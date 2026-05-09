create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.products (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    image_url text,
    puffs integer,
    price numeric not null,
    stock_quantity integer default 0 not null,
    is_in_stock boolean generated always as (stock_quantity > 0) stored,
    category_id uuid references public.categories(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Create policies for public read
create policy "Public can read categories" on public.categories for select to public using (true);
create policy "Public can read products" on public.products for select to public using (true);
