export const VENDORS0 = [
  { id:"V001", name:"TechSupply Co.",   category:"Electronics", gst:"27AABCT1234C1Z5", contact:"Arjun Mehta",  email:"arjun@techsupply.in",  phone:"+91-98765-43210", status:"Active",   rating:4.8 },
  { id:"V002", name:"OfficeWorks Ltd.", category:"Stationery",  gst:"27BBBOF5678D2Z6", contact:"Priya Shah",   email:"priya@officeworks.in", phone:"+91-98765-12345", status:"Active",   rating:4.2 },
  { id:"V003", name:"Industrial Gear",  category:"Machinery",   gst:"27CCCIG9012E3Z7", contact:"Rahul Patel",  email:"rahul@igear.in",       phone:"+91-98765-67890", status:"Active",   rating:3.9 },
  { id:"V004", name:"CloudKit Pvt.",    category:"Software",    gst:"27DDDCK3456F4Z8", contact:"Sneha Joshi",  email:"sneha@cloudkit.in",    phone:"+91-98765-11111", status:"Inactive", rating:4.5 },
];

export const RFQS0: any[] = [];

export const QUOTES0: any[] = [];

export const POS0: any[] = [];

export const INVOICES0: any[] = [];

export const APPROVALS0: any[] = [];

export const LOGS0: any[] = [];

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