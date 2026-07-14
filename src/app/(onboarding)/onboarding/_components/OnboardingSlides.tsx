"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Bell, TriangleAlert, X, Check } from "lucide-react";
import { OB } from "./theme";
import { HalfArcGauge } from "./HalfArcGauge";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <FadeUp>
      <p
        style={{
          fontFamily: OB.mono,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: OB.muted,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        {children}
      </p>
    </FadeUp>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return (
    <em
      style={{
        fontFamily: OB.serif,
        fontStyle: "italic",
        color: OB.accent,
      }}
    >
      {children}
    </em>
  );
}

// ─────────────────────────────────────────
// Slide 1 — How it works
// ─────────────────────────────────────────
const DOC_PILLS = [
  "Concalls",
  "Investor PPTs",
  "Annual reports",
  "Exchange filings",
  "Peer comparisons",
  "Sector filings",
  "Years of earnings",
  "Bulk & block deals",
  "Analyst reports",
  "Management guidance",
  "Insider trades",
];

const STAT_ROW = [
  { num: "920K+", label: "DOCS WE'VE READ" },
  { num: "4,200K+", label: "SIGNALS SURFACED" },
  { num: "120K+", label: "PROMISES TRACKED" },
];

function StackedDocsIcon() {
  return (
    <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={2 + i * 9}
          y={26 - i * 6}
          width="30"
          height="22"
          rx="1.5"
          fill="#fff"
          stroke={OB.border}
          strokeWidth="1"
        />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={38 + i * 2} y1={4} x2={38 + i * 2} y2={20} stroke={OB.faint} strokeWidth="1" />
      ))}
    </svg>
  );
}

