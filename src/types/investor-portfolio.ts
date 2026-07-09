export interface HoldingNote {
  id: string;
  holding_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export interface HoldingMarketData {
  ltp: number | null;
  change: number | null;
  change_percent: number | null;
  qc_score: number | null;
  conviction: "POSITIVE" | "NEUTRAL" | "WATCH" | null;
  thesis_tags: string[];
}

export interface Holding {
  id: string;
  ticker: string;
  amount_invested: number;
  invested_at: string;
  created_at: string;
  updated_at: string;
  user_portfolio_id: string | null;
  shadow_portfolio_id: string | null;
  notes: HoldingNote[];
  market_data?: HoldingMarketData | null;
  broker: string | null;            // broker display name, null for uploaded holdings
  quantity?: number | null;         // optional; null for uploaded holdings
  current_value?: number | null;    // optional live value; else use amount_invested
}

export interface UserPortfolio {
  id: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  holdings: Holding[];
  empty?: boolean;
  portfolio?: null;
}

export interface ShadowPortfolioData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
}

export interface AddShadowHoldingPayload {
  ticker: string;
}

export interface UpdateHoldingPayload {
  ticker?: string;
  amount_invested?: number;
  invested_at?: string;
}
