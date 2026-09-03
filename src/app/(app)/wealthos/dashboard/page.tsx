"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  Filter,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search
} from "lucide-react";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { useWealthDashboard } from "@/hooks/useWealthDashboard";
import { useJobPoller } from "@/hooks/useJobPoller";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import type { WealthJobsResponse } from "@/types/wealthos";

// ── Types ─────────────────────────────────────────────────────────────────────

type OpportunityCategory = "asked" | "life" | "idle" | "gap";
type SortOption = "receptivity" | "aum" | "recency" | "client";

interface OpportunityItem {
  id: string;
  clientId: string;
  clientName: string;
  initials: string;
  aum: string;
  aumValue: number;
  tenure: string;
  category: OpportunityCategory;
  categoryLabel: string;
  subCategory?: string;
  fitScore: number;
  headline: string;
  headlineAccent: string;
  headlineRest: string;
  evidenceLead: string;
  quote?: string;
  strongEvidence?: string;
  valueLabel: string;
  valueText: string;
  valueAlert?: boolean;
  briefHref?: string;
}

// ── Mock & Initial Opportunities Data ─────────────────────────────────────────

const OPPORTUNITIES_DATA: OpportunityItem[] = [
  {
    id: "opp-priya",
    clientId: "priya-venkat",
    clientName: "Priya Venkat",
    initials: "PV",
    aum: "₹4.6 Cr",
    aumValue: 4.6,
    tenure: "client since Mar 2022",
    category: "asked",
    categoryLabel: "Client asked",
    subCategory: "Coverage gap",
    fitScore: 92,
    headline: "She asked about ",
    headlineAccent: "NPS allocation",
    headlineRest: " on the last call. Never followed up.",
    evidenceLead: "From call notes · 11 Apr ·",
    quote: '"My husband mentioned NPS at his office — should we be doing that? What\'s the actual tax benefit at our slab?"',
    valueLabel: "Indicative",
    valueText: "₹50K /yr",
    briefHref: "/brief/priya-venkat",
  },
  {
    id: "opp-rahul",
    clientId: "rahul-mehta",
    clientName: "Rahul Mehta",
    initials: "RM",
    aum: "₹3.2 Cr",
    aumValue: 3.2,
    tenure: "client since Aug 2021",
    category: "life",
    categoryLabel: "Life event",
    subCategory: "Education funding",
    fitScore: 88,
    headline: "Daughter ",
    headlineAccent: "turning 14 this month",
    headlineRest: ". No goal-linked education portfolio.",
    evidenceLead: "From KYC + family details · Aanya born 2012. ",
    strongEvidence: "4 years to undergrad. Current SIPs are general-purpose, no earmarked education corpus despite ₹3.2 Cr book.",
    valueLabel: "Suggested SIP",
    valueText: "₹35K/mo",
    briefHref: "/brief/priya-venkat",
  },
  {
    id: "opp-anita",
    clientId: "anita-shah",
    clientName: "Anita Shah",
    initials: "AS",
    aum: "₹5.8 Cr",
    aumValue: 5.8,
    tenure: "client since Jul 2020",
    category: "asked",
    categoryLabel: "Client asked",
    subCategory: "Sector interest",
    fitScore: 86,
    headline: "Wants ",
    headlineAccent: "EV / Green Energy",
    headlineRest: " exposure. Has zero allocation today.",
    evidenceLead: "From WhatsApp · 14 Apr ·",
    quote: '"My son keeps saying EVs are the future. Is there a thematic fund or ETF we should consider for 2025?"',
    valueLabel: "Allocation room",
    valueText: "₹40 L",
    briefHref: "/brief/priya-venkat",
  },
  {
    id: "opp-suresh",
    clientId: "suresh-nair",
    clientName: "Suresh Nair",
    initials: "SN",
    aum: "₹2.4 Cr",
    aumValue: 2.4,
    tenure: "client since Nov 2023",
    category: "idle",
    categoryLabel: "Idle cash",
    fitScore: 78,
    headline: "",
    headlineAccent: "₹62 L sitting in savings",
    headlineRest: " for 4 months. ~₹2L/yr being lost vs liquid funds.",
    evidenceLead: "From bank statement aggregation · HDFC SB account balance > ₹50L since Dec 2025. Conservative profile suggests ",
    strongEvidence: "liquid + ultra short duration split, not equity.",
    valueLabel: "Yield uplift",
    valueText: "₹2.1 L/yr",
    briefHref: "/brief/priya-venkat",
  },
  {
    id: "opp-kapoor",
    clientId: "kapoor-and-sons",
    clientName: "Kapoor & Sons",
    initials: "KS",
    aum: "₹5.9 Cr",
    aumValue: 5.9,
    tenure: "client since 2019",
    category: "life",
    categoryLabel: "Life event",
    subCategory: "Estate gap",
    fitScore: 81,
    headline: "Mr. Kapoor turning ",
    headlineAccent: "62 next month",
    headlineRest: ". No will or estate structure on file.",
    evidenceLead: "Retiree profile · ₹5.9 Cr across equity, MFs, real estate. Two adult children. Estate planning conversation overdue. Partners: ",
    strongEvidence: "3 lawyers in network for referral.",
    valueLabel: "Risk if not done",
    valueText: "High",
    valueAlert: true,
    briefHref: "/brief/priya-venkat",
  },
];

