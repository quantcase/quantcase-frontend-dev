import { RMPortfolioSignalGraph } from "@/components/dashboard/rm-portfolio-signal-graph";
import type { RMNode } from "@/components/dashboard/rm-portfolio-signal-graph";
import { TodaysBriefing } from "@/components/dashboard/todays-briefing";
import { NextMeetingPrep } from "@/components/dashboard/next-meeting-prep";
import { WhoToCallToday } from "@/components/dashboard/who-to-call-today";
import { BookAtAGlance } from "@/components/dashboard/book-at-a-glance";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { WhatChangedToday } from "@/components/dashboard/what-changed-today";
import { SmartSegmentsPills } from "@/components/dashboard/smart-segments-pills";
import { ResearchTerminalNudge } from "@/components/dashboard/research-terminal-nudge";
import { OpportunitiesPanel } from "@/components/dashboard/opportunities-panel";
import type { TaskItem } from "@/components/dashboard/todays-tasks";

// ── RM Signal Graph data ──────────────────────────────────────────────────────

const RM_GRAPH_DATA: RMNode[] = [
  {
    id: "rm-palash",
    name: "Palash Jain",
    initials: "PJ",
    severity: "critical",
    clients: [
      {
        id: "cli-rahul",
        name: "Rahul Mehta",
        aum: "₹3.2 Cr",
        severity: "critical",
        assetClasses: [
          {
            id: "ac-eq-rm",
            label: "Equity",
            severity: "critical",
            subclasses: [
              { id: "sub-midcap", label: "Mid-cap",    severity: "critical", signal: "Drift +6%" },
              { id: "sub-lrgcap", label: "Large-cap",  severity: "clean",   signal: "On track"  },
            ],
          },
          {
            id: "ac-mf-rm",
            label: "Mutual Funds",
            severity: "moderate",
            subclasses: [
              { id: "sub-hybrid", label: "Hybrid",   severity: "moderate", signal: "Rebalance due" },
            ],
          },
        ],
      },
      {
        id: "cli-varun",
        name: "Varun Kapoor",
        aum: "₹7.1 Cr",
        severity: "critical",
        assetClasses: [
          {
            id: "ac-eq-vk",
            label: "Equity",
            severity: "critical",
            subclasses: [
              { id: "sub-midcap-vk", label: "Mid-cap",    severity: "critical", signal: "Overweight +9%" },
              { id: "sub-smcap-vk", label: "Small-cap",   severity: "warning",  signal: "Threshold near" },
            ],
          },
          {
            id: "ac-bonds-vk",
            label: "Bonds",
            severity: "clean",
            subclasses: [
              { id: "sub-gsec", label: "G-Sec", severity: "clean", signal: "Normal" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rm-sonal",
    name: "Sonal Batra",
    initials: "SB",
    severity: "warning",
    clients: [
      {
        id: "cli-anita",
        name: "Anita Shah",
        aum: "₹5.8 Cr",
        severity: "warning",
        assetClasses: [
          {
            id: "ac-eq-as",
            label: "Equity",
            severity: "warning",
            subclasses: [
              { id: "sub-ev",    label: "EV / Green", severity: "warning",  signal: "Report pending" },
              { id: "sub-it-as", label: "IT",         severity: "moderate", signal: "Watch"         },
            ],
          },
          {
            id: "ac-realty-as",
            label: "Realty",
            severity: "clean",
            subclasses: [
              { id: "sub-realty", label: "REITs", severity: "clean", signal: "Stable" },
            ],
          },
        ],
      },
      {
        id: "cli-suresh",
        name: "Suresh Nair",
        aum: "₹2.4 Cr",
        severity: "clean",
        assetClasses: [
          {
            id: "ac-mf-sn",
            label: "Mutual Funds",
            severity: "clean",
            subclasses: [
              { id: "sub-debt-sn",  label: "Debt",   severity: "clean", signal: "Stable" },
              { id: "sub-equity-sn", label: "Equity", severity: "clean", signal: "Stable" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "rm-arjun",
    name: "Arjun Rao",
    initials: "AR",
    severity: "moderate",
    clients: [
      {
        id: "cli-priya",
        name: "Priya Venkat",
        aum: "₹4.6 Cr",
        severity: "moderate",
        assetClasses: [
          {
            id: "ac-eq-pv",
            label: "Equity",
            severity: "moderate",
            subclasses: [
              { id: "sub-infra",   label: "Infra",      severity: "moderate", signal: "Pending review" },
              { id: "sub-pharma",  label: "Pharma",     severity: "clean",    signal: "On track"      },
            ],
          },
          {
            id: "ac-intl-pv",
            label: "Intl Funds",
            severity: "warning",
            subclasses: [
              { id: "sub-us",  label: "US Equity", severity: "warning", signal: "FX exposure" },
            ],
          },
        ],
      },
    ],
  },
];

const TODAYS_TASKS: TaskItem[] = [
  { id: "1", label: "Send Rahul updated portfolio PDF", status: "pending", meta: "By 10:00" },
  { id: "2", label: "Share EV report with Anita",       status: "overdue", meta: "Overdue · 5 days" },
  { id: "3", label: "KYC renewal — Suresh Nair",        status: "done",    meta: "Done · 09:12"    },
  { id: "4", label: "Q4 review prep — Kapoor & Sons",   status: "pending", meta: "Tomorrow · 14:00" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const greeting = getGreeting();
  const today = getTodayLabel();

  return (
    <div className="min-h-screen mb-16 px-6" style={{ background: "var(--qc-surface-white)" }}>
      <div className="space-y-6">

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", fontSize: 38, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, color: "var(--qc-text-heading)" }}>
              {greeting}<span style={{ color: "var(--qc-text-muted)" }}>,</span> Palash
            </h1>
            <p style={{ fontSize: 13, color: "var(--qc-text-muted)", marginTop: 6 }}>
              {today} · 18 clients · ₹796 Cr book
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-[12px] font-medium px-4 py-2 rounded-md"
              style={{ background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }}
            >
              + New Review
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            HERO ROW — Today's Brief + Portfolio Signal Map
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-[1fr_1.1fr] gap-4" style={{ minHeight: 360 }}>
          <TodaysBriefing />
          <RMPortfolioSignalGraph rms={RM_GRAPH_DATA} className="h-full" />
        </div>

        {/* ════════════════════════════════════════════════════════════
            NEXT MEETING PREP STRIP
        ═══════════════════════════════════════════════════════════════ */}
        <NextMeetingPrep />

        {/* ════════════════════════════════════════════════════════════
            TWO-COLUMN ROW — Who to call (left) + Today stack (right)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-[2fr_1fr] gap-4 items-start">
          <WhoToCallToday />
          <div className="flex flex-col gap-4">
            <BookAtAGlance />
            <TodaysTasks tasks={TODAYS_TASKS} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            WHAT CHANGED TODAY
        ═══════════════════════════════════════════════════════════════ */}
        <WhatChangedToday />

        {/* ════════════════════════════════════════════════════════════
            SMART SEGMENTS
        ═══════════════════════════════════════════════════════════════ */}
        <SmartSegmentsPills />

        {/* ════════════════════════════════════════════════════════════
            RESEARCH TERMINAL NUDGE
        ═══════════════════════════════════════════════════════════════ */}
        <ResearchTerminalNudge />

        {/* ════════════════════════════════════════════════════════════
            OPPORTUNITIES WORTH A CONVERSATION
        ═══════════════════════════════════════════════════════════════ */}
        <OpportunitiesPanel />

      </div>
    </div>
  );
}
