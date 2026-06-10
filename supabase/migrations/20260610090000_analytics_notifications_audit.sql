-- Analytics, notification event metadata, and audit hardening.

alter table public.notifications add column if not exists event_type text;
alter table public.notifications add column if not exists related_type text;
alter table public.notifications add column if not exists related_id uuid;
alter table public.notifications add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists notifications_user_status_idx on public.notifications(user_id, status);
create index if not exists notifications_event_type_idx on public.notifications(event_type);
create index if not exists notifications_related_idx on public.notifications(related_type, related_id);

alter table public.audit_logs add column if not exists target_table text;
alter table public.audit_logs add column if not exists target_id uuid;
alter table public.audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_target_idx on public.audit_logs(target_table, target_id);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  source text not null default 'server',
  path text,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_entity_idx on public.analytics_events(entity_type, entity_id);

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Audit logs are immutable.';
end;
$$;

drop trigger if exists audit_logs_prevent_update on public.audit_logs;
create trigger audit_logs_prevent_update
before update on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

drop trigger if exists audit_logs_prevent_delete on public.audit_logs;
create trigger audit_logs_prevent_delete
before delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

create or replace function public.create_app_notification(
  p_user_id uuid,
  p_title text,
  p_body text default null,
  p_action_url text default null,
  p_event_type text default null,
  p_related_type text default null,
  p_related_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.notifications (user_id, title, body, action_url, event_type, related_type, related_id, metadata)
  values (p_user_id, p_title, p_body, p_action_url, p_event_type, p_related_type, p_related_id, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.write_analytics_event(
  p_user_id uuid default null,
  p_event_name text default null,
  p_source text default 'server',
  p_path text default null,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.analytics_events (user_id, event_name, source, path, entity_type, entity_id, metadata)
  values (p_user_id, p_event_name, coalesce(p_source, 'server'), p_path, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

create policy if not exists analytics_events_admin_read on public.analytics_events
for select using (public.current_user_role() in ('admin', 'super_admin'));

create policy if not exists analytics_events_secure_insert on public.analytics_events
for insert with check (auth.role() = 'service_role');