const BOOK_GAPS = [
  {
    label: "Term life coverage",
    headline: "7 clients under-insured vs liability",
    stat: "Avg gap: ₹1.8 Cr cover · Combined premium opportunity ~₹4.2 L/yr",
    clients: ["RM", "VK", "AK", "SS"],
    overflow: "+3",
    cta: "Run bulk review →",
  },
  {
    label: "Idle cash > 90 days",
    headline: "8 clients · ₹14.2 Cr losing yield",
    stat: "Avg balance idle: ₹1.78 Cr · Foregone return at 6% = ₹85 L/yr",
    clients: ["SN", "PV", "RM", "AS"],
    overflow: "+4",
    cta: "Sweep proposal →",
  },
  {
    label: "NPS coverage",
    headline: "11 clients · no NPS allocation",
    stat: "Tax benefit foregone: ~₹15K/yr per client · 80CCD(1B) headroom unused",
    clients: ["PV", "AS", "RM", "AK"],
    overflow: "+7",
    cta: "Tax-saving brief →",
  },
];

const LIFE_EVENTS = [
  {
    when: "In 8 days",
    date: "5 May",
    name: "Priya Venkat",
    event: "birthday (turns 41)",
    opp: "Personal note · also a natural moment to revisit retirement glide path",
  },
  {
    when: "In 11 days",
    date: "8 May",
    name: "Mehta Family",
    event: "Aanya's 14th birthday",
    opp: "Education corpus conversation · 4 years to undergrad, ₹35K/mo SIP suggested",
  },
  {
    when: "In 23 days",
    date: "20 May",
    name: "Mr. Kapoor",
    event: "turns 62",
    opp: "Retirement income restructure · estate planning conversation overdue",
  },
  {
    when: "In 41 days",
    date: "7 Jun",
    name: "Anita & Rohit Shah",
    event: "15th wedding anniversary",
    opp: "Joint financial review · their EV interest could anchor a fresh allocation conversation",
  },
  {
    when: "In 67 days",
    date: "3 Jul",
    name: "Varun Kapoor",
    event: "son starts college",
    opp: "Education drawdown trigger · convert ELSS holdings strategically before fees due",
  },
];

// ── Main Page Component ───────────────────────────────────────────────────────

