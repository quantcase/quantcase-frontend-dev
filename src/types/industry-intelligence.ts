export type QLevel = "Q1" | "Q2" | "Q3" | "Q4";
export type Direction = "up" | "down" | "neutral" | "positive" | "negative" | "mixed" | "warn";
export type RevisionDirection = "up" | "flat" | "down";
export type ValuationLabel = "Fair" | "Expensive" | "Cheap";
export type ClusterSignalVariant = "hold" | "watch" | "exit" | "emerging";
export type CategoryStyle = "blue" | "warn" | "accent";
export type CategoryType = "demand" | "macro" | "corporate" | "policy" | "geo" | "raw_material";

// ── Meta ──────────────────────────────────────────────────────────────────────

export interface IIMeta {
  regime: string;
  regime_previous: string | null;
  regime_changed_weeks_ago: number | null;
  as_of_date: string;
  week_ending_label: string;
  version: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface IISummaryTiles {
  market_regime: { value: string; change: string | null; since_label: string | null };
  top_cluster: { name: string; score: number; quartile: QLevel; rank: number } | null;
  biggest_mover: { name: string; rank_change: string; label: string } | null;
  news_this_week: { count: number; clusters_affected: number } | null;
}

export interface IITop5Industry {
  rank: number;
  name: string;
  composite_score: number;
  wow: string;
  quartile: QLevel;
  news_tag: string | null;
  news_direction: Direction | null;
}

export interface IIBottom3Industry {
  rank: number;
  name: string;
  composite_score: number;
  wow: string;
  quartile: QLevel;
  signal: string | null;
}

export interface IIPortfolioHolding {
  ticker: string;
  cluster: string;
  cluster_rank: string;
  quartile: QLevel;
  wow: string;
}

export interface IIDashboardRotationSignal {
  type: string;
  industry_name: string;
  detail: string;
  direction: "up" | "down" | "warn";
}

export interface IITopNewsItem {
  category: string;
  category_style: CategoryStyle;
  extra_badge: string | null;
  headline: string;
  sentiment: string;
  sentiment_direction: Direction;
  source: string;
  industry_tags: string[];
  has_cta: boolean;
}

export interface IIDashboard {
  summary_tiles: IISummaryTiles;
  top_5_industries: IITop5Industry[];
  bottom_3_industries: IIBottom3Industry[];
  portfolio_holdings: IIPortfolioHolding[] | null;
  rotation_signals: IIDashboardRotationSignal[];
  top_news: IITopNewsItem[] | null;
}

// ── Industry Ranking ──────────────────────────────────────────────────────────

export interface IIRankPoint {
  week: string;
  rank: number;
}

export interface IIIndustry {
  rank: number;
  name: string;
  composite_score: number;
  wow: string;
  momentum: number | null;
  breadth_pct: number;
  revisions: number | null;
  valuation: number;
  quartile: QLevel;
  news_tag: string | null;
  news_direction: Direction | null;
  rank_history: IIRankPoint[];
}

export interface IIIndustryRanking {
  as_of_date: string;
  total_industries: number;
  industries: IIIndustry[];
}

// ── Deep Dive ─────────────────────────────────────────────────────────────────

export interface IIDeepDiveMetrics {
  cluster_rank: number;
  rank_stability: string;
  rank_change_wow: number;
  rank_label: string;
  rank_change_label: string;
  composite_score: number;
  score_change_wow: string;
  score_change_label: string;
  breadth_pct: number;
  breadth_context: string;
  economic_model: string;
  economic_model_detail: string;
}

export interface IIFactorScores {
  fundamentals: number;
  momentum: number;
  breadth: number;
  revisions: number;
  sentiment: number;
  valuation: number;
}

export interface IIFactorNewsImpact {
  factor: string;
  news_categories: string[];
  direction: "positive" | "negative";
}

export interface IIDeepDiveDriver {
  label: string;
  text: string;
}

export interface IIDeepDiveNews {
  category: string;
  category_type: CategoryType;
  headline: string;
  direction: "positive" | "negative";
  source: string;
  published_day: string;
  factor_tags: string[];
}

export interface IISelectedIndustry {
  name: string;
  breadcrumb: string[];
  metrics: IIDeepDiveMetrics;
  factor_scores: IIFactorScores;
  rank_history: IIRankPoint[];
  factor_news_impacts: IIFactorNewsImpact[];
  overview_text: string;
  drivers: IIDeepDiveDriver[];
  news: IIDeepDiveNews[];
  risks: string;
  catalysts: string;
}

export interface IIDeepDive {
  available_industries: string[];
  selected_industry: IISelectedIndustry | null;
}

// ── Stock Ranking ─────────────────────────────────────────────────────────────

export interface IIStock {
  rank: number;
  symbol: string;
  company_name: string;
  rs_vs_cluster_pct: string;
  revision_label: string;
  revision_direction: RevisionDirection;
  quality_score: number;
  valuation_label: ValuationLabel;
}

export interface IIClusterSignal {
  variant: ClusterSignalVariant;
  title: string;
  subtitle: string | null;
  detail: string;
}

export interface IIClusterNews {
  category: string;
  category_type: CategoryType;
  headline: string;
  sentiment: string;
  sentiment_direction: string;
  source: string;
  published_day: string;
  factor_tags: string[];
}

export interface IISelectedCluster {
  name: string;
  breadcrumb: string[];
  stocks: IIStock[];
  cluster_signals: IIClusterSignal[];
  cluster_news: IIClusterNews[];
}

export interface IIStockRanking {
  available_clusters: string[];
  selected_cluster: IISelectedCluster | null;
}

// ── Rotation Alerts ───────────────────────────────────────────────────────────

export interface IISignalCounts {
  entry_count: number;
  entry_industries: string[];
  exit_count: number;
  exit_industries: string[];
  trap_count: number;
  trap_industries: string[];
  news_confirmed_count: number | null;
  news_confirmed_detail: string | null;
}

export interface IISignalWithNews {
  industry: string;
  detail: string;
  confirming_news: {
    category: string;
    headline: string;
    sentiment_direction: "positive" | "negative";
    factor_tags: string[];
  };
}

export interface IISimpleSignal {
  industry: string;
  detail: string;
}

export interface IIActiveSignals {
  entry: IISignalWithNews | null;
  exit: IISignalWithNews | null;
  trap: IISimpleSignal | null;
  emerging: IISimpleSignal | null;
}

export interface IIHighConvictionPick {
  ticker: string;
  cluster_label: string;
  context: string;
  rs_vs_market_pct: string | null;
  revisions: string | null;
  quality_score: number;
}

export interface IIRegimeWeight {
  label: string;
  value_pct: string;
  delta: string | null;
  delta_direction: "positive" | "negative" | null;
  note: string | null;
}

export interface IIRotationAlerts {
  signal_counts: IISignalCounts;
  active_signals: IIActiveSignals;
  high_conviction_pick: IIHighConvictionPick | null;
  regime_weights: IIRegimeWeight[];
}

// ── Universe Browser ──────────────────────────────────────────────────────────

export interface IIMacroSector {
  code: string;
  name: string;
  stock_count: number;
}

export interface IIUniverseBrowser {
  stats: {
    total_stocks: number;
    total_macro_sectors: number;
    hierarchy_levels: number;
  };
  macro_sectors: IIMacroSector[];
}

// ── Root ──────────────────────────────────────────────────────────────────────

export interface IndustryIntelligenceData {
  meta: IIMeta;
  dashboard: IIDashboard;
  industry_ranking: IIIndustryRanking;
  deep_dive: IIDeepDive;
  stock_ranking: IIStockRanking;
  rotation_alerts: IIRotationAlerts;
  universe_browser: IIUniverseBrowser;
  news_intelligence: null;
}
