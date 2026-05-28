// ── Types ─────────────────────────────────────────────────────────────────────

export type ThesisHealth = "intact" | "partial" | "broken" | "none";
export type ModRating = "STRONG" | "FAIR" | "STRETCHED";
export type Pillar = "mgmt" | "opp" | "deal";

export interface SubScore {
  label: string;
  pillar: Pillar;
  score: number;
}

export interface QuarterBar { height: number; pillar: Pillar }
export interface QuarterData {
  q: string;
  total: number;
  delta: number | null;
  bars: QuarterBar[];
}

export interface JournalEntry {
  thesis: string;
  conviction: number; // 1-5
  aiNudge?: string;
}

export interface Holding {
  symbol: string;
  name: string;
  sector: string;
  capType: "Large" | "Mid" | "Small";
  qty: number;
  avgCost: number;
  ltp: number;
  dayChange: number;
  dayChangePct: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  modScore: number;
  modRating: ModRating;
  thesisHealth: ThesisHealth;
  alert?: string;
  subScores: SubScore[];
  quarterTrend: QuarterData[];
  journal?: JournalEntry;
  trendDir: "up" | "down" | "flat";
}

export interface MutualFund {
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

export interface NewsItem {
  ticker: string;
  title: string;
  body: string;
  source: string;
  age: string;
  impacts: { pillar: "M" | "O" | "D"; label: string; type: "pos" | "neg" | "neu" }[];
  scoreChange?: string;
  scoreChangeType: "pos" | "neg" | "warn";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function fmt(n: number, digits = 0) {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

export function fmtLakhs(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${fmt(n)}`;
}

export const PILLAR_COLOR: Record<Pillar, string> = {
  mgmt: "var(--qc-up)",
  opp:  "var(--qc-blue)",
  deal: "#7C3AED",
};

export function modColor(score: number) {
  if (score >= 80) return "var(--qc-up)";
  if (score >= 60) return "var(--qc-warn)";
  return "#B91C1C";
}

export function thesisConfig(h: ThesisHealth) {
  if (h === "intact")  return { dot: "var(--qc-up)",  label: "Intact",    color: "var(--qc-up)",  bg: "var(--qc-up-soft)",   icon: "●" };
  if (h === "partial") return { dot: "var(--qc-warn)", label: "Partial",   color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", icon: "⚡" };
  if (h === "broken")  return { dot: "#B91C1C",         label: "Broken",    color: "#B91C1C",        bg: "#FEF2F2",             icon: "✕" };
  return { dot: "#9A9A92", label: "No thesis", color: "#9A9A92", bg: "var(--qc-bg)", icon: "○" };
}

export function capBadgeStyle(cap: Holding["capType"]) {
  if (cap === "Large") return { background: "#E7E4DC", color: "#57534E" };
  if (cap === "Mid")   return { background: "#F5F0FF", color: "#6D28D9" };
  return { background: "#FFF7ED", color: "#C2410C" };
}

// ── Static data ───────────────────────────────────────────────────────────────

export const HOLDINGS: Holding[] = [
  {
    symbol: "HDFCBANK", name: "HDFC Bank", sector: "Private Banks", capType: "Large",
    qty: 22, avgCost: 1540, ltp: 1728.40, dayChange: 20.50, dayChangePct: 1.2,
    invested: 33880, currentValue: 38025, pnl: 4145, pnlPct: 12.2,
    modScore: 82, modRating: "STRONG", thesisHealth: "intact", trendDir: "up",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 88 },
      { label: "Capital Allocation", pillar: "mgmt", score: 84 },
      { label: "Promoter Quality",   pillar: "mgmt", score: 79 },
      { label: "Industry Tailwind",  pillar: "opp",  score: 81 },
      { label: "Valuation (Deal)",   pillar: "deal", score: 68 },
    ],
    quarterTrend: [
      { q: "Q1", total: 74, delta: null, bars: [{ height: 28, pillar: "mgmt" }, { height: 22, pillar: "opp" }, { height: 18, pillar: "deal" }] },
      { q: "Q2", total: 76, delta: 2,   bars: [{ height: 30, pillar: "mgmt" }, { height: 24, pillar: "opp" }, { height: 18, pillar: "deal" }] },
      { q: "Q3", total: 79, delta: 3,   bars: [{ height: 32, pillar: "mgmt" }, { height: 26, pillar: "opp" }, { height: 20, pillar: "deal" }] },
      { q: "Q4", total: 82, delta: 3,   bars: [{ height: 34, pillar: "mgmt" }, { height: 28, pillar: "opp" }, { height: 20, pillar: "deal" }] },
    ],
    journal: { thesis: "\"Buying for deposit franchise recovery and ROA expansion. The merger integration is messy but temporary. Management has consistently delivered on medium-term guidance.\"", conviction: 4 },
  },
  {
    symbol: "ASIANPAINT", name: "Asian Paints", sector: "Paints", capType: "Large",
    qty: 8, avgCost: 2980, ltp: 2418.10, dayChange: -95.40, dayChangePct: -3.8,
    invested: 23840, currentValue: 19345, pnl: -4495, pnlPct: -18.9,
    modScore: 54, modRating: "STRETCHED", thesisHealth: "broken", trendDir: "down",
    alert: "Score downgraded 62→54 · guidance cut · thesis flagged Broken",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 42 },
      { label: "Capital Allocation", pillar: "mgmt", score: 68 },
      { label: "Industry Tailwind",  pillar: "opp",  score: 55 },
      { label: "Competitive Edge",   pillar: "opp",  score: 62 },
      { label: "P/E Re-rating",      pillar: "deal", score: 28 },
    ],
    quarterTrend: [
      { q: "Q1", total: 68, delta: null, bars: [{ height: 26, pillar: "mgmt" }, { height: 22, pillar: "opp" }, { height: 18, pillar: "opp"  }] },
      { q: "Q2", total: 64, delta: -4,  bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "deal" }] },
      { q: "Q3", total: 62, delta: -2,  bars: [{ height: 22, pillar: "mgmt" }, { height: 18, pillar: "deal"}, { height: 12, pillar: "deal" }] },
      { q: "Q4", total: 54, delta: -8,  bars: [{ height: 18, pillar: "opp"  }, { height: 14, pillar: "deal"}, { height:  8, pillar: "deal" }] },
    ],
    journal: {
      thesis: "\"Premium consumer brand with pricing power and strong distribution. Margin expansion story on commodity cost normalization.\"",
      conviction: 2,
      aiNudge: "Tier-2 demand has been weak for 3 consecutive quarters. Management guided margin recovery in Q2 FY24 — it never materialized. Your \"pricing power\" thesis is now contradicted by a guidance accuracy score of 42. Consider whether the original thesis still holds.",
    },
  },
  {
    symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", capType: "Large",
    qty: 8, avgCost: 2480, ltp: 2284.60, dayChange: -12.20, dayChangePct: -0.5,
    invested: 19840, currentValue: 18277, pnl: -1563, pnlPct: -7.9,
    modScore: 72, modRating: "FAIR", thesisHealth: "partial", trendDir: "down",
    alert: "Margin compression flagged in Q4 — Management sub-score down 8pts",
    subScores: [
      { label: "Guidance Accuracy",    pillar: "mgmt", score: 76 },
      { label: "Capital Allocation",   pillar: "mgmt", score: 78 },
      { label: "Industry Tailwind",    pillar: "opp",  score: 65 },
      { label: "Distribution Strength",pillar: "opp",  score: 82 },
      { label: "P/E Re-rating",        pillar: "deal", score: 58 },
    ],
    quarterTrend: [
      { q: "Q1", total: 78, delta: null, bars: [{ height: 28, pillar: "mgmt" }, { height: 22, pillar: "opp" }, { height: 18, pillar: "opp" }] },
      { q: "Q2", total: 76, delta: -2,  bars: [{ height: 27, pillar: "mgmt" }, { height: 21, pillar: "opp" }, { height: 17, pillar: "opp" }] },
      { q: "Q3", total: 74, delta: -2,  bars: [{ height: 26, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "opp" }] },
      { q: "Q4", total: 72, delta: -2,  bars: [{ height: 25, pillar: "mgmt" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "opp" }] },
    ],
    journal: {
      thesis: "\"FMCG defensive play — strong distribution moat, rural recovery story, volume-led growth as urban slows.\"",
      conviction: 3,
      aiNudge: "Distribution moat thesis still holds — Distribution Strength scores 82. However, margin compression in Q4 is partially contradicting the rural recovery story. Volume growth needed in Q1 to validate the thesis.",
    },
  },
  {
    symbol: "POLYCAB", name: "Polycab India", sector: "Capital Goods", capType: "Mid",
    qty: 5, avgCost: 5400, ltp: 6124.00, dayChange: 44.00, dayChangePct: 0.7,
    invested: 27000, currentValue: 30620, pnl: 3620, pnlPct: 13.4,
    modScore: 80, modRating: "STRONG", thesisHealth: "intact", trendDir: "up",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 82 },
      { label: "Industry Tailwind", pillar: "opp",  score: 84 },
      { label: "Competitive Edge",  pillar: "opp",  score: 78 },
      { label: "Earnings Growth",   pillar: "deal", score: 76 },
      { label: "P/E Re-rating",     pillar: "deal", score: 72 },
    ],
    quarterTrend: [
      { q: "Q1", total: 72, delta: null, bars: [{ height: 22, pillar: "opp"  }, { height: 18, pillar: "opp"  }, { height: 16, pillar: "deal" }] },
      { q: "Q2", total: 74, delta: 2,   bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp"  }, { height: 16, pillar: "deal" }] },
      { q: "Q3", total: 77, delta: 3,   bars: [{ height: 26, pillar: "mgmt" }, { height: 22, pillar: "opp"  }, { height: 18, pillar: "deal" }] },
      { q: "Q4", total: 80, delta: 3,   bars: [{ height: 28, pillar: "mgmt" }, { height: 24, pillar: "opp"  }, { height: 20, pillar: "deal" }] },
    ],
    journal: { thesis: "\"Infrastructure supercycle play. Capex electrification in India creates multi-year tailwind. Strong execution track record.\"", conviction: 5 },
  },
  {
    symbol: "ICICIBANK", name: "ICICI Bank", sector: "Private Banks", capType: "Large",
    qty: 18, avgCost: 980, ltp: 1184.20, dayChange: 9.40, dayChangePct: 0.8,
    invested: 17640, currentValue: 21316, pnl: 3676, pnlPct: 20.8,
    modScore: 84, modRating: "STRONG", thesisHealth: "intact", trendDir: "up",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 86 },
      { label: "Capital Allocation", pillar: "mgmt", score: 88 },
      { label: "Industry Tailwind",  pillar: "opp",  score: 82 },
      { label: "Competitive Edge",   pillar: "opp",  score: 84 },
      { label: "Earnings Growth",    pillar: "deal", score: 78 },
    ],
    quarterTrend: [
      { q: "Q1", total: 78, delta: null, bars: [{ height: 26, pillar: "mgmt" }, { height: 22, pillar: "mgmt" }, { height: 18, pillar: "opp"  }] },
      { q: "Q2", total: 80, delta: 2,   bars: [{ height: 28, pillar: "mgmt" }, { height: 23, pillar: "mgmt" }, { height: 19, pillar: "opp"  }] },
      { q: "Q3", total: 82, delta: 2,   bars: [{ height: 30, pillar: "mgmt" }, { height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp"  }] },
      { q: "Q4", total: 84, delta: 2,   bars: [{ height: 32, pillar: "mgmt" }, { height: 25, pillar: "mgmt" }, { height: 21, pillar: "opp"  }] },
    ],
    journal: { thesis: "\"Retail banking franchise with best-in-class underwriting. Profitable growth with controlled NPA cycle.\"", conviction: 4 },
  },
  {
    symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", capType: "Large",
    qty: 10, avgCost: 2480, ltp: 2891.00, dayChange: 24.10, dayChangePct: 0.8,
    invested: 24800, currentValue: 28910, pnl: 4110, pnlPct: 16.6,
    modScore: 78, modRating: "STRONG", thesisHealth: "none", trendDir: "flat",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 74 },
      { label: "Industry Tailwind", pillar: "opp",  score: 80 },
      { label: "Competitive Edge",  pillar: "opp",  score: 82 },
      { label: "Earnings Growth",   pillar: "deal", score: 72 },
    ],
    quarterTrend: [
      { q: "Q1", total: 76, delta: null, bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "deal" }] },
      { q: "Q2", total: 77, delta: 1,   bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "deal" }] },
      { q: "Q3", total: 78, delta: 1,   bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "deal" }] },
      { q: "Q4", total: 78, delta: 0,   bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "deal" }] },
    ],
  },
  {
    symbol: "SBIN", name: "State Bank of India", sector: "PSU Banks", capType: "Large",
    qty: 25, avgCost: 720, ltp: 812.40, dayChange: 11.20, dayChangePct: 1.4,
    invested: 18000, currentValue: 20310, pnl: 2310, pnlPct: 12.8,
    modScore: 76, modRating: "STRONG", thesisHealth: "none", trendDir: "up",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 72 },
      { label: "Industry Tailwind", pillar: "opp",  score: 78 },
      { label: "Competitive Edge",  pillar: "opp",  score: 76 },
      { label: "P/E Re-rating",     pillar: "deal", score: 74 },
    ],
    quarterTrend: [
      { q: "Q1", total: 70, delta: null, bars: [{ height: 20, pillar: "opp"  }, { height: 18, pillar: "opp"  }, { height: 14, pillar: "opp"  }] },
      { q: "Q2", total: 72, delta: 2,   bars: [{ height: 22, pillar: "opp"  }, { height: 19, pillar: "opp"  }, { height: 15, pillar: "mgmt" }] },
      { q: "Q3", total: 74, delta: 2,   bars: [{ height: 24, pillar: "mgmt" }, { height: 20, pillar: "opp"  }, { height: 16, pillar: "mgmt" }] },
      { q: "Q4", total: 76, delta: 2,   bars: [{ height: 26, pillar: "mgmt" }, { height: 22, pillar: "mgmt" }, { height: 18, pillar: "mgmt" }] },
    ],
  },
  {
    symbol: "DIVISLAB", name: "Divi's Laboratories", sector: "Pharma", capType: "Large",
    qty: 3, avgCost: 5100, ltp: 5418.00, dayChange: -60.80, dayChangePct: -1.1,
    invested: 15300, currentValue: 16254, pnl: 954, pnlPct: 6.2,
    modScore: 69, modRating: "FAIR", thesisHealth: "partial", trendDir: "down",
    alert: "FDA inspection delay at Kakinada — Opportunity sub-score under pressure",
    subScores: [
      { label: "Guidance Accuracy",    pillar: "mgmt", score: 74 },
      { label: "Disclosure Honesty",   pillar: "mgmt", score: 78 },
      { label: "Industry Tailwind",    pillar: "opp",  score: 62 },
      { label: "Distribution Strength",pillar: "opp",  score: 58 },
      { label: "Risk-Reward",          pillar: "deal", score: 52 },
    ],
    quarterTrend: [
      { q: "Q1", total: 74, delta: null, bars: [{ height: 26, pillar: "mgmt" }, { height: 20, pillar: "opp" }, { height: 16, pillar: "opp"  }] },
      { q: "Q2", total: 72, delta: -2,  bars: [{ height: 25, pillar: "mgmt" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "opp"  }] },
      { q: "Q3", total: 70, delta: -2,  bars: [{ height: 24, pillar: "mgmt" }, { height: 17, pillar: "opp" }, { height: 12, pillar: "opp"  }] },
      { q: "Q4", total: 69, delta: -1,  bars: [{ height: 24, pillar: "mgmt" }, { height: 15, pillar: "opp" }, { height: 10, pillar: "deal" }] },
    ],
    journal: {
      thesis: "\"CDMO opportunity + API dominance. FDA relationship management is a known headwind but management has navigated it before.\"",
      conviction: 3,
      aiNudge: "FDA Kakinada delay is the 2nd inspection issue in 18 months. Your thesis acknowledges this risk — the question is duration. Risk-Reward sub-score has dropped to 52. Set a 6-month review trigger.",
    },
  },
  {
    symbol: "INFY", name: "Infosys", sector: "IT Services", capType: "Large",
    qty: 15, avgCost: 1580, ltp: 1612.30, dayChange: -18.40, dayChangePct: -1.1,
    invested: 23700, currentValue: 24185, pnl: 485, pnlPct: 2.0,
    modScore: 74, modRating: "FAIR", thesisHealth: "partial", trendDir: "flat",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 72 },
      { label: "Capital Allocation", pillar: "mgmt", score: 76 },
      { label: "Industry Tailwind", pillar: "opp",  score: 70 },
      { label: "Competitive Edge",  pillar: "opp",  score: 74 },
      { label: "Earnings Growth",   pillar: "deal", score: 70 },
    ],
    quarterTrend: [
      { q: "Q1", total: 72, delta: null, bars: [{ height: 22, pillar: "opp" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "opp" }] },
      { q: "Q2", total: 73, delta: 1,   bars: [{ height: 22, pillar: "opp" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "opp" }] },
      { q: "Q3", total: 74, delta: 1,   bars: [{ height: 23, pillar: "opp" }, { height: 19, pillar: "opp" }, { height: 14, pillar: "opp" }] },
      { q: "Q4", total: 74, delta: 0,   bars: [{ height: 22, pillar: "opp" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "opp" }] },
    ],
  },
  {
    symbol: "TITAN", name: "Titan Company", sector: "Consumer", capType: "Large",
    qty: 6, avgCost: 3100, ltp: 3298.00, dayChange: 16.50, dayChangePct: 0.5,
    invested: 18600, currentValue: 19788, pnl: 1188, pnlPct: 6.4,
    modScore: 81, modRating: "STRONG", thesisHealth: "intact", trendDir: "flat",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 84 },
      { label: "Capital Allocation", pillar: "mgmt", score: 82 },
      { label: "Industry Tailwind", pillar: "opp",  score: 80 },
      { label: "Competitive Edge",  pillar: "opp",  score: 82 },
      { label: "P/E Re-rating",     pillar: "deal", score: 74 },
    ],
    quarterTrend: [
      { q: "Q1", total: 78, delta: null, bars: [{ height: 26, pillar: "mgmt" }, { height: 22, pillar: "opp" }, { height: 18, pillar: "deal" }] },
      { q: "Q2", total: 79, delta: 1,   bars: [{ height: 27, pillar: "mgmt" }, { height: 22, pillar: "opp" }, { height: 18, pillar: "deal" }] },
      { q: "Q3", total: 80, delta: 1,   bars: [{ height: 28, pillar: "mgmt" }, { height: 23, pillar: "opp" }, { height: 19, pillar: "deal" }] },
      { q: "Q4", total: 81, delta: 1,   bars: [{ height: 28, pillar: "mgmt" }, { height: 23, pillar: "opp" }, { height: 20, pillar: "deal" }] },
    ],
    journal: { thesis: "\"Premium discretionary with brand moat — jewellery + watches duopoly with strong aspirational positioning. Rural jewellery upcycle.\"", conviction: 4 },
  },
  {
    symbol: "TATASTEEL", name: "Tata Steel", sector: "Metals", capType: "Large",
    qty: 30, avgCost: 148, ltp: 162.40, dayChange: -1.80, dayChangePct: -1.1,
    invested: 4440, currentValue: 4872, pnl: 432, pnlPct: 9.7,
    modScore: 68, modRating: "FAIR", thesisHealth: "none", trendDir: "flat",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 66 },
      { label: "Capital Allocation", pillar: "mgmt", score: 70 },
      { label: "Industry Tailwind", pillar: "opp",  score: 68 },
      { label: "Earnings Growth",   pillar: "deal", score: 65 },
    ],
    quarterTrend: [
      { q: "Q1", total: 66, delta: null, bars: [{ height: 20, pillar: "mgmt" }, { height: 16, pillar: "opp" }, { height: 14, pillar: "deal" }] },
      { q: "Q2", total: 67, delta: 1,   bars: [{ height: 20, pillar: "mgmt" }, { height: 17, pillar: "opp" }, { height: 14, pillar: "deal" }] },
      { q: "Q3", total: 68, delta: 1,   bars: [{ height: 20, pillar: "mgmt" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "deal" }] },
      { q: "Q4", total: 68, delta: 0,   bars: [{ height: 21, pillar: "mgmt" }, { height: 18, pillar: "opp" }, { height: 14, pillar: "deal" }] },
    ],
  },
  {
    symbol: "KPIGREEN", name: "KPI Green Energy", sector: "Renewable", capType: "Small",
    qty: 20, avgCost: 680, ltp: 594.20, dayChange: -8.40, dayChangePct: -1.4,
    invested: 13600, currentValue: 11884, pnl: -1716, pnlPct: -12.6,
    modScore: 62, modRating: "FAIR", thesisHealth: "none", trendDir: "flat",
    subScores: [
      { label: "Guidance Accuracy", pillar: "mgmt", score: 60 },
      { label: "Industry Tailwind", pillar: "opp",  score: 72 },
      { label: "Competitive Edge",  pillar: "opp",  score: 58 },
      { label: "Earnings Growth",   pillar: "deal", score: 56 },
    ],
    quarterTrend: [
      { q: "Q1", total: 60, delta: null, bars: [{ height: 18, pillar: "opp" }, { height: 14, pillar: "opp" }, { height: 12, pillar: "deal" }] },
      { q: "Q2", total: 61, delta: 1,   bars: [{ height: 18, pillar: "opp" }, { height: 14, pillar: "opp" }, { height: 12, pillar: "deal" }] },
      { q: "Q3", total: 62, delta: 1,   bars: [{ height: 19, pillar: "opp" }, { height: 15, pillar: "opp" }, { height: 12, pillar: "deal" }] },
      { q: "Q4", total: 62, delta: 0,   bars: [{ height: 19, pillar: "opp" }, { height: 15, pillar: "opp" }, { height: 12, pillar: "deal" }] },
    ],
  },
];

export const MUTUAL_FUNDS: MutualFund[] = [
  { name: "Mirae Asset Large Cap Fund",  type: "Large Cap",  units: 312.4, nav: 108.20, currentValue: 33803, invested: 30000, pnl: 3803, pnlPct: 12.7, dayChangePct: 0.4,  xirr: 14.2 },
  { name: "Axis Midcap Fund",            type: "Mid Cap",    units: 180.6, nav: 92.40,  currentValue: 16687, invested: 14000, pnl: 2687, pnlPct: 19.2, dayChangePct: 0.6,  xirr: 17.8 },
  { name: "Parag Parikh Flexi Cap Fund", type: "Flexi Cap",  units: 240.1, nav: 78.60,  currentValue: 18872, invested: 17000, pnl: 1872, pnlPct: 11.0, dayChangePct: 0.3,  xirr: 13.1 },
  { name: "SBI Small Cap Fund",          type: "Small Cap",  units: 95.8,  nav: 148.50, currentValue: 14226, invested: 12000, pnl: 2226, pnlPct: 18.5, dayChangePct: -0.8, xirr: 16.4 },
  { name: "HDFC Nifty 50 Index Fund",    type: "Index",      units: 880.2, nav: 22.80,  currentValue: 20069, invested: 18500, pnl: 1569, pnlPct: 8.5,  dayChangePct: 0.4,  xirr: 9.8  },
];

export const NEWS_ITEMS: NewsItem[] = [
  {
    ticker: "ASIANPAINT", source: "Economic Times", age: "2 hours ago",
    title: "Asian Paints Q4 concall: Management guides volume growth of 6–8% for FY26 — below analyst estimates of 10–12%",
    body: "Management walked back earlier optimism on tier-2/3 demand recovery, citing prolonged urban slowdown. Capex guidance for FY26 also reduced from ₹1,800 Cr to ₹1,400 Cr.",
    impacts: [
      { pillar: "M", label: "Guidance −12pts", type: "neg" },
      { pillar: "O", label: "Tailwind −8pts",  type: "neg" },
      { pillar: "D", label: "Earnings −6pts",  type: "neg" },
    ],
    scoreChange: "Score: 62 → 54", scoreChangeType: "neg",
  },
  {
    ticker: "DIVISLAB", source: "CNBCTV18", age: "Yesterday",
    title: "Divi's Laboratories: USFDA issues Form 483 for Kakinada facility — 4 observations listed",
    body: "The USFDA inspection resulted in 4 observations under 21 CFR Part 211. Management says observations are procedural and expects resolution within 60 days. No import alert issued.",
    impacts: [
      { pillar: "O", label: "Distribution −6pts", type: "neg" },
      { pillar: "M", label: "Discl. Neutral",     type: "neu" },
      { pillar: "D", label: "Risk-Reward −4pts",  type: "neg" },
    ],
    scoreChange: "Under review · watch 60d", scoreChangeType: "warn",
  },
  {
    ticker: "HDFCBANK", source: "Mint", age: "2 days ago",
    title: "HDFC Bank Q4: NIM expands 6bps QoQ to 3.52% — deposit growth outpaces credit growth for first time post-merger",
    body: "HDFC Bank delivered a clean Q4 with NIM expansion and deposits growing 18% YoY vs credit growth of 14% YoY — a key concern since the merger that management has now addressed.",
    impacts: [
      { pillar: "M", label: "Guidance +6pts", type: "pos" },
      { pillar: "O", label: "Tailwind +4pts", type: "pos" },
      { pillar: "D", label: "Neutral",        type: "neu" },
    ],
    scoreChange: "Score: 78 → 82 ↑", scoreChangeType: "pos",
  },
  {
    ticker: "POLYCAB", source: "Business Standard", age: "3 days ago",
    title: "Polycab India wins ₹800 Cr government contract for railway electrification — largest order in company history",
    body: "Polycab's wires & cables segment secured a major railway electrification contract from Indian Railways, adding visibility to order book through FY27.",
    impacts: [
      { pillar: "O", label: "Tailwind +5pts", type: "pos" },
      { pillar: "D", label: "Earnings +4pts", type: "pos" },
      { pillar: "M", label: "Neutral",        type: "neu" },
    ],
    scoreChange: "Score: 77 → 80 ↑", scoreChangeType: "pos",
  },
];
