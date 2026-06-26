export interface SmallcaseConnectionStatus {
  is_connected: boolean;
  broker: string | null;
  last_synced_at: string | null;
}

export interface SmallcaseSyncResult {
  holdings_synced: number;
  synced_at: string;
}

export interface SmallcasePortfolioSummary {
  total_value: number;
  total_invested: number;
  total_pnl: number;
  total_pnl_pct: number;
  synced_at: string;
}

export interface SmallcaseHolding {
  id: string;
  ticker: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  current_value: number;
  invested_value: number;
  pnl: number;
  pnl_pct: number;
  exchange: string;
  isin: string;
  created_at: string;
  updated_at: string;
}

export interface SmallcaseHoldingsData {
  portfolio: SmallcasePortfolioSummary | null;
  holdings: SmallcaseHolding[];
}
