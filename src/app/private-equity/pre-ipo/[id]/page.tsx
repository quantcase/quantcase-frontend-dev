"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, AlertCircle, Building2, CalendarDays, Loader2,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import type { DrhpApiResponse, DrhpRecord, DrhpRedFlagsAndRisks, DrhpInsight } from "@/types/drhp";
import { VerdictBadge } from "@/components/drhp/verdict-badge";
import { OfsDonut } from "@/components/drhp/ofs-donut";
import { RiskCard } from "@/components/drhp/risk-card";
import { ProceedsTable } from "@/components/drhp/proceeds-table";
import { ShareholderGrid } from "@/components/drhp/shareholder-grid";
import { MetricTile } from "@/components/molecules/metric-tile";
import { SectionPanel } from "@/components/molecules/section-panel";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = ["Verdict", "Red Flags", "Pricing"] as const;
type Tab = (typeof TABS)[number];

// ─── Hero header ──────────────────────────────────────────────────────────────

function HeroHeader({ insight }: { insight: DrhpInsight }) {
  const { heroHeader, quickVerdict } = insight.core;
  const { ofsVsFreshSplit } = quickVerdict;
  const totalIssue = heroHeader.totalIssueSizeCr > 0
    ? heroHeader.totalIssueSizeCr
    : ofsVsFreshSplit.freshIssueCr + ofsVsFreshSplit.ofsCr;

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
      <div className="px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[#E2E2E2]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#90A1B9" }}>
              IPO Filing
            </span>
            {totalIssue > 0 && (
              <span className="text-[10px]" style={{ color: "#888888" }}>
                ₹{totalIssue.toLocaleString("en-IN")} Cr Issue
              </span>
            )}
          </div>

          <h1 className="text-[28px] font-medium leading-tight" style={{ color: "#0F172B" }}>
            {heroHeader.companyName}
          </h1>
          <p className="text-[13px] mt-1.5 max-w-xl leading-relaxed" style={{ color: "#888888" }}>
            {heroHeader.companyDescription}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <VerdictBadge verdict={quickVerdict.verdict} size="md" />
            {heroHeader.listingGainPotential && (
              <span className="text-[12px]" style={{ color: "#888888" }}>
                Listing Gain: <span style={{ color: "#121212" }}>{heroHeader.listingGainPotential}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-[280px] flex-shrink-0">
          {totalIssue > 0 && (
            <MetricTile label="Total Issue Size" value={`₹${totalIssue.toLocaleString("en-IN")} Cr`} />
          )}
          {ofsVsFreshSplit.ofsPct > 0 && (
            <MetricTile
              label="OFS Ratio"
              value={`${ofsVsFreshSplit.ofsPct.toFixed(1)}%`}
              change={ofsVsFreshSplit.ofsHeavyFlag ? "▲ OFS-heavy" : undefined}
            />
          )}
          {ofsVsFreshSplit.freshIssueCr > 0 && (
            <MetricTile label="Fresh Issue" value={`₹${ofsVsFreshSplit.freshIssueCr.toLocaleString("en-IN")} Cr`} />
          )}
          {heroHeader.nineMonthRevenueCr > 0 && (
            <MetricTile label="9M Revenue" value={`₹${heroHeader.nineMonthRevenueCr.toLocaleString("en-IN")} Cr`} />
          )}
          {heroHeader.adjEbitdaMarginPct > 0 && (
            <MetricTile label="Adj. EBITDA Margin" value={`${heroHeader.adjEbitdaMarginPct}%`} />
          )}
        </div>
      </div>

      {heroHeader.issueDate && (
        <div className="px-6 py-2.5 flex items-center gap-4" style={{ background: "#F5F5F5" }}>
          <CalendarDays className="size-3.5" style={{ color: "#888888" }} />
          <span className="text-[11px]" style={{ color: "#888888" }}>{heroHeader.issueDate}</span>
        </div>
      )}
    </div>
  );
}

// ─── Verdict tab ──────────────────────────────────────────────────────────────

