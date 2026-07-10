"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Tag({ children, color = "rgba(255,255,255,0.12)", textColor = "rgba(255,255,255,0.55)" }: { children: React.ReactNode; color?: string; textColor?: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", background: color, color: textColor, borderRadius: 4, padding: "2px 7px" }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0" }} />;
}

// ─── Card 1 · Indian Stocks — Management Score with animated gauge ─────────────

// Math.cos/Math.sin aren't guaranteed bit-identical across JS engines, so raw trig output can
// differ by a ULP or two between server and client — round so SSR/CSR markup matches exactly.
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function GaugeTick({ filled, angle }: { filled: boolean; angle: number }) {
  const r = 52;
  const rad = (angle * Math.PI) / 180;
  const x1 = round(64 + (r - 8) * Math.cos(rad));
  const y1 = round(64 + (r - 8) * Math.sin(rad));
  const x2 = round(64 + r * Math.cos(rad));
  const y2 = round(64 + r * Math.sin(rad));
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={filled ? "#a5b4fc" : "rgba(255,255,255,0.10)"} strokeWidth="2.5" strokeLinecap="round" />;
}

function AnimatedGauge({ score }: { score: number }) {
  const ticks = 28;
  const startAngle = 150;
  const endAngle = 390;
  const filled = Math.round((score / 100) * ticks);

  return (
    <div className="flex flex-col items-center" style={{ marginTop: 4 }}>
      <svg width="128" height="80" viewBox="0 0 128 80">
        {Array.from({ length: ticks }).map((_, i) => {
          const angle = startAngle + (i * (endAngle - startAngle)) / (ticks - 1);
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.025, duration: 0.2 }}
            >
              <GaugeTick filled={i < filled} angle={angle} />
            </motion.g>
          );
        })}
        <text x="64" y="58" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{score}</text>
        <text x="64" y="72" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" letterSpacing="1">/ 100</text>
      </svg>
    </div>
  );
}

