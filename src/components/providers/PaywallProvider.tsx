"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/components/providers/UserContext";
import { PaywallDialog } from "@/components/paywall/PaywallOverlay";

function PaywallLogic({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const symbol = searchParams?.get("symbol") || null;
  const { isAccessBlocked, paywallOpen, closePaywall, freeTickersViewed, recordTickerView } = useUser();

  const [paywallTriggered, setPaywallTriggered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPaywallTriggered(localStorage.getItem("qc_paywall_triggered") === "true");
    }
  }, []);

  const effectivelyBlocked = useMemo(() => {
    if (!isAccessBlocked) return false;
    
    // Always allow viewing the 3 unlocked free tickers, even if paywall was triggered
    if (symbol && freeTickersViewed.includes(symbol)) return false;
    
    if (paywallTriggered) return true;

    if (symbol) {
      if (freeTickersViewed.length < 3) return false;
      return true; // 4th distinct ticker -> block
    }

    // Non-ticker page, before 4th ticker attempt
    return false;
  }, [isAccessBlocked, symbol, freeTickersViewed, paywallTriggered]);

  useEffect(() => {
    if (symbol && isAccessBlocked) {
      if (!freeTickersViewed.includes(symbol)) {
        if (freeTickersViewed.length < 3) {
          recordTickerView(symbol);
        } else if (!paywallTriggered) {
          setPaywallTriggered(true);
          localStorage.setItem("qc_paywall_triggered", "true");
        }
      }
    }
  }, [symbol, isAccessBlocked, freeTickersViewed, recordTickerView, paywallTriggered]);

  return (
    <>
      <div style={effectivelyBlocked ? { filter: "blur(4px)", pointerEvents: "none", userSelect: "none" } : undefined}>
        {children}
      </div>
      {/* Hard-block overlay when access is fully blocked */}
      {effectivelyBlocked && <PaywallDialog open={true} onClose={() => {}} hardBlock />}
      {/* Soft dialog when user clicks trial badge */}
      {!effectivelyBlocked && paywallOpen && <PaywallDialog open={paywallOpen} onClose={closePaywall} hardBlock={false} />}
    </>
  );
}

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <PaywallLogic>{children}</PaywallLogic>
    </Suspense>
  );
}
