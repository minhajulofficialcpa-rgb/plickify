-- Phase 2: Supabase schema for the LMS and digital shop foundation.
-- This migration is intentionally database-only. No frontend or payment UI is implemented here.

create extension if not exists pgcrypto;

create type public.profile_status as enum ('active', 'suspended', 'deleted');
create type public.admin_role_name as enum ('super_admin', 'admin', 'instructor', 'support');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.batch_status as enum ('draft', 'enrolling', 'active', 'completed', 'cancelled');
create type public.lesson_status as enum ('draft', 'published', 'archived');
create type public.activation_status as enum ('pending', 'active', 'paused', 'completed', 'cancelled');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('pending', 'awaiting_payment', 'paid', 'fulfilled', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded');
create type public.download_status as enum ('active', 'expired', 'revoked');
create type public.assignment_status as enum ('draft', 'published', 'archived');
create type public.submission_status as enum ('submitted', 'graded', 'returned', 'late');
create type public.ticket_status as enum ('open', 'pending', 'resolved', 'closed');
create type public.ticket_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void', 'refunded');
create type public.notification_status as enum ('unread', 'read', 'archived');
create type public.cart_status as enum ('open', 'recovered', 'converted', 'expired');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text,
  status public.profile_status not null default 'active',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_unique unique (phone)
);

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.admin_role_name not null,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_roles_user_role_unique unique (user_id, role),
  constraint admin_roles_not_self_granted check (granted_by is null or granted_by <> user_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text,
  thumbnail_url text,
  price_bdt integer not null default 0 check (price_bdt >= 0),
  status public.course_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_slug_unique unique (slug)
);

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  capacity integer check (capacity is null or capacity > 0),
  status public.batch_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint batches_course_slug_unique unique (course_id, slug),
  constraint batches_valid_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  video_url text,
  resource_url text,
  position integer not null check (position > 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  is_preview boolean not null default false,
  status public.lesson_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_lessons_course_slug_unique unique (course_id, slug),
  constraint course_lessons_course_position_unique unique (course_id, position)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  order_id uuid,
  activation_status public.activation_status not null default 'pending',
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_user_course_unique unique (user_id, course_id)
);

create table public.user_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid not null references public.batches(id) on delete cascade,
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  activation_status public.activation_status not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_batches_user_batch_unique unique (user_id, batch_id)
);

alter table public.enrollments
  add constraint enrollments_order_id_fkey foreign key (order_id) references public.orders(id) on delete set null deferrable initially deferred;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text,
  file_path text,
  price_bdt integer not null default 0 check (price_bdt >= 0),
  status public.product_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_unique unique (slug)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  subtotal_bdt integer not null check (subtotal_bdt >= 0),
  discount_bdt integer not null default 0 check (discount_bdt >= 0),
  total_bdt integer not null check (total_bdt >= 0),
  currency text not null default 'BDT',
  customer_email text,
  customer_phone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_has_item check (course_id is not null or product_id is not null),
  constraint orders_total_matches check (total_bdt = subtotal_bdt - discount_bdt)
);

alter table public.enrollments drop constraint enrollments_order_id_fkey;
alter table public.enrollments
  add constraint enrollments_order_id_fkey foreign key (order_id) references public.orders(id) on delete set null;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'piprapay',
  provider_payment_id text,
  transaction_id text,
  status public.payment_status not null default 'pending',
  amount_bdt integer not null check (amount_bdt > 0),
  currency text not null default 'BDT',
  payment_method text,
  checkout_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_provider_payment_unique unique (provider, provider_payment_id),
  constraint payments_transaction_id_unique unique (transaction_id),
  constraint payments_provider_transaction_unique unique (provider, transaction_id)
);

create table public.payment_webhook_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'piprapay',
  event_id text,
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  transaction_id text,
  signature_valid boolean not null default false,
  processed boolean not null default false,
  processing_error text,
  raw_payload jsonb not null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint payment_webhook_logs_provider_event_unique unique (provider, event_id),
  constraint payment_webhook_logs_transaction_unique unique (transaction_id)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  download_token text not null,
  status public.download_status not null default 'active',
  download_count integer not null default 0 check (download_count >= 0),
  max_downloads integer check (max_downloads is null or max_downloads > 0),
  expires_at timestamptz,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint downloads_token_unique unique (download_token),
  constraint downloads_user_product_order_unique unique (user_id, product_id, order_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete cascade,
  lesson_id uuid references public.course_lessons(id) on delete set null,
  title text not null,
  instructions text,
  due_at timestamptz,
  max_score numeric(8,2) not null default 100 check (max_score > 0),
  status public.assignment_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  file_url text,
  status public.submission_status not null default 'submitted',
  score numeric(8,2) check (score is null or score >= 0),
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assignment_submissions_assignment_user_unique unique (assignment_id, user_id)
);

