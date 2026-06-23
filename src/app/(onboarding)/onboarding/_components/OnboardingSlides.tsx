"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────
// Slide 1 — Problem Statement
// ─────────────────────────────────────────
export function Slide1Problem() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c8952a", marginBottom: 24 }}>
        Assessments, not opinions
      </p>
      <h1 style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: "clamp(36px, 5.5vw, 66px)", color: "#0F172B", lineHeight: 1.06, letterSpacing: "-0.03em", maxWidth: 680, marginBottom: 16 }}>
        The market isn&apos;t the problem.{" "}
        <em style={{ fontStyle: "italic", color: "#1a3a5c" }}>Your process is.</em>
      </h1>
      <p style={{ fontSize: 16, color: "#888888", maxWidth: 400, lineHeight: 1.65, marginBottom: 48 }}>
        Conviction without a framework is just hope. QuantCase changes that.
      </p>
      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        {[
          { num: "68%", desc: "of retail investors underperform Nifty over 5 years" },
          { num: "32%", desc: "5-yr CAGR from QuantCase-scored portfolios" },
          { num: "1,200+", desc: "NSE & BSE stocks scored and updated nightly" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 48 }}>
            {i > 0 && <div style={{ width: 1, background: "rgba(0,0,0,0.08)", height: 68, alignSelf: "center" }} />}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: "clamp(44px, 6vw, 72px)", color: "#1a3a5c", letterSpacing: "-0.04em", lineHeight: 1, display: "block", marginBottom: 10 }}>
                {s.num}
              </span>
              <span style={{ fontSize: 13, color: "#888888", maxWidth: 140, display: "block", lineHeight: 1.5 }}>
                {s.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 2 — M·O·D Framework
// ─────────────────────────────────────────
const MOD_CARDS = [
  {
    letter: "M",
    title: "Management",
    blurb: "Who's running the company — and do they do what they say?",
    chips: ["Capital allocation track record", "Guidance vs. actuals history", "Communication credibility"],
    accent: "#1a3a5c",
    ghostOpacity: "rgba(26,58,92,0.1)",
    topBar: "#1a3a5c",
  },
  {
    letter: "O",
    title: "Opportunity",
    blurb: "Is the market growing faster than the stock prices it in?",
    chips: ["TAM expansion signals", "Competitive moat depth", "Sector tailwind index"],
    accent: "#2d6a4f",
    ghostOpacity: "rgba(45,106,79,0.1)",
    topBar: "#2d6a4f",
  },
  {
    letter: "D",
    title: "Deal",
    blurb: "Is the current price worth the bet?",
    chips: ["Intrinsic value vs. market price", "Entry & exit trigger matrix", "Margin of safety"],
    accent: "#c8952a",
    ghostOpacity: "rgba(200,149,42,0.1)",
    topBar: "#c8952a",
  },
];

export function Slide2MOD() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,58,92,0.5)", textAlign: "center", marginBottom: 4 }}>
        The M·O·D Framework
      </p>
      <h2 style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: "clamp(30px, 4vw, 52px)", color: "#0F172B", letterSpacing: "-0.03em", lineHeight: 1.1, textAlign: "center", marginBottom: 8, maxWidth: 520 }}>
        One score. Three lenses.
      </h2>
      <p style={{ fontSize: 15, color: "#888888", textAlign: "center", marginBottom: 36, maxWidth: 380, lineHeight: 1.6 }}>
        Every listed company distilled into what actually drives returns.
      </p>
      <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 780 }}>
        {MOD_CARDS.map((card) => (
          <div
            key={card.letter}
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "24px 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: card.topBar }} />
            <div style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: 48, fontStyle: "italic", lineHeight: 1, marginBottom: 8, color: card.ghostOpacity }}>
              {card.letter}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172B", marginBottom: 5 }}>{card.title}</div>
            <div style={{ fontSize: 12, color: "#888888", lineHeight: 1.55, marginBottom: 14 }}>{card.blurb}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {card.chips.map((chip) => (
                <div key={chip} style={{ fontSize: 11, color: "#3a3a3a", background: "#F5F5F5", padding: "4px 8px", borderRadius: 4, lineHeight: 1.4 }}>
                  {chip}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 3 — Live Score + Technicals
// ─────────────────────────────────────────
const TECH_SIGNALS = [
  { signal: "green", label: "RSI momentum signal", value: "Oversold — entry zone", buy: true },
  { signal: "green", label: "50 / 200 MA crossover", value: "Bullish crossover", buy: true },
  { signal: "amber", label: "Volume trend", value: "Accumulation phase", buy: false },
  { signal: "green", label: "Support / resistance", value: "Above key support", buy: true },
];

const SCORE_BARS = [
  { label: "Management", value: 91, color: "#1a3a5c" },
  { label: "Opportunity", value: 78, color: "#2d6a4f" },
  { label: "Deal", value: 82, color: "#c8952a" },
];

export function Slide3LiveScore() {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div style={{ display: "flex", gap: 48, alignItems: "center", maxWidth: 900, width: "100%" }}>
        {/* Left */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8952a", marginBottom: 18 }}>
            Live example · HDFCBANK
          </p>
          <h2 style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: "clamp(26px, 3.6vw, 44px)", color: "#0F172B", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            Know the stock.<br />Know the moment.
          </h2>
          <p style={{ fontSize: 14, color: "#888888", lineHeight: 1.65, maxWidth: 280, marginBottom: 22 }}>
            MOD tells you what to own. Automated technicals tell you when to pull the trigger.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, maxWidth: 300 }}>
            {TECH_SIGNALS.map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: t.signal === "green" ? "#27ae60" : "#c8952a" }} />
                <span style={{ fontSize: 12, color: "#3a3a3a", flex: 1 }}>{t.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: t.buy ? "#27ae60" : "#c8952a" }}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score card */}
        <div ref={ref} style={{ width: 260, flexShrink: 0, background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", padding: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#bbbbbb", marginBottom: 2 }}>HDFCBANK · NSE</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172B", marginBottom: 16 }}>HDFC Bank Ltd.</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", border: "2.5px solid #1a3a5c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: 26, color: "#1a3a5c", lineHeight: 1 }}>84</span>
              <span style={{ fontSize: 10, color: "#bbbbbb" }}>/ 100</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {SCORE_BARS.map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#3a3a3a", width: 70, flexShrink: 0 }}>{b.label}</span>
                <div style={{ flex: 1, height: 4, background: "#F5F5F5", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: b.color, width: animated ? `${b.value}%` : "0%", transition: "width 0.95s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172B", width: 22, textAlign: "right" }}>{b.value}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "12px 0" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#888888" }}>Technical signal</span>
            <span style={{ fontWeight: 600, color: "#27ae60", background: "#eefaf2", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>▲ Buy trigger active</span>
          </div>
          <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#eef7ee", border: "1px solid rgba(45,106,79,0.18)", fontSize: 11, fontWeight: 600, color: "#2d6a4f" }}>
            ✦ High conviction · Accumulate on dips
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 4 — Demat Connect
// ─────────────────────────────────────────
const PORTFOLIO_HOLDINGS = [
  { rank: 1, ticker: "HDFCBANK", name: "HDFC Bank", m: 91, o: 78, d: 82, score: 84, tier: "hi" },
  { rank: 2, ticker: "INFY", name: "Infosys", m: 85, o: 72, d: 74, score: 77, tier: "hi" },
  { rank: 3, ticker: "TATAMOTORS", name: "Tata Motors", m: 62, o: 70, d: 55, score: 62, tier: "mid" },
  { rank: 4, ticker: "ZOMATO", name: "Zomato", m: 48, o: 66, d: 38, score: 51, tier: "lo" },
];

export function Slide4Demat({ onSkip }: { onSkip: () => void }) {
  const [selected, setSelected] = useState<string>("cdsl");
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const dematOptions = [
    { id: "cdsl", abbr: "CD", name: "CDSL", desc: "Central Depository Services Ltd.", bg: "#1a3a5c", color: "#fff" },
    { id: "nsdl", abbr: "NS", name: "NSDL", desc: "National Securities Depository Ltd.", bg: "#2d6a4f", color: "#fff" },
    { id: "manual", abbr: "+", name: "Add manually", desc: "Enter tickers yourself", bg: "#F5F5F5", color: "#888888", border: "1px solid rgba(0,0,0,0.08)" },
  ];

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div style={{ display: "flex", gap: 56, alignItems: "center", maxWidth: 900, width: "100%" }}>
        {/* Left */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c8952a", marginBottom: 18 }}>
            Connect your portfolio
          </p>
          <h2 style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: "clamp(26px, 3.6vw, 44px)", color: "#0F172B", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            See your holdings<br />through a <em style={{ fontStyle: "italic", color: "#1a3a5c" }}>sharper lens.</em>
          </h2>
          <p style={{ fontSize: 14, color: "#888888", lineHeight: 1.65, maxWidth: 290, marginBottom: 22 }}>
            Link your demat account. Every stock you own, ranked by MOD conviction — instantly.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, maxWidth: 300 }}>
            {dematOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 13,
                  padding: "13px 16px",
                  background: selected === opt.id ? "#f0f4f9" : "#fff",
                  border: selected === opt.id ? "1px solid #1a3a5c" : "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 10, cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: opt.id === "manual" ? 18 : 13, fontWeight: 700, flexShrink: 0, background: opt.bg, color: opt.color, border: opt.border }}>
                  {opt.abbr}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", marginBottom: 1 }}>{opt.name}</div>
                  <div style={{ fontSize: 11, color: "#888888" }}>{opt.desc}</div>
                </div>
                <span style={{ fontSize: 14, color: "#bbbbbb" }}>→</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#bbbbbb", marginTop: 11, maxWidth: 300, lineHeight: 1.5 }}>
            Read-only access · SOC 2 certified · Your holdings are never sold or shared.
          </p>
          <button
            onClick={onSkip}
            style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#888888", textDecoration: "underline", padding: 0 }}
          >
            Skip for now
          </button>
        </div>

        {/* Portfolio preview */}
        <div style={{ width: 300, flexShrink: 0, background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B" }}>Your portfolio · MOD ranked</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#2d6a4f", background: "#eef7ee", padding: "3px 8px", borderRadius: 4 }}>Preview</span>
          </div>
          {PORTFOLIO_HOLDINGS.map((h) => (
            <div key={h.ticker} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#bbbbbb", width: 14, flexShrink: 0 }}>#{h.rank}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172B" }}>{h.ticker}</div>
                <div style={{ fontSize: 10, color: "#888888" }}>{h.name}</div>
              </div>
              <div style={{ width: 68, flexShrink: 0 }}>
                {[{ v: h.m, c: "#1a3a5c" }, { v: h.o, c: "#2d6a4f" }, { v: h.d, c: "#c8952a" }].map((bar, i) => (
                  <div key={i} style={{ height: 3, background: "#F5F5F5", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                    <div style={{ height: "100%", borderRadius: 2, background: bar.c, width: animated ? `${bar.v}%` : "0%", transition: `width 0.7s ease ${i * 0.08}s` }} />
                  </div>
                ))}
                <div style={{ fontSize: 9, color: "#bbbbbb", textAlign: "right", marginTop: 1 }}>M · O · D</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right", width: 28, flexShrink: 0, color: h.tier === "hi" ? "#2d6a4f" : h.tier === "mid" ? "#c8952a" : "#c0392b" }}>
                {h.score}
              </span>
            </div>
          ))}
          <div style={{ padding: "10px 16px", background: "#F5F5F5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#888888" }}>2 holdings need review</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1a3a5c" }}>View full report →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 5 — Search first stock
// ─────────────────────────────────────────
const SEARCH_PILLS = [
  { label: "Reliance Industries", symbol: "RELIANCE" },
  { label: "Infosys", symbol: "INFY" },
  { label: "HDFC Bank", symbol: "HDFCBANK" },
  { label: "Tata Motors", symbol: "TATAMOTORS" },
  { label: "Zomato", symbol: "ZOMATO" },
];

export function Slide5Search() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function goToScreener(symbol: string) {
    router.push(`/screener/home?symbol=${symbol}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/screener/home?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <h1 style={{ fontFamily: "var(--font-ibm-plex-serif), Georgia, serif", fontSize: "clamp(36px, 5.5vw, 64px)", color: "#0F172B", letterSpacing: "-0.03em", lineHeight: 1.06, maxWidth: 520, marginBottom: 10 }}>
        Search your<br />first stock.
      </h1>
      <p style={{ fontSize: 16, color: "#888888", textAlign: "center", marginBottom: 36 }}>
        MOD score, technical signal, verdict — in under 30 seconds.
      </p>
      <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ background: "#fff", border: "1.5px solid #1a3a5c", borderRadius: 10, display: "flex", alignItems: "center", boxShadow: "0 0 0 4px rgba(26,58,92,0.07)", overflow: "hidden", marginBottom: 18 }}>
          <div style={{ padding: "0 14px 0 20px", color: "#888888", flexShrink: 0, display: "flex", alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any listed company…"
            autoComplete="off"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 17, color: "#0F172B", padding: "18px 0" }}
          />
          <span style={{ padding: "0 18px", fontSize: 12, color: "#bbbbbb", fontFamily: "monospace", flexShrink: 0 }}>⌘K</span>
        </div>
      </form>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 520 }}>
        {SEARCH_PILLS.map((p) => (
          <button
            key={p.symbol}
            onClick={() => goToScreener(p.symbol)}
            style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "7px 16px", fontSize: 13, color: "#3a3a3a", cursor: "pointer", transition: "all 0.18s" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a3a5c";
              (e.currentTarget as HTMLButtonElement).style.color = "#1a3a5c";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#3a3a3a";
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 24, fontSize: 12, color: "#bbbbbb" }}>
        1,200+ stocks · NSE & BSE · Updated nightly
      </p>
    </div>
  );
}
