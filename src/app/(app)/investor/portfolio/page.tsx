"use client";

import Link from "next/link";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Holding {
  symbol: string;
  name: string;
  sector: string;
  capType: "Large" | "Mid" | "Small";
  qty: number;
  avgCost: number;
  ltp: number;
  dayChange: number;   // absolute ₹
  dayChangePct: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  modScore: number;
  modRating: "STRONG" | "FAIR" | "STRETCHED" | "WEAK";
  alert?: string;
}

interface MutualFund {
  name: string;
  type: string;
  units: number;
  nav: number;
  currentValue: number;
  invested: number;
  pnl: number;
  pnlPct: number;
  dayChangePct: number;
  xirr: number;
}

// ── Static data ───────────────────────────────────────────────────────────────

const HOLDINGS: Holding[] = [
  { symbol: "HDFCBANK",   name: "HDFC Bank",             sector: "Private Banks", capType: "Large", qty: 22, avgCost: 1540,  ltp: 1728.40, dayChange: 20.50,  dayChangePct: 1.2,  invested: 33880,  currentValue: 38025,  pnl: 4145,  pnlPct: 12.2, modScore: 82, modRating: "STRONG",    },
  { symbol: "RELIANCE",   name: "Reliance Industries",   sector: "Energy",        capType: "Large", qty: 10, avgCost: 2480,  ltp: 2891.00, dayChange: 24.10,  dayChangePct: 0.8,  invested: 24800,  currentValue: 28910,  pnl: 4110,  pnlPct: 16.6, modScore: 78, modRating: "STRONG",    },
  { symbol: "INFY",       name: "Infosys",               sector: "IT Services",   capType: "Large", qty: 15, avgCost: 1580,  ltp: 1612.30, dayChange: -18.40, dayChangePct: -1.1, invested: 23700,  currentValue: 24185,  pnl: 485,   pnlPct: 2.0,  modScore: 74, modRating: "FAIR",      },
  { symbol: "ICICIBANK",  name: "ICICI Bank",            sector: "Private Banks", capType: "Large", qty: 18, avgCost: 980,   ltp: 1184.20, dayChange: 9.40,   dayChangePct: 0.8,  invested: 17640,  currentValue: 21316,  pnl: 3676,  pnlPct: 20.8, modScore: 84, modRating: "STRONG",    },
  { symbol: "TATASTEEL",  name: "Tata Steel",            sector: "Metals",        capType: "Large", qty: 30, avgCost: 148,   ltp: 162.40,  dayChange: -1.80,  dayChangePct: -1.1, invested: 4440,   currentValue: 4872,   pnl: 432,   pnlPct: 9.7,  modScore: 68, modRating: "FAIR",      },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever",    sector: "FMCG",          capType: "Large", qty: 8,  avgCost: 2480,  ltp: 2284.60, dayChange: -12.20, dayChangePct: -0.5, invested: 19840,  currentValue: 18277,  pnl: -1563, pnlPct: -7.9, modScore: 72, modRating: "FAIR",      alert: "Margin compression flagged in Q4" },
  { symbol: "ASIANPAINT", name: "Asian Paints",          sector: "Paints",        capType: "Large", qty: 8,  avgCost: 2980,  ltp: 2418.10, dayChange: -95.40, dayChangePct: -3.8, invested: 23840,  currentValue: 19345,  pnl: -4495, pnlPct: -18.9,modScore: 54, modRating: "STRETCHED", alert: "Score downgraded 62→54 · guidance cut" },
  { symbol: "SBIN",       name: "State Bank of India",   sector: "PSU Banks",     capType: "Large", qty: 25, avgCost: 720,   ltp: 812.40,  dayChange: 11.20,  dayChangePct: 1.4,  invested: 18000,  currentValue: 20310,  pnl: 2310,  pnlPct: 12.8, modScore: 76, modRating: "STRONG",    },
  { symbol: "DIVISLAB",   name: "Divi's Laboratories",   sector: "Pharma",        capType: "Large", qty: 3,  avgCost: 5100,  ltp: 5418.00, dayChange: -60.80, dayChangePct: -1.1, invested: 15300,  currentValue: 16254,  pnl: 954,   pnlPct: 6.2,  modScore: 69, modRating: "FAIR",      alert: "FDA inspection delay at Kakinada" },
  { symbol: "TITAN",      name: "Titan Company",         sector: "Consumer",      capType: "Large", qty: 6,  avgCost: 3100,  ltp: 3298.00, dayChange: 16.50,  dayChangePct: 0.5,  invested: 18600,  currentValue: 19788,  pnl: 1188,  pnlPct: 6.4,  modScore: 81, modRating: "STRONG",    },
  { symbol: "POLYCAB",    name: "Polycab India",         sector: "Capital Goods",  capType: "Mid",  qty: 5,  avgCost: 5400,  ltp: 6124.00, dayChange: 44.00,  dayChangePct: 0.7,  invested: 27000,  currentValue: 30620,  pnl: 3620,  pnlPct: 13.4, modScore: 80, modRating: "STRONG",    },
  { symbol: "KPIGREEN",   name: "KPI Green Energy",      sector: "Renewable",     capType: "Small", qty: 20, avgCost: 680,   ltp: 594.20,  dayChange: -8.40,  dayChangePct: -1.4, invested: 13600,  currentValue: 11884,  pnl: -1716, pnlPct: -12.6,modScore: 62, modRating: "FAIR",      },
];

