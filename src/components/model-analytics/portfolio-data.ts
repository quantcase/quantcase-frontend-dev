import type { PortfolioData } from "@/types/portfolio";

export const PORTFOLIOS: PortfolioData[] = [
  {
    id: "alpha-growth",
    name: "Alpha Growth Portfolio",
    riskProfile: "aggressive",
    capital: 71000000,
    client: { clientName: "Varun Kapoor", aum: "₹7.1 Cr", latestUpdate: "2026-04-18" },
    whyThisPortfolio: [
      "High conviction mid-cap and small-cap equity exposure",
      "Concentrated bets on infrastructure and EV supercycle",
      "Tactical international equity for FX diversification",
    ],
    assetClasses: [
      {
        key: "equity",
        label: "Equity",
        pct: 78,
        amount: 55380000,
        subClasses: [
          { key: "mid_cap",   label: "Mid-cap",   pct: 42, amount: 29820000 },
          { key: "small_cap", label: "Small-cap",  pct: 24, amount: 17040000 },
          { key: "large_cap", label: "Large-cap",  pct: 12, amount: 8520000  },
        ],
      },
      {
        key: "alternatives",
        label: "Alternatives",
        pct: 14,
        amount: 9940000,
        subClasses: [
          { key: "intl_equity", label: "Intl Equity", pct: 14, amount: 9940000 },
        ],
      },
      {
        key: "cash",
        label: "Cash",
        pct: 8,
        amount: 5680000,
        subClasses: [
          { key: "liquid", label: "Liquid Fund", pct: 8, amount: 5680000 },
        ],
      },
    ],
    positions: [
      { id: "1", company: "Jupiter Wagons Ltd",  ticker: "JWL",        subClass: "mid_cap",   score: 84, allocation: 20 },
      { id: "2", company: "Tata Motors Ltd",      ticker: "TATAMOTORS", subClass: "mid_cap",   score: 76, allocation: 18 },
      { id: "3", company: "Zomato Ltd",           ticker: "ZOMATO",     subClass: "small_cap", score: 71, allocation: 15 },
      { id: "4", company: "Adani Enterprises",    ticker: "ADANIENT",   subClass: "large_cap", score: 62, allocation: 12 },
      { id: "5", company: "Kaynes Technology",    ticker: "KAYNES",     subClass: "small_cap", score: 79, allocation: 13 },
    ],
    linkedClientIds: ["cli-varun"],
  },
  {
    id: "balanced-compounder",
    name: "Balanced Compounder Portfolio",
    riskProfile: "balanced",
    capital: 58000000,
    client: { clientName: "Anita Shah", aum: "₹5.8 Cr", latestUpdate: "2026-04-17" },
    whyThisPortfolio: [
      "Quality compounder approach focused on ROCE expansion",
      "Balanced allocation across equity and fixed income",
      "Low drawdown via diversified multi-asset exposure",
    ],
    assetClasses: [
      {
        key: "equity",
        label: "Equity",
        pct: 60,
        amount: 34800000,
        subClasses: [
          { key: "large_cap", label: "Large-cap",  pct: 35, amount: 20300000 },
          { key: "mid_cap",   label: "Mid-cap",    pct: 20, amount: 11600000 },
          { key: "flexi_cap", label: "Flexi-cap",  pct: 5,  amount: 2900000  },
        ],
      },
      {
        key: "debt",
        label: "Debt",
        pct: 30,
        amount: 17400000,
        subClasses: [
          { key: "gsec",      label: "G-Sec",        pct: 18, amount: 10440000 },
          { key: "corporate", label: "Corp Bonds",    pct: 12, amount: 6960000  },
        ],
      },
      {
        key: "cash",
        label: "Cash",
        pct: 10,
        amount: 5800000,
        subClasses: [
          { key: "liquid", label: "Liquid Fund", pct: 10, amount: 5800000 },
        ],
      },
    ],
    positions: [
      { id: "1", company: "HDFC Bank Ltd",    ticker: "HDFCBANK", subClass: "large_cap", score: 88, allocation: 18 },
      { id: "2", company: "Infosys Ltd",       ticker: "INFY",     subClass: "large_cap", score: 82, allocation: 17 },
      { id: "3", company: "Larsen & Toubro",   ticker: "LT",       subClass: "large_cap", score: 85, allocation: 14 },
      { id: "4", company: "Titan Company Ltd", ticker: "TITAN",    subClass: "mid_cap",   score: 74, allocation: 11 },
    ],
    linkedClientIds: ["cli-anita"],
  },
  {
    id: "conservative-income",
    name: "Conservative Income Portfolio",
    riskProfile: "conservative",
    capital: 24000000,
    client: { clientName: "Suresh Nair", aum: "₹2.4 Cr", latestUpdate: "2026-04-16" },
    whyThisPortfolio: [
      "Capital preservation with inflation-beating income",
      "Heavy debt and liquid fund allocation for stability",
      "Equity limited to large-cap dividend yielders",
    ],
    assetClasses: [
      {
        key: "debt",
        label: "Debt",
        pct: 55,
        amount: 13200000,
        subClasses: [
          { key: "gsec",      label: "G-Sec",      pct: 30, amount: 7200000 },
          { key: "corporate", label: "Corp Bonds",  pct: 25, amount: 6000000 },
        ],
      },
      {
        key: "equity",
        label: "Equity",
        pct: 30,
        amount: 7200000,
        subClasses: [
          { key: "large_cap", label: "Large-cap Dividend", pct: 30, amount: 7200000 },
        ],
      },
      {
        key: "cash",
        label: "Cash",
        pct: 15,
        amount: 3600000,
        subClasses: [
          { key: "liquid", label: "Liquid Fund", pct: 15, amount: 3600000 },
        ],
      },
    ],
    positions: [
      { id: "1", company: "ITC Ltd",        ticker: "ITC",       subClass: "large_cap", score: 72, allocation: 20 },
      { id: "2", company: "Coal India Ltd",  ticker: "COALINDIA", subClass: "large_cap", score: 68, allocation: 16 },
      { id: "3", company: "Power Grid Corp", ticker: "POWERGRID", subClass: "large_cap", score: 70, allocation: 14 },
    ],
    linkedClientIds: ["cli-suresh"],
  },
];

