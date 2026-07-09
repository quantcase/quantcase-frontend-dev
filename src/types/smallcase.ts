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
  broker: string | null;   // broker the holding is held at
}

export interface SmallcaseHoldingsData {
  portfolio: SmallcasePortfolioSummary | null;
  holdings: SmallcaseHolding[];
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
