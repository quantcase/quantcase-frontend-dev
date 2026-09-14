import type { BasketCategory } from "../_lib/types";

export const BASKET_CATEGORIES: BasketCategory[] = [
  {
    key: "Composite",
    group: "QuantCase Special",
    desc: "Our own M.O.D. framework composite scores — QC (overall), Management, Opportunity and Deal — ranked across the full universe, no sector or theme constraint.",
  },
  {
    key: "Lens",
    group: "QuantCase Special",
    desc: "Ten single-lens QC scores — Guidance Credibility, Disclosure Honesty, Capital Allocation, Promoter Activity, Industry, Competition, Financial Strength, Customer & Distribution, Earnings Forecast, Earnings Quality — each ranking the full universe on one dimension of the framework.",
  },
  {
    key: "Custom",
    group: "QuantCase Special",
    desc: "Themes extracted from concall transcripts, investor PPTs and annual reports — promoted to a basket once they clear the materiality threshold (distinct-company mentions). Not published by NSE or anyone else — this is QuantCase's own research edge.",
  },
  {
    key: "Thematic",
    group: "Market Specific",
    desc: "NSE-published thematic indices — Defence, EV & New Age Automotive, PSU, REITs & InvITs and more — tracked directly against NSE's own index methodology and constituents.",
  },
  {
    key: "Sectoral",
    group: "Market Specific",
    desc: "Real NSE sector classification — sectors currently outperforming Nifty, ranked weekly. Only sectors clearing the bar get a basket.",
  },
  {
    key: "Broad Based",
    group: "Market Specific",
    desc: "QC Score-ranked picks within a market-cap tier (Large/Mid/Small/Micro, by real rank) — no sector or theme constraint.",
  },
  {
    key: "Strategy",
    group: "Market Specific",
    desc: "Factor baskets built on NSE's own published Strategy Index methodology — Quality, Alpha, Value, Momentum, Low Volatility.",
  },
  {
    key: "Technical",
    group: "Market Specific",
    desc: "Price and trend-driven baskets. Refreshed more often than the others — treat as tactical, not buy-and-hold.",
  },
];

export const GROUP_LABELS: Record<string, string> = {
  "QuantCase Special": "QuantCase Special Buckets",
  "Market Specific": "Market Buckets",
};

export const GROUP_ORDER = ["QuantCase Special", "Market Specific"] as const;
