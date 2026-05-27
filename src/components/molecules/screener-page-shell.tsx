"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InPageNav } from "@/components/molecules/in-page-nav";
import { useScreenerInfo } from "@/hooks/useScreenerInfo";
import type { InPageNavItem } from "@/components/molecules/in-page-nav";

interface ScreenerPageShellProps {
  navItems?: InPageNavItem[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

/* Design-sample chip: .chip style — rounded-full, warm bg, border, small text */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-[10px] py-1 text-[11.5px] font-medium"
      style={{
        background: "var(--qc-chip, #F2F1EC)",
        border: "1px solid var(--qc-hair, #E9E7E1)",
        color: "var(--qc-ink-2)",
      }}
    >
      {children}
    </span>
  );
}

function ShellInner({ navItems, headerRight, children }: ScreenerPageShellProps) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  const { data: screenerInfo, loading } = useScreenerInfo(symbol);

  const companyName = screenerInfo?.company?.name ?? (loading ? "" : symbol);
  const exchange = screenerInfo?.company?.exchange ?? "NSE";
  const sector = screenerInfo?.company?.sector;
  const industry = screenerInfo?.company?.industry;

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-card)" }}>
      {/* Company Header — design-sample style */}
      <div className="flex items-start justify-between gap-4" style={{ padding: "12px 24px 10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h1
            style={{ margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--qc-ink)", lineHeight: 1.2 }}
          >
            {companyName}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {symbol && (
              <Chip>
                <span style={{ color: "var(--qc-ink-2)" }}>{exchange}:</span>&nbsp;{symbol}
              </Chip>
            )}
            {sector && <Chip>{sector}</Chip>}
            {industry && industry !== sector && <Chip>{industry}</Chip>}
          </div>
        </div>
        {headerRight && <div className="flex items-center gap-3 pt-1">{headerRight}</div>}
      </div>

      {/* In-page section nav */}
      {navItems && navItems.length > 0 && (
        <InPageNav items={navItems} />
      )}

      {/* Page content */}
      <div className="mb-8">{children}</div>
    </div>
  );
}

export function ScreenerPageShell({ navItems, headerRight, children }: ScreenerPageShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: "var(--qc-card)" }}>
          <div className="h-20 px-6 pt-8">
            <div className="h-7 w-64 rounded animate-pulse" style={{ background: "var(--qc-section)" }} />
          </div>
        </div>
      }
    >
      <ShellInner navItems={navItems} headerRight={headerRight}>{children}</ShellInner>
    </Suspense>
  );
}
