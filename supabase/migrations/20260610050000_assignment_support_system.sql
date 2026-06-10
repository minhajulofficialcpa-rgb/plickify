-- Assignment and support ticket workflow hardening.

alter table public.assignments
  add column if not exists attachment_url text,
  add column if not exists max_marks numeric(8,2) not null default 100 check (max_marks > 0);

update public.assignments
set max_marks = coalesce(max_score, max_marks)
where max_score is not null;

alter table public.assignment_submissions
  add column if not exists submission_text text,
  add column if not exists submission_url text,
  add column if not exists github_url text,
  add column if not exists attachment_url text,
  add column if not exists marks numeric(8,2) check (marks is null or marks >= 0),
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

update public.assignment_submissions
set submission_text = coalesce(submission_text, content),
    attachment_url = coalesce(attachment_url, file_url),
    marks = coalesce(marks, score),
    reviewed_by = coalesce(reviewed_by, graded_by),
    reviewed_at = coalesce(reviewed_at, graded_at)
where content is not null
   or file_url is not null
   or score is not null
   or graded_by is not null
   or graded_at is not null;

alter table public.support_tickets
  add column if not exists category text not null default 'student_support',
  add column if not exists message text,
  add column if not exists closed_by uuid references public.profiles(id) on delete set null;

alter table public.support_messages
  add column if not exists attachment_url text,
  add column if not exists sender_role text not null default 'student';

alter table public.notifications
  add column if not exists related_type text,
  add column if not exists related_id uuid;

create index if not exists assignments_batch_id_idx on public.assignments(batch_id);
create index if not exists assignment_submissions_assignment_id_idx on public.assignment_submissions(assignment_id);
create index if not exists assignment_submissions_user_id_idx on public.assignment_submissions(user_id);
create index if not exists support_messages_ticket_id_idx on public.support_messages(ticket_id);
create index if not exists support_messages_sender_id_idx on public.support_messages(sender_id);
create index if not exists notifications_related_id_idx on public.notifications(related_id);

alter table public.assignments
  drop constraint if exists assignments_batch_required_for_published,
  add constraint assignments_batch_required_for_published check (status <> 'published' or batch_id is not null);

alter table public.assignment_submissions
  drop constraint if exists assignment_submissions_has_content,
  add constraint assignment_submissions_has_content check (
    nullif(btrim(coalesce(submission_text, content, '')), '') is not null
    or nullif(btrim(coalesce(submission_url, '')), '') is not null
    or nullif(btrim(coalesce(github_url, '')), '') is not null
    or nullif(btrim(coalesce(attachment_url, file_url, '')), '') is not null
  );

alter table public.support_messages
  drop constraint if exists support_messages_sender_role_check,
  add constraint support_messages_sender_role_check check (sender_role in ('student', 'support_moderator', 'admin', 'super_admin'));

alter table public.support_tickets
  drop constraint if exists support_tickets_closed_requires_closed_at,
  add constraint support_tickets_closed_requires_closed_at check (status not in ('resolved', 'closed') or closed_at is not null);

drop policy if exists assignments_read on public.assignments;
create policy assignments_read on public.assignments for select using (
  public.has_admin_role('content_manager')
  or (
    status = 'published'
    and exists (
      select 1
      from public.user_batches ub
      where ub.user_id = auth.uid()
        and ub.batch_id = assignments.batch_id
        and coalesce(ub.status, ub.activation_status::text) = 'active'
    )
  )
);

drop policy if exists assignments_admin_write on public.assignments;
create policy assignments_admin_write on public.assignments for all
  using (public.has_admin_role('content_manager'))
  with check (public.has_admin_role('content_manager'));

drop policy if exists submissions_owner_or_instructor on public.assignment_submissions;
create policy submissions_owner_or_staff on public.assignment_submissions for all using (
  user_id = auth.uid()
  or public.has_admin_role('content_manager')
)
with check (
  user_id = auth.uid()
  or public.has_admin_role('content_manager')
);

drop policy if exists support_tickets_participant_or_support on public.support_tickets;
create policy support_tickets_participant_or_support on public.support_tickets for all using (
  user_id = auth.uid()
  or assigned_to = auth.uid()
  or public.has_admin_role('support_moderator')
)
with check (
  user_id = auth.uid()
  or assigned_to = auth.uid()
  or public.has_admin_role('support_moderator')
);

drop policy if exists support_messages_participant_or_support on public.support_messages;
create policy support_messages_participant_or_support on public.support_messages for all using (
  public.has_admin_role('support_moderator')
  or exists (
    select 1 from public.support_tickets st
    where st.id = support_messages.ticket_id
      and st.user_id = auth.uid()
  )
)
with check (
  sender_id = auth.uid()
  or public.has_admin_role('support_moderator')
);

create or replace function public.touch_ticket_from_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
  set updated_at = now(),
      status = case
        when status = 'closed' then status
        when new.sender_role = 'student' then 'open'::public.ticket_status
        else 'pending'::public.ticket_status
      end
  where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists support_messages_touch_ticket on public.support_messages;
create trigger support_messages_touch_ticket
after insert on public.support_messages
for each row execute function public.touch_ticket_from_message();