export function Slide1HowItWorks() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <Eyebrow>01 — Signals, extracted</Eyebrow>
      <FadeUp delay={0.06}>
        <h1
          style={{
            fontFamily: OB.serif,
            fontWeight: 400,
            fontSize: "clamp(34px, 4.6vw, 60px)",
            color: OB.ink,
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            maxWidth: 760,
            marginBottom: 44,
          }}
        >
          We read <Em>hundreds</Em>. You get <Em>one</Em> answer.
        </h1>
      </FadeUp>

      <FadeUp delay={0.14}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 14 }}>
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                display: "block",
                fontFamily: OB.mono,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: OB.muted,
                marginBottom: 14,
              }}
            >
              WE READ
            </span>
            <span
              style={{
                display: "block",
                fontFamily: OB.serif,
                fontSize: 56,
                color: OB.ink,
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              327
            </span>
            <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted }}>
              DOCS / COMPANY
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 12px" }}>
            <StackedDocsIcon />
          </div>

          <div style={{ width: 60, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `1.5px solid ${OB.accent}`,
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <span
              style={{
                display: "block",
                fontFamily: OB.mono,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: OB.muted,
                marginBottom: 4,
              }}
            >
              YOU SEE
            </span>
            <HalfArcGauge score={84} ticker="HDFCBANK" size={148} delay={0.4} />
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.22}>
        <p style={{ fontFamily: OB.serif, fontStyle: "italic", fontSize: 16, color: OB.ink2, marginBottom: 40 }}>
          cross-referenced, so nothing gets missed
        </p>
      </FadeUp>

      <FadeUp delay={0.3} style={{ width: "100%", maxWidth: 1000 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            overflow: "hidden",
            borderTop: `1px solid ${OB.borderSoft}`,
            borderBottom: `1px solid ${OB.borderSoft}`,
            padding: "18px 0",
            marginBottom: 32,
            maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
          }}
        >
          {DOC_PILLS.map((p) => (
            <span
              key={p}
              style={{
                flexShrink: 0,
                fontFamily: OB.sans,
                fontSize: 13,
                color: OB.ink2,
                border: `1px solid ${OB.border}`,
                borderRadius: 999,
                padding: "8px 18px",
                whiteSpace: "nowrap",
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </FadeUp>

      <FadeUp delay={0.36}>
        <div style={{ display: "flex", gap: 64 }}>
          {STAT_ROW.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "block",
                  fontFamily: OB.serif,
                  fontSize: 40,
                  color: OB.ink,
                  marginBottom: 6,
                }}
              >
                {s.num}
              </span>
              <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </FadeUp>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 2 — The Score (M · O · D)
// ─────────────────────────────────────────
const MOD_LETTERS = [
  { letter: "M", title: "Management", question: "“Do they do what they say?”", score: 91, color: OB.olive },
  { letter: "O", title: "Opportunity", question: "“Is this a good industry?”", score: 78, color: OB.ink },
  { letter: "D", title: "Deal", question: "“Is the price right?”", score: 82, color: OB.accent },
];

export function Slide2TheScore() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <Eyebrow>02 — How we score every stock</Eyebrow>
      <FadeUp delay={0.06}>
        <h2
          style={{
            fontFamily: OB.serif,
            fontWeight: 400,
            fontSize: "clamp(30px, 4vw, 50px)",
            color: OB.ink,
            letterSpacing: "-0.01em",
            marginBottom: 28,
          }}
        >
          Three questions. <Em>One</Em> score.
        </h2>
      </FadeUp>

      <FadeUp delay={0.14} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <HalfArcGauge score={84} ticker="HDFCBANK" size={170} delay={0.3} />
        </div>
      </FadeUp>

      <div style={{ display: "flex", gap: 56, width: "100%", maxWidth: 900, justifyContent: "center" }}>
        {MOD_LETTERS.map((m, i) => (
          <FadeUp key={m.letter} delay={0.24 + i * 0.08} style={{ flex: 1, maxWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 10, marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: OB.serif,
                  fontSize: 88,
                  lineHeight: 0.85,
                  color: m.color,
                }}
              >
                {m.letter}
              </span>
              <span
                style={{
                  fontFamily: OB.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: OB.ink,
                  border: `1px solid ${OB.border}`,
                  borderRadius: 4,
                  padding: "3px 7px",
                  marginTop: 8,
                }}
              >
                {m.score}
              </span>
            </div>
            <p style={{ fontFamily: OB.sans, fontSize: 16, fontWeight: 500, color: OB.ink, marginBottom: 6 }}>
              {m.title}
            </p>
            <p style={{ fontFamily: OB.serif, fontStyle: "italic", fontSize: 15, color: OB.muted, marginBottom: 16 }}>
              {m.question}
            </p>
            <div style={{ height: 3, background: OB.borderSoft, borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.score}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.08 }}
                style={{ height: "100%", background: m.color, borderRadius: 2 }}
              />
            </div>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 3 — Your Journal
// ─────────────────────────────────────────
export function Slide3YourJournal() {
  const [conviction, setConviction] = useState(78);

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div style={{ width: "100%", maxWidth: 980 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Eyebrow>03 — A journal that watches your back</Eyebrow>
          <FadeUp delay={0.06}>
            <h2
              style={{
                fontFamily: OB.serif,
                fontWeight: 400,
                fontSize: "clamp(28px, 3.6vw, 46px)",
                color: OB.ink,
                letterSpacing: "-0.01em",
              }}
            >
              You <Em>write</Em> it once. We <Em>watch</Em> it for you.
            </h2>
          </FadeUp>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          <FadeUp delay={0.16} style={{ flex: 1.1 }}>
            <div
              style={{
                background: OB.bgDeep,
                border: `1px solid ${OB.border}`,
                borderRadius: 14,
                padding: 20,
                height: "100%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: OB.mono, fontSize: 11, letterSpacing: "0.06em", color: OB.muted }}>
                  GUIDED · 4 PROMPTS
                </span>
                <span style={{ fontFamily: OB.mono, fontSize: 11, color: OB.muted }}>03 of 04</span>
              </div>
              <p style={{ fontFamily: OB.serif, fontSize: 24, color: OB.ink, marginBottom: 16 }}>
                Reliance <span style={{ color: OB.muted }}>· NSE</span>
              </p>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 2.5,
                      borderRadius: 2,
                      background: i < 3 ? OB.ink : OB.border,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  borderLeft: `2px solid ${OB.accent}`,
                  paddingLeft: 14,
                  marginBottom: 24,
                }}
              >
                <p style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted, marginBottom: 8 }}>
                  YOUR THESIS · WE&apos;RE SAVING AS YOU TYPE
                </p>
                <p style={{ fontFamily: OB.serif, fontStyle: "italic", fontSize: 17, color: OB.ink2, lineHeight: 1.5 }}>
                  Buying for the Jio value unlock and disciplined capital allocation. The conglomerate discount
                  narrows once retail and Jio list separately.
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted }}>
                  WATCHING
                </span>
                <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted }}>
                  HIGHEST
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={conviction}
                onChange={(e) => setConviction(Number(e.target.value))}
                style={{ width: "100%", accentColor: OB.accent }}
                aria-label="Conviction level"
              />
              <p style={{ fontFamily: OB.serif, fontStyle: "italic", fontSize: 13, color: OB.accent, marginTop: 4 }}>
                High conviction
              </p>
            </div>
          </FadeUp>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <FadeUp delay={0.26}>
              <div
                style={{
                  background: OB.cardDark,
                  borderRadius: 14,
                  padding: 20,
                  boxShadow: "0 12px 28px rgba(23,20,15,0.18)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: OB.accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>
                    LIVE ALERT · 2H AGO
                  </span>
                </div>
                <p style={{ fontFamily: OB.serif, fontSize: 21, color: "#fff", marginBottom: 8 }}>Thesis at risk</p>
                <p style={{ fontFamily: OB.sans, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: 14 }}>
                  KPIGREEN — order-book miss vs. management guidance from Q3 concall.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Bell style={{ width: 12, height: 12, color: "rgba(255,255,255,0.4)" }} />
                  <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)" }}>
                    DRIVER YOU NOTED · TRIGGERED
                  </span>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.34}>
              <div
                style={{
                  background: OB.bgDeep,
                  border: `1px solid ${OB.border}`,
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <TriangleAlert style={{ width: 13, height: 13, color: OB.gold }} />
                  <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted }}>
                    PROMISE BROKEN — YESTERDAY
                  </span>
                </div>
                <p style={{ fontFamily: OB.serif, fontSize: 19, color: OB.ink, marginBottom: 8 }}>
                  Management missed a promise
                </p>
                <p style={{ fontFamily: OB.sans, fontSize: 13, color: OB.ink2, lineHeight: 1.55 }}>
                  They guided for 18% margins last quarter. Q2 came in 240bps lower. We flagged it for you.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 4 — Your Stocks
// ─────────────────────────────────────────
const CONNECT_SOURCES = ["CDSL", "NSDL", "Zerodha", "Groww", "Upstox"];

const PORTFOLIO_ROWS = [
  { rank: 1, ticker: "HDFCBANK", name: "HDFC Bank", score: 84, trend: "up" as const },
  { rank: 2, ticker: "INFY", name: "Infosys", score: 77, trend: "up" as const },
  { rank: 3, ticker: "TATAMOTORS", name: "Tata Motors", score: 62, trend: "flat" as const },
  { rank: 4, ticker: "ZOMATO", name: "Zomato", score: 51, trend: "down" as const },
];

function TrendGlyph({ trend }: { trend: "up" | "down" | "flat" }) {
  const color = trend === "up" ? OB.olive : trend === "down" ? OB.accent : OB.muted;
  const glyph = trend === "up" ? "▲" : trend === "down" ? "▽" : "–";
  return <span style={{ color, fontSize: 14 }}>{glyph}</span>;
}

export function Slide4YourStocks({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div style={{ width: "100%", maxWidth: 960, textAlign: "center" }}>
        <Eyebrow>04 — Bring in what you already own</Eyebrow>
        <FadeUp delay={0.06}>
          <h2
            style={{
              fontFamily: OB.serif,
              fontWeight: 400,
              fontSize: "clamp(30px, 4vw, 50px)",
              color: OB.ink,
              letterSpacing: "-0.01em",
              marginBottom: 28,
            }}
          >
            Your stocks, <Em>ranked</Em> for you.
          </h2>
        </FadeUp>

        <FadeUp delay={0.14}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
            {CONNECT_SOURCES.map((s) => (
              <span
                key={s}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: OB.sans,
                  fontSize: 13,
                  color: OB.ink2,
                  border: `1px solid ${OB.border}`,
                  borderRadius: 999,
                  padding: "8px 16px",
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: OB.olive }} />
                {s}
              </span>
            ))}
            <span style={{ fontFamily: OB.mono, fontSize: 11, color: OB.muted, marginLeft: 4 }}>
              → takes 20 seconds
            </span>
          </div>
          <button
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: OB.sans,
              fontSize: 12,
              color: OB.faint,
              textDecoration: "underline",
              padding: 0,
              marginBottom: 32,
            }}
          >
            Skip for now
          </button>
        </FadeUp>

        <FadeUp delay={0.22}>
          <div style={{ borderTop: `1px solid ${OB.border}` }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 4px",
                borderBottom: `1px solid ${OB.borderSoft}`,
              }}
            >
              <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.08em", color: OB.muted }}>
                YOUR PORTFOLIO · SORTED BY CONVICTION
              </span>
              <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.04em", color: OB.muted }}>
                4 stocks · 2 worth a look
              </span>
            </div>
            {PORTFOLIO_ROWS.map((row, i) => (
              <div
                key={row.ticker}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "16px 4px",
                  borderBottom: `1px solid ${OB.borderSoft}`,
                }}
              >
                <span style={{ fontFamily: OB.mono, fontSize: 12, color: OB.faint, width: 24, textAlign: "left" }}>
                  #{row.rank}
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, width: 220, textAlign: "left" }}>
                  <span style={{ fontFamily: OB.mono, fontSize: 14, fontWeight: 600, color: OB.ink }}>
                    {row.ticker}
                  </span>
                  <span style={{ fontFamily: OB.sans, fontSize: 12, color: OB.muted }}>{row.name}</span>
                </div>
                <div style={{ flex: 1, height: 2, background: OB.borderSoft, position: "relative" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.score}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: row.trend === "down" ? OB.accent : OB.ink,
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, width: 70, justifyContent: "flex-end" }}>
                  <span style={{ fontFamily: OB.serif, fontSize: 26, color: OB.ink }}>{row.score}</span>
                  <TrendGlyph trend={row.trend} />
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <p style={{ fontFamily: OB.serif, fontStyle: "italic", fontSize: 16, color: OB.muted, marginTop: 28 }}>
            Finally, see every stock you own through the same clear lens.
          </p>
        </FadeUp>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 5 — Your Broker
