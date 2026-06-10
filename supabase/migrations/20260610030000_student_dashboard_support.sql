-- Student dashboard support fields and storage helpers.

alter table public.support_tickets
  add column if not exists category text,
  add column if not exists message text;

alter table public.downloads
  add column if not exists file_path text;

create index if not exists support_tickets_user_id_idx on public.support_tickets(user_id);
create index if not exists downloads_user_id_idx on public.downloads(user_id);
create index if not exists certificates_user_id_idx on public.certificates(user_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists assignments_due_at_idx on public.assignments(due_at);
