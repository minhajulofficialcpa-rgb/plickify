-- Plickify LMS + Digital Product Shop database baseline.
-- Run in Supabase SQL editor after creating a project and storage buckets.

create type public.user_role as enum ('super_admin', 'admin', 'instructor', 'student', 'support');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  phone text,
  avatar_path text,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  price_bdt integer not null check (price_bdt >= 0),
  status public.publish_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  seat_limit integer,
  status public.publish_status not null default 'draft'
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  video_path text,
  resource_path text,
  sort_order integer not null default 0,
  is_preview boolean not null default false
);

create table public.digital_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  file_path text not null,
  price_bdt integer not null check (price_bdt >= 0),
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  progress integer not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  title text not null,
  instructions text not null,
  due_at timestamptz,
  points integer not null default 100
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_path text,
  answer text,
  grade integer check (grade between 0 and 100),
  feedback text,
  submitted_at timestamptz not null default now(),
  unique (assignment_id, user_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_no text not null unique,
  issued_at timestamptz not null default now(),
  pdf_path text
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_bdt integer not null check (amount_bdt >= 0),
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  provider text not null default 'piprapay',
  provider_payment_id text not null unique,
  transaction_id text unique,
  status public.payment_status not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payment_webhook_events (
  id bigint generated always as identity primary key,
  provider text not null default 'piprapay',
  provider_payment_id text,
  transaction_id text unique,
  signature_valid boolean not null default false,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  body text not null,
  status public.ticket_status not null default 'open',
  priority text not null default 'normal',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin', 'admin', 'support'));
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role is distinct from new.role and not public.is_super_admin() then
    raise exception 'Only super admins can manage admin roles';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
before update of role on public.profiles
for each row execute function public.prevent_role_escalation();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.batches enable row level security;
alter table public.lessons enable row level security;
alter table public.digital_products enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.support_tickets enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.analytics_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "super admins manage roles" on public.profiles for update using (public.is_super_admin()) with check (public.is_super_admin());

create policy "published courses readable" on public.courses for select using (status = 'published' or public.is_admin());
create policy "admins manage courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "published products readable" on public.digital_products for select using (status = 'published' or public.is_admin());
create policy "admins manage products" on public.digital_products for all using (public.is_admin()) with check (public.is_admin());

create policy "students read own enrollments" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage enrollments" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own submissions" on public.submissions for select using (user_id = auth.uid() or public.is_admin());
create policy "students create own submissions" on public.submissions for insert with check (user_id = auth.uid());
create policy "students read own certificates" on public.certificates for select using (user_id = auth.uid() or public.is_admin());
create policy "students read own invoices" on public.invoices for select using (user_id = auth.uid() or public.is_admin());
create policy "students read own tickets" on public.support_tickets for select using (user_id = auth.uid() or public.is_admin());
create policy "students create own tickets" on public.support_tickets for insert with check (user_id = auth.uid());

create policy "admins manage private operations" on public.batches for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage lessons" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage assignments" on public.assignments for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read payments" on public.payments for select using (public.is_admin());
create policy "admins read webhook events" on public.payment_webhook_events for select using (public.is_admin());
create policy "admins insert audit logs" on public.audit_logs for insert with check (public.is_admin());
create policy "admins read analytics" on public.analytics_events for select using (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select using (public.is_admin());

insert into storage.buckets (id, name, public) values
  ('course-assets', 'course-assets', false),
  ('product-files', 'product-files', false),
  ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "admins manage course assets" on storage.objects for all using (bucket_id = 'course-assets' and public.is_admin()) with check (bucket_id = 'course-assets' and public.is_admin());
create policy "admins manage product files" on storage.objects for all using (bucket_id = 'product-files' and public.is_admin()) with check (bucket_id = 'product-files' and public.is_admin());
create policy "certificate owners read files" on storage.objects for select using (bucket_id = 'certificates' and (public.is_admin() or owner = auth.uid()));
