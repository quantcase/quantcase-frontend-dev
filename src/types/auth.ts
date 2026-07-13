export interface Subscription {
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  plan_name: string;
  days_remaining: number;
  is_access_blocked: boolean;
}

/** Broker/smallcase connection state, returned inline on /api/auth/me. */
export interface SmallcaseConnection {
  is_connected: boolean;
  /** Broker slug, e.g. "kite", "groww". null when not connected. */
  broker: string | null;
  /** ISO timestamp of the last successful holdings sync. */
  last_synced_at: string | null;
  holdings_count: number;
}

export interface MeResponse {
  id?: string;
  email?: string | null;
  display_name?: string | null;
  display_picture?: string | null;
  accountType?: "manager" | "investor" | null;
  account_type?: "manager" | "investor" | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  subscription: Subscription | null;
  smallcase?: SmallcaseConnection | null;
}

export interface BillingPrice {
  id: string;
  plan_type: "monthly" | "annual" | "trial";
  amount: number;
  currency: string;
  interval_months: number;
  razorpay_plan_id: string | null;
}

export interface BillingProduct {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  prices: BillingPrice[];
}

/** GET /api/billing/config */
export interface BillingConfig {
  mode: "test" | "live";
  razorpay_key_id: string;
}

/** POST /api/billing/subscribe → { price_id, coupon_code? } */
export interface SubscribeResponse {
  razorpay_order_id: string;
  razorpay_key_id: string;
  mode: "test" | "live";
  amount: number;
  currency: string;
  subscription_id: string;
  prefill: { name: string; email: string; contact: string };
}

/** POST /api/billing/verify → { razorpay_order_id, razorpay_payment_id, razorpay_signature } */
export interface VerifyResponse {
  status: string;
  subscription_id: string;
  current_period_end: string | null;
}

/** POST /api/billing/coupons/validate */
export interface CouponValidation {
  valid: boolean;
  discount_amount?: number;
  final_amount?: number;
  message?: string;
}
