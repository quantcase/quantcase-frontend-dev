"use client";

import { useUser } from "@/components/providers/UserContext";
import { PaywallDialog } from "@/components/paywall/PaywallOverlay";

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const { isAccessBlocked, paywallOpen, closePaywall } = useUser();

  return (
    <>
      <div style={isAccessBlocked ? { filter: "blur(4px)", pointerEvents: "none", userSelect: "none" } : undefined}>
        {children}
      </div>
      {/* Hard-block overlay when access is fully blocked */}
      {isAccessBlocked && <PaywallDialog open={true} onClose={() => {}} hardBlock />}
      {/* Soft dialog when user clicks trial badge */}
      {!isAccessBlocked && paywallOpen && <PaywallDialog open={paywallOpen} onClose={closePaywall} hardBlock={false} />}
    </>
  );
}
