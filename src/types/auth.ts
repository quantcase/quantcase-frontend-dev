export interface Subscription {
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  plan_name: string;
  days_remaining: number;
  is_access_blocked: boolean;
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
}

export interface BillingPrice {
  id: string;
  plan_type: "monthly" | "annual";
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
