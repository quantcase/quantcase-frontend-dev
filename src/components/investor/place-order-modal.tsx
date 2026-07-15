"use client";

import { useEffect, useState } from "react";
import { useSmallcaseOrders, type PlaceStep } from "@/hooks/useSmallcaseOrders";
import type { SmallcaseOrderType } from "@/types/smallcase";

interface PlaceOrderModalProps {
  open: boolean;
  onClose: () => void;
  /** Stock symbol — sent as `scid`; the backend maps ticker → smallcase scid. */
  ticker: string;
  onPlaced?: () => void;
}

const ORDER_TYPES: { value: SmallcaseOrderType; label: string; hint: string }[] = [
  { value: "buy",  label: "Buy",  hint: "Add to your holdings" },
  { value: "sell", label: "Sell", hint: "Reduce your position" },
];

function stepLabel(step: PlaceStep): { title: string; sub: string } {
  switch (step) {
    case "creating":     return { title: "Preparing order…", sub: "Creating a secure transaction via smallcase Gateway." };
    case "awaiting_sdk": return { title: "Confirm with your broker…", sub: "Complete the order in the broker window." };
    case "tracking":     return { title: "Placing your order…", sub: "Waiting for your broker to confirm execution." };
    default:             return { title: "Working…", sub: "" };
  }
}

export function PlaceOrderModal({ open, onClose, ticker, onPlaced }: PlaceOrderModalProps) {
  const { placeOrder, placeStep, placeError, resetPlace } = useSmallcaseOrders({
    onPlaced: () => onPlaced?.(),
  });

  const [type, setType] = useState<SmallcaseOrderType>("buy");
  const [amount, setAmount] = useState("");

  // Close shortly after a successful placement.
  useEffect(() => {
    if (placeStep !== "done") return;
    const t = setTimeout(() => handleClose(), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeStep]);

  if (!open) return null;

  function handleClose() {
    resetPlace();
    setAmount("");
    setType("buy");
    onClose();
  }

  function handleSubmit() {
    const parsed = amount.trim() ? Number(amount) : undefined;
    placeOrder({
      type,
      scid: ticker,
      smallcase_name: ticker,
      ...(parsed && !Number.isNaN(parsed) ? { amount: parsed } : {}),
    });
  }

  const inProgress = placeStep === "creating" || placeStep === "awaiting_sdk" || placeStep === "tracking";
  const done = placeStep === "done";
  const errored = placeStep === "error";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={inProgress ? undefined : handleClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,43,0.50)", zIndex: 1000, backdropFilter: "blur(3px)", cursor: inProgress ? "default" : "pointer" }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "var(--qc-card)", borderRadius: 18, width: 440, maxWidth: "calc(100vw - 32px)",
          zIndex: 1001, boxShadow: "0 24px 80px rgba(15,23,43,0.20)", overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div style={{ background: "linear-gradient(135deg, var(--qc-ink) 0%, #1e3a5f 100%)", padding: "24px 26px 22px", position: "relative" }}>
          {!inProgress && (
            <button
              onClick={handleClose}
              style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.70)", fontSize: 16, lineHeight: 1 }}
              aria-label="Close"
            >
              ×
            </button>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 20, padding: "4px 10px", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: "var(--qc-font-sans)", letterSpacing: "0.04em" }}>
              Powered by smallcase Gateway
            </span>
          </div>

          {done ? (
            <>
              <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
              <h2 style={{ fontSize: 19, fontWeight: 500, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif)", margin: 0 }}>Order placed</h2>
            </>
          ) : errored ? (
            <>
              <h2 style={{ fontSize: 19, fontWeight: 500, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif)", margin: "0 0 6px" }}>Order failed</h2>
              <p style={{ fontSize: 13, color: "rgba(255,100,100,0.85)", fontFamily: "var(--qc-font-sans)", margin: 0 }}>
                {placeError || "Something went wrong. Please try again."}
              </p>
            </>
          ) : inProgress ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Spinner />
                <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif)", margin: 0 }}>
                  {stepLabel(placeStep).title}
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--qc-font-sans)", margin: 0 }}>
                {stepLabel(placeStep).sub}
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 500, color: "var(--qc-on-dark)", fontFamily: "var(--qc-font-serif)", margin: 0 }}>
                Trade {ticker}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--qc-font-sans)", margin: "6px 0 0" }}>
                Orders execute through your connected broker.
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px 24px" }}>
          {placeStep === "idle" && (
            <>
              {/* Buy / Sell toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {ORDER_TYPES.map((t) => {
                  const active = type === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      style={{
                        borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                        border: active ? "1.5px solid var(--qc-ink)" : "1px solid var(--qc-hair)",
                        background: active ? "rgba(15,23,43,0.03)" : "var(--qc-card)",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)" }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)", marginTop: 2 }}>{t.hint}</div>
                    </button>
                  );
                })}
              </div>

              {/* Amount (optional) */}
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--qc-ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontFamily: "var(--qc-font-sans)" }}>
                Amount (optional)
              </label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--qc-hair)", borderRadius: 10, padding: "0 12px", marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-mono)" }}>₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Leave blank to choose in broker"
                  style={{ flex: 1, border: "none", outline: "none", padding: "12px 8px", fontSize: 14, fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", background: "transparent" }}
                />
              </div>

              <button
                onClick={handleSubmit}
                style={{ width: "100%", background: "var(--qc-ink)", color: "var(--qc-on-dark)", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 600, fontFamily: "var(--qc-font-sans)", cursor: "pointer", letterSpacing: "0.01em" }}
              >
                Continue to broker
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)", margin: "12px 0 0" }}>
                You&apos;ll confirm the final order in your broker&apos;s window.
              </p>
            </>
          )}

          {inProgress && (
            <div style={{ textAlign: "center", padding: "10px 0 6px", color: "var(--qc-ink-3)", fontSize: 13, fontFamily: "var(--qc-font-sans)" }}>
              Please wait, do not close this window…
            </div>
          )}

          {errored && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              <button onClick={resetPlace} style={{ width: "100%", background: "var(--qc-ink)", color: "var(--qc-on-dark)", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 600, fontFamily: "var(--qc-font-sans)", cursor: "pointer" }}>
                Try again
              </button>
              <button onClick={handleClose} style={{ width: "100%", background: "var(--qc-card)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 500, fontFamily: "var(--qc-font-sans)", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          )}

          {done && (
            <div style={{ textAlign: "center", padding: "10px 0 6px", color: "var(--qc-ink-3)", fontSize: 13, fontFamily: "var(--qc-font-sans)" }}>
              Track its status in your orders.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--qc-on-dark)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