function VerdictTab({ insight }: { insight: DrhpInsight }) {
  const { quickVerdict } = insight.core;
  const { ofsVsFreshSplit } = quickVerdict;
  const shareholders = insight.analysis.sellingShareholdersList;

  return (
    <div className="flex flex-col gap-4">
      <SectionPanel
        title={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>01</span>
            <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>Quick Verdict</span>
          </div>
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
          {ofsVsFreshSplit.ofsCr > 0 && (
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Issue Split</p>
              <OfsDonut
                ofsCr={ofsVsFreshSplit.ofsCr}
                freshIssueCr={ofsVsFreshSplit.freshIssueCr}
                ofsPct={ofsVsFreshSplit.ofsPct}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {quickVerdict.verdictHeadline && (
              <h3 className="text-[16px] font-medium mb-3 leading-snug" style={{ color: "#0F172B" }}>
                {quickVerdict.verdictHeadline}
              </h3>
            )}
            <ul className="flex flex-col gap-2">
              {quickVerdict.verdictBullets.slice(0, 8).map((bullet, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="mt-1.5 size-1.5 rounded-full flex-shrink-0 bg-red-500" />
                  <span className="text-[13px] leading-relaxed" style={{ color: "#121212" }}>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionPanel>

      {shareholders.length > 0 && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>02</span>
              <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>Selling Shareholders</span>
            </div>
          }
        >
          <ShareholderGrid shareholders={shareholders} />
        </SectionPanel>
      )}
    </div>
  );
}

// ─── Red Flags tab ────────────────────────────────────────────────────────────

type RiskFilter = "all" | "critical" | "caution" | "watch";

function RedFlagsTab({ risks }: { risks: DrhpRedFlagsAndRisks }) {
  const [filter, setFilter] = useState<RiskFilter>("all");

  const counts = {
    all: risks.critical.length + risks.caution.length + risks.watch.length,
    critical: risks.critical.length,
    caution: risks.caution.length,
    watch: risks.watch.length,
  };

  const filters: { key: RiskFilter; label: string; color: string }[] = [
    { key: "all",      label: "All Flags",  color: "#0F172B" },
    { key: "critical", label: "Critical",   color: "#dc2626" },
    { key: "caution",  label: "Caution",    color: "#d97706" },
    { key: "watch",    label: "Watch",      color: "#ca8a04" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionPanel
        title={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>03</span>
            <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>Risk Register by Severity</span>
          </div>
        }
        headerAction={
          <div className="flex items-center gap-1 rounded-full border border-[#E2E2E2] p-0.5">
            {filters.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                style={filter === key
                  ? { background: "#0F172B", color: "#FFFFFF" }
                  : { color: "#888888" }
                }
              >
                {filter !== key && <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
                {label}
                <span className="ml-0.5 opacity-60">{counts[key]}</span>
              </button>
            ))}
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          {(filter === "all" || filter === "critical") && risks.critical.map((item, i) => (
            <RiskCard key={`c-${i}`} item={item} tier="critical" />
          ))}
          {(filter === "all" || filter === "caution") && risks.caution.map((item, i) => (
            <RiskCard key={`ca-${i}`} item={item} tier="caution" />
          ))}
          {(filter === "all" || filter === "watch") && risks.watch.map((item, i) => (
            <RiskCard key={`w-${i}`} item={item} tier="watch" />
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}

// ─── Pricing tab ──────────────────────────────────────────────────────────────

function PricingTab({ insight }: { insight: DrhpInsight }) {
  const pricing = insight.analysis.ipoPricingAssessment;
  const { quickVerdict } = insight.core;

  return (
    <div className="flex flex-col gap-4">
      {(pricing.ofsCr > 0 || quickVerdict.ofsVsFreshSplit.ofsCr > 0) && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>05</span>
              <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>IPO Pricing Assessment</span>
            </div>
          }
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Issue Split</p>
              <OfsDonut
                ofsCr={pricing.ofsCr || quickVerdict.ofsVsFreshSplit.ofsCr}
                freshIssueCr={pricing.freshIssueCr || quickVerdict.ofsVsFreshSplit.freshIssueCr}
                ofsPct={pricing.ofsPct || quickVerdict.ofsVsFreshSplit.ofsPct}
              />
            </div>
            {pricing.priceBandLower && pricing.priceBandUpper && (
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#888888" }}>Price Band</p>
                <p className="text-[22px] font-semibold" style={{ color: "#0F172B" }}>
                  ₹{pricing.priceBandLower} – ₹{pricing.priceBandUpper}
                </p>
              </div>
            )}
          </div>
        </SectionPanel>
      )}

      {pricing.useOfProceedsBreakdown.length > 0 && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>05B</span>
              <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>Use of Proceeds</span>
            </div>
          }
        >
          <ProceedsTable breakdown={pricing.useOfProceedsBreakdown} />
        </SectionPanel>
      )}

      {pricing.useOfProceedsRedFlags.length > 0 && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>05C</span>
              <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>Proceeds Red Flags</span>
            </div>
          }
        >
          <ul className="flex flex-col gap-2">
            {pricing.useOfProceedsRedFlags.map((flag, i) => (
              <li key={i} className="flex gap-2.5 items-start rounded-[6px] border border-[#E2E2E2] px-3 py-2.5" style={{ background: "#FAFAFA" }}>
                <AlertCircle className="size-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-[12px] leading-relaxed" style={{ color: "#121212" }}>{flag}</span>
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}

      {pricing.anchorInvestorQuality && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "#F5F5F5", color: "#888888" }}>05D</span>
              <span className="text-[14px] font-semibold" style={{ color: "#0F172B" }}>Anchor Investor Quality</span>
            </div>
          }
        >
          <p className="text-[13px] leading-relaxed" style={{ color: "#121212" }}>{pricing.anchorInvestorQuality}</p>
        </SectionPanel>
      )}
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function PreIpoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [record, setRecord] = useState<DrhpRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Verdict");

  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/private-equity/drhp-analyses?id=${id}`)
      .then((r) => r.json())
      .then((json: DrhpApiResponse) => {
        if (!json.success) throw new Error(json.message ?? "Failed to load analysis");
        setRecord(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const insight = record?.insight;
  const companyName = insight?.core.heroHeader.companyName;
  const redFlagCount = insight
    ? insight.core.redFlagsAndRisks.critical.length
      + insight.core.redFlagsAndRisks.caution.length
      + insight.core.redFlagsAndRisks.watch.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-zinc-900 text-white text-xs font-semibold text-center py-2 px-4 sticky top-0 z-10">
        CONFIDENTIAL — For authorised use only
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <button
          onClick={() => router.push("/private-equity/pre-ipo")}
          className="flex items-center gap-1.5 text-[12px] mb-6 transition-opacity hover:opacity-60"
          style={{ color: "#888888" }}
        >
          <ArrowLeft className="size-3.5" />
          All analyses
        </button>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin" style={{ color: "#888888" }} />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="size-4 text-red-600 flex-shrink-0" />
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}

        {!loading && insight && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-4" style={{ color: "#888888" }} />
                <span className="text-[13px] font-medium" style={{ color: "#0F172B" }}>
                  {companyName || "DRHP Analysis"}
                </span>
              </div>
              <button
                onClick={() => router.push("/private-equity/pre-ipo")}
                className="text-[12px] transition-opacity hover:opacity-60"
                style={{ color: "#888888" }}
              >
                Analyse another
              </button>
            </div>

            <HeroHeader insight={insight} />

            <div className="flex items-center gap-1 rounded-full border border-[#E2E2E2] bg-[#F5F5F5] p-1 self-start">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={activeTab === tab
                    ? { background: "#0F172B", color: "#FFFFFF" }
                    : { color: "#888888" }
                  }
                >
                  {tab}
                  {tab === "Red Flags" && (
                    <span className="ml-1.5 text-[10px] opacity-60">{redFlagCount}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "Verdict"   && <VerdictTab insight={insight} />}
            {activeTab === "Red Flags" && <RedFlagsTab risks={insight.core.redFlagsAndRisks} />}
            {activeTab === "Pricing"   && <PricingTab insight={insight} />}
          </div>
        )}
      </div>
    </div>
  );
}
