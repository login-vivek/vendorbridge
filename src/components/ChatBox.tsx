import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { fmt, fmtD } from "./ui";

/* ── types ── */
interface Message {
  id: number;
  from: "user" | "bot";
  text: string;
  time: string;
}

interface Props {
  user: any;
  vendors: any[];
  rfqs: any[];
  quotations: any[];
  pos: any[];
  invoices: any[];
  approvals: any[];
}

/* ── suggested quick questions per role ── */
const SUGGESTIONS: Record<string, string[]> = {
  officer: [
    "How many open RFQs?",
    "Which vendor has the best rating?",
    "Show pending approvals",
    "Total spend this month",
  ],
  vendor_V001: [
    "Show my quotations",
    "Any open RFQs for me?",
    "Show my invoices",
  ],
  manager: [
    "What needs my approval?",
    "Show recent POs",
    "Top spending vendor?",
  ],
  admin: [
    "How many active vendors?",
    "Summary of all RFQs",
    "Total invoice value",
  ],
};

/* ── bot brain: rule-based NLP over app data ── */
function botReply(input: string, props: Props): string {
  const q   = input.toLowerCase().trim();
  const { vendors, rfqs, quotations, pos, invoices, approvals, user } = props;

  /* ── greetings ── */
  if (/^(hi|hello|hey|yo|sup)/.test(q))
    return `Hey ${user.name.split(" ")[0]}! 👋 I'm your VendorBridge assistant. Ask me anything about vendors, RFQs, orders, or invoices.`;

  if (/help|what can you/.test(q))
    return `I can answer questions like:\n• "How many open RFQs?"\n• "Which vendor has the best rating?"\n• "Show pending approvals"\n• "Total spend"\n• "List all vendors"\n• "Show overdue invoices"`;

  /* ── vendors ── */
  if (/list.*vendor|all vendor|vendor list/.test(q)) {
    const active = vendors.filter(v => v.status === "Active");
    return `📋 ${vendors.length} vendors total (${active.length} active):\n` +
      vendors.map(v => `• ${v.name} — ${v.category} [${v.status}] ★${v.rating}`).join("\n");
  }
  if (/best.*rating|highest.*rating|top.*vendor/.test(q)) {
    const top = [...vendors].sort((a, b) => b.rating - a.rating)[0];
    return `⭐ Best rated vendor: ${top.name} with ★${top.rating} (${top.category})`;
  }
  if (/active vendor|how many vendor/.test(q)) {
    const n = vendors.filter(v => v.status === "Active").length;
    return `🏢 You have ${n} active vendors out of ${vendors.length} total.`;
  }
  if (/inactive vendor/.test(q)) {
    const list = vendors.filter(v => v.status === "Inactive");
    if (!list.length) return "✅ No inactive vendors right now!";
    return `⚠️ ${list.length} inactive vendor(s):\n` + list.map(v => `• ${v.name}`).join("\n");
  }

  /* ── RFQs ── */
  if (/open rfq|how many.*rfq|rfq count/.test(q)) {
    const open   = rfqs.filter(r => r.status === "Open").length;
    const quoted = rfqs.filter(r => r.status === "Quoted").length;
    return `📋 RFQ status:\n• Open: ${open}\n• Quoted: ${quoted}\n• Closed: ${rfqs.filter(r => r.status === "Closed").length}\n• Total: ${rfqs.length}`;
  }
  if (/list.*rfq|all rfq|rfq list|show.*rfq/.test(q)) {
    if (!rfqs.length) return "No RFQs created yet.";
    return `📋 All RFQs:\n` + rfqs.map(r => `• ${r.id}: ${r.title} [${r.status}] — due ${fmtD(r.deadline)}`).join("\n");
  }
  if (/overdue rfq|expired rfq/.test(q)) {
    const today = new Date();
    const list  = rfqs.filter(r => r.deadline && new Date(r.deadline) < today && r.status !== "Closed");
    if (!list.length) return "✅ No overdue RFQs!";
    return `⚠️ ${list.length} overdue RFQ(s):\n` + list.map(r => `• ${r.id}: ${r.title} (due ${fmtD(r.deadline)})`).join("\n");
  }

  /* ── quotations ── */
  if (/quotation|quote/.test(q) && /pending|waiting/.test(q)) {
    const list = quotations.filter(q => q.status === "Submitted");
    if (!list.length) return "No quotations waiting for action.";
    return `💬 ${list.length} submitted quotation(s) awaiting action:\n` +
      list.map(qt => {
        const v = vendors.find(x => x.id === qt.vendorId);
        return `• ${qt.id} from ${v?.name || qt.vendorId} — ${fmt(qt.totalPrice)}`;
      }).join("\n");
  }
  if (/how many.*quote|quote count|total.*quote/.test(q)) {
    return `💬 ${quotations.length} total quotations received.`;
  }

  /* ── approvals ── */
  if (/pending.*approval|approval.*pending|need.*approval|waiting.*approval/.test(q)) {
    const list = approvals.filter((a: any) => a.status === "Pending");
    if (!list.length) return "✅ No pending approvals. All clear!";
    return `✅ ${list.length} pending approval(s):\n` +
      list.map((a: any) => `• ${a.quotationId} (RFQ: ${a.rfqId})`).join("\n");
  }
  if (/approved|rejected/.test(q) && /approval/.test(q)) {
    const approved = approvals.filter((a: any) => a.status === "Approved").length;
    const rejected = approvals.filter((a: any) => a.status === "Rejected").length;
    return `✅ Approvals: ${approved} approved, ${rejected} rejected, ${approvals.filter((a: any) => a.status === "Pending").length} pending.`;
  }

  /* ── purchase orders ── */
  if (/total.*spend|how much.*spent|spend|expenditure/.test(q)) {
    const total = pos.reduce((s: number, p: any) => s + p.total, 0);
    return `💰 Total spend across all POs: ${fmt(total)}`;
  }
  if (/list.*po|all.*po|purchase order|show.*po/.test(q)) {
    if (!pos.length) return "No purchase orders yet.";
    return `📦 ${pos.length} Purchase Order(s):\n` +
      pos.map(p => {
        const v = vendors.find((x: any) => x.id === p.vendorId);
        return `• ${p.id}: ${p.product} — ${v?.name} — ${fmt(p.total)}`;
      }).join("\n");
  }
  if (/how many.*po|po count/.test(q)) {
    return `📦 ${pos.length} purchase order(s) total.`;
  }

  /* ── invoices ── */
  if (/overdue.*invoice|unpaid.*invoice/.test(q)) {
    const today = new Date();
    const list  = invoices.filter((i: any) => i.dueDate && new Date(i.dueDate) < today && i.status !== "Paid");
    if (!list.length) return "✅ No overdue invoices!";
    return `⚠️ ${list.length} overdue invoice(s):\n` +
      list.map((i: any) => `• ${i.id} — ${fmt(i.total)} (due ${fmtD(i.dueDate)})`).join("\n");
  }
  if (/invoice|inv/.test(q) && /list|all|show/.test(q)) {
    if (!invoices.length) return "No invoices yet.";
    return `🧾 ${invoices.length} invoice(s):\n` +
      invoices.map((i: any) => {
        const v = vendors.find((x: any) => x.id === i.vendorId);
        return `• ${i.id}: ${v?.name} — ${fmt(i.total)} [${i.status}]`;
      }).join("\n");
  }
  if (/total.*invoice|invoice.*value/.test(q)) {
    const total = invoices.reduce((s: number, i: any) => s + i.total, 0);
    return `🧾 Total invoice value: ${fmt(total)} across ${invoices.length} invoice(s).`;
  }
  if (/sent.*invoice|invoice.*sent/.test(q)) {
    const n = invoices.filter((i: any) => i.status === "Sent").length;
    return `📧 ${n} invoice(s) have been sent to vendors.`;
  }
  if (/draft.*invoice|invoice.*draft/.test(q)) {
    const list = invoices.filter((i: any) => i.status === "Draft");
    if (!list.length) return "No draft invoices.";
    return `📄 ${list.length} draft invoice(s) not yet sent:\n` + list.map((i: any) => `• ${i.id} — ${fmt(i.total)}`).join("\n");
  }
  if (/how many.*invoice|invoice count/.test(q)) {
    return `🧾 ${invoices.length} invoice(s) total.`;
  }

  /* ── summary / dashboard ── */
  if (/summary|overview|dashboard/.test(q)) {
    const spend = pos.reduce((s: number, p: any) => s + p.total, 0);
    return `📊 VendorBridge Summary:\n• Vendors: ${vendors.filter(v => v.status === "Active").length} active\n• RFQs: ${rfqs.filter(r => r.status === "Open").length} open\n• Pending approvals: ${approvals.filter((a: any) => a.status === "Pending").length}\n• Total spend: ${fmt(spend)}\n• Invoices: ${invoices.length} (${invoices.filter((i: any) => i.status === "Draft").length} draft)`;
  }

  /* ── fallback ── */
  return `🤔 I'm not sure about that. Try asking:\n• "Show open RFQs"\n• "List all vendors"\n• "Total spend"\n• "Pending approvals"\n• "Show invoices"`;
}

