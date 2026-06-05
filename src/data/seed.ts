export const VENDORS0 = [
  { id:"V001", name:"TechSupply Co.",   category:"Electronics", gst:"27AABCT1234C1Z5", contact:"Arjun Mehta",  email:"arjun@techsupply.in",  phone:"+91-98765-43210", status:"Active",   rating:4.8 },
  { id:"V002", name:"OfficeWorks Ltd.", category:"Stationery",  gst:"27BBBOF5678D2Z6", contact:"Priya Shah",   email:"priya@officeworks.in", phone:"+91-98765-12345", status:"Active",   rating:4.2 },
  { id:"V003", name:"Industrial Gear",  category:"Machinery",   gst:"27CCCIG9012E3Z7", contact:"Rahul Patel",  email:"rahul@igear.in",       phone:"+91-98765-67890", status:"Active",   rating:3.9 },
  { id:"V004", name:"CloudKit Pvt.",    category:"Software",    gst:"27DDDCK3456F4Z8", contact:"Sneha Joshi",  email:"sneha@cloudkit.in",    phone:"+91-98765-11111", status:"Inactive", rating:4.5 },
];

export const RFQS0 = [
  { id:"RFQ-001", title:"Office Laptops Q4",  product:"Dell Latitude 5540", quantity:25,  unit:"units", deadline:"2024-12-20", vendors:["V001","V004"], status:"Quoted", createdBy:"officer", createdAt:"2024-12-01" },
  { id:"RFQ-002", title:"Printer Cartridges", product:"HP LaserJet Carts",  quantity:100, unit:"packs", deadline:"2024-12-15", vendors:["V002"],        status:"Open",   createdBy:"officer", createdAt:"2024-12-05" },
];

export const QUOTES0 = [
  { id:"Q-001", rfqId:"RFQ-001", vendorId:"V001", unitPrice:78000, totalPrice:1950000, delivery:"10 days", notes:"Includes 1yr warranty",     status:"Submitted", submittedAt:"2024-12-03" },
  { id:"Q-002", rfqId:"RFQ-001", vendorId:"V004", unitPrice:82000, totalPrice:2050000, delivery:"7 days",  notes:"Express delivery available", status:"Submitted", submittedAt:"2024-12-04" },
];

export const POS0 = [
  { id:"PO-001", rfqId:"RFQ-001", quotationId:"Q-001", vendorId:"V001", product:"Dell Latitude 5540", quantity:25, unitPrice:78000, subtotal:1950000, tax:351000, total:2301000, status:"Active", createdAt:"2024-12-06" },
];

export const INVOICES0 = [
  { id:"INV-001", poId:"PO-001", vendorId:"V001", product:"Dell Latitude 5540", quantity:25, subtotal:1950000, tax:351000, total:2301000, status:"Sent", createdAt:"2024-12-07", dueDate:"2024-12-21" },
];

export const APPROVALS0 = [
  { id:"APR-001", rfqId:"RFQ-001", quotationId:"Q-001", status:"Approved", remarks:"Best value", approvedBy:"manager", approvedAt:"2024-12-05",
    timeline:[
      { action:"Submitted for approval", by:"officer", at:"2024-12-04 14:30" },
      { action:"Approved",               by:"manager", at:"2024-12-05 09:15" },
    ],
  },
];

export const LOGS0 = [
  { id:1, action:"RFQ Created",        detail:"RFQ-001: Office Laptops Q4",  by:"officer", at:"2024-12-01 10:00", type:"rfq"      },
  { id:2, action:"Quotation Received", detail:"Q-001 from TechSupply Co.",    by:"vendor",  at:"2024-12-03 11:30", type:"quote"    },
  { id:3, action:"Quotation Approved", detail:"APR-001 approved by manager",  by:"manager", at:"2024-12-05 09:15", type:"approval" },
  { id:4, action:"PO Generated",       detail:"PO-001 created",               by:"officer", at:"2024-12-06 10:00", type:"po"       },
  { id:5, action:"Invoice Sent",       detail:"INV-001 emailed to vendor",    by:"officer", at:"2024-12-07 14:00", type:"invoice"  },
];

export const USERS = [
  { id:"officer",     name:"Kavya Reddy",  role:"Procurement Officer", avatar:"KR" },
  { id:"vendor_V001", name:"Arjun Mehta",  role:"Vendor", avatar:"AM", vendorId:"V001" },
  { id:"vendor_V002", name:"Priya Shah",   role:"Vendor", avatar:"PS", vendorId:"V002" },
  { id:"vendor_V003", name:"Rahul Patel",  role:"Vendor", avatar:"RP", vendorId:"V003" },
  { id:"manager",     name:"Rohan Desai",  role:"Manager",             avatar:"RD" },
  { id:"admin",       name:"Anita Sharma", role:"Admin",               avatar:"AS" },
];

export const NAV: Record<string, string[]> = {
  officer:     ["dashboard","vendors","rfqs","quotations","compare","pos","invoices","logs","reports"],
  vendor_V001: ["dashboard","quotations","pos","invoices"],
  vendor_V002: ["dashboard","quotations","pos","invoices"],
  vendor_V003: ["dashboard","quotations","pos","invoices"],
  manager:     ["dashboard","approvals","rfqs","pos","reports","logs"],
  admin:       ["dashboard","vendors","rfqs","quotations","compare","pos","invoices","logs","reports"],
};

export const NAV_LABELS: Record<string, string> = {
  dashboard:"Dashboard", vendors:"Vendors", rfqs:"RFQs", quotations:"Quotations",
  compare:"Compare Quotes", pos:"Purchase Orders", invoices:"Invoices",
  approvals:"Approvals", logs:"Activity Logs", reports:"Reports",
};

export const NAV_ICONS: Record<string, string> = {
  dashboard:"🏠", vendors:"🏢", rfqs:"📋", quotations:"💬", compare:"⚖️",
  pos:"📦", invoices:"🧾", approvals:"✅", logs:"📜", reports:"📊",
};