"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthPost, apiAuthPatch, apiAuthDelete, apiAuthGet } from "@/lib/api";
import { inlineMarkdownToHtml } from "@/lib/utils";
import { NIFTY50_TICKERS, DEFAULT_THESIS_PROMPTS } from "@/lib/journal-ideas";
import type {
  JournalPendingHolding,
  JournalEntryItem,
  JournalEntriesResponse,
  Dimension,
  PortfolioType,
  SaveEntryResponse,
} from "@/types/journal";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StockState {
  dim: Dimension | null;
  subFactors: string[];
  thesis: string;
  conviction: number;
  done: boolean;
}

interface CompleteJournalModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onConnect?: () => void;
  holdings?: JournalPendingHolding[];
  totalHoldings?: number;
  loadingHoldings?: boolean;
  targetSymbol?: string;
}

type ModalView = "list" | "add" | "edit";

// ── Constants ──────────────────────────────────────────────────────────────────

const CONV_LABELS = [
  { label: "Watching",   desc: "Not yet decided" },
  { label: "Interested", desc: "Early signals positive" },
  { label: "Moderate",   desc: "Core thesis in place" },
  { label: "High",       desc: "Strong conviction" },
  { label: "Highest",    desc: "Maximum conviction" },
];

const SF_HINTS: Record<string, string> = {
  "Guidance Accuracy":       "Management has consistently delivered on forward guidance — or consistently missed. Check how closely revenue/margin actuals tracked what was said.",
  "Capital Allocation":      "Where does surplus cash go — buybacks, dividends, acquisitions, or capex? Compounders allocate capital to highest-return uses.",
  "Disclosure Honesty":      "Does management acknowledge headwinds early, or bury negatives? Tone in concalls, change in auditor, related-party transactions.",
  "Industry Tailwind":       "Is demand for this product/service structurally growing? Is this a sunrise sector or a sunset one with temporary revival?",
  "Distribution Strength":   "How deep is the reach — geographically and across customer segments? A strong distribution moat is hard to replicate.",
  "Competitive Edge":        "What stops competitors from taking share? Brand, switching costs, network effects, patents, regulatory moats.",
  "TAM Expansion":           "Is the total addressable market growing through new geographies, new customer segments, or adjacent products?",
  "Valuation":               "Is the stock cheap vs intrinsic value, vs sector peers, and vs its own historical multiples?",
  "Earnings Growth/Quality": "Is EPS growing — and is that growth real (operating leverage, volume) vs manufactured (buybacks, one-offs)?",
  "P/E Re-rating Potential": "Is there a specific trigger — debt paydown, margin improvement, sector rotation — that could cause the multiple to expand?",
  "Risk-Reward":             "At the current price, what do you make in the bull case vs what you lose in the bear case? Is the skew favourable?",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function dimColor(dim: Dimension) {
  if (dim === "M") return "#16A34A";
  if (dim === "O") return "#2563EB";
  return "#7C3AED";
}

function dimBg(dim: Dimension) {
  if (dim === "M") return "#DCFCE7";
  if (dim === "O") return "#DBEAFE";
  return "#EDE9FE";
}

function signalIcon(type: string) {
  if (type === "green") return "✓";
  if (type === "amber") return "⚡";
  if (type === "red") return "✕";
  return "—";
}

function fmtPrice(price: number) {
  return `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function thesisHealthConfig(h: string) {
  if (h === "intact")  return { label: "Intact",    color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC",  icon: "●" };
  if (h === "partial") return { label: "Partial",   color: "#B45309", bg: "#FFFBEB", border: "#FCD34D",  icon: "⚡" };
  if (h === "broken")  return { label: "Broken",    color: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5",  icon: "✕" };
  return                      { label: "No thesis", color: "#9A9A92", bg: "#F7F5F0", border: "#D6D0C4",  icon: "○" };
}

// Trim a long backend prompt to a concise, clickable label. The full text is
// still used to fill the thesis on click — only the displayed chip is shortened.
function concisePrompt(p: string, max = 42): string {
  const firstClause = p.split(/[.;–—]/)[0].trim();
  const base = firstClause.length >= 12 ? firstClause : p.trim();
  return base.length > max ? `${base.slice(0, max - 1).trimEnd()}…` : base;
}

// ── Step number bubble ────────────────────────────────────────────────────────

function StepNum({ n }: { n: number }) {
  return (
    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1C1917", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {n}
    </div>
  );
}

// ── Wizard form (shared for add & edit) ──────────────────────────────────────

function WizardForm({
  s,
  st,
  dim,
  hintText,
  onSelectDim,
  onToggleSubFactor,
  onSetConviction,
  onUsePrompt,
  onThesisChange,
}: {
  s: JournalPendingHolding;
  st: StockState;
  dim: Dimension | null;
  hintText: string | null;
  onSelectDim: (d: Dimension) => void;
  onToggleSubFactor: (sf: string) => void;
  onSetConviction: (n: number) => void;
  onUsePrompt: (text: string) => void;
  onThesisChange: (val: string) => void;
}) {
  const dimLabel = dim === "M" ? "Management" : dim === "O" ? "Opportunity" : dim === "D" ? "Deal" : "overview";
  const displayName = s.name ?? s.symbol;
  const deltaPositive = s.priceChangeDir === "pos";

  const aiContextText = dim
    ? (s.aiContext[dim] ?? `AI context is not yet available for ${s.symbol} in this dimension.`)
    : `Quantcase scores ${s.symbol} at MOD ${s.mod.M ?? "—"}/${s.mod.O ?? "—"}/${s.mod.D ?? "—"} across Management / Opportunity / Deal. Select a dimension below to see what the data says.`;

  return (
    <>
      {/* Stock identity bar */}
      <div style={{ padding: "18px 28px 14px", borderBottom: "1px solid #E7E4DC", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center", background: "#F7F5F0" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", background: "#1E3A5F", flexShrink: 0 }}>
          {s.symbol[0]}
        </div>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1917" }}>{displayName}</div>
            {s.portfolioType === "shadow" && (
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" }}>Trackers</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#78716C", marginTop: 2 }}>
            {[s.sector, s.capType ? `${s.capType} Cap` : null].filter(Boolean).join(" · ") || s.symbol}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 18, fontWeight: 600, color: "#1C1917" }}>{fmtPrice(s.price)}</div>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, marginTop: 1, color: deltaPositive ? "#15803D" : "#B91C1C" }}>
            {deltaPositive ? "+" : "−"}₹{Math.abs(s.priceChange).toLocaleString("en-IN", { maximumFractionDigits: 2 })} today
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          {(["M", "O", "D"] as const).map(d => (
            <div key={d} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ fontStyle: "italic", fontSize: 15, color: dimColor(d), width: 14, textAlign: "center" }}>{d}</div>
              <div style={{ width: 48, height: 4, background: "#E7E4DC", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.mod[d] ?? 0}%`, background: dimColor(d), borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, width: 20, textAlign: "right", color: "#1C1917" }}>{s.mod[d] ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-check signals — markdown-formatted, prominent at top */}
      {s.signals.length > 0 && (
        <div style={{ padding: "16px 28px 4px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#44403C", marginBottom: 10 }}>
            Cross-check signals for {s.symbol}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {s.signals.map((sig, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 7, fontSize: 11.5, fontWeight: 500, lineHeight: 1.4,
                ...(sig.type === "green"   ? { background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" } :
                    sig.type === "amber"   ? { background: "#FFFBEB", color: "#B45309", border: "1px solid #FCD34D" } :
                    sig.type === "red"     ? { background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5" } :
                                            { background: "#F7F5F0", color: "#44403C", border: "1px solid #D6D0C4" }),
              }}>
                <span style={{ flexShrink: 0 }}>{signalIcon(sig.type)}</span>
                <span dangerouslySetInnerHTML={{ __html: inlineMarkdownToHtml(sig.label) }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI context */}
      <div style={{ padding: "16px 28px 14px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#78716C", marginBottom: 8 }}>
          What the data is saying about {s.symbol}
        </div>
        <div style={{ background: "linear-gradient(135deg,#EDE9FE,#F5F3FF)", border: "1px solid #DDD6FE", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12 }}>
          <div style={{ width: 28, height: 28, background: "#fff", borderRadius: 7, border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#6D28D9", marginBottom: 5 }}>
              Quantcase context — {dimLabel}
            </div>
            <div style={{ fontSize: 12, color: "#4C1D95", lineHeight: 1.55 }}>{aiContextText}</div>
          </div>
        </div>
      </div>

      {/* Step 1: Dimension */}
      <div style={{ borderTop: "1px solid #E7E4DC", padding: "20px 28px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#44403C", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <StepNum n={1} /> Which dimension drove your decision to buy?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {([
            { key: "M" as const, name: "Management",  q: "Do they do what they say?" },
            { key: "O" as const, name: "Opportunity",  q: "Is the business worth owning?" },
            { key: "D" as const, name: "Deal",         q: "Is the price actually fair?" },
          ]).map(d => {
            const selected = dim === d.key;
            return (
              <div key={d.key} onClick={() => onSelectDim(d.key)} style={{ border: selected ? `1.5px solid ${dimColor(d.key)}` : "1.5px solid #D6D0C4", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, background: selected ? dimBg(d.key) : "#fff", transition: "all 0.2s" }}>
                <div style={{ fontStyle: "italic", fontSize: 32, fontWeight: 400, lineHeight: 1, color: selected ? dimColor(d.key) : "#A8A29E" }}>{d.key}</div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#44403C" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: "#78716C", lineHeight: 1.4 }}>{d.q}</div>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, color: selected ? dimColor(d.key) : "#A8A29E" }}>
                  Score: {s.mod[d.key] ?? "—"}/100
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
            <StepNum n={2} /> What specifically drove your view?
          </div>
          <p style={{ fontSize: 13, color: "#44403C", marginBottom: 12, lineHeight: 1.5 }}>
            Pick the sub-factors that resonated — these become searchable tags on your journal entry.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 4 }}>
            {s.subFactors[dim].map(sf => {
              const sel = st.subFactors.includes(sf);
              return (
                <div key={sf} onClick={() => onToggleSubFactor(sf)} style={{ padding: "6px 12px", borderRadius: 999, border: sel ? `1.5px solid ${dimColor(dim)}` : "1.5px solid #D6D0C4", fontSize: 11, fontWeight: 500, cursor: "pointer", background: sel ? dimBg(dim) : "#fff", color: sel ? dimColor(dim) : "#44403C", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
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
            <StepNum n={3} /> Write your thesis in one or two sentences
          </div>
          <p style={{ fontSize: 13, color: "#44403C", marginBottom: 10, lineHeight: 1.5 }}>
            Why do you own this? What has to be true for it to work?
          </p>
          <div style={{ position: "relative" }}>
            <textarea
              value={st.thesis}
              onChange={e => onThesisChange(e.target.value)}
              maxLength={300}
              placeholder="e.g. Buying for the Jio value unlock — the sum-of-parts hasn't been recognised by the market yet..."
              style={{ width: "100%", minHeight: 80, border: "1.5px solid #D6D0C4", borderRadius: 10, padding: "14px 16px", fontFamily: "var(--font-serif, 'IBM Plex Serif', serif)", fontSize: 15, fontStyle: "italic", color: "#1C1917", lineHeight: 1.55, background: "#fff", resize: "none", outline: "none" }}
            />
            <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: "#A8A29E", fontFamily: "var(--font-mono, monospace)" }}>
              {st.thesis.length}/300
            </div>
          </div>
          {(() => {
            const promptList = s.prompts.length > 0 ? s.prompts : DEFAULT_THESIS_PROMPTS;
            return (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#78716C", marginRight: 4 }}>Prompts:</span>
                {promptList.map(p => (
                  <div key={p} onClick={() => onUsePrompt(p)} title={p} style={{ fontSize: 11, color: "#7C3AED", background: "#EDE9FE", border: "1px solid #DDD6FE", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}>
                    {concisePrompt(p)}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Step 4: Conviction */}
      {dim && (
        <div style={{ borderTop: "1px solid #E7E4DC", padding: "20px 28px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, color: "#44403C", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <StepNum n={4} /> How much conviction do you have?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {CONV_LABELS.map((c, i) => {
              const n = i + 1;
              const sel = st.conviction === n;
              return (
                <div key={n} onClick={() => onSetConviction(n)} style={{ border: sel ? "1.5px solid #D97706" : "1.5px solid #D6D0C4", borderRadius: 10, padding: "12px 10px", textAlign: "center", cursor: "pointer", background: sel ? "#FFFBEB" : "#fff", transform: sel ? "translateY(-2px)" : "none", boxShadow: sel ? "0 4px 12px rgba(217,119,6,0.15)" : "none", transition: "all 0.2s" }}>
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

// ── Journal list view ─────────────────────────────────────────────────────────

function JournalListView({
  entries,
  loading,
  error,
  pendingCount,
  portfolioFilter,
  onAdd,
  onEdit,
  onDelete,
  onConnect,
}: {
  entries: JournalEntryItem[];
  loading: boolean;
  error: string | null;
  pendingCount: number;
  portfolioFilter: PortfolioType;
  onAdd: () => void;
  onEdit: (item: JournalEntryItem) => void;
  onDelete: (item: JournalEntryItem) => void;
  onConnect?: () => void;
}) {
  const scoped = entries.filter(e => e.portfolioType === portfolioFilter);
  const withThesis  = scoped.filter(e => e.journal !== null);
  const withoutThesis = scoped.filter(e => e.journal === null);

  // Holdings tab with no linked holdings → prompt to connect a portfolio.
  if (!loading && !error && portfolioFilter === "user" && scoped.length === 0) {
    return (
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 32px", textAlign: "center", minHeight: 340 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 20, fontWeight: 400, color: "#1C1917", marginBottom: 8 }}>Connect your portfolio</div>
        <div style={{ fontSize: 14, color: "#78716C", marginBottom: 24, lineHeight: 1.6, maxWidth: 420 }}>
          Link your holdings via smallcase to build an investment thesis for each stock you own — Quantcase will then monitor them for you.
        </div>
        <button
          onClick={onConnect}
          style={{ background: "#1C1917", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          Connect portfolio →
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {/* Toolbar */}
      <div style={{ padding: "16px 28px", borderBottom: "1px solid #E7E4DC", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F7F5F0" }}>
        <div style={{ fontSize: 13, color: "#44403C" }}>
          <strong style={{ color: "#1C1917" }}>{withThesis.length}</strong> of <strong style={{ color: "#1C1917" }}>{scoped.length}</strong> {portfolioFilter === "shadow" ? "trackers" : "holdings"} have a thesis
          {pendingCount > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, color: "#7C3AED", fontWeight: 600 }}>· {pendingCount} pending</span>
          )}
        </div>
        {pendingCount > 0 && (
          <button
            onClick={onAdd}
            style={{ background: "#1C1917", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            + Add thesis
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "20px 28px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 80, background: "#F7F5F0", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
        </div>
      )}

      {error && (
        <div style={{ margin: "20px 28px", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 13, color: "#B91C1C" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ padding: "16px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
          {withThesis.map(item => {
            const tc = thesisHealthConfig(item.thesisHealth);
            return (
              <div key={`${item.symbol}-${item.portfolioType}`} style={{ background: "#fff", border: `1px solid ${tc.border}`, borderRadius: 12, overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ background: tc.bg, padding: "10px 16px", borderBottom: `1px solid ${tc.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "#1C1917" }}>{item.symbol}</div>
                    {item.portfolioType === "shadow" && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" }}>Trackers</span>
                    )}
                    {item.name && <div style={{ fontSize: 11, color: "#78716C" }}>{item.name}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                      {tc.icon} {tc.label}
                    </div>
                    <button
                      onClick={() => onEdit(item)}
                      style={{ background: "transparent", border: "1px solid #D6D0C4", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "#44403C", cursor: "pointer", fontWeight: 500 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      style={{ background: "transparent", border: "1px solid #FCA5A5", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "#B91C1C", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {/* Thesis + meta */}
                <div style={{ padding: "12px 16px" }}>
                  {item.journal && (
                    <>
                      <div style={{ fontStyle: "italic", fontSize: 14, color: "#44403C", lineHeight: 1.5, marginBottom: 8 }}>
                        {item.journal.thesis}
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: dimBg(item.journal.dimension), color: dimColor(item.journal.dimension) }}>
                          {item.journal.dimension === "M" ? "Management" : item.journal.dimension === "O" ? "Opportunity" : "Deal"}
                        </div>
                        <div style={{ display: "flex", gap: 3 }}>
                          {Array(5).fill(0).map((_, d) => (
                            <div key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: d < item.journal!.conviction ? "#D97706" : "#E7E4DC" }} />
                          ))}
                        </div>
                        {item.journal.subFactors.length > 0 && (
                          <div style={{ fontSize: 10, color: "#78716C" }}>{item.journal.subFactors.join(" · ")}</div>
                        )}
                        {item.pnlPct !== null && item.pnlPct !== undefined && (
                          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 600, color: item.pnlPct >= 0 ? "#16A34A" : "#B91C1C", marginLeft: "auto" }}>
                            {item.pnlPct >= 0 ? "+" : ""}{item.pnlPct.toFixed(2)}% today
                          </div>
                        )}
                      </div>
                      {item.journal.aiNudge && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: item.thesisHealth === "broken" ? "#FEF2F2" : "#FFFBEB", border: `1px solid ${item.thesisHealth === "broken" ? "#FCA5A5" : "#FCD34D"}`, borderRadius: 7, fontSize: 11, color: item.thesisHealth === "broken" ? "#B91C1C" : "#92400E", lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 6 }}>🤖 AI check:</span>
                          {item.journal.aiNudge}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Holdings without a thesis */}
          {withoutThesis.length > 0 && (
            <>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#78716C", fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
                No thesis yet
              </div>
              {withoutThesis.map(item => (
                <div key={`${item.symbol}-${item.portfolioType}`} style={{ background: "#fff", border: "1px solid #E7E4DC", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1917" }}>{item.symbol}</div>
                    {item.portfolioType === "shadow" && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" }}>Trackers</span>
                    )}
                    {item.name && <div style={{ fontSize: 11, color: "#78716C" }}>{item.name}</div>}
                  </div>
                  <button
                    onClick={onAdd}
                    style={{ background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE", padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                  >
                    + Add thesis
                  </button>
                </div>
              ))}
            </>
          )}

          {scoped.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#78716C", fontSize: 14 }}>
              {portfolioFilter === "shadow" ? "No trackers yet. Add a stock to research it alongside your holdings." : "No holdings found. Connect your portfolio to get started."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tracker ideas empty state ─────────────────────────────────────────────────
// Shown when the Trackers filter has no holdings — surfaces a rotating window of
// 5 Nifty50 tickers as starting ideas, with "See more ideas" to advance.

function TrackerIdeasEmptyState({ onPickIdea }: { onPickIdea: (symbol: string) => void }) {
  const [offset, setOffset] = useState(0);
  const window = Array.from({ length: 5 }, (_, i) => NIFTY50_TICKERS[(offset + i) % NIFTY50_TICKERS.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center", minHeight: 300 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🔭</div>
      <div style={{ fontSize: 20, fontWeight: 400, color: "#1C1917", marginBottom: 6 }}>No trackers yet</div>
      <div style={{ fontSize: 13, color: "#78716C", marginBottom: 20, lineHeight: 1.6, maxWidth: 420 }}>
        Track a stock to research it alongside your holdings. Here are a few Nifty50 ideas to start with.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 18, maxWidth: 460 }}>
        {window.map(sym => (
          <button
            key={sym}
            onClick={() => onPickIdea(sym)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE", padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED" }}>+</span> {sym}
          </button>
        ))}
      </div>
      <button
        onClick={() => setOffset(o => (o + 5) % NIFTY50_TICKERS.length)}
        style={{ background: "transparent", border: "1px solid #D6D0C4", color: "#44403C", padding: "8px 18px", borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
      >
        See more ideas →
      </button>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function CompleteJournalModal({
  open,
  onClose,
  onComplete,
  onConnect,
  holdings = [],
  totalHoldings,
  loadingHoldings,
  targetSymbol,
}: CompleteJournalModalProps) {
  const [view, setView] = useState<ModalView>("list");
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioType>("shadow");

  // Add-wizard state
  const [cur, setCur] = useState(0);
  const [wizStates, setWizStates] = useState<StockState[]>([]);
  const [hintText, setHintText] = useState<string | null>(null);
  const [wizCompleted, setWizCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit state
  const [editItem, setEditItem] = useState<JournalEntryItem | null>(null);
  const [editHolding, setEditHolding] = useState<JournalPendingHolding | null>(null);
  const [editState, setEditState] = useState<StockState>({ dim: null, subFactors: [], thesis: "", conviction: 0, done: false });
  const [editHintText, setEditHintText] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Journal entries for list view — fetched inside modal so it's always fresh
  const [entriesData, setEntriesData] = useState<JournalEntriesResponse | null>(null);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);

  const filteredHoldings = holdings.filter(h => h.portfolioType === portfolioFilter);
  const userCount   = holdings.filter(h => h.portfolioType === "user").length;
  const shadowCount = holdings.filter(h => h.portfolioType === "shadow").length;

  const fetchEntries = useCallback(() => {
    setEntriesLoading(true);
    setEntriesError(null);
    apiAuthGet<{ success: boolean; data: JournalEntriesResponse }>(
      `${BACKEND_URL}/api/journal/entries`,
      {
        onSuccess: (res) => setEntriesData(res.data),
        onError: (err) => setEntriesError(err),
        onComplete: () => setEntriesLoading(false),
      }
    );
  }, []);

  // Reset to list view on open; refetch entries
  useEffect(() => {
    if (!open) return;
    setView("list");
    setWizCompleted(false);
    setSaveError(null);
    setEditItem(null);
    setEditHolding(null);
    setDeleteTarget(null);
    fetchEntries();
  }, [open, fetchEntries]);

  // Init wizard states when entering add view
  useEffect(() => {
    if (view !== "add") return;
    setWizStates(filteredHoldings.map(() => ({ dim: null, subFactors: [], thesis: "", conviction: 0, done: false })));
    setWizCompleted(false);
    setSaveError(null);

    if (targetSymbol) {
      const idx = filteredHoldings.findIndex(h => h.symbol === targetSymbol);
      setCur(idx >= 0 ? idx : 0);
    } else {
      setCur(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, portfolioFilter]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [cur, view]);

  if (!open) return null;

  // ── Loading state ──
  if (loadingHoldings && view !== "list") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, padding: "56px 32px", textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #E7E4DC", borderTopColor: "#7C3AED", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, color: "#78716C" }}>Loading your holdings…</div>
        </div>
      </div>
    );
  }

  // ── Delete confirm overlay ──
  if (deleteTarget) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗑️</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1C1917", marginBottom: 8 }}>Delete thesis for {deleteTarget.symbol}?</div>
          <div style={{ fontSize: 13, color: "#78716C", marginBottom: 24, lineHeight: 1.5 }}>This will permanently remove your investment thesis and conviction rating. This action cannot be undone.</div>
          {editError && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 12, color: "#B91C1C" }}>{editError}</div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => { setDeleteTarget(null); setEditError(null); }} style={{ background: "#F7F5F0", color: "#44403C", border: "1px solid #D6D0C4", padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              disabled={deleting}
              onClick={() => {
                if (!deleteTarget.journal?.entryId) return;
                setDeleting(true);
                setEditError(null);
                apiAuthDelete<{ success: boolean }>(
                  `${BACKEND_URL}/api/journal/entries/${deleteTarget.journal.entryId}`,
                  {
                    onSuccess: () => {
                      setDeleting(false);
                      setDeleteTarget(null);
                      fetchEntries();
                      onComplete?.();
                    },
                    onError: (err) => { setDeleting(false); setEditError(err); },
                  }
                );
              }}
              style={{ background: "#B91C1C", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared modal shell ──
  const allEntries = entriesData?.entries ?? [];
  const wizSt = wizStates[cur] ?? { dim: null, subFactors: [], thesis: "", conviction: 0, done: false };
  const wizS  = filteredHoldings[cur];
  const wizDim = wizSt.dim;
  const canSave = wizDim !== null && wizSt.thesis.trim().length > 10 && wizSt.conviction > 0;
  const isLast = wizStates.filter(s => !s.done).length <= 1;
  const doneCount = wizStates.filter(s => s.done).length;

  const canSaveEdit = editState.dim !== null && editState.thesis.trim().length > 10 && editState.conviction > 0;

  function updateWizState(patch: Partial<StockState>) {
    setWizStates(prev => { const next = [...prev]; next[cur] = { ...next[cur], ...patch }; return next; });
  }

  function advanceWiz(markDone = true) {
    const nextStates = markDone ? wizStates.map((s, i) => (i === cur ? { ...s, done: true } : s)) : wizStates;
    const nextIdx = nextStates.findIndex((s, i) => !s.done && i > cur);
    if (nextIdx === -1) {
      const remaining = nextStates.filter(s => !s.done);
      if (remaining.length === 0) { if (markDone) setWizStates(nextStates); setWizCompleted(true); }
      else { if (markDone) setWizStates(nextStates); setCur(nextStates.findIndex(s => !s.done)); }
    } else {
      if (markDone) setWizStates(nextStates);
      setCur(nextIdx);
    }
    setHintText(null);
    setSaveError(null);
  }

  function saveAndNext() {
    if (!canSave || !wizDim || !wizS) return;
    setSaving(true);
    setSaveError(null);
    apiAuthPost<{ success: boolean; data: SaveEntryResponse }>(
      `${BACKEND_URL}/api/journal/entries`,
      {
        onSuccess: () => { setSaving(false); advanceWiz(true); fetchEntries(); onComplete?.(); },
        onError: (err) => { setSaving(false); setSaveError(err); },
      },
      { symbol: wizS.symbol, portfolioType: wizS.portfolioType, dimension: wizDim, subFactors: wizSt.subFactors, thesis: wizSt.thesis.trim(), conviction: wizSt.conviction }
    );
  }

  function saveEdit() {
    if (!canSaveEdit || !editItem?.journal?.entryId || !editState.dim) return;
    setEditSaving(true);
    setEditError(null);
    apiAuthPatch<{ success: boolean }>(
      `${BACKEND_URL}/api/journal/entries/${editItem.journal.entryId}`,
      {
        onSuccess: () => {
          setEditSaving(false);
          setView("list");
          setEditItem(null);
          setEditHolding(null);
          fetchEntries();
          onComplete?.();
        },
        onError: (err) => { setEditSaving(false); setEditError(err); },
      },
      { dimension: editState.dim, subFactors: editState.subFactors, thesis: editState.thesis.trim(), conviction: editState.conviction }
    );
  }

  function startEdit(item: JournalEntryItem) {
    // Build a synthetic JournalPendingHolding from the entry item for the wizard form
    const holding: JournalPendingHolding = {
      symbol: item.symbol,
      name: item.name,
      sector: item.sector,
      capType: item.capType,
      price: 0,
      priceChange: 0,
      priceChangeDir: "pos",
      portfolioType: item.portfolioType,
      mod: {
        M: item.subScores.find(s => s.pillar === "mgmt")?.score ?? null,
        O: item.subScores.find(s => s.pillar === "opp")?.score ?? null,
        D: item.subScores.find(s => s.pillar === "deal")?.score ?? null,
      },
      aiContext: { M: null, O: null, D: null },
      signals: [],
      subFactors: {
        M: Object.keys(SF_HINTS).filter((_, i) => i < 3),
        O: Object.keys(SF_HINTS).filter((_, i) => i >= 3 && i < 7),
        D: Object.keys(SF_HINTS).filter((_, i) => i >= 7),
      },
      prompts: [],
    };
    setEditItem(item);
    setEditHolding(holding);
    setEditState({
      dim: item.journal?.dimension ?? null,
      subFactors: item.journal?.subFactors ?? [],
      thesis: item.journal?.thesis ?? "",
      conviction: item.journal?.conviction ?? 0,
      done: false,
    });
    setEditHintText(null);
    setEditError(null);
    setView("edit");
  }

  const titleText =
    view === "list" ? "Investment Journal"
    : view === "edit" ? `Edit — ${editItem?.symbol}`
    : wizCompleted ? "Journal complete"
    : filteredHoldings.length > 0 ? `${cur + 1} of ${filteredHoldings.length} — ${wizS?.symbol ?? ""}`
    : "Add thesis";

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 760, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* ── Header ── */}
        <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #E7E4DC", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#78716C", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                {view === "list" ? (
                  <><span>📓</span> Investment journal</>
                ) : view === "edit" ? (
                  <><span style={{ cursor: "pointer", color: "#7C3AED" }} onClick={() => setView("list")}>← Back</span></>
                ) : (
                  <><span style={{ cursor: "pointer", color: "#7C3AED" }} onClick={() => setView("list")}>← Back</span> · <span>🔥</span> Add thesis</>
                )}
              </div>
              <div style={{ fontFamily: "var(--font-ibm-plex-sans, 'IBM Plex Sans', serif)", fontSize: 22, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1C1917" }}>
                {titleText}
              </div>
            </div>

            {/* Top-right controls: portfolio toggle + close button */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {/* Portfolio type toggle — always visible */}
              <div style={{ display: "inline-flex", borderRadius: 8, border: "1px solid #D6D0C4", overflow: "hidden", background: "#F7F5F0" }}>
                {([
                  { key: "shadow" as const, label: "Trackers", count: shadowCount },
                  { key: "user"   as const, label: "Holdings", count: userCount },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setPortfolioFilter(opt.key); setCur(0); setWizCompleted(false); }}
                    style={{ padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: portfolioFilter === opt.key ? "#1C1917" : "transparent", color: portfolioFilter === opt.key ? "#fff" : "#78716C", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                  >
                    {opt.label}
                    {opt.count > 0 && (
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, background: portfolioFilter === opt.key ? "rgba(255,255,255,0.2)" : "#E7E4DC", color: portfolioFilter === opt.key ? "#fff" : "#44403C", fontWeight: 700 }}>
                        {opt.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                style={{ background: "#F7F5F0", border: "1px solid #D6D0C4", width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#44403C", flexShrink: 0 }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* ── Progress bar (add view only) ── */}
        {view === "add" && filteredHoldings.length > 0 && (
          <div style={{ padding: "12px 28px", borderBottom: "1px solid #E7E4DC", background: "#F7F5F0", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {filteredHoldings.map((h, i) => {
                const done = wizStates[i]?.done ?? false;
                const active = !wizCompleted && i === cur;
                const cls = done ? "done" : active ? "active" : "empty";
                return (
                  <div key={h.symbol} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, alignItems: "center", position: "relative" }}>
                    {i < filteredHoldings.length - 1 && (
                      <div style={{ position: "absolute", left: "calc(50% + 18px)", right: "calc(-50% + 18px)", top: 14, height: 1, background: "#D6D0C4" }} />
                    )}
                    <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, position: "relative", zIndex: 1, background: cls === "done" ? "#1C1917" : cls === "active" ? "#7C3AED" : "#fff", color: cls === "empty" ? "#78716C" : "#fff", border: cls === "empty" ? "1.5px solid #D6D0C4" : "none", boxShadow: cls === "active" ? "0 0 0 4px #EDE9FE" : "none" }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: cls === "active" ? "#7C3AED" : cls === "done" ? "#44403C" : "#78716C", fontWeight: 600, textAlign: "center" }}>
                      {h.symbol}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Body ── */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* LIST VIEW */}
          {view === "list" && (
            <JournalListView
              entries={allEntries}
              loading={entriesLoading}
              error={entriesError}
              pendingCount={filteredHoldings.length}
              portfolioFilter={portfolioFilter}
              onAdd={() => setView("add")}
              onEdit={startEdit}
              onDelete={(item) => { setDeleteTarget(item); setEditError(null); }}
              onConnect={() => { onClose(); onConnect?.(); }}
            />
          )}

          {/* ADD VIEW */}
          {view === "add" && (
            wizCompleted ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 28px", textAlign: "center", minHeight: 400 }}>
                <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>🎉</div>
                <div style={{ fontFamily: "var(--font-serif, serif)", fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 10, color: "#1C1917" }}>
                  Your journal is <em style={{ fontStyle: "italic", color: "#7C3AED" }}>complete</em>.
                </div>
                <div style={{ fontSize: 15, color: "#44403C", lineHeight: 1.55, maxWidth: 440, marginBottom: 28 }}>
                  {doneCount} holdings now have an investment thesis. Quantcase will monitor each one and alert you when the data shifts.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setView("list")} style={{ background: "#F7F5F0", color: "#44403C", border: "1px solid #D6D0C4", padding: "10px 20px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                    View journal →
                  </button>
                  <button onClick={() => { onClose(); onComplete?.(); }} style={{ background: "#1C1917", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Return to portfolio →
                  </button>
                </div>
              </div>
            ) : filteredHoldings.length === 0 && portfolioFilter === "shadow" ? (
              // Trackers empty → rotating Nifty50 ideas
              <TrackerIdeasEmptyState onPickIdea={sym => { onClose(); window.location.href = `/screener/management?symbol=${sym}`; }} />
            ) : filteredHoldings.length === 0 && (totalHoldings ?? 1) === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", textAlign: "center", minHeight: 300 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
                <div style={{ fontSize: 20, fontWeight: 400, color: "#1C1917", marginBottom: 8 }}>No holdings linked yet</div>
                <div style={{ fontSize: 14, color: "#78716C", marginBottom: 24, lineHeight: 1.6 }}>
                  Add stocks to your holdings or trackers first.
                </div>
                <button onClick={() => { onClose(); window.location.href = "/diary"; }} style={{ background: "#1C1917", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Add holdings →
                </button>
              </div>
            ) : filteredHoldings.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", textAlign: "center", minHeight: 300 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                <div style={{ fontSize: 20, fontWeight: 400, color: "#1C1917", marginBottom: 8 }}>All {portfolioFilter === "shadow" ? "Trackers" : "Holdings"} have a thesis</div>
                <button onClick={() => setView("list")} style={{ background: "#1C1917", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View journal →</button>
              </div>
            ) : wizS ? (
              <WizardForm
                s={wizS}
                st={wizSt}
                dim={wizDim}
                hintText={hintText}
                onSelectDim={d => { updateWizState({ dim: d, subFactors: [] }); setHintText(null); }}
                onToggleSubFactor={sf => {
                  const arr = wizSt.subFactors;
                  updateWizState({ subFactors: arr.includes(sf) ? arr.filter(x => x !== sf) : [...arr, sf] });
                  setHintText(SF_HINTS[sf] ?? null);
                }}
                onSetConviction={n => updateWizState({ conviction: n })}
                onUsePrompt={text => updateWizState({ thesis: text })}
                onThesisChange={val => updateWizState({ thesis: val })}
              />
            ) : null
          )}

          {/* EDIT VIEW */}
          {view === "edit" && editHolding && (
            <WizardForm
              s={editHolding}
              st={editState}
              dim={editState.dim}
              hintText={editHintText}
              onSelectDim={d => { setEditState(s => ({ ...s, dim: d, subFactors: [] })); setEditHintText(null); }}
              onToggleSubFactor={sf => {
                const arr = editState.subFactors;
                setEditState(s => ({ ...s, subFactors: arr.includes(sf) ? arr.filter(x => x !== sf) : [...arr, sf] }));
                setEditHintText(SF_HINTS[sf] ?? null);
              }}
              onSetConviction={n => setEditState(s => ({ ...s, conviction: n }))}
              onUsePrompt={text => setEditState(s => ({ ...s, thesis: text }))}
              onThesisChange={val => setEditState(s => ({ ...s, thesis: val }))}
            />
          )}
        </div>

        {/* ── Footer ── */}
        {view === "add" && !wizCompleted && filteredHoldings.length > 0 && wizS && (
          <div style={{ padding: "14px 28px", borderTop: "1px solid #E7E4DC", flexShrink: 0, background: "#fff" }}>
            {saveError && (
              <div style={{ marginBottom: 10, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 12, color: "#B91C1C" }}>{saveError}</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => advanceWiz(true)} style={{ fontSize: 12, color: "#78716C", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>
                Skip this stock →
              </button>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={onClose} style={{ background: "#fff", color: "#44403C", border: "1px solid #D6D0C4", padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Save for later
                </button>
                <button
                  disabled={!canSave || saving}
                  onClick={saveAndNext}
                  style={{ background: "#1C1917", color: "#fff", border: "none", padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: canSave && !saving ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, opacity: canSave && !saving ? 1 : 0.4 }}
                >
                  {saving ? "Saving…" : isLast ? "Complete journal 🎉" : "Save & next →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "edit" && editHolding && (
          <div style={{ padding: "14px 28px", borderTop: "1px solid #E7E4DC", flexShrink: 0, background: "#fff" }}>
            {editError && (
              <div style={{ marginBottom: 10, padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 12, color: "#B91C1C" }}>{editError}</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => { setView("list"); setEditItem(null); setEditHolding(null); }} style={{ fontSize: 12, color: "#78716C", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>
                ← Cancel
              </button>
              <button
                disabled={!canSaveEdit || editSaving}
                onClick={saveEdit}
                style={{ background: "#1C1917", color: "#fff", border: "none", padding: "9px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: canSaveEdit && !editSaving ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: canSaveEdit && !editSaving ? 1 : 0.4 }}
              >
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
