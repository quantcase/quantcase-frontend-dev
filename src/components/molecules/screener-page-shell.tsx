"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { InPageNav } from "@/components/molecules/in-page-nav";
import { useScreenerInfo } from "@/hooks/useScreenerInfo";
import type { InPageNavItem } from "@/components/molecules/in-page-nav";

interface ScreenerPageShellProps {
  navItems?: InPageNavItem[];
  children: React.ReactNode;
}

function ShellInner({ navItems, children }: ScreenerPageShellProps) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  const { data: screenerInfo, loading } = useScreenerInfo(symbol);

  const companyName = screenerInfo?.company?.name ?? (loading ? "" : symbol);
  const exchange = screenerInfo?.company?.exchange ?? "NSE";
  const sector = screenerInfo?.company?.sector;
  const industry = screenerInfo?.company?.industry;

  return (
    <div className="min-h-screen bg-white">
      {/* Company Header */}
      <div className="flex items-center justify-between gap-4 pt-4 pb-4 px-4">
        <div className="space-y-1">
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "#0F172B", lineHeight: 1.2 }}>
            {companyName}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {symbol && (
              <Badge>
                {exchange}: {symbol}
              </Badge>
            )}
            {sector && <Badge>{sector}</Badge>}
            {industry && industry !== sector && <Badge>{industry}</Badge>}
          </div>
        </div>
      </div>

      {/* In-page section nav (optional) */}
      {navItems && navItems.length > 0 && (
        <InPageNav items={navItems} />
      )}

      {/* Page content */}
      <div className="mb-8">{children}</div>
    </div>
  );
}

export function ScreenerPageShell({ navItems, children }: ScreenerPageShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="h-20 px-4 pt-8">
            <div className="h-6 w-48 rounded bg-zinc-100 animate-pulse" />
          </div>
        </div>
      }
    >
      <ShellInner navItems={navItems}>{children}</ShellInner>
    </Suspense>
  );
}
