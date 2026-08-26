"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { BillingConfig, BillingProduct } from "@/types/auth";
import { getBillingConfig, getProducts } from "@/lib/billing";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { useUser } from "@/components/providers/UserContext";

const FEATURE_LIST = [
  "AI-powered earnings call analysis",
  "Management quality scoring (MOD)",
  "Real-time stock screener & alerts",
  "Shadow portfolio & wealth tracking",
];

function formatAmount(amount: number, currency: string) {
  if (currency.toLowerCase() === "inr") {
    return `₹${(amount / 100).toLocaleString("en-IN")}`;
  }
  return `$${(amount / 100).toFixed(2)}`;
}

export default function PricingPage() {
  const { subscription } = useUser();
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "quaterly" | "annual">("monthly");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState(true);

  // On a verified { status: "active" }, reload so AuthGuard re-fetches /auth/me and
  // refreshes the subscription in UserContext (clearing any paywall gate).
  const { startCheckout, loading, error, reset } = useRazorpayCheckout({
    onSuccess: () => window.location.reload(),
  });

  useEffect(() => {
    getProducts()
      .then((list) => {
        setProducts(list);
        const firstMonthly = list.flatMap((p) => p.prices).find((pr) => pr.plan_type === "monthly");
        if (firstMonthly) setSelectedPriceId(firstMonthly.id);
      })
      .catch(() => {})
      .finally(() => setFetchingProducts(false));

    getBillingConfig().then(setConfig).catch(() => {});
  }, []);

  const visiblePrices = products.flatMap((product) =>
    product.prices
      .filter((pr) => pr.plan_type === billingInterval || (billingInterval === "quaterly" && pr.plan_type === "quarterly"))
      .map((pr) => ({ product, price: pr })),
  );

  function handleSubscribe() {
    if (!selectedPriceId) return;
    reset();
    startCheckout(selectedPriceId);
  }

  const isActive = subscription?.status === "active";

  return (
    <div className="p-6 space-y-4">
      {/* Test-mode banner — backend-driven */}
      {config?.mode === "test" && (
        <div
          className="text-white text-xs font-semibold text-center py-2 px-4 rounded-[10px]"
          style={{ background: "#0F172B", letterSpacing: "0.02em" }}
        >
          ⚠️ Test Mode — no real money is charged.
        </div>
      )}

      {/* Page header */}
      <div>
        <h2 className="text-[22px] font-medium text-[#0F172B]">Subscription</h2>
        <p className="text-sm text-[#888888]">
          {isActive
            ? `You're on the ${subscription?.plan_name ?? "Pro"} plan.`
            : "Choose a plan to unlock the full QuantCase research platform."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Plans column */}
        <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
          <div className="px-2 pt-1 pb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#0F172B] uppercase tracking-[0.01em]">
              Choose a plan
            </div>

            {/* Monthly / quarterly / annual toggle */}
            <div
              className="inline-flex rounded-full p-[3px] bg-white border border-[#E2E2E2]"
            >
              {(["monthly", "quaterly", "annual"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBillingInterval(opt)}
                  className="px-4 py-[5px] rounded-full text-xs font-medium capitalize flex items-center gap-1.5 transition-colors"
                  style={{
                    background: billingInterval === opt ? "#0F172B" : "transparent",
                    color: billingInterval === opt ? "#fff" : "#888888",
                  }}
                >
                  {opt === "quaterly" ? "quarterly" : opt}
                  {opt === "annual" && (
                    <span
                      className="text-[9px] font-bold rounded-full px-1.5 py-[1px] tracking-[0.02em]"
                      style={{
                        background: billingInterval === "annual" ? "rgba(255,255,255,0.2)" : "#d1fae5",
                        color: billingInterval === "annual" ? "#fff" : "#065f46",
                      }}
                    >
                      SAVE 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
            {fetchingProducts ? (
              <div className="py-8 text-center text-sm text-[#888888]">Loading plans…</div>
            ) : visiblePrices.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#888888]">
                No plans available right now.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {visiblePrices.map(({ product, price }, idx) => {
                  const isSelected = selectedPriceId === price.id;
                  const isPopular = idx === 0;
                  return (
                    <button
                      key={price.id}
                      onClick={() => setSelectedPriceId(price.id)}
                      className="text-left rounded-[10px] px-[18px] py-4 flex justify-between items-center transition-all relative"
                      style={{
                        border: isSelected ? "2px solid #0F172B" : "1.5px solid #E2E2E2",
                        background: isSelected ? "#F5F5F5" : "#fff",
                      }}
                    >
                      {isPopular && (
                        <span
                          className="absolute -top-[10px] left-[14px] text-[9px] font-bold rounded-full px-2 py-[2px] tracking-[0.06em] uppercase text-white"
                          style={{ background: "#0F172B" }}
                        >
                          Most popular
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full bg-white shrink-0 transition-all"
                          style={{ border: isSelected ? "5px solid #0F172B" : "1.5px solid #D1D5DB" }}
                        />
                        <div>
                          <div className="text-sm font-medium text-[#0F172B] mb-0.5">
                            {product.name}
                          </div>
                          <div className="text-xs text-[#888888]">{product.description}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-semibold text-[#0F172B] tracking-[-0.02em]">
                          {formatAmount(Math.round(price.amount / (price.interval_months || 1)), price.currency)}
                        </div>
                        <div className="text-[11px] text-[#888888]">/month</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg px-3.5 py-2.5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <p className="text-[13px] text-[#dc2626]" role="alert">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading || !selectedPriceId || fetchingProducts || isActive}
              className="mt-4 w-full py-3.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading || !selectedPriceId || isActive ? "#94a3b8" : "#0F172B",
                cursor: loading || !selectedPriceId || isActive ? "not-allowed" : "pointer",
                boxShadow: loading || !selectedPriceId || isActive ? "none" : "0 2px 8px rgba(15,23,43,0.25)",
                letterSpacing: "0.01em",
              }}
            >
              {isActive ? (
                "Current plan"
              ) : loading ? (
                <>
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full"
                    style={{
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                  Processing…
                </>
              ) : (
                "Subscribe now →"
              )}
            </button>

            <p className="text-[11px] text-center mt-3 leading-relaxed" style={{ color: "rgba(18,18,18,0.35)" }}>
              Secured by Razorpay &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; No hidden fees
            </p>
            <p className="text-[11px] text-center mt-1 leading-relaxed text-[#888888]">
              *Prices shown are exclusive of 18% GST.
            </p>
          </div>
        </div>

        {/* What's included */}
        <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 h-fit">
          <div className="px-2 pt-1 pb-3 text-sm font-semibold text-[#0F172B] uppercase tracking-[0.01em]">
            What&apos;s included
          </div>
          <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 flex flex-col gap-3">
            {FEATURE_LIST.map((text) => (
              <div key={text} className="flex items-start gap-2.5">
                <div
                  className="w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(15,23,43,0.06)", border: "1px solid rgba(15,23,43,0.08)" }}
                >
                  <Check size={12} color="#0F172B" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-[#444]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