// ─────────────────────────────────────────
const BROKERS = [
  { id: "zerodha", name: "Zerodha", file: "zerodha.png" },
  { id: "groww", name: "Groww", file: "groww.png" },
  { id: "upstox", name: "Upstox", file: "upstox.png" },
  { id: "angelone", name: "Angel One", file: "angelone.png" },
  { id: "5paisa", name: "5paisa", file: "5paisa.png" },
  { id: "icicidirect", name: "ICICI Direct", file: "icicidirect.png" },
  { id: "hdfcsky", name: "HDFC Sky", file: "hdfcsky.png" },
  { id: "kotaksecurities", name: "Kotak Securities", file: "kotaksecurities.png" },
  { id: "paytmmoney", name: "Paytm Money", file: "paytmmoney.png" },
  { id: "sharekhan", name: "Sharekhan", file: "sharekhan.png" },
];

export function Slide5YourBroker() {
  const radius = 210;
  const center = radius + 40;
  const size = center * 2;

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <Eyebrow>05 — Buy & sell without switching apps</Eyebrow>
      <FadeUp delay={0.06}>
        <h2
          style={{
            fontFamily: OB.serif,
            fontWeight: 400,
            fontSize: "clamp(28px, 3.6vw, 46px)",
            color: OB.ink,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          See a signal. <Em>Place</Em> the trade.
        </h2>
      </FadeUp>
      <FadeUp delay={0.12}>
        <h3
          style={{
            fontFamily: OB.serif,
            fontWeight: 400,
            fontSize: "clamp(22px, 2.8vw, 36px)",
            color: OB.ink2,
            marginBottom: 32,
          }}
        >
          All in one place.
        </h3>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div style={{ position: "relative", width: size, height: size, maxWidth: "80vw", maxHeight: "48vh" }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={OB.border}
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          </svg>

          <div
            style={{
              position: "absolute",
              left: center,
              top: center,
              transform: "translate(-50%, -50%)",
              width: 128,
              height: 128,
              borderRadius: "50%",
              border: `1px solid ${OB.border}`,
              background: OB.bg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: OB.accent, marginBottom: 4 }} />
            <span style={{ fontFamily: OB.serif, fontSize: 24, color: OB.ink }}>You</span>
            <span style={{ fontFamily: OB.mono, fontSize: 9, letterSpacing: "0.06em", color: OB.muted }}>
              1 TAP · TRADE
            </span>
          </div>

          {BROKERS.map((b, i) => {
            const angle = (i / BROKERS.length) * 2 * Math.PI - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    border: `1px solid ${OB.border}`,
                    background: OB.card,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Image src={`/logos/brokers/${b.file}`} alt={b.name} width={28} height={28} style={{ objectFit: "contain" }} />
                </div>
                <span
                  style={{
                    fontFamily: OB.mono,
                    fontSize: 9,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: OB.muted,
                    whiteSpace: "nowrap",
                  }}
                >
                  {b.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </FadeUp>
    </div>
  );
}

// ─────────────────────────────────────────
// Slide 6 — Pick a few
// ─────────────────────────────────────────
interface PickStock {
  ticker: string;
  name: string;
  sector: string;
  score: number;
}

const PICK_STOCKS: PickStock[] = [
  { ticker: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking", score: 84 },
  { ticker: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas", score: 79 },
  { ticker: "INFY", name: "Infosys", sector: "IT Services", score: 77 },
  { ticker: "TCS", name: "Tata Consultancy Services", sector: "IT Services", score: 82 },
  { ticker: "ICICIBANK", name: "ICICI Bank", sector: "Banking", score: 81 },
  { ticker: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", score: 74 },
];

export function Slide6PickAFew() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(["HDFCBANK", "RELIANCE"]);
  const MAX = 4;

  function toggle(ticker: string) {
    setSelected((prev) => {
      if (prev.includes(ticker)) return prev.filter((t) => t !== ticker);
      if (prev.length >= MAX) return prev;
      return [...prev, ticker];
    });
  }

  const filtered = query.trim()
    ? PICK_STOCKS.filter(
        (s) =>
          s.ticker.toLowerCase().includes(query.trim().toLowerCase()) ||
          s.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : PICK_STOCKS;

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div style={{ width: "100%", maxWidth: 880 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Eyebrow>06 — Last step, promise</Eyebrow>
          <FadeUp delay={0.06}>
            <h2
              style={{
                fontFamily: OB.serif,
                fontWeight: 400,
                fontSize: "clamp(30px, 4vw, 50px)",
                color: OB.ink,
                letterSpacing: "-0.01em",
              }}
            >
              Pick <Em>3–4</Em> stocks to follow.
            </h2>
          </FadeUp>
        </div>

        <FadeUp delay={0.14}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: `1.5px solid ${OB.ink}`,
              paddingBottom: 14,
              marginBottom: 12,
            }}
          >
            <Search style={{ width: 18, height: 18, color: OB.muted, flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try HDFC Bank, Reliance, Infosys…"
              autoComplete="off"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: OB.serif,
                fontSize: 22,
                color: OB.ink,
              }}
            />
            <span style={{ fontFamily: OB.mono, fontSize: 10, letterSpacing: "0.06em", color: OB.faint, flexShrink: 0 }}>
              SCORED IN 3S
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={{ fontFamily: OB.serif, fontStyle: "italic", fontSize: 20, color: OB.accent, flexShrink: 0 }}>
              {selected.length}
            </span>
            <span style={{ fontFamily: OB.mono, fontSize: 12, color: OB.muted, flexShrink: 0 }}>/ {MAX}</span>
            <div style={{ flex: 1, height: 2, background: OB.borderSoft, position: "relative" }}>
              <motion.div
                initial={false}
                animate={{ width: `${(selected.length / MAX) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: "absolute", inset: 0, background: OB.accent }}
              />
            </div>
          </div>

          {selected.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {selected.map((t) => (
                <span
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: OB.mono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    background: OB.ink,
                    borderRadius: 6,
                    padding: "7px 10px",
                  }}
                >
                  {t}
                  <button
                    onClick={() => toggle(t)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
                    aria-label={`Remove ${t}`}
                  >
                    <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.7)" }} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </FadeUp>

        <FadeUp delay={0.22}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {filtered.map((s) => {
              const isSel = selected.includes(s.ticker);
              return (
                <button
                  key={s.ticker}
                  onClick={() => toggle(s.ticker)}
                  disabled={!isSel && selected.length >= MAX}
                  style={{
                    textAlign: "left",
                    border: `1px solid ${isSel ? OB.ink : OB.border}`,
                    borderRadius: 10,
                    padding: 16,
                    background: isSel ? OB.ink : "transparent",
                    cursor: !isSel && selected.length >= MAX ? "not-allowed" : "pointer",
                    opacity: !isSel && selected.length >= MAX ? 0.4 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <span
                      style={{
                        fontFamily: OB.mono,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isSel ? "#fff" : OB.ink,
                      }}
                    >
                      {s.ticker}
                    </span>
                    <span
                      style={{
                        fontFamily: OB.serif,
                        fontSize: 26,
                        color: isSel ? "#fff" : OB.ink,
                      }}
                    >
                      {s.score}
                    </span>
                  </div>
                  <p style={{ fontFamily: OB.sans, fontSize: 13, color: isSel ? "rgba(255,255,255,0.75)" : OB.ink2, marginBottom: 3 }}>
                    {s.name}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontFamily: OB.mono,
                        fontSize: 10,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: isSel ? "rgba(255,255,255,0.5)" : OB.muted,
                      }}
                    >
                      {s.sector}
                    </span>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `1px solid ${isSel ? "rgba(255,255,255,0.6)" : OB.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isSel ? "#fff" : "transparent",
                        flexShrink: 0,
                      }}
                    >
                      {isSel && <Check style={{ width: 11, height: 11, color: OB.ink }} />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
