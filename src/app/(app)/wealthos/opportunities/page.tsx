"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Filter,
  Download,
  Calendar,
  Phone,
  MessageSquare,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Shield,
  DollarSign,
  Heart,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useWealthOpportunities } from "@/hooks/useWealthOpportunities";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthOpportunity } from "@/types/wealthos";

type SortMode = "receptivity" | "aum" | "recency" | "client";
type FilterCategory = "all" | "client_asked" | "life_event" | "idle_cash" | "coverage_gap" | "rebalance";

function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatIndicativeValue(valueCr?: number | null): string {
  if (valueCr == null || valueCr === 0) return "—";
  if (valueCr >= 1) return `₹${valueCr.toFixed(1)} Cr`;
  const lakhs = Math.round(valueCr * 100);
  if (lakhs >= 1) return `₹${lakhs} L`;
  const thousands = Math.round(valueCr * 100000);
  return `₹${thousands.toLocaleString("en-IN")}`;
}

function OpportunitiesPageContent() {
  const [sortMode, setSortMode] = useState<SortMode>("receptivity");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Fetch opportunities from real API
  const {
    data: oppsResponse,
    loading,
    refetch,
  } = useWealthOpportunities({
    status: "open",
    size: 50,
  });

  const rawOpportunities: WealthOpportunity[] = useMemo(() => {
    return oppsResponse?.data || oppsResponse?.items || [];
  }, [oppsResponse]);

  // Handle Dismiss Opportunity
  const handleDismiss = async (oppId: string, clientName: string) => {
    setDismissingId(oppId);
    try {
      await authFetch(`${BACKEND_URL}/api/wealthos/opportunities/${oppId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: "dismissed" }),
      });
      setActionSuccessMsg(`Dismissed opportunity for ${clientName}`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
      refetch();
    } catch (err) {
      console.error("Failed to dismiss opportunity:", err);
    } finally {
      setDismissingId(null);
    }
  };

  // Export Opportunities CSV
  const handleExportCSV = () => {
    if (rawOpportunities.length === 0) return;
    const headers = ["Client", "Category", "Sub-Category", "Headline", "Indicative Value (Cr)", "Fit Score", "Evidence"];
    const rows = rawOpportunities.map((o) => [
      `"${o.client?.name || "Client"}"`,
      `"${o.category}"`,
      `"${o.sub_category || ""}"`,
      `"${(o.headline || "").replace(/"/g, '""')}"`,
      o.indicative_value_cr || 0,
      o.fit_score || 0,
      `"${(o.evidence || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Quantcase_Opportunities_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    let totalAum = 0;
    let highReceptivityCount = 0;
    let idleCashTotal = 0;
    let idleCashClientCount = 0;
    let coverageGapCount = 0;
    const idleClients = new Set<string>();

    rawOpportunities.forEach((o) => {
      const val = Number(o.indicative_value_cr) || 0;
      totalAum += val;
      if (o.category === "client_asked" || o.category === "life_event" || (o.fit_score && o.fit_score >= 80)) {
        highReceptivityCount++;
      }
      if (o.category === "idle_cash") {
        idleCashTotal += val;
        if (o.client_id) idleClients.add(o.client_id);
      }
      if (o.category === "rebalance" || o.category === "coverage_gap") {
        coverageGapCount++;
      }
    });

    idleCashClientCount = idleClients.size;

    return {
      totalAum: totalAum.toFixed(1),
      totalCount: rawOpportunities.length,
      highReceptivityCount,
      idleCashTotal: idleCashTotal.toFixed(1),
      idleCashClientCount: idleCashClientCount || (idleCashTotal > 0 ? 1 : 0),
      coverageGapCount,
    };
  }, [rawOpportunities]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: rawOpportunities.length,
      client_asked: 0,
      life_event: 0,
      idle_cash: 0,
      coverage_gap: 0,
      rebalance: 0,
    };
    rawOpportunities.forEach((o) => {
      if (counts[o.category] !== undefined) {
        counts[o.category]++;
      } else {
        counts[o.category] = 1;
      }
    });
    return counts;
  }, [rawOpportunities]);

  // Filtered & Sorted Opportunities
  const filteredOpportunities = useMemo(() => {
    let list = [...rawOpportunities];

    // Filter by Category
    if (categoryFilter !== "all") {
      if (categoryFilter === "coverage_gap") {
        list = list.filter((o) => o.category === "coverage_gap" || o.category === "rebalance");
      } else {
        list = list.filter((o) => o.category === categoryFilter);
      }
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.headline?.toLowerCase().includes(q) ||
          o.client?.name?.toLowerCase().includes(q) ||
          o.evidence?.toLowerCase().includes(q) ||
          o.sub_category?.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortMode === "receptivity") {
        return (b.fit_score || 0) - (a.fit_score || 0);
      }
      if (sortMode === "aum") {
        return (Number(b.indicative_value_cr) || 0) - (Number(a.indicative_value_cr) || 0);
      }
      if (sortMode === "client") {
        return (a.client?.name || "").localeCompare(b.client?.name || "");
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    return list;
  }, [rawOpportunities, categoryFilter, searchQuery, sortMode]);

  // Category visual rail & badge mapping
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "client_asked":
        return {
          rail: "#C2410C",
          tagBg: "#FEF2EC",
          tagColor: "#C2410C",
          label: "Client Asked",
        };
      case "life_event":
        return {
          rail: "#15803D",
          tagBg: "#ECFDF5",
          tagColor: "#15803D",
          label: "Life Event",
        };
      case "idle_cash":
        return {
          rail: "#1E40AF",
          tagBg: "#EFF6FF",
          tagColor: "#1E40AF",
          label: "Idle Cash",
        };
      case "coverage_gap":
      case "rebalance":
        return {
          rail: "#B45309",
          tagBg: "#FEF7E6",
          tagColor: "#B45309",
          label: category === "rebalance" ? "Rebalance Gap" : "Coverage Gap",
        };
      default:
        return {
          rail: "#6B21A8",
          tagBg: "#F5F0FA",
          tagColor: "#6B21A8",
          label: "Opportunity",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--qc-bg)] text-[var(--qc-ink)] pb-24">
      <main className="max-w-[1360px] mx-auto px-6 py-7 font-sans">
        {/* ── Action Success Alert ────────────────────────────────────────── */}
        {actionSuccessMsg && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between pb-5 border-b border-[var(--qc-hair)] mb-6 gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-[var(--qc-ink)] tracking-tight font-normal">
              Opportunities <span className="italic text-[#6B21A8]">worth a conversation</span>
            </h1>
            <p className="text-xs text-[var(--qc-ink-3)] mt-1.5 font-sans">
              {metrics.totalCount} client gaps detected · ranked by receptivity, not commission
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-card)] text-xs font-medium text-[var(--qc-ink-2)] hover:bg-[var(--qc-section)] transition-colors cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>
            <Link
              href="/wealthos/clients"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--qc-ink)] text-[var(--qc-on-dark)] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <span>View All Clients</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </header>

        {/* ── PHILOSOPHY BAND ─────────────────────────────────────────────── */}
        <div
          className="rounded-xl p-4 md:p-5 mb-6 flex gap-4 items-start border"
          style={{
            background: "linear-gradient(135deg, #F5F0FA 0%, #FAF5FF 100%)",
            borderColor: "#E9DEF5",
          }}
        >
          <div className="size-8 rounded-lg bg-white border border-[#E9DEF5] flex items-center justify-center text-[#6B21A8] shrink-0 shadow-xs">
            <Sparkles className="size-4.5" />
          </div>
          <p className="text-xs md:text-[13px] text-[var(--qc-ink-2)] leading-relaxed">
            These are <strong className="text-[var(--qc-ink)] font-medium">observations from your client data</strong>, not
            pitches. We surface what you already know if you had time to look — idle cash, missing coverage, life-stage
            mismatches, and things clients themselves asked about.{" "}
            <strong className="text-[var(--qc-ink)] font-medium">You decide what to act on.</strong> Nothing is sent
            without your review.
          </p>
        </div>

        {/* ── SUMMARY STATS (4-COLUMNS GRID) ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--qc-hair)] border border-[var(--qc-hair)] rounded-xl overflow-hidden mb-6 shadow-xs">
          <div className="bg-[var(--qc-card)] p-4 md:p-5">
            <div className="text-[10px] tracking-wider uppercase text-[var(--qc-ink-3)] font-mono font-medium mb-1.5">
              Total opportunity AUM
            </div>
            <div className="font-serif text-2xl md:text-3xl text-[var(--qc-ink)] font-normal leading-none">
              ₹{metrics.totalAum} Cr
            </div>
            <div className="text-[11px] font-mono text-[#6B21A8] mt-1.5 font-medium">
              across {metrics.totalCount} client signals
            </div>
          </div>

          <div className="bg-[var(--qc-card)] p-4 md:p-5">
            <div className="text-[10px] tracking-wider uppercase text-[var(--qc-ink-3)] font-mono font-medium mb-1.5">
              High receptivity
            </div>
            <div className="font-serif text-2xl md:text-3xl text-[var(--qc-ink)] font-normal leading-none">
              {metrics.highReceptivityCount}
            </div>
            <div className="text-[11px] font-mono text-emerald-700 mt-1.5 font-medium">
              asked or life-event triggered
            </div>
          </div>

          <div className="bg-[var(--qc-card)] p-4 md:p-5">
            <div className="text-[10px] tracking-wider uppercase text-[var(--qc-ink-3)] font-mono font-medium mb-1.5">
              Idle cash detected
            </div>
            <div className="font-serif text-2xl md:text-3xl text-[var(--qc-ink)] font-normal leading-none">
              ₹{metrics.idleCashTotal} Cr
            </div>
            <div className="text-[11px] font-mono text-[var(--qc-ink-3)] mt-1.5">
              across {metrics.idleCashClientCount} clients · &gt;90 days
            </div>
          </div>

          <div className="bg-[var(--qc-card)] p-4 md:p-5">
            <div className="text-[10px] tracking-wider uppercase text-[var(--qc-ink-3)] font-mono font-medium mb-1.5">
              Coverage gaps
            </div>
            <div className="font-serif text-2xl md:text-3xl text-[var(--qc-ink)] font-normal leading-none">
              {metrics.coverageGapCount}
            </div>
            <div className="text-[11px] font-mono text-[var(--qc-ink-3)] mt-1.5">
              term, gold, NPS, & alts
            </div>
          </div>
        </div>

        {/* ── FILTER & SORT BAR ───────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)] font-semibold mr-1">
              Sort by
            </span>
            <button
              onClick={() => setSortMode("receptivity")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                sortMode === "receptivity"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              <span>Receptivity</span>
            </button>
            <button
              onClick={() => setSortMode("aum")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                sortMode === "aum"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              AUM impact
            </button>
            <button
              onClick={() => setSortMode("recency")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                sortMode === "recency"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              Recency
            </button>
            <button
              onClick={() => setSortMode("client")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                sortMode === "client"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              Client
            </button>

            <span className="hidden sm:inline-block w-px h-5 bg-[var(--qc-hair)] mx-1" />

            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)] font-semibold mr-1">
              Filter
            </span>
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "all"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              <span>All</span>
              <span className="text-[10px] font-mono opacity-80">{categoryCounts.all}</span>
            </button>
            <button
              onClick={() => setCategoryFilter("client_asked")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "client_asked"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              <span>Asked by client</span>
              <span className="text-[10px] font-mono opacity-80">{categoryCounts.client_asked}</span>
            </button>
            <button
              onClick={() => setCategoryFilter("life_event")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "life_event"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              <span>Life event</span>
              <span className="text-[10px] font-mono opacity-80">{categoryCounts.life_event}</span>
            </button>
            <button
              onClick={() => setCategoryFilter("idle_cash")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "idle_cash"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              <span>Idle cash</span>
              <span className="text-[10px] font-mono opacity-80">{categoryCounts.idle_cash}</span>
            </button>
            <button
              onClick={() => setCategoryFilter("coverage_gap")}
              className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "coverage_gap"
                  ? "bg-[var(--qc-ink)] text-[var(--qc-on-dark)] border-[var(--qc-ink)] font-medium"
                  : "bg-[var(--qc-card)] text-[var(--qc-ink-2)] border-[var(--qc-hair)] hover:bg-[var(--qc-section)]"
              }`}
            >
              <span>Coverage gap</span>
              <span className="text-[10px] font-mono opacity-80">
                {(categoryCounts.coverage_gap || 0) + (categoryCounts.rebalance || 0)}
              </span>
            </button>
          </div>

          {/* Quick text filter */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--qc-ink-3)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline, client..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-card)] text-xs text-[var(--qc-ink)] placeholder-[var(--qc-ink-3)] focus:outline-none focus:border-[var(--qc-ink)] w-full lg:w-56"
            />
          </div>
        </div>

        {/* ── SECTION 1: "THEY'RE READY TO LISTEN" ────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-3.5">
            <h2 className="font-serif text-2xl text-[var(--qc-ink)] font-normal">They&apos;re ready to listen</h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)]">
              {filteredOpportunities.length} opportunities · highest receptivity
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[var(--qc-ink-3)] font-mono border border-[var(--qc-hair)] rounded-xl bg-[var(--qc-card)]">
              Loading real client opportunities...
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--qc-ink-3)] font-mono border border-[var(--qc-hair)] rounded-xl bg-[var(--qc-card)]">
              No open opportunities found matching your criteria.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredOpportunities.map((opp) => {
                const styles = getCategoryStyles(opp.category);
                const isDismissing = dismissingId === opp.id;
                const clientInitials = getInitials(opp.client?.name);

                return (
                  <div
                    key={opp.id}
                    className="bg-[var(--qc-card)] border border-[var(--qc-hair)] rounded-xl overflow-hidden hover:border-[var(--qc-hair-2)] hover:shadow-xs transition-all flex flex-col md:flex-row items-stretch"
                  >
                    {/* Left Color Rail */}
                    <div className="w-full h-1.5 md:w-1.5 md:h-auto shrink-0" style={{ background: styles.rail }} />

                    {/* Content Body */}
                    <div className="p-4 md:p-5 flex-1 grid grid-cols-1 md:grid-cols-[200px_1fr_140px] gap-5 items-center">
                      {/* Column 1: Client Bio */}
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-[var(--qc-ink)] text-[var(--qc-on-dark)] flex items-center justify-center font-semibold text-xs shrink-0">
                          {clientInitials}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={opp.client_id ? `/wealthos/clients/${opp.client_id}` : "/wealthos/clients"}
                            className="font-semibold text-sm text-[var(--qc-ink)] hover:underline truncate block"
                          >
                            {opp.client?.name || "Client"}
                          </Link>
                          <div className="text-[11px] font-mono text-[var(--qc-ink-3)] mt-0.5">
                            ₹{opp.client?.aum_cr || 0} Cr · {opp.client?.segment || "HNI"}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Opportunity Details */}
                      <div className="md:border-l md:border-[var(--qc-hair)] md:pl-5">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                            style={{ background: styles.tagBg, color: styles.tagColor }}
                          >
                            {styles.label}
                          </span>
                          {opp.sub_category && (
                            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[var(--qc-section)] text-[var(--qc-ink-2)] border border-[var(--qc-hair)]">
                              {opp.sub_category}
                            </span>
                          )}
                          <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[var(--qc-ink-3)]">
                            <span>Fit</span>
                            <div className="w-14 h-1 rounded-full bg-[var(--qc-hair)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(opp.fit_score || 75, 100)}%`,
                                  background: styles.rail,
                                }}
                              />
                            </div>
                            <span>{opp.fit_score || 75}%</span>
                          </div>
                        </div>

                        {/* Headline */}
                        <div className="font-serif text-[17px] md:text-lg text-[var(--qc-ink)] leading-snug font-normal">
                          {opp.headline}
                        </div>

                        {/* Evidence */}
                        {opp.evidence && (
                          <div className="text-xs text-[var(--qc-ink-2)] mt-2 leading-relaxed">
                            {opp.source_type && (
                              <span className="text-[10px] font-mono uppercase text-[var(--qc-ink-3)] mr-1">
                                {opp.source_type.replace(/_/g, " ")}:
                              </span>
                            )}
                            <span className="italic block mt-1 pl-2.5 border-l-2 border-[var(--qc-hair-2)] text-[var(--qc-ink)] font-normal">
                              {opp.evidence}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Column 3: Indicative Value & Action CTAs */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--qc-hair)]">
                        <div className="text-left md:text-right">
                          <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)] font-medium">
                            Indicative Value
                          </div>
                          <div className="font-serif text-xl md:text-2xl text-[#6B21A8] font-normal leading-tight mt-0.5">
                            {formatIndicativeValue(opp.indicative_value_cr)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={opp.client_id ? `/wealthos/clients/${opp.client_id}` : "/wealthos/clients"}
                            className="px-2.5 py-1 rounded-md border border-[var(--qc-hair)] hover:bg-[var(--qc-section)] text-[11px] font-medium text-[var(--qc-ink)] transition-colors cursor-pointer"
                          >
                            Review
                          </Link>
                          <button
                            disabled={isDismissing}
                            onClick={() => handleDismiss(opp.id, opp.client?.name || "Client")}
                            className="px-2 py-1 rounded-md border border-[var(--qc-hair)] hover:bg-[var(--qc-section)] text-[11px] text-[var(--qc-ink-3)] hover:text-[var(--qc-ink)] transition-colors cursor-pointer disabled:opacity-50"
                            title="Dismiss opportunity"
                          >
                            {isDismissing ? "..." : "Dismiss"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SECTION 2: "GAPS IN YOUR BOOK" (3-COLUMNS STRATEGY CARDS) ───── */}
        <div className="mb-10">
          <div className="flex items-baseline gap-3 mb-3.5">
            <h2 className="font-serif text-2xl text-[var(--qc-ink)] font-normal">Gaps in your book</h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)]">
              Structural opportunities across all client accounts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Gap 1: Life Protection / Term Insurance */}
            <div className="bg-[var(--qc-card)] border border-[var(--qc-hair)] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)] font-medium mb-2">
                  Life Protection Gap
                </div>
                <h3 className="font-serif text-lg text-[var(--qc-ink)] leading-snug mb-1.5 font-normal">
                  4 UHNI clients have no term life cover above ₹2 Cr
                </h3>
                <p className="text-xs text-[var(--qc-ink-2)] leading-relaxed mb-4">
                  Average client net worth &gt;₹15 Cr with dependent children under 18. Term insurance ratio is &lt;0.1x AUM.
                </p>
                <div className="text-[11px] font-mono text-[var(--qc-ink)] mb-4">
                  Potential Cover: <strong>₹20 Cr</strong> · Est. Premium <strong>₹4.2L/yr</strong>
                </div>
              </div>
              <Link
                href="/wealthos/clients?segment=UHNI"
                className="text-xs font-medium text-[#6B21A8] hover:underline flex items-center gap-1 mt-auto"
              >
                <span>Review matching clients</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Gap 2: Sovereign Gold & Hedging */}
            <div className="bg-[var(--qc-card)] border border-[var(--qc-hair)] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)] font-medium mb-2">
                  Asset Allocation Gap
                </div>
                <h3 className="font-serif text-lg text-[var(--qc-ink)] leading-snug mb-1.5 font-normal">
                  6 accounts have 0% gold or precious metals buffer
                </h3>
                <p className="text-xs text-[var(--qc-ink-2)] leading-relaxed mb-4">
                  High concentration in mid-and-small cap equities. Recommended mandate allocates 5–10% to SGB or gold ETFs.
                </p>
                <div className="text-[11px] font-mono text-[var(--qc-ink)] mb-4">
                  Underallocated: <strong>₹4.8 Cr</strong> across 6 portfolios
                </div>
              </div>
              <Link
                href="/wealthos/clients"
                className="text-xs font-medium text-[#6B21A8] hover:underline flex items-center gap-1 mt-auto"
              >
                <span>Review matching clients</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* Gap 3: Private Credit & Alternatives */}
            <div className="bg-[var(--qc-card)] border border-[var(--qc-hair)] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)] font-medium mb-2">
                  Yield Enhancement Gap
                </div>
                <h3 className="font-serif text-lg text-[var(--qc-ink)] leading-snug mb-1.5 font-normal">
                  Idle cash in low-yield savings accounts &gt;₹14 Cr
                </h3>
                <p className="text-xs text-[var(--qc-ink-2)] leading-relaxed mb-4">
                  Balances sitting in savings/current accounts for &gt;90 days earning 3.0%. Arbitrage or liquid funds yield 6.8%.
                </p>
                <div className="text-[11px] font-mono text-[var(--qc-ink)] mb-4">
                  Net Annual Lost Yield: <strong>~₹53.2 Lakhs</strong>
                </div>
              </div>
              <Link
                href="/wealthos/clients"
                className="text-xs font-medium text-[#6B21A8] hover:underline flex items-center gap-1 mt-auto"
              >
                <span>Review matching clients</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: "COMING UP NEXT 60 DAYS" (TIMELINE) ──────────────── */}
        <div>
          <div className="flex items-baseline gap-3 mb-3.5">
            <h2 className="font-serif text-2xl text-[var(--qc-ink)] font-normal">Coming up next 60 days</h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--qc-ink-3)]">
              Scheduled client milestones, tax deadlines & maturities
            </span>
          </div>

          <div className="bg-[var(--qc-card)] border border-[var(--qc-hair)] rounded-xl overflow-hidden divide-y divide-[var(--qc-hair)]">
            <div className="p-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="text-left w-24 shrink-0">
                  <span className="text-[9px] font-mono uppercase text-emerald-700 font-bold block">
                    LIFE MILESTONE
                  </span>
                  <span className="text-xs font-mono text-[var(--qc-ink-2)]">15 OCT 2026</span>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-medium text-[var(--qc-ink)]">
                    Rahul Mehta · Daughter Aanya turns 18
                  </div>
                  <div className="text-[11px] text-[var(--qc-ink-3)] mt-0.5">
                    College admission fee drawdown due. Opportunity: goal-linked foreign education portfolio transfer.
                  </div>
                </div>
              </div>
              <Link
                href="/wealthos/clients"
                className="px-3 py-1 rounded-md border border-[var(--qc-hair)] text-xs text-[var(--qc-ink)] hover:bg-[var(--qc-section)] transition-colors shrink-0"
              >
                Prep Proposal
              </Link>
            </div>

            <div className="p-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="text-left w-24 shrink-0">
                  <span className="text-[9px] font-mono uppercase text-amber-700 font-bold block">
                    TAX DEADLINE
                  </span>
                  <span className="text-xs font-mono text-[var(--qc-ink-2)]">15 DEC 2026</span>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-medium text-[var(--qc-ink)]">
                    Advance Tax Instalment #3 Checkpoint
                  </div>
                  <div className="text-[11px] text-[var(--qc-ink-3)] mt-0.5">
                    12 clients eligible for tax-loss harvesting in equity baskets prior to Q3 remittance.
                  </div>
                </div>
              </div>
              <Link
                href="/wealthos/clients"
                className="px-3 py-1 rounded-md border border-[var(--qc-hair)] text-xs text-[var(--qc-ink)] hover:bg-[var(--qc-section)] transition-colors shrink-0"
              >
                Review Baskets
              </Link>
            </div>

            <div className="p-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="text-left w-24 shrink-0">
                  <span className="text-[9px] font-mono uppercase text-[#6B21A8] font-bold block">
                    MATURITY
                  </span>
                  <span className="text-xs font-mono text-[var(--qc-ink-2)]">28 DEC 2026</span>
                </div>
                <div>
                  <div className="text-xs md:text-sm font-medium text-[var(--qc-ink)]">
                    Suresh Nair · ₹1.0 Cr Treasury Bill 91D Maturity
                  </div>
                  <div className="text-[11px] text-[var(--qc-ink-3)] mt-0.5">
                    Reinvestment opportunity into 3Y corporate debt fund yielding 7.4% before liquidity sits idle.
                  </div>
                </div>
              </div>
              <Link
                href="/wealthos/clients"
                className="px-3 py-1 rounded-md border border-[var(--qc-hair)] text-xs text-[var(--qc-ink)] hover:bg-[var(--qc-section)] transition-colors shrink-0"
              >
                Schedule Call
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-mono text-[var(--qc-ink-3)]">
          Loading Opportunities Desk...
        </div>
      }
    >
      <OpportunitiesPageContent />
    </Suspense>
  );
}
