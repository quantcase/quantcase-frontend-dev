"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StockSignal {
  label: string;
  type: "green" | "amber" | "red" | "neutral";
}

interface StockData {
  id: string;
  name: string;
  sector: string;
  cap: string;
  color: string;
  price: string;
  delta: string;
  deltaDir: "pos" | "neg";
  mod: { M: number; O: number; D: number };
  signals: StockSignal[];
  aiContext: { M: string; O: string; D: string };
  subFactors: { M: string[]; O: string[]; D: string[] };
  prompts: string[];
}

interface StockState {
  dim: "M" | "O" | "D" | null;
  subFactors: string[];
  thesis: string;
  conviction: number;
  done: boolean;
}

interface CompleteJournalModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Static data ───────────────────────────────────────────────────────────────

const STOCKS: StockData[] = [
  {
    id: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy",
    cap: "Large Cap",
    color: "#1A6B35",
    price: "₹2,891",
    delta: "+16.5%",
    deltaDir: "pos",
    mod: { M: 74, O: 80, D: 72 },
    signals: [
      { label: "Jio subscriber growth steady", type: "green" },
      { label: "Retail expansion on track", type: "green" },
      { label: "Petchem margins under pressure", type: "amber" },
      { label: "O2C business headwinds", type: "amber" },
    ],
    aiContext: {
      M: "Management has delivered on Jio KPIs for 6 consecutive quarters. Capital allocation across verticals (Retail, Jio, O2C) is complex — Guidance Accuracy score: 74, dragged by O2C margin miss in Q2.",
      O: "Jio has 35%+ market share and the retail expansion story is real — 4,200+ stores added YoY. O2C is cyclical and under pressure. The opportunity thesis depends on which segment you're buying.",
      D: "At 1.4× P/B and 22× P/E — not cheap, but not stretched. SOTP valuation gives meaningful upside if Jio is valued as a standalone digital business. P/E re-rating potential is moderate.",
    },
    subFactors: {
      M: ["Guidance Accuracy", "Capital Allocation", "Disclosure Honesty"],
      O: ["Industry Tailwind", "Distribution Strength", "Competitive Edge", "TAM Expansion"],
      D: ["Valuation", "Earnings Growth/Quality", "P/E Re-rating Potential", "Risk-Reward"],
    },
    prompts: [
      "Buying for Jio value unlock...",
      "Retail expansion undervalued by market...",
      "Conglomerate discount will narrow...",
    ],
  },
  {
    id: "SBIN",
    name: "State Bank of India",
    sector: "PSU Banks",
    cap: "Large Cap",
    color: "#1D4ED8",
    price: "₹812.40",
    delta: "+12.8%",
    deltaDir: "pos",
    mod: { M: 76, O: 80, D: 68 },
    signals: [
      { label: "NPA cycle largely behind", type: "green" },
      { label: "ROE consistently above 15%", type: "green" },
      { label: "Government ownership — policy risk", type: "amber" },
      { label: "CASA ratio stable", type: "green" },
    ],
    aiContext: {
      M: "Guidance accuracy has improved significantly over 4 years. The NPA cleanup was transparent and disciplined. Capital allocation has been rational — no aggressive lending cycles. Promoter is government, which introduces political risk but also capital support.",
      O: "India's largest lender by assets — distribution moat is unrivalled with 22,000+ branches. Credit cycle is supportive. The PSU banking sector tailwind is real, particularly for infrastructure financing.",
      D: "Trades at 1.3× P/B — below most private peers. P/E re-rating potential is the classic PSU thesis. ROE > 16% sustained for 3 years justifies rerating. Risk-reward is attractive at current valuation.",
    },
    subFactors: {
      M: ["Guidance Accuracy", "Capital Allocation", "Disclosure Honesty"],
      O: ["Industry Tailwind", "Distribution Strength", "Competitive Edge", "TAM Expansion"],
      D: ["Valuation", "Earnings Growth/Quality", "P/E Re-rating Potential", "Risk-Reward"],
    },
    prompts: [
      "PSU re-rating thesis — P/B discount vs private peers...",
      "Credit cycle recovery and ROE expansion...",
      "Distribution moat is unmatched in Indian banking...",
    ],
  },
  {
    id: "KPIGREEN",
    name: "KPI Green Energy",
    sector: "Renewable Energy",
    cap: "Small Cap",
    color: "#065F46",
    price: "₹594.20",
    delta: "−12.6%",
    deltaDir: "neg",
    mod: { M: 62, O: 74, D: 48 },
    signals: [
      { label: "India solar capacity target +10× by 2030", type: "green" },
      { label: "Order book growing 40% YoY", type: "green" },
      { label: "Working capital cycle stretched", type: "amber" },
      { label: "Small cap — liquidity risk", type: "amber" },
    ],
    aiContext: {
      M: "Guidance accuracy score is 62 — the weakest dimension. Promoter has walked back two execution timelines. However, disclosure quality is improving QoQ. Small management team — key-man risk exists.",
      O: "Secular tailwind is very strong — India's solar capacity must grow 10× to meet 2030 targets. KPI Green has an order book growing 40% YoY. Competitive edge is strong in Gujarat solar corridors. The opportunity is real.",
      D: "Current valuations (P/E 38×) imply high execution — downside is significant if management misses again. Risk-reward is the concern. However, for a 3-5 year holding, the opportunity size justifies a speculative position.",
    },
    subFactors: {
      M: ["Guidance Accuracy", "Capital Allocation", "Disclosure Honesty"],
      O: ["Industry Tailwind", "Distribution Strength", "Competitive Edge", "TAM Expansion"],
      D: ["Valuation", "Earnings Growth/Quality", "P/E Re-rating Potential", "Risk-Reward"],
    },
    prompts: [
      "Buying the India solar secular theme...",
      "Order book growth justifies premium...",
      "High risk, high reward — sized accordingly...",
    ],
  },
  {
    id: "TATASTEEL",
    name: "Tata Steel",
    sector: "Metals",
    cap: "Large Cap",
    color: "#1E3A5F",
    price: "₹162.40",
    delta: "+9.7%",
    deltaDir: "pos",
    mod: { M: 68, O: 64, D: 72 },
    signals: [
      { label: "Europe operations turning cash positive", type: "green" },
      { label: "India volumes growing 8% YoY", type: "green" },
      { label: "Steel cycle at mid-cycle, not peak", type: "neutral" },
      { label: "Debt reduction ongoing", type: "green" },
    ],
    aiContext: {
      M: "Tata Steel management has been transparent about Europe struggles and has consistently delivered on debt reduction targets. Capital allocation decision to stay in Europe was controversial but appears to be playing out. Guidance accuracy: 68 — reasonable for a cyclical business.",
      O: "India steel demand is structural — infrastructure, housing, auto. Europe recovery is the optionality. The sector tailwind is moderate (mid-cycle), not a screaming buy. Competitive edge in Indian operations is strong.",
      D: "Valuation is attractive — trading at 0.9× replacement cost. Debt reduction gives earnings leverage. P/E re-rating potential exists as Europe losses shrink. Risk-reward is favourable at this price.",
    },
    subFactors: {
      M: ["Guidance Accuracy", "Capital Allocation", "Disclosure Honesty"],
      O: ["Industry Tailwind", "Distribution Strength", "Competitive Edge", "TAM Expansion"],
      D: ["Valuation", "Earnings Growth/Quality", "P/E Re-rating Potential", "Risk-Reward"],
    },
    prompts: [
      "Cyclical recovery play — buying at trough valuation...",
      "Europe optionality not priced in...",
      "India steel demand structural over 5 years...",
    ],
  },
];

