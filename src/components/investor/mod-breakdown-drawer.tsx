"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface StockMOD {
  symbol: string;
  name: string;
  pct: number;
  management: number;
  opportunity: number;
  deal: number;
}

interface MODBreakdownDrawerProps {
  open: boolean;
  stocks: StockMOD[];
  onClose: () => void;
}

function ratingLabel(score: number): string {
  if (score >= 75) return "STRONG";
  if (score >= 55) return "FAIR";
  if (score >= 40) return "STRETCHED";
  return "WEAK";
}

function ratingColor(score: number): string {
  if (score >= 75) return "var(--qc-up, #16a34a)";
  if (score >= 55) return "var(--qc-warn, #d97706)";
  return "var(--qc-down, #dc2626)";
}

function ratingBg(score: number): string {
  if (score >= 75) return "rgba(22,163,74,0.10)";
  if (score >= 55) return "rgba(217,119,6,0.10)";
  return "rgba(220,38,38,0.10)";
}

/** Small SVG donut chart showing a score out of 100 */
function DonutScore({ score, size = 44 }: { score: number; size?: number }) {
  const color = ratingColor(score);
  const r = (size - 6) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const gap = circumference - dash;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--qc-hair, #E2E2E2)"
          strokeWidth={3}
        />
        {/* Fill */}
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${gap}` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      {/* Score label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size <= 40 ? "var(--qc-fz-11)" : "var(--qc-fz-12)",
        fontWeight: "var(--qc-w-bold)",
        fontFamily: "var(--qc-font-mono)",
        color,
        lineHeight: 1,
      }}>
        {score}
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const label = ratingLabel(score);
  const color = ratingColor(score);
  const bg = ratingBg(score);
  return (
    <span style={{
      fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)",
      letterSpacing: "var(--qc-track-eyebrow)", textTransform: "uppercase",
      fontFamily: "var(--qc-font-sans)",
      color, background: bg, border: `1px solid ${color}`,
      borderRadius: 4, padding: "2px 5px", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function PortfolioSummary({ stocks }: { stocks: StockMOD[] }) {
  const avg = (key: keyof StockMOD) =>
    Math.round(stocks.reduce((s, st) => s + (st[key] as number), 0) / stocks.length);

  const scores = [
    { label: "Management", short: "M", score: avg("management") },
    { label: "Opportunity", short: "O", score: avg("opportunity") },
    { label: "Deal", short: "D", score: avg("deal") },
  ];

  return (
    <div style={{
      background: "var(--qc-section, #F5F5F5)",
      border: "1px solid var(--qc-hair, #E2E2E2)",
      borderRadius: 10,
      padding: "14px 20px",
      marginBottom: 20,
    }}>
      <p style={{
        fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)",
        textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow-l)",
        fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)",
        margin: "0 0 12px",
      }}>
        Portfolio Average
      </p>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {scores.map(({ label, score }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DonutScore score={score} size={48} />
            <div>
              <p style={{
                fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)",
                textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)",
                fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)",
                margin: "0 0 3px",
              }}>
                {label}
              </p>
              <ScorePill score={score} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Column header row */
function TableHeader() {
  const colStyle: React.CSSProperties = {
    fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-semi)",
    textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow-l)",
    fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)",
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 44px 44px 44px 52px",
      gap: "0 8px",
      padding: "0 12px 8px",
      alignItems: "center",
    }}>
      <span style={colStyle}>Stock</span>
      <span style={{ ...colStyle, textAlign: "center" }}>M</span>
      <span style={{ ...colStyle, textAlign: "center" }}>O</span>
      <span style={{ ...colStyle, textAlign: "center" }}>D</span>
      <span style={{ ...colStyle, textAlign: "right" }}>Weight</span>
    </div>
  );
}

function StockRow({ stock, index }: { stock: StockMOD; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 48px 48px 48px 70px",
        gap: "0 12px",
        alignItems: "center",
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 8,
        padding: "10px 12px",
      }}
    >
      {/* Symbol + Name */}
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div style={{
          fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)",
          fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {stock.symbol}
        </div>
        <div style={{
          fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink-3)", marginTop: 1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {stock.name}
        </div>
      </div>

      {/* M / O / D donuts */}
      {[stock.management, stock.opportunity, stock.deal].map((score, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          <DonutScore score={score} size={38} />
        </div>
      ))}

      {/* Weight badge */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{
          fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink-3)", background: "var(--qc-section)",
          border: "1px solid var(--qc-hair)", borderRadius: 4,
          padding: "2px 7px", fontWeight: "var(--qc-w-medium)",
          whiteSpace: "nowrap",
        }}>
          {stock.pct}%
        </span>
      </div>
    </motion.div>
  );
}

const PLACEHOLDER_STOCKS: StockMOD[] = [
  { symbol: "HDFCBANK",   name: "HDFC Bank",           pct: 14, management: 82, opportunity: 74, deal: 68 },
  { symbol: "ICICIBANK",  name: "ICICI Bank",           pct: 12, management: 79, opportunity: 71, deal: 72 },
  { symbol: "RELIANCE",   name: "Reliance Industries",  pct: 11, management: 77, opportunity: 68, deal: 64 },
  { symbol: "INFY",       name: "Infosys",              pct: 9,  management: 75, opportunity: 65, deal: 61 },
  { symbol: "TCS",        name: "Tata Consultancy",     pct: 8,  management: 73, opportunity: 67, deal: 52 },
  { symbol: "TATAMOTORS", name: "Tata Motors",          pct: 7,  management: 70, opportunity: 72, deal: 58 },
  { symbol: "SBIN",       name: "State Bank of India",  pct: 6,  management: 76, opportunity: 63, deal: 69 },
  { symbol: "DIVISLAB",   name: "Divi's Laboratories",  pct: 5,  management: 69, opportunity: 61, deal: 57 },
  { symbol: "PIDILITIND", name: "Pidilite Industries",  pct: 5,  management: 79, opportunity: 66, deal: 63 },
  { symbol: "ASIANPAINT", name: "Asian Paints",         pct: 5,  management: 54, opportunity: 58, deal: 42 },
  { symbol: "ZOMATO",     name: "Zomato",               pct: 4,  management: 52, opportunity: 71, deal: 38 },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance",      pct: 4,  management: 68, opportunity: 59, deal: 55 },
];

export function MODBreakdownDrawer({ open, stocks, onClose }: MODBreakdownDrawerProps) {
  const displayStocks = stocks.length > 0 ? stocks : PLACEHOLDER_STOCKS;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 40,
              background: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)",
            }}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
              width: "min(540px, 92vw)",
              background: "var(--qc-card, #fff)",
              borderLeft: "1px solid var(--qc-hair, #E2E2E2)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "var(--qc-card, #fff)",
              borderBottom: "1px solid var(--qc-hair, #E2E2E2)",
              padding: "16px 20px 14px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}>
              <div>
                <div style={{
                  fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)",
                  letterSpacing: "var(--qc-track-eyebrow-l)", textTransform: "uppercase",
                  fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginBottom: 4,
                }}>
                  YOUR PORTFOLIO
                </div>
                <h2 style={{
                  fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-regular)",
                  margin: 0, lineHeight: 1.3,
                  color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif)",
                }}>
                  MOD Score Breakdown
                </h2>
                <p style={{
                  fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)",
                  color: "var(--qc-ink-3)", margin: "3px 0 0",
                }}>
                  Management · Opportunity · Deal
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  flexShrink: 0, background: "var(--qc-section, #F5F5F5)",
                  border: "1px solid var(--qc-hair, #E2E2E2)",
                  borderRadius: 8, width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--qc-ink-3)",
                  fontSize: "var(--qc-fz-14)", lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, padding: "16px 20px 32px", display: "flex", flexDirection: "column" }}>
              <PortfolioSummary stocks={displayStocks} />

              {/* Section label */}
              <p style={{
                fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)",
                textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow-l)",
                fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)",
                margin: "0 0 8px",
              }}>
                {displayStocks.length} Holdings · sorted by portfolio weight
              </p>

              <TableHeader />

              {/* Stock rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {displayStocks.map((stock, i) => (
                  <StockRow key={stock.symbol} stock={stock} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
