"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InPageNav } from "@/components/molecules/in-page-nav";
import { useScreenerInfo } from "@/hooks/useScreenerInfo";
import { SimilarStocks } from "@/components/molecules/similar-stocks";
import type { InPageNavItem } from "@/components/molecules/in-page-nav";

interface CompanyInfo {
  name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
}

interface ScreenerPageShellProps {
  navItems?: InPageNavItem[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  /** Pass pre-fetched company info to skip the internal useScreenerInfo request */
  companyInfo?: CompanyInfo | null;
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

function ShellInner({ navItems, headerRight, children, companyInfo }: ScreenerPageShellProps) {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  // Only fire the info request when the caller hasn't already supplied company data
  const skip = !!companyInfo;
  const { data: screenerInfo, loading } = useScreenerInfo(skip ? "" : symbol);

  const companyName = companyInfo?.name ?? screenerInfo?.company?.name ?? (loading ? "" : symbol);
  const exchange = companyInfo?.exchange ?? screenerInfo?.company?.exchange ?? "NSE";
  const sector = companyInfo?.sector ?? screenerInfo?.company?.sector;
  const industry = companyInfo?.industry ?? screenerInfo?.company?.industry;

  return (
    <div className="min-h-screen qc-dock-clearance" style={{ background: "var(--qc-bg)" }}>
      {/* Company Header — design-sample style */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4" style={{ padding: "10px 16px 10px" }}>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <h1
            className="text-2xl sm:text-[length:var(--qc-fz-30)]"
            style={{ margin: 0, fontWeight: "var(--qc-w-medium)", letterSpacing: "-0.015em", color: "var(--qc-ink)", lineHeight: 1.2 }}
          >
            {companyName}
          </h1>
          {/* Mobile-only NSE chip next to title */}
          {symbol && (
            <div className="sm:hidden mt-0.5">
              <Chip>
                <span style={{ color: "var(--qc-ink-2)" }}>{exchange}:</span>&nbsp;{symbol}
              </Chip>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {symbol && (
            <div className="hidden sm:block">
              <Chip>
                <span style={{ color: "var(--qc-ink-2)" }}>{exchange}:</span>&nbsp;{symbol}
              </Chip>
            </div>
          )}
          {sector && <div className="hidden sm:block"><Chip>{sector}</Chip></div>}
          {industry && industry !== sector && <div className="hidden sm:block"><Chip>{industry}</Chip></div>}
          {headerRight}
        </div>
      </div>

      {/* In-page section nav */}
      {navItems && navItems.length > 0 && (
        <InPageNav items={navItems} />
      )}

      {/* Page content */}
      <div className="pb-8">{children}</div>

      {/* Similar stocks strip */}
      {symbol && (
        <div className="pb-12">
          <SimilarStocks symbol={symbol} />
        </div>
      )}
    </div>
  );
}

export function ScreenerPageShell({ navItems, headerRight, children, companyInfo }: ScreenerPageShellProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>
          <div className="h-20 px-6 pt-8">
            <div className="h-7 w-64 rounded animate-pulse" style={{ background: "var(--qc-section)" }} />
          </div>
        </div>
      }
    >
      <ShellInner navItems={navItems} headerRight={headerRight} companyInfo={companyInfo}>{children}</ShellInner>
    </Suspense>
  );
}