create table public.watch_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete set null,
  seconds_watched integer not null default 0 check (seconds_watched >= 0),
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint watch_analytics_user_lesson_session_unique unique (user_id, lesson_id, session_id)
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  subject text not null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  certificate_number text not null,
  verification_code text not null,
  file_url text,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificates_number_unique unique (certificate_number),
  constraint certificates_verification_code_unique unique (verification_code),
  constraint certificates_user_course_unique unique (user_id, course_id)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  invoice_number text not null,
  status public.invoice_status not null default 'issued',
  amount_bdt integer not null check (amount_bdt >= 0),
  currency text not null default 'BDT',
  due_at timestamptz,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_order_unique unique (order_id),
  constraint invoices_number_unique unique (invoice_number)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  handled_by uuid references public.profiles(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_has_target check (course_id is not null or product_id is not null),
  constraint reviews_user_course_unique unique (user_id, course_id),
  constraint reviews_user_product_unique unique (user_id, product_id)
);

create table public.device_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id text not null,
  device_name text,
  ip_address inet,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_sessions_session_unique unique (session_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  status public.notification_status not null default 'unread',
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  email text,
  course_id uuid references public.courses(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  status public.cart_status not null default 'open',
  cart_token text not null,
  subtotal_bdt integer not null default 0 check (subtotal_bdt >= 0),
  last_activity_at timestamptz not null default now(),
  recovered_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint abandoned_carts_token_unique unique (cart_token),
  constraint abandoned_carts_has_contact check (user_id is not null or email is not null),
  constraint abandoned_carts_has_item check (course_id is not null or product_id is not null)
);

create index admin_roles_user_id_idx on public.admin_roles(user_id);
create index courses_created_by_idx on public.courses(created_by);
create index batches_course_id_idx on public.batches(course_id);
create index course_lessons_course_id_idx on public.course_lessons(course_id);
create index enrollments_user_id_idx on public.enrollments(user_id);
create index enrollments_course_id_idx on public.enrollments(course_id);
create index enrollments_order_id_idx on public.enrollments(order_id);
create index user_batches_user_id_idx on public.user_batches(user_id);
create index user_batches_batch_id_idx on public.user_batches(batch_id);
create index user_batches_enrollment_id_idx on public.user_batches(enrollment_id);
create index orders_user_id_idx on public.orders(user_id);
create index orders_course_id_idx on public.orders(course_id);
create index orders_product_id_idx on public.orders(product_id);
create index payments_user_id_idx on public.payments(user_id);
create index payments_order_id_idx on public.payments(order_id);
create index payments_transaction_id_idx on public.payments(transaction_id);
create index payment_webhook_logs_order_id_idx on public.payment_webhook_logs(order_id);
create index payment_webhook_logs_payment_id_idx on public.payment_webhook_logs(payment_id);
create index payment_webhook_logs_transaction_id_idx on public.payment_webhook_logs(transaction_id);
create index downloads_user_id_idx on public.downloads(user_id);
create index downloads_order_id_idx on public.downloads(order_id);
create index assignments_course_id_idx on public.assignments(course_id);
create index assignments_batch_id_idx on public.assignments(batch_id);
create index assignment_submissions_user_id_idx on public.assignment_submissions(user_id);
create index assignment_submissions_assignment_id_idx on public.assignment_submissions(assignment_id);
create index watch_analytics_user_id_idx on public.watch_analytics(user_id);
create index watch_analytics_course_id_idx on public.watch_analytics(course_id);
create index watch_analytics_batch_id_idx on public.watch_analytics(batch_id);
create index support_tickets_user_id_idx on public.support_tickets(user_id);
create index support_tickets_order_id_idx on public.support_tickets(order_id);
create index support_tickets_course_id_idx on public.support_tickets(course_id);
create index support_messages_ticket_id_idx on public.support_messages(ticket_id);
create index certificates_user_id_idx on public.certificates(user_id);
create index certificates_course_id_idx on public.certificates(course_id);
create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_order_id_idx on public.invoices(order_id);
create index reviews_user_id_idx on public.reviews(user_id);
create index reviews_course_id_idx on public.reviews(course_id);
create index device_sessions_user_id_idx on public.device_sessions(user_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index abandoned_carts_user_id_idx on public.abandoned_carts(user_id);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger admin_roles_set_updated_at before update on public.admin_roles for each row execute function public.set_updated_at();
create trigger courses_set_updated_at before update on public.courses for each row execute function public.set_updated_at();
create trigger batches_set_updated_at before update on public.batches for each row execute function public.set_updated_at();
create trigger course_lessons_set_updated_at before update on public.course_lessons for each row execute function public.set_updated_at();
create trigger enrollments_set_updated_at before update on public.enrollments for each row execute function public.set_updated_at();
create trigger user_batches_set_updated_at before update on public.user_batches for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger downloads_set_updated_at before update on public.downloads for each row execute function public.set_updated_at();
create trigger assignments_set_updated_at before update on public.assignments for each row execute function public.set_updated_at();
create trigger assignment_submissions_set_updated_at before update on public.assignment_submissions for each row execute function public.set_updated_at();
create trigger watch_analytics_set_updated_at before update on public.watch_analytics for each row execute function public.set_updated_at();
create trigger support_tickets_set_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();
create trigger support_messages_set_updated_at before update on public.support_messages for each row execute function public.set_updated_at();
create trigger certificates_set_updated_at before update on public.certificates for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger contact_messages_set_updated_at before update on public.contact_messages for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger device_sessions_set_updated_at before update on public.device_sessions for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger abandoned_carts_set_updated_at before update on public.abandoned_carts for each row execute function public.set_updated_at();

create or replace function public.allocate_user_to_active_batches()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.activation_status = 'active'
    and (tg_op = 'INSERT' or old.activation_status is distinct from new.activation_status)
  then
    new.activated_at = coalesce(new.activated_at, now());

    insert into public.user_batches (user_id, batch_id, enrollment_id, activation_status)
    select new.user_id, b.id, new.id, 'active'
    from public.batches b
    where b.course_id = new.course_id
      and b.status in ('enrolling', 'active')
    on conflict (user_id, batch_id) do update
      set enrollment_id = excluded.enrollment_id,
          activation_status = 'active',
          updated_at = now();
  end if;

  return new;
end;
$$;

create trigger enrollments_allocate_active_batches
before insert or update of activation_status on public.enrollments
for each row execute function public.allocate_user_to_active_batches();

create or replace function public.audit_sensitive_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_record_id uuid;
begin
  changed_record_id = coalesce(new.id, old.id);

  insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    changed_record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

create trigger admin_roles_audit after insert or update or delete on public.admin_roles for each row execute function public.audit_sensitive_admin_change();
create trigger courses_audit after insert or update or delete on public.courses for each row execute function public.audit_sensitive_admin_change();
create trigger batches_audit after insert or update or delete on public.batches for each row execute function public.audit_sensitive_admin_change();
create trigger products_audit after insert or update or delete on public.products for each row execute function public.audit_sensitive_admin_change();
create trigger assignments_audit after insert or update or delete on public.assignments for each row execute function public.audit_sensitive_admin_change();

create or replace function public.has_admin_role(required_role public.admin_role_name default 'admin')
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = auth.uid()
      and ar.revoked_at is null
      and (
        ar.role = 'super_admin'
        or ar.role = required_role
        or (required_role in ('instructor', 'support') and ar.role = 'admin')
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.courses enable row level security;
alter table public.batches enable row level security;
alter table public.course_lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.user_batches enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_logs enable row level security;
alter table public.downloads enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.watch_analytics enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.certificates enable row level security;
alter table public.invoices enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.device_sessions enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.abandoned_carts enable row level security;

create policy profiles_select_own_or_admin on public.profiles for select using (id = auth.uid() or public.has_admin_role());
create policy profiles_update_own_or_admin on public.profiles for update using (id = auth.uid() or public.has_admin_role()) with check (id = auth.uid() or public.has_admin_role());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());

create policy admin_roles_admin_all on public.admin_roles for all using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy courses_public_read on public.courses for select using (status = 'published' or public.has_admin_role());
create policy courses_admin_write on public.courses for all using (public.has_admin_role('instructor')) with check (public.has_admin_role('instructor'));
create policy batches_public_read on public.batches for select using (status in ('enrolling', 'active', 'completed') or public.has_admin_role());
create policy batches_admin_write on public.batches for all using (public.has_admin_role('instructor')) with check (public.has_admin_role('instructor'));
create policy course_lessons_public_preview_read on public.course_lessons for select using (is_preview or status = 'published' or public.has_admin_role());
create policy course_lessons_admin_write on public.course_lessons for all using (public.has_admin_role('instructor')) with check (public.has_admin_role('instructor'));

create policy products_public_read on public.products for select using (status = 'published' or public.has_admin_role());
create policy products_admin_write on public.products for all using (public.has_admin_role('admin')) with check (public.has_admin_role('admin'));

create policy user_owned_enrollments on public.enrollments for select using (user_id = auth.uid() or public.has_admin_role());
create policy admin_write_enrollments on public.enrollments for all using (public.has_admin_role()) with check (public.has_admin_role());
create policy user_owned_batches on public.user_batches for select using (user_id = auth.uid() or public.has_admin_role());

create policy user_owned_orders on public.orders for select using (user_id = auth.uid() or public.has_admin_role());
create policy user_create_orders on public.orders for insert with check (user_id = auth.uid());
create policy admin_update_orders on public.orders for update using (public.has_admin_role()) with check (public.has_admin_role());
create policy user_owned_payments on public.payments for select using (user_id = auth.uid() or public.has_admin_role());
create policy admin_write_payments on public.payments for all using (public.has_admin_role()) with check (public.has_admin_role());
create policy admin_webhook_logs on public.payment_webhook_logs for all using (public.has_admin_role()) with check (public.has_admin_role());

create policy user_owned_downloads on public.downloads for select using (user_id = auth.uid() or public.has_admin_role());
create policy user_owned_submissions on public.assignment_submissions for select using (user_id = auth.uid() or public.has_admin_role('instructor'));
create policy user_create_submissions on public.assignment_submissions for insert with check (user_id = auth.uid());
create policy instructor_update_submissions on public.assignment_submissions for update using (public.has_admin_role('instructor')) with check (public.has_admin_role('instructor'));
create policy assignments_read on public.assignments for select using (status = 'published' or public.has_admin_role('instructor'));
create policy assignments_admin_write on public.assignments for all using (public.has_admin_role('instructor')) with check (public.has_admin_role('instructor'));
create policy watch_analytics_user_owned on public.watch_analytics for all using (user_id = auth.uid() or public.has_admin_role()) with check (user_id = auth.uid() or public.has_admin_role());

create policy support_tickets_user_owned on public.support_tickets for select using (user_id = auth.uid() or assigned_to = auth.uid() or public.has_admin_role('support'));
create policy support_tickets_user_create on public.support_tickets for insert with check (user_id = auth.uid());
create policy support_tickets_support_update on public.support_tickets for update using (public.has_admin_role('support')) with check (public.has_admin_role('support'));
create policy support_messages_ticket_access on public.support_messages for select using (
  public.has_admin_role('support') or exists (
    select 1 from public.support_tickets st where st.id = ticket_id and st.user_id = auth.uid()
  )
);
create policy support_messages_ticket_insert on public.support_messages for insert with check (sender_id = auth.uid() or public.has_admin_role('support'));

create policy certificates_user_owned on public.certificates for select using (user_id = auth.uid() or public.has_admin_role());
create policy invoices_user_owned on public.invoices for select using (user_id = auth.uid() or public.has_admin_role());
create policy contact_messages_admin_only on public.contact_messages for all using (public.has_admin_role('support')) with check (public.has_admin_role('support'));
create policy reviews_public_read on public.reviews for select using (is_published or user_id = auth.uid() or public.has_admin_role());
create policy reviews_user_write on public.reviews for all using (user_id = auth.uid() or public.has_admin_role()) with check (user_id = auth.uid() or public.has_admin_role());
create policy device_sessions_user_owned on public.device_sessions for all using (user_id = auth.uid() or public.has_admin_role()) with check (user_id = auth.uid() or public.has_admin_role());
create policy notifications_user_owned on public.notifications for all using (user_id = auth.uid() or public.has_admin_role()) with check (user_id = auth.uid() or public.has_admin_role());
create policy audit_logs_admin_read on public.audit_logs for select using (public.has_admin_role());
create policy abandoned_carts_owner_or_admin on public.abandoned_carts for all using (user_id = auth.uid() or public.has_admin_role()) with check (user_id = auth.uid() or public.has_admin_role());
