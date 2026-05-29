-- PrintQuote initial schema

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  business_name text,
  phone text,
  currency text not null default 'RON',
  default_material_cost_per_kg numeric not null default 80,
  default_machine_hourly_rate numeric not null default 5,
  default_electricity_cost_per_hour numeric not null default 1,
  default_labor_cost numeric not null default 10,
  default_packaging_cost numeric not null default 3,
  default_failure_risk_percentage numeric not null default 10,
  default_profit_margin_percentage numeric not null default 30,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  share_token uuid not null unique default gen_random_uuid(),
  customer_id uuid references public.customers on delete set null,
  title text not null,
  description text,
  file_name text,
  material text,
  color text,
  quantity integer not null default 1,
  estimated_print_hours numeric,
  estimated_material_grams numeric,
  deadline date,
  status text not null default 'Nou',
  material_cost_per_kg numeric,
  machine_hourly_rate numeric,
  electricity_cost_per_hour numeric,
  labor_cost numeric,
  packaging_cost numeric,
  failure_risk_percentage numeric,
  profit_margin_percentage numeric,
  material_cost numeric,
  machine_cost numeric,
  electricity_cost numeric,
  subtotal numeric,
  failure_buffer numeric,
  cost_before_profit numeric,
  final_price numeric,
  estimated_profit numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_user_id_idx on public.customers (user_id);
create index orders_user_id_idx on public.orders (user_id);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_share_token_idx on public.orders (share_token);

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Customers policies
create policy "Users can view own customers"
  on public.customers for select
  using (auth.uid() = user_id);

create policy "Users can insert own customers"
  on public.customers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own customers"
  on public.customers for update
  using (auth.uid() = user_id);

create policy "Users can delete own customers"
  on public.customers for delete
  using (auth.uid() = user_id);

-- Orders policies
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

create policy "Users can delete own orders"
  on public.orders for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger for orders
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();
