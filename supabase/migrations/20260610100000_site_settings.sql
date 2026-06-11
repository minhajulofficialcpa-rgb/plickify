create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_settings_key on public.site_settings(key);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_site_settings_updated_at();

alter table public.site_settings enable row level security;

-- App code reads and writes this table only through secure server-side service-role actions.
-- Keep direct client access closed by default.
drop policy if exists "site settings no direct select" on public.site_settings;
create policy "site settings no direct select" on public.site_settings
for select using (false);

drop policy if exists "site settings no direct insert" on public.site_settings;
create policy "site settings no direct insert" on public.site_settings
for insert with check (false);

drop policy if exists "site settings no direct update" on public.site_settings;
create policy "site settings no direct update" on public.site_settings
for update using (false) with check (false);

drop policy if exists "site settings no direct delete" on public.site_settings;
create policy "site settings no direct delete" on public.site_settings
for delete using (false);
