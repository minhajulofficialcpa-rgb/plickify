-- Phase 3: role helpers, onboarding RPC, audit RPC, and RLS policy hardening.

create or replace function public.current_user_role_rank()
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(max(case ar.role
    when 'super_admin' then 50
    when 'admin' then 40
    when 'content_manager' then 30
    when 'support_moderator' then 20
    else 0
  end), 0)
  from public.admin_roles ar
  where ar.user_id = auth.uid()
    and ar.revoked_at is null;
$$;

create or replace function public.has_admin_role(required_role public.admin_role_name default 'admin')
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_user_role_rank() >= case required_role
    when 'super_admin' then 50
    when 'admin' then 40
    when 'content_manager' then 30
    when 'support_moderator' then 20
    else 40
  end;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.has_admin_role('super_admin');
$$;

create or replace function public.complete_profile_onboarding(
  profile_full_name text,
  profile_email text,
  profile_phone_number text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if nullif(btrim(profile_full_name), '') is null
    or nullif(btrim(profile_email), '') is null
    or nullif(btrim(profile_phone_number), '') is null
  then
    raise exception 'full_name, email and phone_number are required';
  end if;

  insert into public.profiles (id, full_name, email, phone_number, onboarding_completed, is_locked, locked_at)
  values (auth.uid(), btrim(profile_full_name), lower(btrim(profile_email)), btrim(profile_phone_number), true, true, now())
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        phone_number = excluded.phone_number,
        onboarding_completed = true,
        is_locked = true,
        locked_at = coalesce(public.profiles.locked_at, now()),
        updated_at = now()
    where public.profiles.id = auth.uid()
      and public.profiles.is_locked = false
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile is locked and cannot be edited by this user';
  end if;

  insert into public.audit_logs (actor_id, action, table_name, record_id, new_data)
  values (auth.uid(), 'profile.onboarding_completed', 'profiles', updated_profile.id, to_jsonb(updated_profile));

  return updated_profile;
end;
$$;

create or replace function public.manage_user_role(
  target_user_id uuid,
  target_role public.admin_role_name,
  should_revoke boolean default false
)
returns public.admin_roles
language plpgsql
security definer
set search_path = public
as $$
declare
  role_record public.admin_roles;
begin
  if not public.is_super_admin() then
    raise exception 'Only super_admin can manage roles';
  end if;

  if should_revoke then
    update public.admin_roles
    set revoked_at = now(), updated_at = now()
    where user_id = target_user_id and role = target_role
    returning * into role_record;
  else
    insert into public.admin_roles (user_id, role, granted_by)
    values (target_user_id, target_role, auth.uid())
    on conflict (user_id, role) do update
      set revoked_at = null,
          granted_by = auth.uid(),
          granted_at = now(),
          updated_at = now()
    returning * into role_record;
  end if;

  insert into public.audit_logs (actor_id, action, table_name, record_id, new_data)
  values (auth.uid(), case when should_revoke then 'role.revoked' else 'role.granted' end, 'admin_roles', role_record.id, to_jsonb(role_record));

  return role_record;
end;
$$;

create or replace function public.insert_audit_log(
  audit_action text,
  audit_table_name text default null,
  audit_record_id uuid default null,
  audit_old_data jsonb default null,
  audit_new_data jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  created_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (auth.uid(), audit_action, audit_table_name, audit_record_id, audit_old_data, audit_new_data)
  returning id into created_id;

  return created_id;
end;
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs are immutable';
end;
$$;

drop trigger if exists audit_logs_no_update on public.audit_logs;
create trigger audit_logs_no_update
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

drop policy if exists profiles_own_or_admin on public.profiles;
drop policy if exists admin_roles_admin_all on public.admin_roles;
drop policy if exists audit_logs_admin_read on public.audit_logs;

drop policy if exists profiles_read_own_or_admin on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_unlocked_own_or_admin on public.profiles;
drop policy if exists admin_roles_super_admin_read on public.admin_roles;
drop policy if exists admin_roles_super_admin_write on public.admin_roles;
drop policy if exists audit_logs_super_admin_read on public.audit_logs;

create policy profiles_read_own_or_admin
on public.profiles for select
using (id = auth.uid() or public.has_admin_role('support_moderator'));

create policy profiles_insert_own
on public.profiles for insert
with check (id = auth.uid());

create policy profiles_update_unlocked_own_or_admin
on public.profiles for update
using ((id = auth.uid() and is_locked = false) or public.has_admin_role('admin'))
with check ((id = auth.uid() and is_locked = false) or public.has_admin_role('admin'));

create policy admin_roles_super_admin_read
on public.admin_roles for select
using (public.is_super_admin());

create policy admin_roles_super_admin_write
on public.admin_roles for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy audit_logs_super_admin_read
on public.audit_logs for select
using (public.is_super_admin());
