import { useState, useEffect, useCallback } from "react";
import { apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

export interface SubscriptionData {
  id: string;
  plan_type: string;
  status: string;
  is_access_blocked: boolean;
  days_remaining: number;
  trial_starts_at?: string;
  trial_ends_at?: string;
  current_period_start?: string;
  current_period_end?: string;
  razorpay_subscription_id?: string;
  cancelled_at?: string;
  price?: {
    id: string;
    amount: number;
    currency: string;
    interval_months: number;
    product: {
      name: string;
    };
  };
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(() => {
    setLoading(true);
    apiAuthGet(
      `${BACKEND_URL}/api/billing/subscription`,
      {
        onSuccess: (res) => {
          setData(res.data);
          setError(null);
          setLoading(false);
        },
        onError: (err) => {
          setError(err.message || "Failed to fetch subscription");
          setLoading(false);
        },
      }
    );
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { data, loading, error, refetch: fetchSubscription };
}
