import { BACKEND_URL } from "@/lib/constants";
import type {
  BillingConfig,
  BillingProduct,
  CouponValidation,
  Subscription,
  SubscribeResponse,
  VerifyResponse,
} from "@/types/auth";

/**
 * Typed client for the Razorpay billing API.
 *
 * All success responses use the `{ success: true, data: ... }` envelope; errors are
 * `{ success: false, error }` (or `{ error }` for validation). We unwrap `.data` and
 * throw the server-provided message on non-2xx so callers get a clean Promise.
 *
 * The Razorpay key is NEVER hardcoded — it always comes from `/config` or the
 * `/subscribe` response, which makes the test↔live switch a backend-only change.
 */

const BILLING = `${BACKEND_URL}/api/billing`;

function authToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("qc_at");
}

function authHeaders(): Record<string, string> {
  const token = authToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Unwrap the `{ success, data }` envelope, throwing the server error message on failure. */
async function unwrap<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  // Hex kept intentionally below: console `%c` style strings — the DevTools console cannot resolve CSS var() tokens.
  if (!res.ok) {
    const httpStatus = res.statusText ? `${res.status} ${res.statusText}` : `${res.status}`;
    console.error(
      `%c[billing]%c ${res.status} ${res.url}`,
      "color:#dc2626;font-weight:600",
      "color:inherit",
      json,
    );
    throw new Error(json?.error ?? json?.message ?? `${fallback} (${httpStatus})`);
  }
  console.log(
    `%c[billing]%c ${res.status} ${res.url}`,
    "color:#0F172B;font-weight:600",
    "color:inherit",
    json,
  );
  // Tolerate both enveloped ({ data }) and bare responses.
  return (json?.data ?? json) as T;
}

/** GET /api/billing/config — no auth. Read `{ mode, razorpay_key_id }`. */
export async function getBillingConfig(): Promise<BillingConfig> {
  const res = await fetch(`${BILLING}/config`);
  return unwrap<BillingConfig>(res, "Failed to load billing config");
}

/** GET /api/billing/products — list products and their prices. */
export async function getProducts(): Promise<BillingProduct[]> {
  const res = await fetch(`${BILLING}/products`, { headers: authHeaders() });
  return unwrap<BillingProduct[]>(res, "Failed to load plans");
}

/**
 * POST /api/billing/subscribe — create a Razorpay order.
 * Returns the order + publishable key + prefill (amount is final, after coupon).
 */
export async function createSubscribeOrder(
  priceId: string,
  couponCode?: string,
): Promise<SubscribeResponse> {
  const res = await fetch(`${BILLING}/subscribe`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ price_id: priceId, ...(couponCode ? { coupon_code: couponCode } : {}) }),
  });
  return unwrap<SubscribeResponse>(res, "Failed to create order");
}

/**
 * POST /api/billing/verify — MANDATORY server-side verification.
 * Never treat the checkout handler as "paid" without this.
 */
export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyResponse> {
  const res = await fetch(`${BILLING}/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return unwrap<VerifyResponse>(res, "Payment verification failed");
}

/** POST /api/billing/coupons/validate — optional pre-checkout coupon check. */
export async function validateCoupon(
  couponCode: string,
  priceId: string,
): Promise<CouponValidation> {
  const res = await fetch(`${BILLING}/coupons/validate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ coupon_code: couponCode, price_id: priceId }),
  });
  return unwrap<CouponValidation>(res, "Failed to validate coupon");
}

/** GET /api/billing/subscription — current subscription status / access state. */
export async function getSubscription(): Promise<Subscription> {
  const res = await fetch(`${BILLING}/subscription`, { headers: authHeaders() });
  return unwrap<Subscription>(res, "Failed to load subscription");
}