function WealthOSDashboardContent() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("receptivity");
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // RM backend integration
  const [selectedRmId, setSelectedRmId] = useState("");
  const { data: rms } = useWealthRMList();
  const { isPolling, progress, startPolling } = useJobPoller({
    onComplete: () => {},
    onError: () => {},
  });

  const handleGenerate = () => {
    if (!selectedRmId) return;
    apiPost<WealthJobsResponse>(
      `${BACKEND_URL}/api/wealthos/suggestions/generate`,
      {
        onSuccess: (res) => startPolling(res.jobs.map((j) => j.id)),
        onError: (err) => console.error("Error generating suggestions:", err),
      },
      { rm_id: selectedRmId }
    );
  };

  const visibleOpportunities = useMemo(() => {
    return OPPORTUNITIES_DATA.filter((item) => {
      if (dismissedIds.has(item.id)) return false;
      if (selectedCategory === "all") return true;
      if (selectedCategory === "asked") return item.category === "asked";
      if (selectedCategory === "life") return item.category === "life";
      if (selectedCategory === "idle") return item.category === "idle";
      if (selectedCategory === "gap") return item.subCategory?.toLowerCase().includes("gap");
      return true;
    }).sort((a, b) => {
      if (sortBy === "receptivity") return b.fitScore - a.fitScore;
      if (sortBy === "aum") return b.aumValue - a.aumValue;
      if (sortBy === "client") return a.clientName.localeCompare(b.clientName);
      return 0;
    });
  }, [selectedCategory, sortBy, dismissedIds]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const getRailColor = (cat: OpportunityCategory) => {
    switch (cat) {
      case "asked": return "#C2410C";
      case "life": return "#15803D";
      case "idle": return "#1E40AF";
      case "gap": return "#B45309";
      default: return "#6B21A8";
    }
  };

  const getTagBadgeStyle = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("asked")) return { bg: "#FEF2EC", text: "#C2410C" };
    if (c.includes("life") || c.includes("education")) return { bg: "#ECFDF5", text: "#15803D" };
    if (c.includes("idle")) return { bg: "#EFF6FF", text: "#1E40AF" };
    if (c.includes("gap") || c.includes("estate")) return { bg: "#FEF7E6", text: "#B45309" };
    return { bg: "#F5F0FA", text: "#6B21A8" };
  };

  return (
    <div style={{ background: "#FCFCFA", minHeight: "100vh", color: "#1A1A1A" }}>
      <main style={{ padding: "24px 36px 60px", maxWidth: 1400, margin: "0 auto", fontFamily: "var(--qc-font-sans)" }}>

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingBottom: 20,
            borderBottom: "1px solid #EDEAE3",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--qc-font-serif, Georgia, serif)",
                fontSize: 36,
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                margin: 0,
              }}
            >
              Opportunities <span style={{ fontStyle: "italic", color: "#6B21A8" }}>worth a conversation</span>
            </h1>
            <div style={{ color: "#8A8A8A", fontSize: 13, marginTop: 6, fontFamily: "var(--qc-font-sans)" }}>
              12 client gaps detected · ranked by receptivity, not commission
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* RM selector if available */}
            {rms && rms.length > 0 && (
              <div className="relative">
                <select
                  value={selectedRmId}
                  onChange={(e) => setSelectedRmId(e.target.value)}
                  style={{
                    borderRadius: 6,
                    border: "1px solid #E0DCD2",
                    background: "#FFFFFF",
                    color: "#4A4A4A",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "7px 28px 7px 12px",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="">Viewing: All RMs</option>
                  {rms.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-500 pointer-events-none" />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isPolling}
              style={{
                background: "#FFFFFF",
                color: "#4A4A4A",
                border: "1px solid #E0DCD2",
                padding: "7px 13px",
                borderRadius: 6,
                fontSize: 12,
                cursor: isPolling ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles className="size-3.5 text-[#6B21A8]" />
              <span>{isPolling ? `Generating (${progress}%)` : "Refresh AI"}</span>
            </button>

            <button
              style={{
                background: "#1A1A1A",
                color: "#FCFCFA",
                border: "none",
                padding: "8px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Bulk schedule
            </button>
          </div>
        </header>

        {/* ── AI POLLING PROGRESS ──────────────────────────────────────────── */}
        {isPolling && (
          <div style={{ marginBottom: 20, padding: 14, background: "#FFFFFF", borderRadius: 8, border: "1px solid #EDEAE3" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 500 }}>Scanning client telemetry & portfolio drifts…</span>
              <span style={{ fontFamily: "var(--qc-font-mono)", color: "#6B21A8" }}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* ── PHILOSOPHY BAND ──────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg, #F5F0FA 0%, #FAF5FF 100%)",
            border: "1px solid #E9DEF5",
            padding: "18px 24px",
            borderRadius: 10,
            marginBottom: 24,
            display: "flex",
            gap: 18,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "white",
              border: "1px solid #E9DEF5",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B21A8",
              flexShrink: 0,
            }}
          >
            <Lightbulb className="size-4" />
          </div>
          <p style={{ fontSize: 13, color: "#4A4A4A", lineHeight: 1.55, margin: 0 }}>
            These are <strong style={{ color: "#1A1A1A", fontWeight: 600 }}>observations from your client data</strong>, not pitches.
            We surface what you already know if you had time to look — idle cash, missing coverage, life-stage mismatches, and things clients themselves asked about.{" "}
            <strong style={{ color: "#1A1A1A", fontWeight: 600 }}>You decide what to act on.</strong> Nothing is sent without your review.
          </p>
        </div>

        {/* ── SUMMARY METRICS (4 COLUMNS) ──────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 1,
            background: "#EDEAE3",
            border: "1px solid #EDEAE3",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", marginBottom: 8, fontWeight: 600 }}>
              Total opportunity AUM
            </div>
            <div style={{ fontFamily: "var(--qc-font-serif, Georgia, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1 }}>
              ₹38.4 Cr
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", color: "#6B21A8", marginTop: 6, fontWeight: 500 }}>
              across 12 clients
            </div>
          </div>

          <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", marginBottom: 8, fontWeight: 600 }}>
              High receptivity
            </div>
            <div style={{ fontFamily: "var(--qc-font-serif, Georgia, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1 }}>
              5
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", color: "#15803D", marginTop: 6, fontWeight: 500 }}>
              asked or life-event triggered
            </div>
          </div>

          <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", marginBottom: 8, fontWeight: 600 }}>
              Idle cash detected
            </div>
            <div style={{ fontFamily: "var(--qc-font-serif, Georgia, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1 }}>
              ₹14.2 Cr
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", color: "#8A8A8A", marginTop: 6 }}>
              across 8 clients · &gt;90 days
            </div>
          </div>

          <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", marginBottom: 8, fontWeight: 600 }}>
              Coverage gaps
            </div>
            <div style={{ fontFamily: "var(--qc-font-serif, Georgia, serif)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1 }}>
              7
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", color: "#8A8A8A", marginTop: 6 }}>
              term, health, NPS
            </div>
          </div>
        </div>

        {/* ── FILTER & SORT BAR ────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", fontWeight: 600, marginRight: 4 }}>
            Sort by
          </span>
          <button
            onClick={() => setSortBy("receptivity")}
            style={{
              padding: "5px 12px",
              border: sortBy === "receptivity" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: sortBy === "receptivity" ? "#1A1A1A" : "#FFFFFF",
              color: sortBy === "receptivity" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Receptivity</span>
            <span
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: 10,
                background: sortBy === "receptivity" ? "rgba(255,255,255,0.2)" : "#F4F1EA",
                color: sortBy === "receptivity" ? "#FFFFFF" : "#8A8A8A",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              12
            </span>
          </button>
          <button
            onClick={() => setSortBy("aum")}
            style={{
              padding: "5px 12px",
              border: sortBy === "aum" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: sortBy === "aum" ? "#1A1A1A" : "#FFFFFF",
              color: sortBy === "aum" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            AUM impact
          </button>
          <button
            onClick={() => setSortBy("client")}
            style={{
              padding: "5px 12px",
              border: sortBy === "client" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: sortBy === "client" ? "#1A1A1A" : "#FFFFFF",
              color: sortBy === "client" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Client
          </button>

          <span style={{ width: 1, height: 20, background: "#EDEAE3", margin: "0 8px" }} />

          <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", fontWeight: 600, marginRight: 4 }}>
            Filter
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "5px 12px",
              border: selectedCategory === "all" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: selectedCategory === "all" ? "#1A1A1A" : "#FFFFFF",
              color: selectedCategory === "all" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("asked")}
            style={{
              padding: "5px 12px",
              border: selectedCategory === "asked" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: selectedCategory === "asked" ? "#1A1A1A" : "#FFFFFF",
              color: selectedCategory === "asked" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Asked by client</span>
            <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: 10, background: selectedCategory === "asked" ? "rgba(255,255,255,0.2)" : "#F4F1EA", padding: "1px 5px", borderRadius: 3 }}>
              3
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory("life")}
            style={{
              padding: "5px 12px",
              border: selectedCategory === "life" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: selectedCategory === "life" ? "#1A1A1A" : "#FFFFFF",
              color: selectedCategory === "life" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Life event</span>
            <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: 10, background: selectedCategory === "life" ? "rgba(255,255,255,0.2)" : "#F4F1EA", padding: "1px 5px", borderRadius: 3 }}>
              2
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory("idle")}
            style={{
              padding: "5px 12px",
              border: selectedCategory === "idle" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: selectedCategory === "idle" ? "#1A1A1A" : "#FFFFFF",
              color: selectedCategory === "idle" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Idle cash</span>
            <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: 10, background: selectedCategory === "idle" ? "rgba(255,255,255,0.2)" : "#F4F1EA", padding: "1px 5px", borderRadius: 3 }}>
              8
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory("gap")}
            style={{
              padding: "5px 12px",
              border: selectedCategory === "gap" ? "1px solid #1A1A1A" : "1px solid #E0DCD2",
              background: selectedCategory === "gap" ? "#1A1A1A" : "#FFFFFF",
              color: selectedCategory === "gap" ? "#FCFCFA" : "#4A4A4A",
              borderRadius: 999,
              fontSize: 11,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Coverage gap</span>
            <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: 10, background: selectedCategory === "gap" ? "rgba(255,255,255,0.2)" : "#F4F1EA", padding: "1px 5px", borderRadius: 3 }}>
              7
            </span>
          </button>
        </div>

        {/* ── HIGH RECEPTIVITY OPPORTUNITIES LIST ──────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--qc-font-serif, Georgia, serif)",
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: "24px 0 14px",
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            They&apos;re ready to listen
            <span
              style={{
                fontFamily: "var(--qc-font-sans)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8A8A8A",
                fontWeight: 500,
              }}
            >
              {visibleOpportunities.length} clients · highest priority
            </span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visibleOpportunities.map((opp) => {
              const railColor = getRailColor(opp.category);
              const tagStyle = getTagBadgeStyle(opp.categoryLabel);
              const subTagStyle = opp.subCategory ? getTagBadgeStyle(opp.subCategory) : null;

              return (
                <div
                  key={opp.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #EDEAE3",
                    borderRadius: 10,
                    padding: 0,
                    display: "grid",
                    gridTemplateColumns: "6px 1fr",
                    overflow: "hidden",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  className="hover:border-[#E0DCD2] hover:shadow-sm"
                >
                  {/* Left color rail */}
                  <div style={{ background: railColor }} />

                  {/* Card Content Grid */}
                  <div
                    style={{
                      padding: "18px 22px",
                      display: "grid",
                      gridTemplateColumns: "220px 1fr auto",
                      gap: 22,
                      alignItems: "center",
                    }}
                    className="grid-cols-1 md:grid-cols-[200px_1fr_auto]"
                  >
                    {/* Client info */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 190 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#1A1A1A",
                          color: "#FCFCFA",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {opp.initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }} className="truncate">
                          {opp.clientName}
                        </div>
                        <div style={{ fontSize: 11, color: "#8A8A8A", fontFamily: "var(--qc-font-mono)" }}>
                          {opp.aum} · {opp.tenure}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div
                      style={{
                        borderLeft: "1px solid #EDEAE3",
                        paddingLeft: 22,
                        minWidth: 0,
                      }}
                      className="border-l-0 md:border-l pl-0 md:pl-5"
                    >
                      <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 9,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "2px 7px",
                            borderRadius: 3,
                            fontWeight: 600,
                            background: tagStyle.bg,
                            color: tagStyle.text,
                          }}
                        >
                          {opp.categoryLabel}
                        </span>

                        {opp.subCategory && subTagStyle && (
                          <span
                            style={{
                              fontSize: 9,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              padding: "2px 7px",
                              borderRadius: 3,
                              fontWeight: 600,
                              background: subTagStyle.bg,
                              color: subTagStyle.text,
                            }}
                          >
                            {opp.subCategory}
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: 10,
                            color: "#8A8A8A",
                            marginLeft: "auto",
                            fontFamily: "var(--qc-font-mono)",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          Fit
                          <span
                            style={{
                              display: "inline-block",
                              width: 60,
                              height: 4,
                              background: "#EDEAE3",
                              borderRadius: 2,
                              margin: "0 6px",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${opp.fitScore}%`,
                                background: "#6B21A8",
                              }}
                            />
                          </span>
                          {opp.fitScore}%
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: "var(--qc-font-serif, Georgia, serif)",
                          fontSize: 18,
                          fontWeight: 400,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.3,
                          marginBottom: 6,
                          color: "#1A1A1A",
                        }}
                      >
                        {opp.headline}
                        {opp.headlineAccent && (
                          <em style={{ fontStyle: "italic", color: "#6B21A8" }}>{opp.headlineAccent}</em>
                        )}
                        {opp.headlineRest}
                      </div>

                      <div style={{ fontSize: 12, color: "#4A4A4A", lineHeight: 1.5 }}>
                        {opp.evidenceLead}{" "}
                        {opp.strongEvidence && (
                          <strong style={{ color: "#1A1A1A", fontWeight: 600 }}>{opp.strongEvidence}</strong>
                        )}
                        {opp.quote && (
                          <span
                            style={{
                              fontStyle: "italic",
                              color: "#1A1A1A",
                              borderLeft: "2px solid #E0DCD2",
                              paddingLeft: 10,
                              marginTop: 6,
                              display: "block",
                              fontSize: 12,
                            }}
                          >
                            {opp.quote}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions & Metrics */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        alignItems: "flex-end",
                        minWidth: 130,
                      }}
                    >
                      <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A8A", fontWeight: 600 }}>
                        {opp.valueLabel}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--qc-font-serif, Georgia, serif)",
                          fontSize: 22,
                          fontWeight: 400,
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          color: opp.valueAlert ? "#C2410C" : "#6B21A8",
                        }}
                      >
                        {opp.valueText}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <button
                          onClick={() => handleDismiss(opp.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid #E0DCD2",
                            padding: "5px 10px",
                            borderRadius: 5,
                            fontSize: 11,
                            color: "#8A8A8A",
                            cursor: "pointer",
                          }}
                          className="hover:bg-[#EDEAE3]"
                        >
                          Dismiss
                        </button>
                        <Link
                          href={opp.briefHref || "/brief/priya-venkat"}
                          style={{
                            background: "transparent",
                            border: "1px solid #E0DCD2",
                            padding: "5px 10px",
                            borderRadius: 5,
                            fontSize: 11,
                            color: "#1A1A1A",
                            fontWeight: 500,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                          className="hover:bg-[#EDEAE3]"
                        >
                          <span>Brief →</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOOK-WIDE GAPS GRID (3 COLUMNS) ──────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--qc-font-serif, Georgia, serif)",
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: "32px 0 14px",
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            Book-wide gaps
            <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8A8A", fontWeight: 500 }}>
              Patterns across multiple clients
            </span>
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 12,
            }}
          >
            {BOOK_GAPS.map((gap, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EDEAE3",
                  borderRadius: 10,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8A8A", fontWeight: 600, marginBottom: 8 }}>
                  {gap.label}
                </div>
                <div style={{ fontFamily: "var(--qc-font-serif, Georgia, serif)", fontSize: 17, fontWeight: 400, marginBottom: 6, lineHeight: 1.3 }}>
                  {gap.headline}
                </div>
                <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 11, color: "#4A4A4A", marginBottom: 14 }}>
                  {gap.stat}
                </div>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #EDEAE3" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {gap.clients.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#1A1A1A",
                          color: "#FCFCFA",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 9,
                          fontWeight: 600,
                          border: "2px solid #FFFFFF",
                          marginLeft: idx === 0 ? 0 : -6,
                        }}
                      >
                        {c}
                      </div>
                    ))}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#8A8A8A",
                        color: "#FCFCFA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 600,
                        border: "2px solid #FFFFFF",
                        marginLeft: -6,
                      }}
                    >
                      {gap.overflow}
                    </div>
                  </div>

                  <span style={{ fontSize: 11, color: "#6B21A8", fontWeight: 600, cursor: "pointer" }} className="hover:underline">
                    {gap.cta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LIFE EVENTS TIMELINE (NEXT 90 DAYS) ─────────────────────────── */}
        <div>
          <h2
            style={{
              fontFamily: "var(--qc-font-serif, Georgia, serif)",
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: "32px 0 14px",
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            Life events · next 90 days
            <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8A8A", fontWeight: 500 }}>
              Birthdays, anniversaries, milestones
            </span>
          </h2>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #EDEAE3",
              borderRadius: 10,
              padding: "4px 0",
            }}
          >
            {LIFE_EVENTS.map((event, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr auto",
                  gap: 18,
                  padding: "14px 22px",
                  borderBottom: i === LIFE_EVENTS.length - 1 ? "none" : "1px solid #EDEAE3",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 11, fontFamily: "var(--qc-font-mono)", color: "#4A4A4A" }}>
                  <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#15803D", fontWeight: 600, display: "block", marginBottom: 2 }}>
                    {event.when}
                  </span>
                  {event.date}
                </div>

                <div style={{ fontSize: 13, color: "#1A1A1A" }}>
                  <strong style={{ fontWeight: 600 }}>{event.name}</strong> — {event.event}
                  <span style={{ display: "block", fontSize: 12, color: "#4A4A4A", marginTop: 3 }}>
                    {event.opp}
                  </span>
                </div>

                <button
                  style={{
                    background: "transparent",
                    border: "1px solid #E0DCD2",
                    padding: "5px 12px",
                    borderRadius: 5,
                    fontSize: 11,
                    color: "#4A4A4A",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                  className="hover:bg-[#EDEAE3]"
                >
                  Plan →
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export default function WealthOSDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading WealthOS…</div>}>
      <WealthOSDashboardContent />
    </Suspense>
  );
}
