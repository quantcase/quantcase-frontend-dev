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

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 3, borderRadius: 99, background: "var(--qc-hair, #E2E2E2)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
      <span style={{ fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-mono)", color, minWidth: 24, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const label = ratingLabel(score);
  const color = ratingColor(score);
  const bg = ratingBg(score);
  return (
    <span style={{
      fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow)", textTransform: "uppercase",
      fontFamily: "var(--qc-font-sans)",
      color, background: bg, border: `1px solid ${color}`, borderRadius: 4, padding: "2px 6px",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function PortfolioAverageRow({ stocks }: { stocks: StockMOD[] }) {
  const avg = (key: keyof StockMOD) =>
    Math.round(stocks.reduce((s, st) => s + (st[key] as number), 0) / stocks.length);

  const m = avg("management");
  const o = avg("opportunity");
  const d = avg("deal");

  return (
    <div style={{
      background: "var(--qc-section, #F5F5F5)",
      border: "1px solid var(--qc-hair, #E2E2E2)",
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 16,
    }}>
      <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow-l)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", margin: "0 0 12px" }}>
        Portfolio Average
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 20px" }}>
        {[["Management", m], ["Opportunity", o], ["Deal", d]].map(([label, score]) => (
          <div key={label as string}>
            <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", margin: "0 0 4px" }}>
              {label}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-mono)", color: ratingColor(score as number), lineHeight: 1 }}>{score}</span>
              <ScorePill score={score as number} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StockRow({ stock, index }: { stock: StockMOD; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      {/* Symbol row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{stock.symbol}</span>
          <span style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginLeft: 6 }}>{stock.name}</span>
        </div>
        <span style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", background: "var(--qc-section)", border: "1px solid var(--qc-hair)", borderRadius: 4, padding: "2px 7px", fontWeight: "var(--qc-w-medium)" }}>
          {stock.pct}% of book
        </span>
      </div>

      {/* M / O / D bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "M", fullLabel: "Management", score: stock.management },
          { label: "O", fullLabel: "Opportunity", score: stock.opportunity },
          { label: "D", fullLabel: "Deal",        score: stock.deal },
        ].map(({ label, fullLabel, score }) => (
          <div key={label} style={{ display: "grid", gridTemplateColumns: "80px 1fr 70px", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-3)", letterSpacing: "var(--qc-track-mono)",
              }}>
                {label}
              </span>
              <span style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)" }}>{fullLabel}</span>
            </div>
            <ScoreBar score={score} color={ratingColor(score)} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ScorePill score={score} />
            </div>
          </div>
        ))}
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

type SortKey = "management" | "opportunity" | "deal" | "pct";

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
              background: "rgba(0,0,0,0.30)", backdropFilter: "blur(2px)",
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
              width: "min(70vw, 860px)",
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
              padding: "18px 24px 16px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}>
              <div>
                <div style={{
                  fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow-l)",
                  textTransform: "uppercase", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginBottom: 6,
                }}>
                  YOUR PORTFOLIO
                </div>
                <h2 style={{
                  fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-regular)", margin: 0, lineHeight: 1.3,
                  color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif)",
                }}>
                  MOD Score Breakdown
                </h2>
                <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
                  Management · Opportunity · Deal scores for each holding
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  flexShrink: 0, background: "var(--qc-section, #F5F5F5)", border: "1px solid var(--qc-hair, #E2E2E2)",
                  borderRadius: 8, width: 32, height: 32, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  color: "var(--qc-ink-3)", fontSize: "var(--qc-fz-16)", lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, padding: "20px 24px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
              <PortfolioAverageRow stocks={displayStocks} />

              {/* Column legend */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                marginBottom: 4,
              }}>
                <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow-l)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", margin: 0 }}>
                  {displayStocks.length} Holdings · sorted by portfolio weight
                </p>
              </div>

              {/* Stock rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
