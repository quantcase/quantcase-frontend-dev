"use client";

import { useUser } from "@/components/providers/UserContext";
import { PaywallOverlay } from "@/components/paywall/PaywallOverlay";

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const { isAccessBlocked } = useUser();

  return (
    <>
      <div style={isAccessBlocked ? { filter: "blur(4px)", pointerEvents: "none", userSelect: "none" } : undefined}>
        {children}
      </div>
      {isAccessBlocked && <PaywallOverlay />}
    </>
  );
}
