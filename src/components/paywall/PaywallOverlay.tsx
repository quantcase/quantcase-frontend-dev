"use client";

import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/lib/constants";
import type { BillingProduct, BillingPrice } from "@/types/auth";
import { useUser } from "@/components/providers/UserContext";

export function PaywallOverlay() {
  const { subscription } = useUser();
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [interval, setIntervalToggle] = useState<"monthly" | "annual">("monthly");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("qc_at");
    if (!token) return;

    fetch(`${BACKEND_URL}/api/billing/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const list: BillingProduct[] = data?.data ?? data ?? [];
        setProducts(list);
        // Pre-select first available price
        const firstMonthly = list.flatMap((p) => p.prices).find((pr) => pr.interval === "monthly");
        if (firstMonthly) setSelectedPriceId(firstMonthly.price_id);
      })
      .catch(() => {})
      .finally(() => setFetchingProducts(false));
  }, []);

  const visiblePrices = products.flatMap((product) =>
    product.prices
      .filter((pr) => pr.interval === interval)
      .map((pr) => ({ product, price: pr }))
  );

  function formatAmount(amount: number, currency: string) {
    if (currency.toLowerCase() === "inr") {
      return `₹${(amount / 100).toLocaleString("en-IN")}`;
    }
    return `$${(amount / 100).toFixed(2)}`;
  }

  async function handleSubscribe() {
    if (!selectedPriceId) return;
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("qc_at");
      const res = await fetch(`${BACKEND_URL}/api/billing/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price_id: selectedPriceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? data?.error ?? "Failed to create order. Please try again.");
        return;
      }

      const checkoutParams = data?.data ?? data;

      if (!window.Razorpay) {
        setError("Payment system not loaded. Please refresh and try again.");
        return;
      }

      const rzp = new window.Razorpay({
        key: checkoutParams.key,
        amount: checkoutParams.amount,
        currency: checkoutParams.currency ?? "INR",
        name: "QuantCase",
        description: "Research Platform Subscription",
        order_id: checkoutParams.order_id,
        subscription_id: checkoutParams.subscription_id,
        prefill: checkoutParams.prefill,
        theme: { color: "#0F172B" },
        handler: () => {
          window.location.reload();
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch {
      setError("Unable to connect to payment service. Please try again.");
      setLoading(false);
    }
  }

  const headlineStatus = subscription?.status;
  const headline =
    headlineStatus === "trialing"
      ? "Your free trial has ended"
      : headlineStatus === "past_due"
      ? "Payment overdue"
      : headlineStatus === "canceled"
      ? "Subscription cancelled"
      : "Subscription required";

  const subtext =
    headlineStatus === "past_due"
      ? "Your last payment failed. Subscribe to restore full access."
      : "Choose a plan to continue using QuantCase.";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(2px)",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E2E2",
          borderRadius: 12,
          padding: "40px 48px",
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "#0F172B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "#0F172B", marginBottom: 6, letterSpacing: "-0.02em" }}>
            {headline}
          </h2>
          <p style={{ fontSize: 14, color: "#888888", lineHeight: 1.5 }}>{subtext}</p>
        </div>

        {/* Interval toggle */}
        <div
          style={{
            display: "inline-flex",
            border: "1px solid #E2E2E2",
            borderRadius: 999,
            padding: 3,
            marginBottom: 24,
            background: "#F5F5F5",
          }}
        >
          {(["monthly", "annual"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setIntervalToggle(opt)}
              style={{
                padding: "5px 16px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background: interval === opt ? "#0F172B" : "transparent",
                color: interval === opt ? "#fff" : "#888888",
                textTransform: "capitalize",
              }}
            >
              {opt}
              {opt === "annual" && (
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 10,
                    background: "#d1fae5",
                    color: "#065f46",
                    borderRadius: 999,
                    padding: "1px 5px",
                    fontWeight: 600,
                  }}
                >
                  Save 20%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        {fetchingProducts ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#888888", fontSize: 14 }}>
            Loading plans…
          </div>
        ) : visiblePrices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#888888", fontSize: 14 }}>
            No plans available right now.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {visiblePrices.map(({ product, price }) => {
              const isSelected = selectedPriceId === price.price_id;
              return (
                <button
                  key={price.price_id}
                  onClick={() => setSelectedPriceId(price.price_id)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: isSelected ? "2px solid #0F172B" : "1px solid #E2E2E2",
                    background: isSelected ? "#F5F5F5" : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.12s",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0F172B", marginBottom: 2 }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#888888" }}>{price.label || product.description}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172B" }}>
                      {formatAmount(price.amount, price.currency)}
                    </div>
                    <div style={{ fontSize: 11, color: "#888888" }}>/{price.interval}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 13, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading || !selectedPriceId || fetchingProducts}
          style={{
            width: "100%",
            padding: "13px 0",
            background: "#0F172B",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: loading || !selectedPriceId ? "not-allowed" : "pointer",
            opacity: loading || !selectedPriceId ? 0.6 : 1,
            letterSpacing: "0.01em",
            boxShadow: "0 2px 8px rgba(15,23,43,0.25)",
            transition: "opacity 0.15s",
          }}
        >
          {loading ? "Processing…" : "Subscribe now"}
        </button>

        <p style={{ fontSize: 11, color: "rgba(18,18,18,0.40)", textAlign: "center", marginTop: 12 }}>
          Secured by Razorpay · Cancel anytime
        </p>
      </div>
    </div>
  );
}
