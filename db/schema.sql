-- Database schema for vendorbridge

create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);