function IndianStocksCard() {
  const bars = [
    { label: "Capital Allocation", val: 91, color: "#a5b4fc" },
    { label: "Execution Track",    val: 84, color: "#6ee7b7" },
    { label: "Communication",      val: 88, color: "#fde68a" },
  ];
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Tag color="rgba(165,180,252,0.15)" textColor="#a5b4fc">Indian Stocks</Tag>
            <Tag>FY26 Q3</Tag>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>TCS</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Management quality analysis</p>
        </div>
        <AnimatedGauge score={87} />
      </div>
      <Divider />
      {/* Bars */}
      <div className="px-5 py-3 flex flex-col gap-3">
        {bars.map(({ label, val, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.1, duration: 0.45 }}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color }}>{val}</span>
            </div>
            <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: "easeOut" }} style={{ height: "100%", borderRadius: 99, background: color, opacity: 0.8 }} />
            </div>
          </motion.div>
        ))}
      </div>
      <Divider />
      {/* AI insight chip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.4 }} className="flex items-start gap-2.5 px-5 py-3.5">
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(165,180,252,0.15)", border: "1px solid rgba(165,180,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>
          Management demonstrates <span style={{ color: "#a5b4fc", fontWeight: 500 }}>high capital discipline</span> with consistent guidance accuracy over 6 quarters.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Card 2 · Mutual Funds — Fund comparison heatmap ─────────────────────────

const mfFunds = [
  { name: "Mirae Asset Large Cap",   aum: "₹32,400 Cr",  ret1y: 18.4, ret3y: 14.2, risk: "Low",    color: "#6ee7b7" },
  { name: "Parag Parikh Flexi Cap",  aum: "₹78,200 Cr",  ret1y: 22.1, ret3y: 16.8, risk: "Med",    color: "#6ee7b7" },
  { name: "HDFC Mid-Cap Opps",       aum: "₹61,500 Cr",  ret1y: 28.6, ret3y: 19.4, risk: "High",   color: "#fde68a" },
  { name: "Axis Small Cap",          aum: "₹22,800 Cr",  ret1y: 31.2, ret3y: 21.7, risk: "High",   color: "#fb923c" },
];

function HeatCell({ val, max, color }: { val: number; max: number; color: string }) {
  return (
    <div style={{ position: "relative", width: 44, height: 28, borderRadius: 5, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, background: color, opacity: val / max * 0.55, transformOrigin: "left" }}
      />
      <span style={{ position: "relative", fontSize: 11, fontWeight: 600, color: "white", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        {val}%
      </span>
    </div>
  );
}

function MutualFundsCard() {
  return (
    <div>
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Tag color="rgba(110,231,183,0.15)" textColor="#6ee7b7">Mutual Funds</Tag>
            <Tag>AI Screener</Tag>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Top Picks</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Returns vs risk, ranked by QuantScore</p>
        </div>
      </div>
      <Divider />
      {/* Table header */}
      <div className="px-5 pt-3 pb-1.5 flex items-center" style={{ gap: 0 }}>
        <span style={{ flex: 1, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Fund</span>
        <span style={{ width: 44, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>1Y</span>
        <span style={{ width: 52, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>3Y</span>
        <span style={{ width: 32, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>Risk</span>
      </div>
      <div className="px-5 flex flex-col gap-2 pb-4">
        {mfFunds.map(({ name, ret1y, ret3y, risk, color }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.1, duration: 0.45 }}
            className="flex items-center"
            style={{ gap: 0 }}
          >
            <p style={{ flex: 1, fontSize: 10.5, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 6 }}>{name}</p>
            <div style={{ width: 44, display: "flex", justifyContent: "center" }}><HeatCell val={ret1y} max={35} color={color} /></div>
            <div style={{ width: 52, display: "flex", justifyContent: "center" }}><HeatCell val={ret3y} max={25} color={color} /></div>
            <div style={{ width: 32, display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: risk === "High" ? "#fb923c" : risk === "Med" ? "#fde68a" : "#6ee7b7" }}>{risk}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <Divider />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="flex items-center justify-between px-5 py-3">
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>4,200+ funds screened</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#6ee7b7" }}>↑ Updated today</span>
      </motion.div>
    </div>
  );
}

// ─── Card 3 · US Stocks — Candlestick-style OHLC + earnings beat timeline ────

const candles = [
  { o: 58, h: 72, l: 52, c: 68, beat: false, label: "Q2'22" },
  { o: 68, h: 80, l: 62, c: 74, beat: false, label: "Q3'22" },
  { o: 74, h: 82, l: 66, c: 70, beat: false, label: "Q4'22" },
  { o: 70, h: 78, l: 58, c: 61, beat: false, label: "Q1'23" },
  { o: 61, h: 76, l: 56, c: 73, beat: true,  label: "Q2'23" },
  { o: 73, h: 88, l: 70, c: 85, beat: false, label: "Q3'23" },
  { o: 85, h: 95, l: 80, c: 91, beat: true,  label: "Q4'23" },
];

// chart constants
const CHART_W = 280;
const CHART_H = 88;
const PAD_L = 32; // left padding for price axis
const PAD_B = 18; // bottom padding for quarter labels
const PLOT_W = CHART_W - PAD_L - 4;
const PLOT_H = CHART_H - PAD_B;
const MIN_PRICE = 48;
const MAX_PRICE = 100;

function priceToY(v: number) {
  return PLOT_H - ((v - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * PLOT_H;
}

function Candle({ o, h, l, c, beat, label, index }: { o: number; h: number; l: number; c: number; beat: boolean; label: string; index: number }) {
  const slotW = PLOT_W / candles.length;
  const cx = PAD_L + slotW * index + slotW / 2;
  const bull = c >= o;
  const color = bull ? "#6ee7b7" : "#f87171";
  const bodyTop = Math.min(priceToY(o), priceToY(c));
  const bodyH = Math.max(2, Math.abs(priceToY(o) - priceToY(c)));
  const candleW = Math.min(10, slotW * 0.55);

  return (
    <motion.g
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.45, ease: "easeOut" }}
      style={{ transformOrigin: `${cx}px ${priceToY((o + c) / 2)}px` }}
    >
      {/* Wick */}
      <line x1={cx} y1={priceToY(h)} x2={cx} y2={priceToY(l)} stroke={color} strokeWidth="1" opacity={0.45} />
      {/* Body */}
      <rect x={cx - candleW / 2} y={bodyTop} width={candleW} height={bodyH} rx={1.5} fill={color} opacity={0.85} />
      {/* Earnings beat star */}
      {beat && (
        <motion.text
          x={cx} y={priceToY(h) - 5}
          textAnchor="middle" fontSize="8" fill="#fde68a"
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.07, duration: 0.3, ease: "backOut" }}
        >★</motion.text>
      )}
      {/* Quarter label */}
      <text x={cx} y={CHART_H - 3} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.22)" letterSpacing="0">{label}</text>
    </motion.g>
  );
}

function USStocksCard() {
  const stats = [
    { label: "P/E",      val: "28.4x",  sub: "vs 32x sector" },
    { label: "EPS",      val: "$9.21",  sub: "+18% YoY" },
    { label: "52W Rtn",  val: "+34%",   sub: "vs S&P +24%" },
    { label: "Mkt Cap",  val: "$2.2T",  sub: "Mega cap" },
  ];
  const priceLabels = [MIN_PRICE, 70, MAX_PRICE];
  return (
    <div>
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Tag color="rgba(251,146,60,0.15)" textColor="#fb923c">US Stocks</Tag>
            <Tag>NASDAQ</Tag>
          </div>
          <div className="flex items-baseline gap-2">
            <p style={{ fontSize: 20, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>NVDA</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7" }}>$891.20</p>
            <p style={{ fontSize: 10, color: "#6ee7b7", opacity: 0.7 }}>+2.4%</p>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Price action + earnings beats</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "backOut" }}
          style={{ textAlign: "right" }}
        >
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>QC Score</div>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(251,146,60,0.18)", border: "1px solid rgba(251,146,60,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fb923c" }}>82</span>
          </div>
        </motion.div>
      </div>
      <Divider />
      {/* Candlestick chart */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.07em" }}>7 quarters · ★ earnings beat</p>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}><span style={{ color: "#6ee7b7" }}>●</span> Bull</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}><span style={{ color: "#f87171" }}>●</span> Bear</span>
          </div>
        </div>
        <svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
          {/* Horizontal grid lines + price axis */}
          {priceLabels.map((p) => {
            const y = priceToY(p);
            return (
              <g key={p}>
                <line x1={PAD_L} y1={y} x2={CHART_W - 4} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 4" />
                <text x={PAD_L - 3} y={y + 3.5} textAnchor="end" fontSize="7.5" fill="rgba(255,255,255,0.22)">{p}</text>
              </g>
            );
          })}
          {candles.map((c, i) => <Candle key={i} {...c} index={i} />)}
        </svg>
      </div>
      <Divider />
      {/* Key stats — 2×2 grid */}
      <div className="grid grid-cols-2 gap-0 px-5 py-3">
        {stats.map(({ label, val, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
            style={{
              paddingTop: i >= 2 ? 10 : 0,
              paddingBottom: i < 2 ? 10 : 0,
              paddingRight: i % 2 === 0 ? 12 : 0,
              paddingLeft: i % 2 === 1 ? 12 : 0,
              borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "white", lineHeight: 1 }}>{val}</p>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Card 4 · Pre-IPO / Private Equity — deal pipeline ───────────────────────

const deals = [
  { name: "Ola Electric",   stage: "Pre-IPO",    raise: "₹2,800 Cr", moic: "3.2x",  progress: 78, color: "#a5b4fc" },
  { name: "PhysicsWallah",  stage: "Series E",   raise: "₹1,500 Cr", moic: "4.8x",  progress: 55, color: "#6ee7b7" },
  { name: "Shiprocket",     stage: "Pre-IPO",    raise: "₹900 Cr",   moic: "2.7x",  progress: 90, color: "#fde68a" },
];

function DealRow({ name, stage, raise, moic, progress, color, i }: { name: string; stage: string; raise: string; moic: string; progress: number; color: string; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.18 + i * 0.12, duration: 0.5 }}
      className="px-5 py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{name}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color, background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 3, padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stage}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{moic}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginLeft: 3 }}>target</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div style={{ flex: 1, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.32 + i * 0.12, duration: 0.75, ease: "easeOut" }}
            style={{ height: "100%", borderRadius: 99, background: color, opacity: 0.75 }}
          />
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{progress}% filled · {raise}</span>
      </div>
    </motion.div>
  );
}

function PreIPOCard() {
  return (
    <div>
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Tag color="rgba(253,230,138,0.15)" textColor="#fde68a">Pre-IPO · PE</Tag>
            <Tag>Live Deals</Tag>
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Deal Pipeline</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Curated private market opportunities</p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: "right" }}
        >
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Avg MOIC</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#fde68a" }}>3.9x</p>
        </motion.div>
      </div>
      <Divider />
      {deals.map((d, i) => <DealRow key={d.name} {...d} i={i} />)}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 px-5 py-3.5">
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Minimum ticket · ₹10L &nbsp;·&nbsp; SEBI-registered distributor</span>
      </motion.div>
    </div>
  );
}

// ─── Cycling shell ─────────────────────────────────────────────────────────────

const SLIDES = [
  { id: "indian-stocks",  component: <IndianStocksCard /> },
  { id: "mutual-funds",   component: <MutualFundsCard /> },
  { id: "us-stocks",      component: <USStocksCard /> },
  { id: "pre-ipo",        component: <PreIPOCard /> },
];


const slideVariants = {
  enter:  { opacity: 0, y: 14, scale: 0.985 },
  center: { opacity: 1, y: 0,  scale: 1     },
  exit:   { opacity: 0, y: -10, scale: 0.985 },
};

export function SignInPreviewCard({ index }: { index: number }) {
  return (
    <div className="w-full max-w-[480px] flex flex-col gap-3">
      {/* Card — motion.div with layout so height animates smoothly on swap */}
      <motion.div
        layout
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
        transition={{ layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={SLIDES[index].id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            {SLIDES[index].component}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
