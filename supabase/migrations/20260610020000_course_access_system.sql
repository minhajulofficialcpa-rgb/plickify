-- Course, batch, lesson, enrollment access system.

alter table public.courses
  add column if not exists is_featured boolean not null default false;

alter table public.batches
  add column if not exists current_seats integer not null default 0;

alter table public.course_lessons
  add column if not exists batch_id uuid references public.batches(id) on delete set null,
  add column if not exists content text,
  add column if not exists video_url text,
  add column if not exists youtube_video_id text,
  add column if not exists is_locked boolean not null default false;

alter table public.enrollments
  add column if not exists batch_id uuid references public.batches(id) on delete set null,
  add column if not exists activation_status text not null default 'pending';

alter table public.user_batches
  add column if not exists course_id uuid references public.courses(id) on delete cascade,
  add column if not exists status text not null default 'active';

alter table public.watch_analytics
  add column if not exists course_id uuid references public.courses(id) on delete cascade,
  add column if not exists batch_id uuid references public.batches(id) on delete set null,
  add column if not exists duration_seconds integer not null default 0,
  add column if not exists heartbeat_count integer not null default 0,
  add column if not exists completed_at timestamptz;

alter table public.enrollments
  drop constraint if exists enrollments_activation_status_check,
  add constraint enrollments_activation_status_check check (activation_status in ('pending', 'active', 'inactive', 'revoked'));

alter table public.course_lessons
  drop constraint if exists course_lessons_position_positive_check,
  add constraint course_lessons_position_positive_check check (position > 0),
  drop constraint if exists course_lessons_duration_non_negative_check,
  add constraint course_lessons_duration_non_negative_check check (duration_seconds >= 0);

create unique index if not exists courses_one_featured_idx
  on public.courses (is_featured)
  where is_featured is true;

create unique index if not exists course_lessons_course_batch_position_idx
  on public.course_lessons (course_id, coalesce(batch_id, '00000000-0000-0000-0000-000000000000'::uuid), position);

create index if not exists course_lessons_batch_id_idx on public.course_lessons(batch_id);
create index if not exists course_lessons_course_id_idx on public.course_lessons(course_id);
create index if not exists enrollments_batch_id_idx on public.enrollments(batch_id);
create index if not exists user_batches_course_id_idx on public.user_batches(course_id);
create index if not exists watch_analytics_course_id_idx on public.watch_analytics(course_id);
create index if not exists watch_analytics_batch_id_idx on public.watch_analytics(batch_id);

create unique index if not exists user_batches_user_batch_idx
  on public.user_batches(user_id, batch_id)
  where batch_id is not null;

create unique index if not exists watch_analytics_user_lesson_idx
  on public.watch_analytics(user_id, lesson_id);

create or replace function public.allocate_active_enrollment_to_user_batches()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' and (tg_op = 'INSERT' or old.status is distinct from new.status or old.batch_id is distinct from new.batch_id) then
    update public.enrollments
      set activation_status = 'active', updated_at = now()
      where id = new.id and activation_status is distinct from 'active';

    if new.batch_id is not null then
      insert into public.user_batches (user_id, course_id, batch_id, status, created_at, updated_at)
      values (new.user_id, new.course_id, new.batch_id, 'active', now(), now())
      on conflict (user_id, batch_id) where batch_id is not null
      do update set status = 'active', course_id = excluded.course_id, updated_at = now();
    else
      insert into public.user_batches (user_id, course_id, batch_id, status, created_at, updated_at)
      select new.user_id, b.course_id, b.id, 'active', now(), now()
      from public.batches b
      where b.course_id = new.course_id and b.status in ('enrolling', 'active')
      on conflict (user_id, batch_id) where batch_id is not null
      do update set status = 'active', course_id = excluded.course_id, updated_at = now();
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enrollments_allocate_active_user_batches on public.enrollments;
create trigger enrollments_allocate_active_user_batches
after insert or update of status, batch_id on public.enrollments
for each row execute function public.allocate_active_enrollment_to_user_batches();

create or replace function public.increment_watch_heartbeat()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.heartbeat_count := coalesce(old.heartbeat_count, 0) + 1;
  elsif new.heartbeat_count is null or new.heartbeat_count < 1 then
    new.heartbeat_count := 1;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists watch_analytics_increment_heartbeat on public.watch_analytics;
create trigger watch_analytics_increment_heartbeat
before insert or update on public.watch_analytics
for each row execute function public.increment_watch_heartbeat();

create or replace function public.audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  record_id uuid;
begin
  record_id := coalesce(new.id, old.id);

  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata, created_at)
  values (
    actor,
    lower(tg_table_name) || '.' || lower(tg_op),
    tg_table_name,
    record_id,
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)),
    now()
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists audit_courses_content_change on public.courses;
create trigger audit_courses_content_change
after insert or update or delete on public.courses
for each row execute function public.audit_content_change();

drop trigger if exists audit_batches_content_change on public.batches;
create trigger audit_batches_content_change
after insert or update or delete on public.batches
for each row execute function public.audit_content_change();

drop trigger if exists audit_lessons_content_change on public.course_lessons;
create trigger audit_lessons_content_change
after insert or update or delete on public.course_lessons
for each row execute function public.audit_content_change();
