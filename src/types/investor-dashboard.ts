// Response types for the investor dashboard endpoints.
// All money values are raw rupee numbers; the frontend formats them.

// ── 1. GET /api/portfolio/mod-synopsis ────────────────────────────────────────

export type ModPillar = "management" | "opportunity" | "deal";
export type ModRating = "STRONG" | "FAIR" | "STRETCHED" | "WEAK";

export interface ModSubScore {
  pillar: ModPillar;
  score: number;
  rating: ModRating;
}

export interface ModBreakdownRow {
  symbol: string;
  name: string;
  weight_pct: number;
  management: number;
  opportunity: number;
  deal: number;
}

export interface ModSynopsis {
  empty: boolean;
  overall_score: number;
  sub_scores: ModSubScore[];
  weakest_pillar: ModPillar | null;
  dragging_symbols: string[];
  breakdown: ModBreakdownRow[];
}

// ── 2. GET /api/portfolio/summary ─────────────────────────────────────────────

export interface AllocationSegment {
  label: string;
  value: number; // ₹
  count: number;
  pct: number;
}

export interface ValueTrendPoint {
  date: string; // ISO
  value: number; // ₹
}

export type PortfolioSource = "smallcase" | "firstparty";

export interface PortfolioSummary {
  empty: boolean;
  source: PortfolioSource;
  stock_count: number;
  fund_count: number;
  synced_at: string | null; // ISO
  equity_value: number; // ₹
  invested_value: number; // ₹
  today_change_value: number | null; // ₹ (null for first-party — no share qty)
  today_change_pct: number | null;
  ytd_change_pct: number | null;
  return_6m_pct: number | null;
  value_trend: ValueTrendPoint[];
  cap_segments: AllocationSegment[];
  industry_segments: AllocationSegment[];
}

// ── 3. GET /api/portfolio/whats-moving ────────────────────────────────────────

export type WhatsMovingKind = "score_upgrade" | "score_downgrade" | "earnings";

export interface WhatsMovingItem {
  id: string;
  symbol: string;
  price: number; // ₹
  price_change_pct: number;
  kind: WhatsMovingKind;
  headline_label: string;
  headline_detail: string;
  body: string;
  qc_score: number;
  held: boolean;
  holding_detail: string;
  cta_label: string;
  href: string;
}

export interface WhatsMovingResponse {
  items: WhatsMovingItem[];
}

// ── 4. GET /api/discover/screens ──────────────────────────────────────────────

export type DiscoverBadgeKind = "warning" | "new" | "info";

export interface DiscoverStat {
  value: number;
  label: string;
}

export interface DiscoverScreenDto {
  id: string;
  icon: string; // icon key, not SVG
  badge_label?: string;
  badge_kind?: DiscoverBadgeKind;
  title: string;
  description: string;
  stats: DiscoverStat[];
  href: string;
}

export interface DiscoverScreensResponse {
  screens: DiscoverScreenDto[];
}

// ── 5. GET /api/research-library/summary ──────────────────────────────────────

export interface ResearchLibrarySummary {
  new_ic_notes: number;
  catalysts_next_30_days: number;
  subtitle?: string;
}

// ── 6. GET /api/market/indices ────────────────────────────────────────────────

export interface MarketIndex {
  symbol: string;
  value: number;
  change_pct: number;
}

export interface MarketIndicesResponse {
  indices: MarketIndex[];
  as_of?: string; // ISO
}
