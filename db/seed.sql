-- ══════════════════════════════════════════
--  VendorBridge — Seed Data
-- ══════════════════════════════════════════

insert into vendors (id, name, category, gst, contact, email, phone, status, rating) values
  ('V001', 'TechSupply Co.',   'Electronics', '27AABCT1234C1Z5', 'Arjun Mehta',  'arjun@techsupply.in',  '+91-98765-43210', 'Active',   4.8),
  ('V002', 'OfficeWorks Ltd.', 'Stationery',  '27BBBOF5678D2Z6', 'Priya Shah',   'priya@officeworks.in', '+91-98765-12345', 'Active',   4.2),
  ('V003', 'Industrial Gear',  'Machinery',   '27CCCIG9012E3Z7', 'Rahul Patel',  'rahul@igear.in',       '+91-98765-67890', 'Active',   3.9),
  ('V004', 'CloudKit Pvt.',    'Software',    '27DDDCK3456F4Z8', 'Sneha Joshi',  'sneha@cloudkit.in',    '+91-98765-11111', 'Inactive', 4.5)
on conflict (id) do nothing;

insert into rfqs (id, title, product, quantity, unit, deadline, vendors, status, created_by, created_at) values
  ('RFQ-001', 'Office Laptops Q4',  'Dell Latitude 5540', 25,  'units', '2024-12-20', '{V001,V004}', 'Quoted', 'officer', '2024-12-01'),
  ('RFQ-002', 'Printer Cartridges', 'HP LaserJet Carts',  100, 'packs', '2024-12-15', '{V002}',      'Open',   'officer', '2024-12-05')
on conflict (id) do nothing;

insert into quotations (id, rfq_id, vendor_id, unit_price, total_price, delivery, notes, status, submitted_at) values
  ('Q-001', 'RFQ-001', 'V001', 78000, 1950000, '10 days', 'Includes 1yr warranty',     'Approved',  '2024-12-03'),
  ('Q-002', 'RFQ-001', 'V004', 82000, 2050000, '7 days',  'Express delivery available','Submitted', '2024-12-04')
on conflict (id) do nothing;

insert into approvals (id, rfq_id, quotation_id, status, remarks, approved_by, approved_at, timeline) values
  ('APR-001', 'RFQ-001', 'Q-001', 'Approved', 'Best value', 'manager', '2024-12-05',
   '[{"action":"Submitted for approval","by":"officer","at":"2024-12-04 14:30"},{"action":"Approved","by":"manager","at":"2024-12-05 09:15"}]')
on conflict (id) do nothing;

insert into purchase_orders (id, rfq_id, quotation_id, vendor_id, product, quantity, unit_price, subtotal, tax, total, status, created_at) values
  ('PO-001', 'RFQ-001', 'Q-001', 'V001', 'Dell Latitude 5540', 25, 78000, 1950000, 351000, 2301000, 'Active', '2024-12-06')
on conflict (id) do nothing;

insert into invoices (id, po_id, vendor_id, product, quantity, subtotal, tax, total, status, due_date, created_at) values
  ('INV-001', 'PO-001', 'V001', 'Dell Latitude 5540', 25, 1950000, 351000, 2301000, 'Sent', '2024-12-21', '2024-12-07')
on conflict (id) do nothing;

insert into activity_logs (action, detail, by, type, created_at) values
  ('RFQ Created',        'RFQ-001: Office Laptops Q4',     'officer', 'rfq',      '2024-12-01 10:00'),
  ('Quotation Received', 'Q-001 from TechSupply Co.',       'vendor',  'quote',    '2024-12-03 11:30'),
  ('Quotation Approved', 'APR-001 approved by manager',     'manager', 'approval', '2024-12-05 09:15'),
  ('PO Generated',       'PO-001 created',                  'officer', 'po',       '2024-12-06 10:00'),
  ('Invoice Sent',       'INV-001 emailed to vendor',       'officer', 'invoice',  '2024-12-07 14:00');