const MUTUAL_FUNDS: MutualFund[] = [
  { name: "Mirae Asset Large Cap Fund",      type: "Large Cap",  units: 312.4,  nav: 108.20, currentValue: 33803, invested: 30000, pnl: 3803,  pnlPct: 12.7, dayChangePct: 0.4,  xirr: 14.2 },
  { name: "Axis Midcap Fund",                type: "Mid Cap",    units: 180.6,  nav: 92.40,  currentValue: 16687, invested: 14000, pnl: 2687,  pnlPct: 19.2, dayChangePct: 0.6,  xirr: 17.8 },
  { name: "Parag Parikh Flexi Cap Fund",     type: "Flexi Cap",  units: 240.1,  nav: 78.60,  currentValue: 18872, invested: 17000, pnl: 1872,  pnlPct: 11.0, dayChangePct: 0.3,  xirr: 13.1 },
  { name: "SBI Small Cap Fund",              type: "Small Cap",  units: 95.8,   nav: 148.50, currentValue: 14226, invested: 12000, pnl: 2226,  pnlPct: 18.5, dayChangePct: -0.8, xirr: 16.4 },
  { name: "HDFC Nifty 50 Index Fund",        type: "Index",      units: 880.2,  nav: 22.80,  currentValue: 20069, invested: 18500, pnl: 1569,  pnlPct: 8.5,  dayChangePct: 0.4,  xirr: 9.8  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const ratingColor: Record<Holding["modRating"], string> = {
  STRONG: "#22c55e", FAIR: "#f59e0b", STRETCHED: "#ef4444", WEAK: "#ef4444",
};

const ratingBg: Record<Holding["modRating"], string> = {
  STRONG: "rgba(34,197,94,0.10)", FAIR: "rgba(245,158,11,0.10)", STRETCHED: "rgba(239,68,68,0.10)", WEAK: "rgba(239,68,68,0.10)",
};

function fmt(n: number, digits = 0) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

function fmtLakhs(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${fmt(n)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryTile({ label, value, sub, subPositive }: { label: string; value: string; sub?: string; subPositive?: boolean }) {
  return (
    <div style={{ background: "var(--qc-card,#fff)", border: "1px solid var(--qc-hair,#E2E2E2)", borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#888", letterSpacing: "0.10em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, color: "var(--qc-ink,#0F172B)", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12, color: subPositive === false ? "#ef4444" : subPositive === true ? "#22c55e" : "#888" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function MODScoreBar({ score, rating }: { score: number; rating: Holding["modRating"] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: ratingColor[rating], minWidth: 22 }}>{score}</span>
      <div style={{ flex: 1, height: 4, background: "#F0F0F0", borderRadius: 2 }}>
        <div style={{ width: `${score}%`, height: "100%", background: ratingColor[rating], borderRadius: 2 }} />
      </div>
    </div>
  );
}

function RatingBadge({ rating }: { rating: Holding["modRating"] }) {
  return (
    <span style={{
      display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", borderRadius: 4, padding: "2px 6px",
      color: ratingColor[rating], background: ratingBg[rating],
    }}>
      {rating}
    </span>
  );
}

type SortKey = "symbol" | "currentValue" | "pnlPct" | "dayChangePct" | "modScore";

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "currentValue", asc: false });
  const [filter, setFilter] = useState<"all" | "alerts" | "winners" | "losers">("all");

  const filtered = holdings.filter(h => {
    if (filter === "alerts")  return !!h.alert;
    if (filter === "winners") return h.pnl > 0;
    if (filter === "losers")  return h.pnl < 0;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sort.key] as number | string;
    const vb = b[sort.key] as number | string;
    if (typeof va === "string") return sort.asc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    return sort.asc ? (va as number) - (vb as number) : (vb as number) - (va as number);
  });

  function toggleSort(key: SortKey) {
    setSort(s => s.key === key ? { key, asc: !s.asc } : { key, asc: false });
  }

  const col = (key: SortKey, label: string, align: "left" | "right" = "right") => (
    <th
      onClick={() => toggleSort(key)}
      style={{
        fontSize: 10, fontWeight: 500, color: sort.key === key ? "#0F172B" : "#aaa",
        letterSpacing: "0.08em", textTransform: "uppercase", textAlign: align,
        padding: "10px 12px", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
        borderBottom: "1px solid #E2E2E2",
      }}
    >
      {label} {sort.key === key ? (sort.asc ? "↑" : "↓") : ""}
    </th>
  );

  const alertCount = holdings.filter(h => h.alert).length;

  return (
    <div style={{ background: "var(--qc-card,#fff)", border: "1px solid var(--qc-hair,#E2E2E2)", borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            EQUITY HOLDINGS
          </span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>
            {holdings.length} stocks · demat-linked
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "alerts", "winners", "losers"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 20, cursor: "pointer",
                border: filter === f ? "1px solid #0F172B" : "1px solid #E2E2E2",
                background: filter === f ? "#0F172B" : "#fff",
                color: filter === f ? "#fff" : "#555",
                textTransform: "capitalize",
              }}
            >
              {f === "alerts" ? `Alerts ${alertCount > 0 ? `(${alertCount})` : ""}` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA" }}>
              {col("symbol", "Stock", "left")}
              <th style={{ fontSize: 10, fontWeight: 500, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "right", padding: "10px 12px", borderBottom: "1px solid #E2E2E2", whiteSpace: "nowrap" }}>QTY · AVG COST</th>
              {col("currentValue", "Curr. Value")}
              {col("pnlPct", "P&L")}
              {col("dayChangePct", "Day")}
              {col("modScore", "MOD Score")}
              <th style={{ fontSize: 10, fontWeight: 500, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "right", padding: "10px 12px", borderBottom: "1px solid #E2E2E2" }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((h, i) => (
              <tr key={h.symbol} style={{ borderBottom: i < sorted.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                {/* Stock */}
                <td style={{ padding: "13px 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>{h.symbol}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{h.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: "#888", background: "#F5F5F5", borderRadius: 4, padding: "1px 6px" }}>{h.sector}</span>
                        <span style={{ fontSize: 10, color: "#888", background: "#F5F5F5", borderRadius: 4, padding: "1px 6px" }}>{h.capType} Cap</span>
                      </div>
                      {h.alert && (
                        <div style={{ fontSize: 10, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 4, padding: "2px 6px", marginTop: 4, display: "inline-block" }}>
                          ⚠ {h.alert}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Qty · Avg Cost */}
                <td style={{ padding: "13px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{h.qty}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>@ ₹{fmt(h.avgCost)}</div>
                </td>

                {/* Current Value */}
                <td style={{ padding: "13px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{fmtLakhs(h.currentValue)}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>₹{fmt(h.ltp, 2)} / sh</div>
                </td>

                {/* P&L */}
                <td style={{ padding: "13px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: h.pnl >= 0 ? "#22c55e" : "#ef4444" }}>
                    {h.pnl >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 11, color: h.pnl >= 0 ? "#22c55e" : "#ef4444", marginTop: 1, opacity: 0.8 }}>
                    {h.pnl >= 0 ? "+" : ""}{fmtLakhs(Math.abs(h.pnl))}
                  </div>
                </td>

                {/* Day change */}
                <td style={{ padding: "13px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: h.dayChangePct >= 0 ? "#22c55e" : "#ef4444" }}>
                    {h.dayChangePct >= 0 ? "+" : ""}{h.dayChangePct.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 11, color: h.dayChangePct >= 0 ? "#22c55e" : "#ef4444", marginTop: 1, opacity: 0.7 }}>
                    {h.dayChange >= 0 ? "+" : ""}₹{fmt(Math.abs(h.dayChange), 2)}
                  </div>
                </td>

                {/* MOD Score */}
                <td style={{ padding: "13px 12px", minWidth: 140 }}>
                  <MODScoreBar score={h.modScore} rating={h.modRating} />
                  <div style={{ marginTop: 4 }}>
                    <RatingBadge rating={h.modRating} />
                  </div>
                </td>

                {/* Open */}
                <td style={{ padding: "13px 12px", textAlign: "right" }}>
                  <Link
                    href={`/screener/management?symbol=${h.symbol}`}
                    style={{ fontSize: 12, color: "#0F172B", background: "#fff", border: "1px solid #E2E2E2", borderRadius: 7, padding: "5px 12px", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MutualFundsTable({ funds }: { funds: MutualFund[] }) {
  return (
    <div style={{ background: "var(--qc-card,#fff)", border: "1px solid var(--qc-hair,#E2E2E2)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid #E2E2E2" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          MUTUAL FUNDS
        </span>
        <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>
          {funds.length} funds · folio-linked
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAFA" }}>
              {["FUND", "TYPE", "UNITS · NAV", "CURR. VALUE", "P&L", "XIRR", "DAY"].map((h, i) => (
                <th key={h} style={{ fontSize: 10, fontWeight: 500, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: i === 0 ? "left" : "right", padding: "10px 12px", borderBottom: "1px solid #E2E2E2", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funds.map((f, i) => (
              <tr key={f.name} style={{ borderBottom: i < funds.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                <td style={{ padding: "12px 12px", maxWidth: 240 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>{f.name}</div>
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right" }}>
                  <span style={{ fontSize: 10, background: "#F5F5F5", color: "#555", borderRadius: 4, padding: "2px 7px" }}>{f.type}</span>
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{f.units}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>@ ₹{f.nav}</div>
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{fmtLakhs(f.currentValue)}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>Inv. {fmtLakhs(f.invested)}</div>
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: f.pnl >= 0 ? "#22c55e" : "#ef4444" }}>
                    {f.pnl >= 0 ? "+" : ""}{f.pnlPct.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 11, color: f.pnl >= 0 ? "#22c55e" : "#ef4444", opacity: 0.8, marginTop: 1 }}>
                    +{fmtLakhs(f.pnl)}
                  </div>
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{f.xirr.toFixed(1)}%</div>
                  <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>XIRR</div>
                </td>
                <td style={{ padding: "12px 12px", textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: f.dayChangePct >= 0 ? "#22c55e" : "#ef4444" }}>
                    {f.dayChangePct >= 0 ? "+" : ""}{f.dayChangePct.toFixed(1)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectorAllocation({ holdings }: { holdings: Holding[] }) {
  const sectorMap = new Map<string, { value: number; modSum: number; count: number }>();
  for (const h of holdings) {
    const cur = sectorMap.get(h.sector) ?? { value: 0, modSum: 0, count: 0 };
    sectorMap.set(h.sector, { value: cur.value + h.currentValue, modSum: cur.modSum + h.modScore, count: cur.count + 1 });
  }
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  const sectors = [...sectorMap.entries()]
    .map(([sector, { value, modSum, count }]) => ({ sector, value, pct: (value / total) * 100, avgMod: Math.round(modSum / count) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ background: "var(--qc-card,#fff)", border: "1px solid var(--qc-hair,#E2E2E2)", borderRadius: 14, padding: "16px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
        SECTOR ALLOCATION
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sectors.map(s => (
          <div key={s.sector}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#0F172B", fontWeight: 500 }}>{s.sector}</span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#888" }}>MOD avg {s.avgMod}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", minWidth: 36, textAlign: "right" }}>{s.pct.toFixed(1)}%</span>
              </div>
            </div>
            <div style={{ height: 6, background: "#F5F5F5", borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${s.pct}%`, background: "#0F172B", borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MODDistribution({ holdings }: { holdings: Holding[] }) {
  const buckets = [
    { label: "Strong (80+)",    min: 80, max: 100, color: "#22c55e" },
    { label: "Fair (60–79)",    min: 60, max: 79,  color: "#f59e0b" },
    { label: "Stretched (<60)", min: 0,  max: 59,  color: "#ef4444" },
  ];
  const totalVal = holdings.reduce((s, h) => s + h.currentValue, 0);

  return (
    <div style={{ background: "var(--qc-card,#fff)", border: "1px solid var(--qc-hair,#E2E2E2)", borderRadius: 14, padding: "16px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        MOD QUALITY SPLIT
      </div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>
        % of portfolio value by management quality
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {buckets.map(b => {
          const match = holdings.filter(h => h.modScore >= b.min && h.modScore <= b.max);
          const val = match.reduce((s, h) => s + h.currentValue, 0);
          const pct = totalVal > 0 ? (val / totalVal) * 100 : 0;
          return (
            <div key={b.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#555" }}>{b.label}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>{match.length} stocks</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: b.color, minWidth: 36, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div style={{ height: 8, background: "#F5F5F5", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: b.color, borderRadius: 4 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsPanel({ holdings }: { holdings: Holding[] }) {
  const alerts = holdings.filter(h => h.alert);
  if (alerts.length === 0) return null;

  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "16px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        ⚠ PORTFOLIO ALERTS · {alerts.length} HOLDINGS NEED ATTENTION
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.map(h => (
          <div key={h.symbol} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172B" }}>{h.symbol}</span>
                <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 6, color: ratingColor[h.modRating], background: ratingBg[h.modRating], borderRadius: 4, padding: "1px 6px" }}>{h.modRating}</span>
              </div>
              <span style={{ fontSize: 12, color: "#78350f" }}>{h.alert}</span>
            </div>
            <Link
              href={`/screener/management?symbol=${h.symbol}`}
              style={{ fontSize: 12, color: "#92400e", border: "1px solid #fcd34d", borderRadius: 7, padding: "4px 10px", textDecoration: "none", whiteSpace: "nowrap", background: "#fff" }}
            >
              Review →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvestorPortfolioPage() {
  const totalEquity = HOLDINGS.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested = HOLDINGS.reduce((s, h) => s + h.invested, 0);
  const totalMF = MUTUAL_FUNDS.reduce((s, f) => s + f.currentValue, 0);
  const totalMFInvested = MUTUAL_FUNDS.reduce((s, f) => s + f.invested, 0);
  const totalPnl = totalEquity - totalInvested;
  const totalPnlPct = (totalPnl / totalInvested) * 100;
  const totalDayChange = HOLDINGS.reduce((s, h) => s + h.dayChange * h.qty, 0);
  const totalPortfolio = totalEquity + totalMF;
  const avgMOD = Math.round(HOLDINGS.reduce((s, h) => s + h.modScore, 0) / HOLDINGS.length);

  return (
    <div style={{ background: "var(--qc-bg,#F5F5F5)", minHeight: "100vh" }}>
      <main style={{ padding: "28px 36px 60px", maxWidth: 1440, fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink,#0F172B)" }}>

        {/* ── Page header ──────────────────────────────────────────── */}
        <header style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.15, color: "var(--qc-ink,#0F172B)" }}>
              Portfolio
            </h1>
            <div style={{ marginTop: 5, fontSize: 12, color: "#888" }}>
              12 stocks · 5 mutual funds · synced 2 min ago
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 10, fontSize: 11, fontWeight: 500, color: "#22c55e", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)", borderRadius: 20, padding: "2px 8px" }}
              >
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Demat-linked
              </span>
            </div>
          </div>
          <Link
            href="/investor/dashboard"
            style={{ fontSize: 12, color: "#888", textDecoration: "none" }}
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* ── Summary tiles ────────────────────────────────────────── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 14 }}>
          <SummaryTile
            label="Total Portfolio Value"
            value={fmtLakhs(totalPortfolio)}
            sub="Equity + Mutual Funds"
          />
          <SummaryTile
            label="Equity Value"
            value={fmtLakhs(totalEquity)}
            sub={`+₹${fmt(totalDayChange)} today`}
            subPositive={totalDayChange >= 0}
          />
          <SummaryTile
            label="Total P&L"
            value={`${totalPnl >= 0 ? "+" : ""}${fmtLakhs(totalPnl)}`}
            sub={`${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(1)}% on ₹${(totalInvested / 100000).toFixed(1)}L invested`}
            subPositive={totalPnl >= 0}
          />
          <SummaryTile
            label="Mutual Funds"
            value={fmtLakhs(totalMF)}
            sub={`+${fmtLakhs(totalMF - totalMFInvested)} gain`}
            subPositive={true}
          />
          <SummaryTile
            label="Avg Portfolio MOD"
            value={`${avgMOD}/100`}
            sub="Weighted mgmt quality"
          />
        </section>

        {/* ── Alerts ───────────────────────────────────────────────── */}
        <section style={{ marginBottom: 14 }}>
          <AlertsPanel holdings={HOLDINGS} />
        </section>

        {/* ── Holdings table + Sidebar ─────────────────────────────── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, marginBottom: 14, alignItems: "start" }}>
          <HoldingsTable holdings={HOLDINGS} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SectorAllocation holdings={HOLDINGS} />
            <MODDistribution holdings={HOLDINGS} />
          </div>
        </section>

        {/* ── Mutual Funds ─────────────────────────────────────────── */}
        <section style={{ marginBottom: 14 }}>
          <MutualFundsTable funds={MUTUAL_FUNDS} />
        </section>

        {/* ── Footer CTA ───────────────────────────────────────────── */}
        <section>
          <div
            style={{
              background: "linear-gradient(135deg,#0F172B 0%,#1e293b 100%)",
              borderRadius: 14,
              padding: "22px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                DEEP DIVE
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "#fff" }}>
                Run a full MOD analysis on any holding
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Management quality · guidance accuracy · capital allocation — by earnings call
              </div>
            </div>
            <Link
              href="/screener/home"
              style={{
                fontSize: 13, fontWeight: 600, color: "#0F172B", background: "#fff",
                borderRadius: 9, padding: "10px 22px", textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              Open Terminal →
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
