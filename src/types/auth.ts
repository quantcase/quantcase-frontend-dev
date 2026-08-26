export interface Subscription {
  status: "trialing" | "active" | "past_due" | "canceled" | "expired" | null;
  plan_name?: string;
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
  accountType?: "manager" | "investor" | "admin" | null;
  account_type?: "manager" | "investor" | "admin" | null;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  profile?: {
    onboarding_completed: boolean;
    onboarding_step: string | number;
  } | null;
  subscription: Subscription | null;
  smallcase?: SmallcaseConnection | null;
}

export interface BillingPrice {
  id: string;
  plan_type: "monthly" | "quaterly" | "quarterly" | "half-yearly" | "annual" | "trial";
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
  razorpay_subscription_id: string;
  razorpay_key_id: string;
  mode: "test" | "live";
  subscription_id: string;
  prefill: { name: string; email: string; contact: string };
}

/** POST /api/billing/verify → { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } */
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

/** GET /api/invites/validate?token= — success body (raw, not wrapped in .data) */
export interface InviteValidation {
  success: true;
  email: string;
  expiresAt: string;
}

/** POST /api/auth/register body */
export interface RegisterPayload {
  email?: string;
  mobile?: string;
  password: string;
  display_name?: string;
  invite_token?: string;
}

/** POST /api/auth/register — success body (raw, not wrapped in .data) */
export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    accountType: "manager" | "investor" | "admin";
  };
}

/** POST /api/auth/google body */
export interface GoogleAuthPayload {
  id_token: string;
}

/** POST /api/auth/google — success body (raw, not wrapped in .data) */
export interface GoogleAuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    accountType: "manager" | "investor" | "admin";
    displayName?: string | null;
    displayPicture?: string | null;
  };
}

/** POST /admin/invites body */
export interface AdminInvitePayload {
  emails: string[];
}

export type AdminInviteResultStatus = "sent" | "skipped" | "failed";

export interface AdminInviteResult {
  email: string;
  status: AdminInviteResultStatus;
  inviteId?: string;
  reason?: string;
}

/** POST /admin/invites — success body (raw, not wrapped in .data) */
export interface AdminInviteResponse {
  success: true;
  results: AdminInviteResult[];
}
