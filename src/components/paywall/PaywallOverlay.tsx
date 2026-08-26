"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle2, Zap, Shield, BarChart2, Clock } from "lucide-react";
import type { BillingConfig, BillingProduct } from "@/types/auth";
import { getBillingConfig, getProducts } from "@/lib/billing";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { useUser } from "@/components/providers/UserContext";

interface PaywallDialogProps {
  open: boolean;
  onClose: () => void;
  hardBlock: boolean;
}

const FEATURE_LIST = [
  { icon: BarChart2, text: "AI-powered earnings call analysis" },
  { icon: Shield,   text: "Management quality scoring (MOD)" },
  { icon: Zap,      text: "Real-time stock screener & alerts" },
  { icon: CheckCircle2, text: "Shadow portfolio & wealth tracking" },
];

export function PaywallDialog({ open, onClose, hardBlock }: PaywallDialogProps) {
  const { subscription } = useUser();
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [hasGst, setHasGst] = useState(false);
  const [gstin, setGstin] = useState("");

  // Shared subscribe → open Razorpay → verify → unlock flow (see useRazorpayCheckout).
  // On a verified { status: "active" } we reload so AuthGuard re-fetches /auth/me and
  // refreshes the subscription in UserContext (clearing the paywall).
  const { startCheckout, loading, error, reset } = useRazorpayCheckout({
    onSuccess: () => window.location.reload(),
  });

  useEffect(() => {
    if (!open) return;

    getProducts()
      .then((list) => {
        setProducts(list);
        const firstMonthly = list.flatMap((p) => p.prices).find((pr) => pr.plan_type === "monthly");
        if (firstMonthly) setSelectedPriceId(firstMonthly.id);
      })
      .catch(() => {})
      .finally(() => setFetchingProducts(false));

    getBillingConfig().then(setConfig).catch(() => {});
  }, [open]);

  const allPrices = products.flatMap((product) =>
    product.prices.map((pr) => ({ product, price: pr }))
  );
  // Find one half-yearly (or annual mapped to half-yearly), one quarterly, and one monthly plan to display simultaneously
  const visiblePrices = [
    allPrices.find((p) => p.price.plan_type === "half-yearly" || p.price.plan_type === "annual"),
    allPrices.find((p) => p.price.plan_type === "quarterly" || p.price.plan_type === "quaterly"),
    allPrices.find((p) => p.price.plan_type === "monthly"),
  ].filter(Boolean) as { product: BillingProduct; price: any }[];

  function formatAmount(amount: number, currency: string) {
    if (currency.toLowerCase() === "inr") {
      return `₹${Math.round(amount / 100).toLocaleString("en-IN")}`;
    }
    return `$${Math.round(amount / 100).toFixed(0)}`;
  }

  function handleSubscribe() {
    if (!selectedPriceId) return;
    reset();
    startCheckout(selectedPriceId, undefined, hasGst ? gstin : undefined);
  }

  // --- Derive messaging from subscription status ---
  const status = subscription?.status;
  const daysLeft = subscription?.days_remaining ?? 0;

  const statusConfig = (() => {
    if (status === "trialing" && daysLeft > 0) {
      return {
        badge: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in trial`,
        badgeColor: "var(--qc-warn)",
        badgeBg: "var(--qc-warn-soft)",
        badgeBorder: "var(--qc-warn)",
        icon: Clock,
        iconBg: "var(--qc-warn-soft)",
        iconColor: "var(--qc-warn)",
        headline: "You're on a free trial",
        subtext: `Your trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Subscribe now to keep uninterrupted access to all QuantCase features.`,
        urgency: daysLeft <= 2,
      };
    }
    if (status === "trialing" && daysLeft <= 0) {
      return {
        badge: "Trial ended",
        badgeColor: "var(--qc-down)",
        badgeBg: "var(--qc-down-soft)",
        badgeBorder: "var(--qc-down)",
        icon: Clock,
        iconBg: "var(--qc-down-soft)",
        iconColor: "var(--qc-down)",
        headline: "Your free trial has ended",
        subtext: "Subscribe to a plan to continue using QuantCase and access all research tools.",
        urgency: true,
      };
    }
    if (status === "past_due") {
      return {
        badge: "Payment overdue",
        badgeColor: "var(--qc-down)",
        badgeBg: "var(--qc-down-soft)",
        badgeBorder: "var(--qc-down)",
        icon: Shield,
        iconBg: "var(--qc-down-soft)",
        iconColor: "var(--qc-down)",
        headline: "Payment overdue",
        subtext: "Your last payment failed. Update your subscription to restore full access.",
        urgency: true,
      };
    }
    if (status === "canceled") {
      return {
        badge: "Subscription cancelled",
        badgeColor: "var(--qc-ink-2)",
        badgeBg: "var(--qc-section)",
        badgeBorder: "var(--qc-hair)",
        icon: Shield,
        iconBg: "var(--qc-section)",
        iconColor: "var(--qc-ink-2)",
        headline: "Subscription cancelled",
        subtext: "Re-subscribe to regain access to earnings call analysis, MOD scoring, and your portfolio.",
        urgency: false,
      };
    }
    return {
      badge: "quantcase.",
      badgeColor: "var(--qc-ink-2)",
      badgeBg: "var(--qc-section)",
      badgeBorder: "var(--qc-hair)",
      icon: Shield,
      iconBg: "var(--qc-section)",
      iconColor: "var(--qc-ink-2)",
      headline: "What an analyst costs, without the analyst.",
      subtext: "",
      urgency: false,
    };
  })();

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 43, 0.45)",
        backdropFilter: "blur(3px)",
        padding: "24px",
      }}
      onClick={hardBlock ? undefined : (e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 16,
          maxWidth: 560,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--qc-ink) 0%, var(--qc-ink-2) 100%)" }} />

        {/* Header */}
        <div style={{ padding: "28px 32px 0 32px", position: "relative" }}>
          {!hardBlock && (
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 20,
                right: 24,
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid var(--qc-hair)",
                background: "var(--qc-section)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--qc-ink-3)",
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* Status badge */}
          <div style={{ marginBottom: 16 }}>
            {statusConfig.badge === "quantcase." ? (
              <Image src="/logos/logo-text-dark.png" alt="Quantcase" width={140} height={32} style={{ height: "26px", width: "auto" }} />
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: statusConfig.badgeColor,
                  background: statusConfig.badgeBg,
                  border: `1px solid ${statusConfig.badgeBorder}`,
                  borderRadius: 999,
                  padding: "3px 10px",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: statusConfig.badgeColor,
                    display: "inline-block",
                  }}
                />
                {statusConfig.badge}
              </span>
            )}
          </div>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 500,
              color: "var(--qc-ink)",
              marginBottom: 8,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {statusConfig.headline}
          </h2>
          <p style={{ fontSize: 14, color: "var(--qc-ink-3)", lineHeight: 1.6, marginBottom: statusConfig.headline === "What an analyst costs, without the analyst." ? 0 : 20 }}>
            {statusConfig.subtext}
          </p>

          {statusConfig.headline === "What an analyst costs, without the analyst." && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--qc-ink-3)", fontSize: 14 }}>
                <span>Junior analyst</span>
                <span style={{ textDecoration: "line-through" }}>₹60,000/mo</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--qc-ink-3)", fontSize: 14 }}>
                <span>Bloomberg seat</span>
                <span style={{ textDecoration: "line-through" }}>₹2,00,000/mo</span>
              </div>
            </div>
          )}

          {/* Feature highlights (only in soft/trial mode) */}
          {!hardBlock && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 24,
                padding: "16px",
                background: "var(--qc-section)",
                borderRadius: 10,
                border: "1px solid var(--qc-hair)",
              }}
            >
              {FEATURE_LIST.map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "rgba(15,23,43,0.06)",
                      border: "1px solid rgba(15,23,43,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={12} color="var(--qc-ink)" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--qc-ink-2)", lineHeight: 1.3 }}>{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing section */}
        <div style={{ padding: "0 32px 28px 32px" }}>
          {/* Plan cards */}
          {fetchingProducts ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--qc-ink)",
                      opacity: 0.3 + i * 0.3,
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 13, color: "var(--qc-ink-3)" }}>Loading plans…</p>
            </div>
          ) : visiblePrices.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--qc-ink-3)", fontSize: 14 }}>
              No plans available right now.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {(() => {
                const monthlyPerMonth = visiblePrices.find(p =>
                  p.price.plan_type === "monthly"
                )?.price?.amount ?? null;

                return visiblePrices.map(({ product, price }, idx) => {
                  const isSelected = selectedPriceId === price.id;
                  const isPopular = idx === 0;
                  const isHalfYearly = price.plan_type === "half-yearly" || price.plan_type === "annual";
                  const isQuarterly = price.plan_type === "quarterly" || price.plan_type === "quaterly";

                  let savePct: number | null = null;
                  if (monthlyPerMonth && (isHalfYearly || isQuarterly)) {
                    const planPerMonth = price.amount / (price.interval_months || 1);
                    savePct = Math.round((1 - planPerMonth / monthlyPerMonth) * 100);
                  }

                  return (
                    <button
                      key={price.id}
                      onClick={() => setSelectedPriceId(price.id)}
                      style={{
                        textAlign: "left",
                        padding: "16px 18px",
                        borderRadius: 10,
                        border: isSelected ? "2px solid var(--qc-ink)" : "1.5px solid var(--qc-hair)",
                        background: isSelected ? "var(--qc-section)" : "var(--qc-card)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.12s",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Radio dot */}
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: isSelected ? "5px solid var(--qc-ink)" : "1.5px solid var(--qc-hair)",
                            background: "var(--qc-card)",
                            flexShrink: 0,
                            transition: "all 0.12s",
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
                            {isHalfYearly ? "Semi Annual" : price.plan_type === "monthly" ? "Monthly" : "Quarterly"}
                            {savePct !== null && savePct > 0 && (
                              <span style={{ fontSize: 10, background: "var(--qc-up-soft)", color: "var(--qc-up)", borderRadius: 999, padding: "2px 8px", fontWeight: 700 }}>
                                SAVE {savePct}%
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>
                            {isHalfYearly ? `${formatAmount(price.amount, price.currency)} billed every 6 months` : price.plan_type === "monthly" ? "Cancel any time" : `${formatAmount(price.amount, price.currency)} billed every 3 months`}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 600, color: "var(--qc-ink)", letterSpacing: "-0.02em" }}>
                          {formatAmount(Math.round(price.amount / (price.interval_months || 1)), price.currency)}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>/mo</div>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          )}

          {error && (
            <div
              style={{
                background: "var(--qc-down-soft)",
                border: "1px solid var(--qc-down)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>
            </div>
          )}

          {/* GSTIN Checkbox */}
          <div style={{ marginTop: 24, marginBottom: 16, paddingTop: 16, borderTop: "1px solid var(--qc-hair)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: hasGst ? 12 : 0 }}>
              <input type="checkbox" checked={hasGst} onChange={e => setHasGst(e.target.checked)} style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 13, color: "var(--qc-ink-3)", userSelect: "none" }}>I have a GSTIN (for business billing)</span>
            </label>
            {hasGst && (
              <input
                type="text"
                placeholder="Enter GST Number"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid var(--qc-hair)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 13,
                  outline: "none",
                  background: "var(--qc-card)"
                }}
              />
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleSubscribe}
            disabled={loading || !selectedPriceId || fetchingProducts}
            style={{
              width: "100%",
              padding: "14px 0",
              background: loading || !selectedPriceId ? "var(--qc-ink-3)" : "var(--qc-ink)",
              color: "var(--qc-on-dark)",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading || !selectedPriceId ? "not-allowed" : "pointer",
              letterSpacing: "0.01em",
              boxShadow: loading || !selectedPriceId ? "none" : "0 2px 8px rgba(15,23,43,0.25)",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "var(--qc-on-dark)",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Processing…
              </>
            ) : (
              (statusConfig.headline === "What an analyst costs, without the analyst." ? "Start free week" : "Subscribe now →")
            )}
          </button>

          {statusConfig.headline === "What an analyst costs, without the analyst." ? (
            <p style={{ fontSize: 12, color: "var(--qc-ink-3)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
              No charge for 7 days · Cancel anytime
            </p>
          ) : (
            <p style={{ fontSize: 11, color: "var(--qc-ink-3)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
              Secured by Razorpay &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; No hidden fees
            </p>
          )}
          <p style={{ fontSize: 11, color: "var(--qc-ink-3)", textAlign: "center", marginTop: 4, fontStyle: "italic" }}>
            *Prices shown are exclusive of 18% GST.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/** @deprecated Use PaywallDialog directly */
export function PaywallOverlay() {
  return <PaywallDialog open={true} onClose={() => {}} hardBlock />;
}
