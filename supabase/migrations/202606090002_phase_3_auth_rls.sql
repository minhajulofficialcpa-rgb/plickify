-- Phase 3: profile onboarding fields and role enum values.
-- Kept separate from functions/policies so newly added enum values are safe to use later.

alter type public.admin_role_name add value if not exists 'support_moderator';
alter type public.admin_role_name add value if not exists 'content_manager';

alter table public.profiles
  add column if not exists email text,
  add column if not exists phone_number text,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists is_locked boolean not null default false,
  add column if not exists locked_at timestamptz;

alter table public.profiles
  add constraint profiles_email_unique unique (email),
  add constraint profiles_phone_number_unique unique (phone_number),
  add constraint profiles_onboarding_required_when_completed check (
    onboarding_completed = false
    or (nullif(btrim(full_name), '') is not null and nullif(btrim(email), '') is not null and nullif(btrim(phone_number), '') is not null)
  );

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_onboarding_completed_idx on public.profiles(onboarding_completed);
create index if not exists profiles_is_locked_idx on public.profiles(is_locked);
