"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSubscribeOrder, verifyPayment } from "@/lib/billing";
import type { VerifyResponse } from "@/types/auth";

/** Namespaced console logging so the whole checkout flow is traceable in DevTools. */
// Hex kept intentionally: these are console `%c` style strings — the DevTools console cannot resolve CSS var() tokens.
const log = (msg: string, data?: unknown) =>
  data === undefined
    ? console.log(`%c[razorpay]%c ${msg}`, "color:#0F172B;font-weight:600", "color:inherit")
    : console.log(`%c[razorpay]%c ${msg}`, "color:#0F172B;font-weight:600", "color:inherit", data);
const logErr = (msg: string, data?: unknown) =>
  console.error(`%c[razorpay]%c ${msg}`, "color:#dc2626;font-weight:600", "color:inherit", data ?? "");

/**
 * Drives the Razorpay Standard Checkout flow, shared by the paywall modal and the
 * standalone pricing page:
 *   1. POST /api/billing/subscribe → Razorpay order + publishable key + prefill
 *   2. new window.Razorpay(options).open() (handler-function flow, NOT callback_url)
 *   3. handler → POST /api/billing/verify (MANDATORY server-side verification)
 *   4. onSuccess only fires on { status: "active" }; unlock (reload) is the caller's job
 *
 * The webhook confirms every payment server-side as a backstop, so even if the browser
 * closes mid-verify the subscription still activates. Never unlock without a passing /verify.
 *
 * Mirrors the step-state + unmount-guard convention of useSmallcaseConnect.
 */

export type CheckoutStep =
  | "idle"
  | "creating"   // POST /subscribe
  | "checkout"   // Razorpay modal is open
  | "verifying"  // POST /verify
  | "done"
  | "error";

interface UseRazorpayCheckoutOptions {
  /** Fired after /verify returns { status: "active" }. Typically triggers an unlock/reload. */
  onSuccess?: (result: VerifyResponse) => void;
}

export function useRazorpayCheckout({ onSuccess }: UseRazorpayCheckoutOptions = {}) {
  const [step, setStep] = useState<CheckoutStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fail = useCallback((message: string) => {
    logErr("flow failed:", message);
    if (!mountedRef.current) return;
    setError(message);
    setStep("error");
  }, []);

  const startCheckout = useCallback(
    async (priceId: string, couponCode?: string) => {
      setError(null);
      setStep("creating");
      log("startCheckout →", { priceId, couponCode: couponCode ?? null });

      let order;
      try {
        order = await createSubscribeOrder(priceId, couponCode);
        log("/subscribe response", order);
      } catch (e) {
        logErr("/subscribe threw", e);
        fail(e instanceof Error ? e.message : "Failed to create order. Please try again.");
        return;
      }

      if (!mountedRef.current) return;

      if (typeof window === "undefined" || !window.Razorpay) {
        fail("Payment system not loaded. Please refresh and try again.");
        return;
      }

      // Validate the backend response shape BEFORE handing it to the SDK — a missing
      // subscription id or key is the most common cause of a 400 from api.razorpay.com.
      const missing: string[] = [];
      if (!order.razorpay_subscription_id) missing.push("razorpay_subscription_id");
      if (!order.razorpay_key_id) missing.push("razorpay_key_id");
      if (missing.length) {
        logErr("backend /subscribe is missing required fields", { missing, order });
        fail(
          `Order response is missing ${missing.join(", ")}. This is a backend issue — check the /api/billing/subscribe response.`,
        );
        return;
      }

      // Razorpay treats order_id and subscription_id as MUTUALLY EXCLUSIVE. This is a
      // subscription flow — passing both causes a 400 from api.razorpay.com.
      // Send ONLY subscription_id.
      const options = {
        key: order.razorpay_key_id, // always from backend — never hardcoded
        name: "QuantCase",
        description: "QuantCase Pro subscription",
        subscription_id: order.razorpay_subscription_id,
        prefill: order.prefill,
        // Hex kept intentionally: passed to Razorpay's external SDK, which cannot resolve CSS var() tokens.
        theme: { color: "#0F172B" },

        // On success Razorpay calls this — verify server-side before unlocking.
        handler: async (res: {
          razorpay_payment_id: string;
          razorpay_subscription_id?: string;
          razorpay_signature: string;
        }) => {
          log("checkout handler fired (payment captured client-side)", res);
          if (!mountedRef.current) return;
          setStep("verifying");
          try {
            const result = await verifyPayment({
              razorpay_subscription_id: res.razorpay_subscription_id ?? order.razorpay_subscription_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });
            log("/verify response", result);
            if (!mountedRef.current) return;
            if (result.status === "active" || result.status === "trialing") {
              log("subscription active/trialing — firing onSuccess");
              setStep("done");
              onSuccess?.(result);
            } else {
              fail(`Payment could not be verified (status: "${result.status}"). Please contact support.`);
            }
          } catch (e) {
            // Do NOT unlock on a failed verify. The webhook still activates server-side.
            logErr("/verify threw", e);
            fail(e instanceof Error ? e.message : "Payment verification failed.");
          }
        },

        modal: {
          ondismiss: () => {
            log("checkout modal dismissed by user");
            if (!mountedRef.current) return;
            // User closed the checkout without paying — return to idle so they can retry.
            setStep((s) => (s === "checkout" ? "idle" : s));
          },
        },
      };

      log("opening Razorpay with options", options);

      let rzp;
      try {
        rzp = new window.Razorpay(options);
      } catch (e) {
        logErr("new window.Razorpay(...) threw", e);
        fail(e instanceof Error ? e.message : "Could not initialise checkout.");
        return;
      }

      rzp.on("payment.failed", (r) => {
        // Log the FULL failure payload — Razorpay puts the real reason in error.*
        logErr("payment.failed event", r);
        const err = r?.error;
        const detail =
          err?.description ||
          err?.reason ||
          [err?.code, err?.step, err?.source].filter(Boolean).join(" / ") ||
          "Payment failed. Please try again.";
        fail(detail);
      });

      setStep("checkout");
      rzp.open();
    },
    [fail, onSuccess],
  );

  const reset = useCallback(() => {
    setError(null);
    setStep("idle");
  }, []);

  const loading = step === "creating" || step === "checkout" || step === "verifying";

  return { step, error, loading, startCheckout, reset };
}
