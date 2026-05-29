-- Public shareable quote links (secure token per order)

alter table public.orders
  add column if not exists share_token uuid unique default gen_random_uuid();

update public.orders
set share_token = gen_random_uuid()
where share_token is null;

alter table public.orders
  alter column share_token set not null;

create index if not exists orders_share_token_idx on public.orders (share_token);

-- Read-only public access via token (no direct table access for anon)
create or replace function public.get_public_quote(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if p_token is null then
    return null;
  end if;

  select json_build_object(
    'business_name', coalesce(nullif(trim(p.business_name), ''), 'Atelier 3D Print'),
    'seller_phone', p.phone,
    'title', o.title,
    'description', o.description,
    'material', o.material,
    'color', o.color,
    'quantity', o.quantity,
    'deadline', o.deadline,
    'final_price', o.final_price,
    'currency', coalesce(p.currency, 'RON')
  )
  into result
  from public.orders o
  inner join public.profiles p on p.id = o.user_id
  where o.share_token = p_token
  limit 1;

  return result;
end;
$$;

revoke all on function public.get_public_quote(uuid) from public;
grant execute on function public.get_public_quote(uuid) to anon, authenticated;
