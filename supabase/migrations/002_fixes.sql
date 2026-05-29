-- PrintQuote fixes: profile signup robustness, grants, FK hint for PostgREST

-- Safer profile creation on signup (ignore duplicate)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Explicit FK name helps Supabase/PostgREST embed: orders -> customers
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_customer_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id) references public.customers (id) on delete set null;
  end if;
exception
  when duplicate_object then null;
end $$;

-- Ensure authenticated users can use tables (Supabase usually sets this; safe to repeat)
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
