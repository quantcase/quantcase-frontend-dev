"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, AlertCircle, Building2, CalendarDays, Loader2,
  AlertTriangle, Eye,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import type {
  DrhpApiResponse, DrhpRecord, DrhpRedFlagsAndRisks, DrhpInsight,
  DrhpIntelligenceData, DrhpIntelligenceFlag,
} from "@/types/drhp";
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

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY = {
  high:   { Icon: AlertTriangle, color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "var(--qc-down-soft)" },
  medium: { Icon: AlertCircle,   color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "var(--qc-warn-soft)" },
  low:    { Icon: Eye,           color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "var(--qc-warn-soft)" },
} as const;

// ─── Hero header ──────────────────────────────────────────────────────────────

function HeroHeader({ insight, intel }: { insight: DrhpInsight; intel: DrhpIntelligenceData }) {
  const { heroHeader, quickVerdict } = insight.core;
  const totalIssue = intel.total_issue_size_cr || heroHeader.totalIssueSizeCr;
  const ofsPct = intel.ofs_ratio_pct || quickVerdict.ofsVsFreshSplit.ofsPct;

  return (
    <div className="rounded-[10px] border border-[var(--qc-hair)] bg-white overflow-hidden">
      <div className="px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-[var(--qc-hair)]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>
              IPO Filing
            </span>
            {totalIssue > 0 && (
              <span className="text-[10px]" style={{ color: "var(--qc-ink-2)" }}>
                ₹{totalIssue.toLocaleString("en-IN")} Cr Issue
              </span>
            )}
          </div>

          <h1 className="text-[28px] font-medium leading-tight" style={{ color: "var(--qc-ink)" }}>
            {heroHeader.companyName}
          </h1>
          <p className="text-[13px] mt-1.5 max-w-xl leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
            {heroHeader.companyDescription}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <VerdictBadge verdict={quickVerdict.verdict} size="md" />
            {heroHeader.listingGainPotential && (
              <span className="text-[12px]" style={{ color: "var(--qc-ink-2)" }}>
                Listing Gain: <span style={{ color: "var(--qc-ink)" }}>{heroHeader.listingGainPotential}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-[280px] flex-shrink-0">
          {totalIssue > 0 && (
            <MetricTile label="Total Issue Size" value={`₹${totalIssue.toLocaleString("en-IN")} Cr`} />
          )}
          {ofsPct > 0 && (
            <MetricTile
              label="OFS Ratio"
              value={`${ofsPct.toFixed(1)}%`}
              change={ofsPct > 40 ? "▲ OFS-heavy" : undefined}
            />
          )}
          {intel.fresh_issue_cr > 0 && (
            <MetricTile label="Fresh Issue" value={`₹${intel.fresh_issue_cr.toLocaleString("en-IN")} Cr`} />
          )}
          {intel.revenue_9m_fy25_cr > 0 && (
            <MetricTile label="9M FY25 Revenue" value={`₹${intel.revenue_9m_fy25_cr.toLocaleString("en-IN")} Cr`} />
          )}
          {intel.adj_ebitda_margin_pct !== undefined && intel.adj_ebitda_margin_pct !== null && (
            <MetricTile label="Adj. EBITDA Margin" value={`${Number(intel.adj_ebitda_margin_pct).toFixed(1)}%`} />
          )}
          {intel.fair_value_est_low && intel.fair_value_est_high && (
            <MetricTile
              label="Fair Value Est."
              value={`₹${intel.fair_value_est_low}–${intel.fair_value_est_high}`}
            />
          )}
        </div>
      </div>

      {heroHeader.issueDate && (
        <div className="px-6 py-2.5 flex items-center gap-4" style={{ background: "var(--qc-section)" }}>
          <CalendarDays className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>{heroHeader.issueDate}</span>
        </div>
      )}
    </div>
  );
}

// ─── Intelligence: Quick Verdict section ─────────────────────────────────────

function FlagCard({ item }: { item: DrhpIntelligenceFlag }) {
  const { Icon, color, bg, border } = SEVERITY[item.severity] ?? SEVERITY.low;
  return (
    <div
      className="flex items-start gap-3 rounded-[8px] border px-3 py-2.5"
      style={{ background: bg, borderColor: border }}
    >
      <Icon className="size-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
      <span className="text-[12px] leading-relaxed" style={{ color: "var(--qc-ink)" }}>{item.flag}</span>
    </div>
  );
}

function IntelligenceVerdictSection({ intel, insight }: { intel: DrhpIntelligenceData; insight: DrhpInsight }) {
  const { quickVerdict } = insight.core;
  const ofsCr = intel.ofs_amount_cr || quickVerdict.ofsVsFreshSplit.ofsCr;
  const freshCr = intel.fresh_issue_cr || quickVerdict.ofsVsFreshSplit.freshIssueCr;
  const ofsPct = intel.ofs_ratio_pct || quickVerdict.ofsVsFreshSplit.ofsPct;

  return (
    <SectionPanel
      title={
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>01</span>
          <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Quick Verdict</span>
        </div>
      }
    >
      {intel.quick_verdict_title && (
        <h3 className="text-[16px] font-medium mb-4 leading-snug" style={{ color: "var(--qc-ink)" }}>
          {intel.quick_verdict_title}
        </h3>
      )}

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {/* Left: donut + analysis prose */}
        {(ofsCr > 0 || intel.quick_verdict_issue_split_analysis) && (
          <div className="flex-shrink-0 sm:w-[320px]">
            {ofsCr > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--qc-ink-2)" }}>Issue Split</p>
                <OfsDonut ofsCr={ofsCr} freshIssueCr={freshCr} ofsPct={ofsPct} />
              </div>
            )}
            {intel.quick_verdict_issue_split_analysis && (
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
                {intel.quick_verdict_issue_split_analysis}
              </p>
            )}
          </div>
        )}

        {/* Right: flag cards */}
        {intel.quick_verdict_flags.length > 0 && (
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {intel.quick_verdict_flags.map((f, i) => (
              <FlagCard key={i} item={f} />
            ))}
          </div>
        )}
      </div>
    </SectionPanel>
  );
}

