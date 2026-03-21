"use client";

import { WealthOSSubnav } from "@/components/wealthos/wealthos-subnav";

export default function WealthOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WealthOSSubnav />
      <div className="pt-11">{children}</div>
    </>
  );
}