// ── Per-portfolio target allocations (%) for drift calculation ────────────────
const TARGETS: Record<string, Record<string, number>> = {
  "alpha-growth":        { equity: 80, alternatives: 12, cash: 8 },
  "balanced-compounder": { equity: 60, debt: 30,         cash: 10 },
  "conservative-income": { debt: 55,   equity: 30,       cash: 15 },
};

export function getDriftItems(p: PortfolioData) {
  return p.assetClasses.map((ac, i) => {
    const target = TARGETS[p.id]?.[ac.key] ?? ac.pct;
    const drift  = +(ac.pct - target).toFixed(1);
    return {
      id: String(i),
      assetClass: ac.label,
      currentAllocation: ac.pct,
      targetAllocation: target,
      driftPercent: drift,
      direction: (drift >= 0 ? "up" : "down") as "up" | "down",
    };
  });
}

export function formatCrore(n: number) {
  return `₹${(n / 10000000).toFixed(2)} Cr`;
}

export function riskLabel(r: PortfolioData["riskProfile"]) {
  return { conservative: "Conservative", balanced: "Balanced", aggressive: "Aggressive" }[r];
}

export function riskColor(r: PortfolioData["riskProfile"]) {
  return { conservative: "#16a34a", balanced: "#d97706", aggressive: "#dc2626" }[r];
}

export function driftSeverity(d: number): "clean" | "warning" | "critical" {
  const abs = Math.abs(d);
  if (abs <= 2) return "clean";
  if (abs <= 5) return "warning";
  return "critical";
}