// ─── Verdict tab ──────────────────────────────────────────────────────────────

function VerdictTab({ insight, intel }: { insight: DrhpInsight; intel: DrhpIntelligenceData }) {
  const shareholders = insight.analysis.sellingShareholdersList;

  return (
    <div className="flex flex-col gap-4">
      <IntelligenceVerdictSection intel={intel} insight={insight} />

      {shareholders.length > 0 && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>02</span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Selling Shareholders</span>
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
    { key: "all",      label: "All Flags",  color: "var(--qc-ink)" },
    { key: "critical", label: "Critical",   color: "var(--qc-down)" },
    { key: "caution",  label: "Caution",    color: "var(--qc-warn)" },
    { key: "watch",    label: "Watch",      color: "var(--qc-warn)" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SectionPanel
        title={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>03</span>
            <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Risk Register by Severity</span>
          </div>
        }
        headerAction={
          <div className="flex items-center gap-1 rounded-full border border-[var(--qc-hair)] p-0.5">
            {filters.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                style={filter === key
                  ? { background: "var(--qc-ink)", color: "var(--qc-card)" }
                  : { color: "var(--qc-ink-2)" }
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>05</span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>IPO Pricing Assessment</span>
            </div>
          }
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--qc-ink-2)" }}>Issue Split</p>
              <OfsDonut
                ofsCr={pricing.ofsCr || quickVerdict.ofsVsFreshSplit.ofsCr}
                freshIssueCr={pricing.freshIssueCr || quickVerdict.ofsVsFreshSplit.freshIssueCr}
                ofsPct={pricing.ofsPct || quickVerdict.ofsVsFreshSplit.ofsPct}
              />
            </div>
            {pricing.priceBandLower && pricing.priceBandUpper && (
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--qc-ink-2)" }}>Price Band</p>
                <p className="text-[22px] font-semibold" style={{ color: "var(--qc-ink)" }}>
                  ₹{pricing.priceBandLower} – ₹{pricing.priceBandUpper}
                </p>
              </div>
            )}
          </div>
        </SectionPanel>
      )}

      {(pricing.useOfProceedsBreakdown?.length ?? 0) > 0 && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>05B</span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Use of Proceeds</span>
            </div>
          }
        >
          <ProceedsTable breakdown={pricing.useOfProceedsBreakdown} />
        </SectionPanel>
      )}

      {(pricing.useOfProceedsRedFlags?.length ?? 0) > 0 && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>05C</span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Proceeds Red Flags</span>
            </div>
          }
        >
          <ul className="flex flex-col gap-2">
            {pricing.useOfProceedsRedFlags.map((flag, i) => (
              <li key={i} className="flex gap-2.5 items-start rounded-[6px] border border-[var(--qc-hair)] px-3 py-2.5" style={{ background: "var(--qc-bg)" }}>
                <AlertCircle className="size-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--qc-warn)" }} />
                <span className="text-[12px] leading-relaxed" style={{ color: "var(--qc-ink)" }}>{flag}</span>
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}

      {pricing.anchorInvestorQuality && (
        <SectionPanel
          title={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>05D</span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>Anchor Investor Quality</span>
            </div>
          }
        >
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--qc-ink)" }}>{pricing.anchorInvestorQuality}</p>
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
    let cancelled = false;
    authFetch(`${BACKEND_URL}/api/private-equity/drhp-analyses?id=${id}`)
      .then((r) => r.json())
      .then((json: DrhpApiResponse) => {
        if (cancelled) return;
        if (!json.success) throw new Error(json.message ?? "Failed to load analysis");
        setRecord(json.data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const insight = record?.insight;
  const intel = record?.intelligence?.intelligence;
  const companyName = insight?.core.heroHeader.companyName;
  const redFlagCount = insight
    ? insight.core.redFlagsAndRisks.critical.length
      + insight.core.redFlagsAndRisks.caution.length
      + insight.core.redFlagsAndRisks.watch.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="text-white text-xs font-semibold text-center py-2 px-4 sticky top-0 z-10" style={{ background: "var(--qc-ink)" }}>
        CONFIDENTIAL — For authorised use only
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <button
          onClick={() => router.push("/private-equity/pre-ipo")}
          className="flex items-center gap-1.5 text-[12px] mb-6 transition-opacity hover:opacity-60"
          style={{ color: "var(--qc-ink-2)" }}
        >
          <ArrowLeft className="size-3.5" />
          All analyses
        </button>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin" style={{ color: "var(--qc-ink-2)" }} />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-[8px] border border-down-soft bg-down-soft px-4 py-3">
            <AlertCircle className="size-4 text-down flex-shrink-0" />
            <p className="text-[13px] text-down">{error}</p>
          </div>
        )}

        {!loading && insight && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-4" style={{ color: "var(--qc-ink-2)" }} />
                <span className="text-[13px] font-medium" style={{ color: "var(--qc-ink)" }}>
                  {companyName || "DRHP Analysis"}
                </span>
              </div>
              <button
                onClick={() => router.push("/private-equity/pre-ipo")}
                className="text-[12px] transition-opacity hover:opacity-60"
                style={{ color: "var(--qc-ink-2)" }}
              >
                Analyse another
              </button>
            </div>

            <HeroHeader insight={insight} intel={intel ?? {
              ofs_amount_cr: insight.core.quickVerdict.ofsVsFreshSplit.ofsCr,
              ofs_ratio_pct: insight.core.quickVerdict.ofsVsFreshSplit.ofsPct,
              fresh_issue_cr: insight.core.quickVerdict.ofsVsFreshSplit.freshIssueCr,
              fair_value_est_low: null,
              fair_value_est_high: null,
              revenue_9m_fy25_cr: insight.core.heroHeader.nineMonthRevenueCr,
              quick_verdict_flags: [],
              quick_verdict_title: insight.core.quickVerdict.verdictHeadline,
              total_issue_size_cr: insight.core.heroHeader.totalIssueSizeCr,
              adj_ebitda_margin_pct: insight.core.heroHeader.adjEbitdaMarginPct,
              quick_verdict_issue_split_analysis: "",
            }} />

            <div className="flex items-center gap-1 rounded-full border border-[var(--qc-hair)] bg-[var(--qc-section)] p-1 self-start">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={activeTab === tab
                    ? { background: "var(--qc-ink)", color: "var(--qc-card)" }
                    : { color: "var(--qc-ink-2)" }
                  }
                >
                  {tab}
                  {tab === "Red Flags" && (
                    <span className="ml-1.5 text-[10px] opacity-60">{redFlagCount}</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === "Verdict"   && (
              <VerdictTab insight={insight} intel={intel ?? {
                ofs_amount_cr: insight.core.quickVerdict.ofsVsFreshSplit.ofsCr,
                ofs_ratio_pct: insight.core.quickVerdict.ofsVsFreshSplit.ofsPct,
                fresh_issue_cr: insight.core.quickVerdict.ofsVsFreshSplit.freshIssueCr,
                fair_value_est_low: null,
                fair_value_est_high: null,
                revenue_9m_fy25_cr: insight.core.heroHeader.nineMonthRevenueCr,
                quick_verdict_flags: insight.core.quickVerdict.verdictBullets.map((b) => ({ flag: b, severity: "medium" as const })),
                quick_verdict_title: insight.core.quickVerdict.verdictHeadline,
                total_issue_size_cr: insight.core.heroHeader.totalIssueSizeCr,
                adj_ebitda_margin_pct: insight.core.heroHeader.adjEbitdaMarginPct,
                quick_verdict_issue_split_analysis: "",
              }} />
            )}
            {activeTab === "Red Flags" && <RedFlagsTab risks={insight.core.redFlagsAndRisks} />}
            {activeTab === "Pricing"   && <PricingTab insight={insight} />}
          </div>
        )}
      </div>
    </div>
  );
}
