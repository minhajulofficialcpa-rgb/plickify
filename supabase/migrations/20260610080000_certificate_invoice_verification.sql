-- Certificate, invoice, and public verification support.
-- Generates stable public codes, QR URLs, certificate URLs, and invoices for paid orders.

alter table public.course_lessons add column if not exists is_locked boolean not null default false;

alter table public.certificates add column if not exists certificate_code text;
alter table public.certificates add column if not exists certificate_url text;
alter table public.certificates add column if not exists qr_code_url text;
alter table public.certificates add column if not exists progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100);
alter table public.certificates add column if not exists assignment_criteria_completed boolean not null default false;
alter table public.certificates add column if not exists issue_source text not null default 'automatic';
alter table public.certificates add column if not exists issued_by uuid references public.profiles(id) on delete set null;
alter table public.certificates add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.certificates
set certificate_code = coalesce(certificate_code, verification_code, certificate_number)
where certificate_code is null;

alter table public.certificates alter column certificate_code set not null;

alter table public.certificates drop constraint if exists certificates_issue_source_check;
alter table public.certificates add constraint certificates_issue_source_check
  check (issue_source in ('automatic', 'manual'));

create unique index if not exists certificates_certificate_code_unique on public.certificates(certificate_code);
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists certificates_course_id_idx on public.certificates(course_id);
create index if not exists certificates_certificate_code_idx on public.certificates(certificate_code);

alter table public.invoices add column if not exists invoice_code text;
alter table public.invoices add column if not exists invoice_url text;
alter table public.invoices add column if not exists qr_code_url text;
alter table public.invoices add column if not exists course_id uuid references public.courses(id) on delete set null;
alter table public.invoices add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.invoices add column if not exists issued_at timestamptz not null default now();
alter table public.invoices add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.invoices
set invoice_code = coalesce(invoice_code, invoice_number)
where invoice_code is null;

alter table public.invoices alter column invoice_code set not null;

create unique index if not exists invoices_invoice_code_unique on public.invoices(invoice_code);
create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_order_id_idx on public.invoices(order_id);
create index if not exists invoices_course_id_idx on public.invoices(course_id);
create index if not exists invoices_product_id_idx on public.invoices(product_id);
create index if not exists invoices_invoice_code_idx on public.invoices(invoice_code);

create or replace function public.public_qr_url(public_url text)
returns text
language sql
immutable
as $$
  select 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' || replace(replace(public_url, ':', '%3A'), '/', '%2F')
$$;

