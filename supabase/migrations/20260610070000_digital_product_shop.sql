-- Digital product shop access, private downloads, and order activation rules.

alter type public.order_status add value if not exists 'failed';

alter table public.products add column if not exists category text not null default 'paid';
alter table public.products add column if not exists access_type text not null default 'purchase';
alter table public.products add column if not exists private_file_path text;
alter table public.products add column if not exists download_bucket text not null default 'downloads';
alter table public.products add column if not exists download_limit integer;

update public.products
set private_file_path = coalesce(private_file_path, file_path)
where private_file_path is null and file_path is not null;

alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('free', 'paid', 'software', 'subscription', 'manual_service'));

alter table public.products drop constraint if exists products_access_type_check;
alter table public.products add constraint products_access_type_check
  check (access_type in ('free', 'purchase', 'manual', 'subscription'));

alter table public.products drop constraint if exists products_download_limit_check;
alter table public.products add constraint products_download_limit_check
  check (download_limit is null or download_limit > 0);

alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists item_type text not null default 'product';
alter table public.orders add column if not exists access_type text not null default 'purchase';
alter table public.orders add column if not exists activation_status public.activation_status not null default 'pending';
alter table public.orders add column if not exists activated_at timestamptz;

update public.orders
set item_type = case when course_id is not null then 'course' else 'product' end
where item_type is null or item_type = '';

alter table public.orders drop constraint if exists orders_item_type_check;
alter table public.orders add constraint orders_item_type_check check (item_type in ('course', 'product'));

alter table public.orders drop constraint if exists orders_access_type_check;
alter table public.orders add constraint orders_access_type_check check (access_type in ('purchase', 'free', 'manual'));

create unique index if not exists orders_order_number_unique on public.orders(order_number) where order_number is not null;
create index if not exists orders_product_id_idx on public.orders(product_id);
create index if not exists orders_item_type_idx on public.orders(item_type);
create index if not exists orders_activation_status_idx on public.orders(activation_status);

alter table public.downloads add column if not exists file_path text;
alter table public.downloads add column if not exists bucket_name text not null default 'downloads';
alter table public.downloads add column if not exists granted_at timestamptz not null default now();
create unique index if not exists downloads_user_product_free_unique on public.downloads(user_id, product_id) where order_id is null;
create index if not exists downloads_user_id_idx on public.downloads(user_id);
create index if not exists downloads_order_id_idx on public.downloads(order_id);
create index if not exists downloads_product_id_idx on public.downloads(product_id);

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'PLK-' || upper(substr(replace(new.id::text, '-', ''), 1, 10));
  end if;
  return new;
end;
$$;

drop trigger if exists orders_generate_order_number on public.orders;
create trigger orders_generate_order_number
before insert on public.orders
for each row execute function public.generate_order_number();

create or replace function public.grant_product_download_access(
  p_user_id uuid,
  p_product_id uuid,
  p_order_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_file_path text;
  v_bucket text;
  v_download_limit integer;
  v_download_id uuid;
begin
  select coalesce(private_file_path, file_path), coalesce(download_bucket, 'downloads'), download_limit
  into v_file_path, v_bucket, v_download_limit
  from public.products
  where id = p_product_id
    and status = 'published';

  if v_file_path is null or v_file_path = '' then
    return null;
  end if;

  if p_order_id is null then
    insert into public.downloads (user_id, product_id, order_id, file_path, bucket_name, download_token, status, max_downloads)
    values (p_user_id, p_product_id, null, v_file_path, v_bucket, encode(gen_random_bytes(24), 'hex'), 'active', v_download_limit)
    on conflict (user_id, product_id) where order_id is null
    do update set
      file_path = excluded.file_path,
      bucket_name = excluded.bucket_name,
      status = 'active',
      max_downloads = excluded.max_downloads,
      updated_at = now()
    returning id into v_download_id;
  else
    insert into public.downloads (user_id, product_id, order_id, file_path, bucket_name, download_token, status, max_downloads)
    values (p_user_id, p_product_id, p_order_id, v_file_path, v_bucket, encode(gen_random_bytes(24), 'hex'), 'active', v_download_limit)
    on conflict on constraint downloads_user_product_order_unique
    do update set
      file_path = excluded.file_path,
      bucket_name = excluded.bucket_name,
      status = 'active',
      max_downloads = excluded.max_downloads,
      updated_at = now()
    returning id into v_download_id;
  end if;

  return v_download_id;
end;
$$;

create or replace function public.fulfill_product_order_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.product_id is null then
    return new;
  end if;

  if new.status = 'paid'
     and new.payment_status = 'paid'
     and (new.access_type = 'purchase' or new.activation_status = 'active') then
    perform public.grant_product_download_access(new.user_id, new.product_id, new.id);
  end if;

  if new.activation_status = 'active' and old.activation_status is distinct from new.activation_status then
    new.activated_at := coalesce(new.activated_at, now());
    perform public.grant_product_download_access(new.user_id, new.product_id, new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists orders_fulfill_product_order_access on public.orders;
create trigger orders_fulfill_product_order_access
before update on public.orders
for each row execute function public.fulfill_product_order_access();

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
for select using (status = 'published');

drop policy if exists downloads_owner_read on public.downloads;
create policy downloads_owner_read on public.downloads
for select using (auth.uid() = user_id);
