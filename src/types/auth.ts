export interface Subscription {
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  plan_name: string;
  days_remaining: number;
  is_access_blocked: boolean;
}

export interface MeResponse {
  accountType?: "manager" | "investor" | null;
  account_type?: "manager" | "investor" | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  subscription: Subscription | null;
}

export interface BillingPrice {
  id: string;
  price_id: string;
  amount: number;
  currency: string;
  interval: "monthly" | "annual";
  label: string;
}

export interface BillingProduct {
  id: string;
  name: string;
  description: string;
  prices: BillingPrice[];
}