create or replace function public.course_certificate_progress(p_user_id uuid, p_course_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  with lessons as (
    select id
    from public.course_lessons
    where course_id = p_course_id
      and status = 'published'
      and is_locked = false
  ), lesson_count as (
    select count(*)::numeric as total_lessons from lessons
  ), completed_count as (
    select count(distinct wa.lesson_id)::numeric as completed_lessons
    from public.watch_analytics wa
    join lessons l on l.id = wa.lesson_id
    where wa.user_id = p_user_id
      and wa.course_id = p_course_id
      and wa.progress_percent >= 100
  )
  select case
    when lesson_count.total_lessons = 0 then 0
    else least(100, round((completed_count.completed_lessons / lesson_count.total_lessons) * 100, 2))
  end
  from lesson_count, completed_count;
$$;

create or replace function public.course_assignment_criteria_completed(p_user_id uuid, p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.assignments a
    where a.course_id = p_course_id
      and a.status = 'published'
      and not exists (
        select 1
        from public.assignment_submissions s
        where s.assignment_id = a.id
          and s.user_id = p_user_id
          and s.status in ('submitted', 'graded', 'late')
      )
  );
$$;

create or replace function public.issue_course_certificate(
  p_user_id uuid,
  p_course_id uuid,
  p_issued_by uuid default null,
  p_manual_override boolean default false,
  p_manual_reason text default null,
  p_site_url text default 'https://plickify.vercel.app'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_progress numeric(5,2);
  v_assignments_ok boolean;
  v_code text;
  v_public_url text;
  v_certificate_id uuid;
begin
  v_progress := public.course_certificate_progress(p_user_id, p_course_id);
  v_assignments_ok := public.course_assignment_criteria_completed(p_user_id, p_course_id);

  if not p_manual_override and (v_progress < 100 or not v_assignments_ok) then
    raise exception 'Certificate is locked until course progress is 100 percent and required assignments are completed.';
  end if;

  select 'CERT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)) into v_code;
  v_public_url := rtrim(coalesce(nullif(p_site_url, ''), 'https://plickify.vercel.app'), '/') || '/certificate/verify/' || v_code;

  insert into public.certificates (
    user_id,
    course_id,
    certificate_number,
    verification_code,
    certificate_code,
    certificate_url,
    qr_code_url,
    progress_percent,
    assignment_criteria_completed,
    issue_source,
    issued_by,
    metadata
  ) values (
    p_user_id,
    p_course_id,
    v_code,
    v_code,
    v_code,
    v_public_url,
    public.public_qr_url(v_public_url),
    v_progress,
    v_assignments_ok,
    case when p_manual_override then 'manual' else 'automatic' end,
    p_issued_by,
    jsonb_build_object('manual_reason', p_manual_reason)
  )
  on conflict (user_id, course_id) do update set
    revoked_at = null,
    certificate_code = excluded.certificate_code,
    verification_code = excluded.verification_code,
    certificate_number = excluded.certificate_number,
    certificate_url = excluded.certificate_url,
    qr_code_url = excluded.qr_code_url,
    progress_percent = excluded.progress_percent,
    assignment_criteria_completed = excluded.assignment_criteria_completed,
    issue_source = excluded.issue_source,
    issued_by = excluded.issued_by,
    metadata = excluded.metadata,
    issued_at = now(),
    updated_at = now()
  returning id into v_certificate_id;

  return v_certificate_id;
end;
$$;

create or replace function public.generate_paid_order_invoice()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_public_url text;
  v_site_url text := 'https://plickify.vercel.app';
begin
  if new.status = 'paid' and new.payment_status = 'paid' then
    select 'INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)) into v_code;
    v_public_url := v_site_url || '/invoice/verify/' || v_code;

    insert into public.invoices (
      order_id,
      user_id,
      invoice_number,
      invoice_code,
      invoice_url,
      qr_code_url,
      course_id,
      product_id,
      status,
      amount_bdt,
      currency,
      paid_at,
      issued_at,
      metadata
    ) values (
      new.id,
      new.user_id,
      v_code,
      v_code,
      v_public_url,
      public.public_qr_url(v_public_url),
      new.course_id,
      new.product_id,
      'paid',
      new.total_bdt,
      new.currency,
      now(),
      now(),
      jsonb_build_object('order_number', new.order_number, 'item_type', new.item_type, 'access_type', new.access_type)
    )
    on conflict (order_id) do update set
      status = 'paid',
      amount_bdt = excluded.amount_bdt,
      currency = excluded.currency,
      paid_at = coalesce(public.invoices.paid_at, now()),
      course_id = excluded.course_id,
      product_id = excluded.product_id,
      updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists orders_generate_paid_order_invoice on public.orders;
create trigger orders_generate_paid_order_invoice
after insert or update of status, payment_status on public.orders
for each row
execute function public.generate_paid_order_invoice();

create or replace function public.audit_certificate_invoice_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    lower(tg_table_name) || '.' || lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists certificates_verification_audit on public.certificates;
create trigger certificates_verification_audit
after insert or update or delete on public.certificates
for each row execute function public.audit_certificate_invoice_change();

drop trigger if exists invoices_verification_audit on public.invoices;
create trigger invoices_verification_audit
after insert or update or delete on public.invoices
for each row execute function public.audit_certificate_invoice_change();
