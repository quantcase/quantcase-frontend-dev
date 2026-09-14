export type RiskLevel = "Low" | "Medium" | "High";
export type HealthStatus = "Improving" | "Weakening" | "Stable";
export type BasketGroup = "QuantCase Special" | "Market Specific";

export interface BasketCategory {
  key: string;
  group: BasketGroup;
  desc: string;
}

export interface BasketHistorySnapshot {
  at: string;
  avgQc: number;
  symbols: string[];
}

export interface SampleBasket {
  name: string;
  category: string;
  rationale: string;
  risk: RiskLevel;
  stocks: number;
  minInv: number;
  returnLabel: string;
  returnVal: number;
  volatility: RiskLevel;
  health: HealthStatus;
  fee: string;
  history?: BasketHistorySnapshot[];
  slug?: string;
  /** Present on real backend baskets later */
  selections?: Record<string, string[]>;
  maxStocks?: number;
}

export type SortKey = "popularity" | "return" | "newest" | "name";

export interface BasketListState {
  group: BasketGroup;
  category: string;
  risk: string;
  sort: SortKey;
  search: string;
}
