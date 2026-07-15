export interface SmallcaseConnectionStatus {
  is_connected: boolean;
  broker: string | null;
  last_synced_at: string | null;
}

export interface SmallcaseSyncResult {
  holdings_synced: number;
  baskets_synced: number;
  synced_at: string;
}

export interface SmallcasePortfolioSummary {
  total_value: number;
  total_invested: number;
  total_pnl: number;
  total_pnl_pct: number;
  synced_at: string;
}

/** Enrichment block from market data — may be null when the ticker has no live feed. */
export interface SmallcaseHoldingMarketData {
  ltp: number;
  change: number;
  change_percent: number;
  qc_score: number | null;
  conviction: string | null;
  thesis_tags: string[];
}

export interface SmallcaseHolding {
  id: string;
  ticker: string;
  name: string | null;
  quantity: number;
  avg_price: number;                 // your average BUY price (cost basis)
  invested_value: number;            // qty × avg_price — what you paid
  current_price: number | null;      // live LTP (null if no market data)
  current_value: number | null;      // qty × ltp (null if no live price)
  display_value: number;             // ← RENDER THIS. current_value ?? invested_value (never null)
  has_live_price: boolean;           // false → display_value is cost basis
  pnl: number | null;                // current_value − invested_value (null if no live price)
  pnl_pct: number | null;
  exchange: string;
  isin: string;
  broker: string | null;             // broker the holding is held at

  // Full smallcase fidelity — available but not rendered today.
  nse_ticker?: string;
  bse_ticker?: string;
  collateral_quantity?: number;
  transactable_quantity?: number;
  smallcase_quantity?: number;
  nse_quantity?: number;
  nse_avg_price?: number;
  bse_quantity?: number;
  bse_avg_price?: number;
  suspended_nse?: boolean;
  suspended_bse?: boolean;

  market_data: SmallcaseHoldingMarketData | null;

  created_at?: string;
  updated_at?: string;
}

/** An owned smallcase basket — the smallcases.public[] groups. */
export interface SmallcaseBasketConstituent {
  ticker: string;
  shares: number;
}

export interface SmallcaseBasket {
  scid: string;
  name: string;
  short_description: string;
  investment_url: string;
  image_url: string;
  current_value: number;             // real current value from smallcase
  total_returns: number;
  constituents: SmallcaseBasketConstituent[];
  is_private: boolean;
}

export interface SmallcaseHoldingsData {
  portfolio: SmallcasePortfolioSummary | null;
  holdings: SmallcaseHolding[];
  baskets: SmallcaseBasket[];
}

// ── Gateway transaction / order flow (POST /connect, /orders, etc.) ────────────

export type SmallcaseIntent = "HOLDINGS_IMPORT" | "TRANSACTION" | "CONNECT";

/** POST /connect → creates a HOLDINGS_IMPORT transaction */
export interface SmallcaseConnectTransaction {
  transactionId: string;
  /** Session token to seed the SDK with; minted fresh per transaction */
  smallcaseAuthToken: string;
  gateway: string;
  expireAt: string;
  intent: SmallcaseIntent;
}

/** POST /transactions/:id/confirm → result once the SDK flow completes */
export interface SmallcaseConfirmResult {
  is_connected: boolean;
  broker: string | null;
  holdings_synced: number;
  synced_at: string;
}

/** POST /transactions/:id/confirm → still settling; poll again */
export interface SmallcaseProcessing {
  status: "processing";
}

export type SmallcaseConfirmResponse = SmallcaseConfirmResult | SmallcaseProcessing;

export function isProcessing(res: SmallcaseConfirmResponse): res is SmallcaseProcessing {
  return (res as SmallcaseProcessing).status === "processing";
}

export type SmallcaseOrderType = "buy" | "sell" | "rebalance" | "sip";

export type SmallcaseOrderStatus =
  | "pending"
  | "placed"
  | "completed"
  | "failed"
  | "cancelled";

/** POST /orders body */
export interface SmallcasePlaceOrderInput {
  type: SmallcaseOrderType;
  scid: string;
  smallcase_name?: string;
  amount?: number;
}

/** POST /orders → transaction to run in the SDK */
export interface SmallcaseOrderTransaction {
  transactionId: string;
  /** Session token to seed the SDK with; minted fresh per transaction */
  smallcaseAuthToken: string;
  gateway: string;
  expireAt: string;
}

/** GET /orders → orders[] */
export interface SmallcaseOrder {
  order_id: string;
  status: SmallcaseOrderStatus;
  type: SmallcaseOrderType;
  amount: number | null;
  smallcase_name: string | null;
  placed_at: string;
  completed_at: string | null;
}

/** GET /orders → paginated envelope */
export interface SmallcaseOrdersData {
  orders: SmallcaseOrder[];
  total: number;
  page: number;
  limit: number;
}