const CONV_LABELS = [
  { label: "Watching", desc: "Not yet decided" },
  { label: "Interested", desc: "Early signals positive" },
  { label: "Moderate", desc: "Core thesis in place" },
  { label: "High", desc: "Strong conviction" },
  { label: "Highest", desc: "Maximum conviction" },
];

const SF_HINTS: Record<string, string> = {
  "Guidance Accuracy": "Management has consistently delivered on forward guidance — or consistently missed. Check how closely revenue/margin actuals tracked what was said.",
  "Capital Allocation": "Where does surplus cash go — buybacks, dividends, acquisitions, or capex? Compounders allocate capital to highest-return uses.",
  "Disclosure Honesty": "Does management acknowledge headwinds early, or bury negatives? Tone in concalls, change in auditor, related-party transactions.",
  "Industry Tailwind": "Is demand for this product/service structurally growing? Is this a sunrise sector or a sunset one with temporary revival?",
  "Distribution Strength": "How deep is the reach — geographically and across customer segments? A strong distribution moat is hard to replicate.",
  "Competitive Edge": "What stops competitors from taking share? Brand, switching costs, network effects, patents, regulatory moats.",
  "TAM Expansion": "Is the total addressable market growing through new geographies, new customer segments, or adjacent products?",
  "Valuation": "Is the stock cheap vs intrinsic value, vs sector peers, and vs its own historical multiples?",
  "Earnings Growth/Quality": "Is EPS growing — and is that growth real (operating leverage, volume) vs manufactured (buybacks, one-offs)?",
  "P/E Re-rating Potential": "Is there a specific trigger — debt paydown, margin improvement, sector rotation — that could cause the multiple to expand?",
  "Risk-Reward": "At the current price, what do you make in the bull case vs what you lose in the bear case? Is the skew favourable?",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function dimColor(dim: "M" | "O" | "D") {
  if (dim === "M") return "#16A34A";
  if (dim === "O") return "#2563EB";
  return "#7C3AED";
}

function dimBg(dim: "M" | "O" | "D") {
  if (dim === "M") return "#DCFCE7";
  if (dim === "O") return "#DBEAFE";
  return "#EDE9FE";
}

function signalIcon(type: StockSignal["type"]) {
  if (type === "green") return "✓";
  if (type === "amber") return "⚡";
  if (type === "red") return "✕";
  return "—";
}

// ── Main component ────────────────────────────────────────────────────────────

export function CompleteJournalModal({ open, onClose }: CompleteJournalModalProps) {
  const [cur, setCur] = useState(0);
  const [states, setStates] = useState<StockState[]>(
    STOCKS.map(() => ({ dim: null, subFactors: [], thesis: "", conviction: 0, done: false }))
  );
  const [hintText, setHintText] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setCur(0);
      setStates(STOCKS.map(() => ({ dim: null, subFactors: [], thesis: "", conviction: 0, done: false })));
      setHintText(null);
      setCompleted(false);
    }
  }, [open]);

  // Scroll body to top on step change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [cur]);

  if (!open) return null;

  const st = states[cur];
  const s = STOCKS[cur];
  const dim = st.dim;

  const canSave = dim !== null && st.thesis.trim().length > 10 && st.conviction > 0;

  function updateState(patch: Partial<StockState>) {
    setStates(prev => {
      const next = [...prev];
      next[cur] = { ...next[cur], ...patch };
      return next;
    });
  }

  function selectDim(d: "M" | "O" | "D") {
    updateState({ dim: d, subFactors: [] });
    setHintText(null);
  }

  function toggleSubFactor(sf: string) {
    const arr = st.subFactors;
    const has = arr.includes(sf);
    updateState({ subFactors: has ? arr.filter(x => x !== sf) : [...arr, sf] });
    setHintText(SF_HINTS[sf] ?? null);
  }

  function setConviction(level: number) {
    updateState({ conviction: level });
  }

  function usePrompt(text: string) {
    updateState({ thesis: text });
  }

  function advance(markDone = true) {
    const nextStates = markDone
      ? states.map((s, i) => (i === cur ? { ...s, done: true } : s))
      : states;

    const nextIdx = nextStates.findIndex((s, i) => !s.done && i > cur);
    if (nextIdx === -1) {
      const remaining = nextStates.filter(s => !s.done);
      if (remaining.length === 0) {
        if (markDone) setStates(nextStates);
        setCompleted(true);
      } else {
        if (markDone) setStates(nextStates);
        setCur(nextStates.findIndex(s => !s.done));
      }
    } else {
      if (markDone) setStates(nextStates);
      setCur(nextIdx);
    }
    setHintText(null);
  }

  function skipHolding() {
    advance(true);
  }

  function saveAndNext() {
    advance(true);
  }

  const doneCount = states.filter(s => s.done).length;
  const isLast = states.filter(s => !s.done).length <= 1;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,25,23,0.6)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #E7E4DC", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716C", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔥</span> Complete your investment journal
            </div>
            <div style={{ fontFamily: "var(--font-ibm-plex-sans, 'IBM Plex Sans', serif)", fontSize: 22, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1C1917" }}>
              {completed ? "Journal complete" : `${cur + 1} of ${STOCKS.length} — ${s.id}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "#F7F5F0", border: "1px solid #D6D0C4", width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#44403C", flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ padding: "12px 28px", borderBottom: "1px solid #E7E4DC", background: "#F7F5F0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {STOCKS.map((stock, i) => {
              const done = states[i].done;
              const active = !completed && i === cur;
              const cls = done ? "done" : active ? "active" : "empty";
              return (
                <div key={stock.id} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, alignItems: "center", position: "relative" }}>
                  {i < STOCKS.length - 1 && (
                    <div style={{ position: "absolute", left: "calc(50% + 18px)", right: "calc(-50% + 18px)", top: 14, height: 1, background: "#D6D0C4" }} />
                  )}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 600, position: "relative", zIndex: 1,
                    background: cls === "done" ? "#1C1917" : cls === "active" ? "#7C3AED" : "#fff",
                    color: cls === "empty" ? "#78716C" : "#fff",
                    border: cls === "empty" ? "1.5px solid #D6D0C4" : "none",
                    boxShadow: cls === "active" ? "0 0 0 4px #EDE9FE" : "none",
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: cls === "active" ? "#7C3AED" : cls === "done" ? "#44403C" : "#78716C", fontWeight: 600, textAlign: "center" }}>
                    {stock.id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto" }}>
          {completed ? (
            <CompletionView onClose={onClose} doneCount={doneCount} />
          ) : (
            <StepView
              s={s}
              st={st}
              dim={dim}
              hintText={hintText}
              onSelectDim={selectDim}
              onToggleSubFactor={toggleSubFactor}
              onSetConviction={setConviction}
              onUsePrompt={usePrompt}
              onThesisChange={(val) => updateState({ thesis: val })}
            />
          )}
        </div>

        {/* ── Footer ── */}
        {!completed && (
          <div style={{ padding: "14px 28px", borderTop: "1px solid #E7E4DC", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "#fff" }}>
            <button
              onClick={skipHolding}
              style={{ fontSize: 12, color: "#78716C", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}
            >
              Skip this stock →
            </button>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={onClose}
                style={{ background: "#fff", color: "#44403C", border: "1px solid #D6D0C4", padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              >
                Save for later
              </button>
              <button
                disabled={!canSave}
                onClick={saveAndNext}
                style={{
                  background: canSave ? "#1C1917" : "#1C1917",
                  color: "#fff",
                  border: "none",
                  padding: "9px 22px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: canSave ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: canSave ? 1 : 0.4,
                }}
              >
                {isLast ? "Complete journal 🎉" : "Save & next →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step view ─────────────────────────────────────────────────────────────────

function StepView({
  s, st, dim, hintText,
  onSelectDim, onToggleSubFactor, onSetConviction, onUsePrompt, onThesisChange,
}: {
  s: StockData;
  st: StockState;
  dim: "M" | "O" | "D" | null;
  hintText: string | null;
  onSelectDim: (d: "M" | "O" | "D") => void;
  onToggleSubFactor: (sf: string) => void;
  onSetConviction: (n: number) => void;
  onUsePrompt: (text: string) => void;
  onThesisChange: (val: string) => void;
}) {
  const dimLabel = dim === "M" ? "Management" : dim === "O" ? "Opportunity" : dim === "D" ? "Deal" : "overview";

  return (
    <>
      {/* Stock identity bar */}
      <div style={{ padding: "18px 28px 14px", borderBottom: "1px solid #E7E4DC", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center", background: "#F7F5F0" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", background: s.color, flexShrink: 0 }}>
          {s.id[0]}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1917" }}>{s.name}</div>
          <div style={{ fontSize: 12, color: "#78716C", marginTop: 2 }}>{s.sector} · {s.cap}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 18, fontWeight: 600, color: "#1C1917" }}>{s.price}</div>
          <div style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12, marginTop: 1, color: s.deltaDir === "pos" ? "#15803D" : "#B91C1C" }}>{s.delta}</div>
        </div>
        {/* MOD mini bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          {(["M", "O", "D"] as const).map(d => (
            <div key={d} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-serif, 'IBM Plex Serif', serif)", fontStyle: "italic", fontSize: 15, color: dimColor(d), width: 14, textAlign: "center" }}>{d}</div>
              <div style={{ width: 48, height: 4, background: "#E7E4DC", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.mod[d]}%`, background: dimColor(d), borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, width: 20, textAlign: "right", color: "#1C1917" }}>{s.mod[d]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Context signals */}
      <div style={{ padding: "20px 28px 14px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#78716C", marginBottom: 8 }}>
          What the data is saying about {s.id}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {s.signals.map((sig, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 7,
              fontSize: 11, fontWeight: 500,
              ...(sig.type === "green" ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" } :
                sig.type === "amber" ? { background: "#FFFBEB", color: "#B45309", border: "1px solid #FCD34D" } :
                sig.type === "red"   ? { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5" } :
                                      { background: "#F7F5F0", color: "#44403C", border: "1px solid #D6D0C4" }),
            }}>
              {signalIcon(sig.type)} {sig.label}
            </div>
          ))}
        </div>

        {/* AI context box */}
        <div style={{ background: "linear-gradient(135deg,#EDE9FE,#F5F3FF)", border: "1px solid #DDD6FE", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12 }}>
          <div style={{ width: 28, height: 28, background: "#fff", borderRadius: 7, border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#6D28D9", marginBottom: 5 }}>
              Quantcase context — {dimLabel}
            </div>
            <div style={{ fontSize: 12, color: "#4C1D95", lineHeight: 1.55 }}>
              {dim ? s.aiContext[dim] : `Quantcase scores ${s.id} at MOD ${s.mod.M}/${s.mod.O}/${s.mod.D} across Management / Opportunity / Deal. Select a dimension below to see what the data says about each.`}
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Dimension picker */}
      <div style={{ borderTop: "1px solid #E7E4DC", padding: "20px 28px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#44403C", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <StepNum n={1} />
          Which dimension drove your decision to buy?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {([
            { key: "M" as const, name: "Management", q: "Do they do what they say?" },
            { key: "O" as const, name: "Opportunity", q: "Is the business worth owning?" },
            { key: "D" as const, name: "Deal", q: "Is the price actually fair?" },
          ]).map(d => {
            const selected = dim === d.key;
            return (
              <div
                key={d.key}
                onClick={() => onSelectDim(d.key)}
                style={{
                  border: selected ? `1.5px solid ${dimColor(d.key)}` : "1.5px solid #D6D0C4",
                  borderRadius: 12,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: selected ? dimBg(d.key) : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontFamily: "var(--font-serif, serif)", fontStyle: "italic", fontSize: 32, fontWeight: 400, lineHeight: 1, color: selected ? dimColor(d.key) : "#A8A29E" }}>{d.key}</div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#44403C" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#78716C", lineHeight: 1.4 }}>{d.q}</div>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, color: selected ? dimColor(d.key) : "#A8A29E" }}>
                  Score: {s.mod[d.key]}/100
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Sub-factors */}
      {dim && (
        <div style={{ borderTop: "1px solid #E7E4DC", padding: "20px 28px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: dimColor(dim), marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <StepNum n={2} />
            What specifically drove your view?
          </div>
          <p style={{ fontSize: 13, color: "#44403C", marginBottom: 12, lineHeight: 1.5 }}>
            Pick the sub-factors that resonated — these become searchable tags on your journal entry.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 4 }}>
            {s.subFactors[dim].map(sf => {
              const sel = st.subFactors.includes(sf);
              return (
                <div
                  key={sf}
                  onClick={() => onToggleSubFactor(sf)}
                  style={{
                    padding: "6px 12px", borderRadius: 999,
                    border: sel ? `1.5px solid ${dimColor(dim)}` : "1.5px solid #D6D0C4",
                    fontSize: 11, fontWeight: 500, cursor: "pointer",
                    background: sel ? dimBg(dim) : "#fff",
                    color: sel ? dimColor(dim) : "#44403C",
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "all 0.15s",
                  }}
                >
                  {sel && <span style={{ fontSize: 9, fontWeight: 700 }}>✓</span>} {sf}
                </div>
              );
            })}
          </div>
          {hintText && (
            <div style={{ fontSize: 11, color: "#78716C", lineHeight: 1.4, padding: "8px 12px", background: "#F7F5F0", borderRadius: 8, border: "1px solid #E7E4DC", marginTop: 8 }}>
              {hintText}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Thesis */}
      {dim && (
        <div style={{ borderTop: "1px solid #E7E4DC", padding: "20px 28px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#44403C", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <StepNum n={3} />
            Write your thesis in one or two sentences
          </div>
          <p style={{ fontSize: 13, color: "#44403C", marginBottom: 10, lineHeight: 1.5 }}>
            Why do you own this? What has to be true for it to work? Use your own words — prompts below if you&apos;re stuck.
          </p>
          <div style={{ position: "relative" }}>
            <textarea
              value={st.thesis}
              onChange={e => onThesisChange(e.target.value)}
              maxLength={300}
              placeholder="e.g. Buying for the Jio value unlock — the sum-of-parts hasn't been recognised by the market yet..."
              style={{
                width: "100%", minHeight: 80,
                border: "1.5px solid #D6D0C4", borderRadius: 10,
                padding: "14px 16px",
                fontFamily: "var(--font-serif, 'IBM Plex Serif', serif)",
                fontSize: 15, fontStyle: "italic",
                color: "#1C1917", lineHeight: 1.55,
                background: "#fff", resize: "none", outline: "none",
              }}
            />
            <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: "#A8A29E", fontFamily: "var(--font-mono, monospace)" }}>
              {st.thesis.length}/300
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#78716C", marginRight: 4 }}>Prompts:</span>
            {s.prompts.map(p => (
              <div
                key={p}
                onClick={() => onUsePrompt(p)}
                style={{ fontSize: 11, color: "#7C3AED", background: "#EDE9FE", border: "1px solid #DDD6FE", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Conviction */}
      {dim && (
        <div style={{ borderTop: "1px solid #E7E4DC", padding: "20px 28px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#44403C", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <StepNum n={4} />
            How much conviction do you have?
          </div>
          <p style={{ fontSize: 13, color: "#44403C", marginBottom: 12, lineHeight: 1.5 }}>
            Conviction determines how we weight this holding in your journal insights — and how aggressively we nudge you when things change.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {CONV_LABELS.map((c, i) => {
              const n = i + 1;
              const sel = st.conviction === n;
              return (
                <div
                  key={n}
                  onClick={() => onSetConviction(n)}
                  style={{
                    border: sel ? "1.5px solid #D97706" : "1.5px solid #D6D0C4",
                    borderRadius: 10, padding: "12px 10px", textAlign: "center", cursor: "pointer",
                    background: sel ? "#FFFBEB" : "#fff",
                    transform: sel ? "translateY(-2px)" : "none",
                    boxShadow: sel ? "0 4px 12px rgba(217,119,6,0.15)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 6 }}>
                    {Array(5).fill(0).map((_, d) => (
                      <div key={d} style={{ width: 10, height: 10, borderRadius: "50%", background: d < n ? "#D97706" : "#E7E4DC", border: d < n ? "none" : "1px solid #A8A29E" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#44403C", letterSpacing: "0.04em", marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontSize: 9, color: "#78716C", lineHeight: 1.3 }}>{c.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </>
  );
}

// ── Completion view ───────────────────────────────────────────────────────────

function CompletionView({ onClose, doneCount }: { onClose: () => void; doneCount: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 28px", textAlign: "center", minHeight: 400 }}>
      <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>🎉</div>
      <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 10, color: "#1C1917" }}>
        Your journal is <em style={{ fontStyle: "italic", color: "#7C3AED" }}>complete</em>.
      </div>
      <div style={{ fontSize: 15, color: "#44403C", lineHeight: 1.55, maxWidth: 440, marginBottom: 28 }}>
        All {doneCount} holdings now have an investment thesis. Quantcase will monitor each one against your stated reasoning and alert you when the data contradicts it.
      </div>
      <div style={{ display: "flex", gap: 24, marginBottom: 32, background: "#F7F5F0", borderRadius: 12, padding: "16px 28px", border: "1px solid #E7E4DC" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-serif, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: "#15803D", display: "block" }}>{doneCount}</span>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C", fontWeight: 600, marginTop: 4, display: "block" }}>Holdings journalled</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-serif, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: "#7C3AED", display: "block" }}>100%</span>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C", fontWeight: 600, marginTop: 4, display: "block" }}>Journal complete</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "var(--font-serif, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: "#D97706", display: "block" }}>{doneCount}</span>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C", fontWeight: 600, marginTop: 4, display: "block" }}>AI monitors active</span>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{ background: "#1C1917", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 9, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
      >
        Return to portfolio →
      </button>
    </div>
  );
}

// ── Step number bubble ────────────────────────────────────────────────────────

function StepNum({ n }: { n: number }) {
  return (
    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1C1917", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {n}
    </div>
  );
}
