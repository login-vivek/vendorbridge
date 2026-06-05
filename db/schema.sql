-- ══════════════════════════════════════════
--  VendorBridge — Supabase Schema
-- ══════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Vendors ─────────────────────────────
create table if not exists vendors (
  id          text primary key default 'V' || substr(gen_random_uuid()::text, 1, 8),
  name        text not null,
  category    text not null default 'Electronics',
  gst         text,
  contact     text,
  email       text not null,
  phone       text,
  status      text not null default 'Active' check (status in ('Active', 'Inactive')),
  rating      numeric(3,1) default 4.0,
  created_at  timestamptz default now()
);

-- ── RFQs ────────────────────────────────
create table if not exists rfqs (
  id          text primary key default 'RFQ-' || substr(gen_random_uuid()::text, 1, 8),
  title       text not null,
  product     text not null,
  quantity    integer not null default 1,
  unit        text not null default 'units',
  deadline    date,
  vendors     text[] default '{}',           -- array of vendor IDs
  status      text not null default 'Open'
                check (status in ('Open', 'Quoted', 'Closed')),
  created_by  text not null,
  created_at  timestamptz default now()
);

-- ── Quotations ──────────────────────────
create table if not exists quotations (
  id           text primary key default 'Q-' || substr(gen_random_uuid()::text, 1, 8),
  rfq_id       text not null references rfqs(id),
  vendor_id    text not null references vendors(id),
  unit_price   bigint not null,
  total_price  bigint not null,
  delivery     text,
  notes        text,
  status       text not null default 'Submitted'
                 check (status in ('Submitted', 'Pending Approval', 'Approved', 'Rejected')),
  submitted_at timestamptz default now()
);

-- ── Approvals ───────────────────────────
create table if not exists approvals (
  id             text primary key default 'APR-' || substr(gen_random_uuid()::text, 1, 8),
  rfq_id         text not null references rfqs(id),
  quotation_id   text not null references quotations(id),
  status         text not null default 'Pending'
                   check (status in ('Pending', 'Approved', 'Rejected')),
  remarks        text,
  approved_by    text,
  approved_at    timestamptz,
  timeline       jsonb default '[]',
  created_at     timestamptz default now()
);

-- ── Purchase Orders ─────────────────────
create table if not exists purchase_orders (
  id            text primary key default 'PO-' || substr(gen_random_uuid()::text, 1, 8),
  rfq_id        text not null references rfqs(id),
  quotation_id  text not null references quotations(id),
  vendor_id     text not null references vendors(id),
  product       text not null,
  quantity      integer not null,
  unit_price    bigint not null,
  subtotal      bigint not null,
  tax           bigint not null default 0,
  total         bigint not null,
  status        text not null default 'Active'
                  check (status in ('Active', 'Invoiced', 'Cancelled')),
  created_at    timestamptz default now()
);

-- ── Invoices ────────────────────────────
create table if not exists invoices (
  id          text primary key default 'INV-' || substr(gen_random_uuid()::text, 1, 8),
  po_id       text not null references purchase_orders(id),
  vendor_id   text not null references vendors(id),
  product     text not null,
  quantity    integer not null,
  subtotal    bigint not null,
  tax         bigint not null default 0,
  total       bigint not null,
  status      text not null default 'Draft'
                check (status in ('Draft', 'Sent', 'Paid')),
  due_date    date,
  created_at  timestamptz default now()
);

-- ── Activity Logs ───────────────────────
create table if not exists activity_logs (
  id         bigserial primary key,
  action     text not null,
  detail     text,
  by         text not null,
  type       text,
  created_at timestamptz default now()
);