/* ══════════════════════════════════════════
   CHATBOX COMPONENT
══════════════════════════════════════════ */
export default function ChatBox(props: Props) {
  const { user } = props;
  const [open, setOpen]     = useState(false);
  const [input, setInput]   = useState("");
  const [msgs, setMsgs]     = useState<Message[]>([
    { id:0, from:"bot", text:`Hi ${user.name.split(" ")[0]}! 👋 I'm your procurement assistant. Ask me anything about vendors, RFQs, orders, or invoices.`, time: now() },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, open]);

  const send = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    const userMsg: Message = { id:Date.now(), from:"user", text:msg, time:now() };
    const reply  = botReply(msg, props);
    const botMsg: Message  = { id:Date.now()+1, from:"bot", text:reply, time:now() };
    setMsgs(m => [...m, userMsg, botMsg]);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const suggestions = SUGGESTIONS[user.id] || SUGGESTIONS.officer;

  return (
    <>
      {/* ── floating toggle button ── */}
      <button onClick={() => setOpen(o => !o)}
        style={{ position:"fixed", bottom:24, right:24, width:52, height:52, borderRadius:"50%", background:"#2563eb", color:"#fff", border:"none", cursor:"pointer", boxShadow:"0 4px 16px rgba(37,99,235,0.45)", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, transition:"transform .15s" }}
        title={open ? "Close chat" : "Open assistant"}>
        {open ? "✕" : "💬"}
      </button>

      {/* ── chat panel ── */}
      {open && (
        <div style={{ position:"fixed", bottom:88, right:24, width:360, height:500, background:"#fff", borderRadius:14, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", border:"1px solid #e5e7eb", display:"flex", flexDirection:"column", zIndex:998, overflow:"hidden" }}>

          {/* header */}
          <div style={{ padding:"14px 16px", background:"#2563eb", color:"#fff", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>VendorBridge Assistant</div>
              <div style={{ fontSize:11, opacity:0.8 }}>● Online · knows your data</div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ marginLeft:"auto", background:"none", border:"none", color:"#fff", fontSize:18, cursor:"pointer", lineHeight:1, opacity:0.8 }}>✕</button>
          </div>

          {/* messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {msgs.map(m => (
              <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:m.from==="user"?"flex-end":"flex-start" }}>
                <div style={{
                  maxWidth:"82%", padding:"9px 13px", borderRadius:m.from==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                  background:m.from==="user"?"#2563eb":"#f3f4f6",
                  color:m.from==="user"?"#fff":"#111",
                  fontSize:13, lineHeight:1.55, whiteSpace:"pre-wrap", wordBreak:"break-word",
                }}>
                  {m.text}
                </div>
                <span style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>{m.time}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* suggestions */}
          <div style={{ padding:"6px 12px", borderTop:"1px solid #f3f4f6", display:"flex", gap:6, overflowX:"auto" }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ whiteSpace:"nowrap", padding:"4px 10px", border:"1px solid #dbeafe", borderRadius:99, fontSize:11, background:"#eff6ff", color:"#2563eb", cursor:"pointer", flexShrink:0 }}>
                {s}
              </button>
            ))}
          </div>

          {/* input */}
          <div style={{ padding:"10px 12px", borderTop:"1px solid #e5e7eb", display:"flex", gap:8 }}>
            <input
              style={{ flex:1, padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:13, outline:"none", background:"#f9fafb" }}
              placeholder="Ask anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              autoFocus
            />
            <button onClick={() => send()}
              style={{ padding:"8px 14px", background:input.trim()?"#2563eb":"#e5e7eb", color:input.trim()?"#fff":"#9ca3af", border:"none", borderRadius:8, cursor:input.trim()?"pointer":"default", fontSize:16, transition:"background .15s" }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}
