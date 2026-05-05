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
              { id: "sub-midcap", label: "Mid-cap",   severity: "critical", signal: "Drift +6%"  },
              { id: "sub-lrgcap", label: "Large-cap", severity: "clean",    signal: "On track"   },
            ],
          },
          {
            id: "ac-mf-rm",
            label: "Mutual Funds",
            severity: "moderate",
            subclasses: [
              { id: "sub-hybrid", label: "Hybrid", severity: "moderate", signal: "Rebalance due" },
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
              { id: "sub-midcap-vk", label: "Mid-cap",   severity: "critical", signal: "Overweight +9%"  },
              { id: "sub-smcap-vk",  label: "Small-cap", severity: "warning",  signal: "Threshold near" },
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
              { id: "sub-it-as", label: "IT",         severity: "moderate", signal: "Watch"          },
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
              { id: "sub-debt-sn",   label: "Debt",   severity: "clean", signal: "Stable" },
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
              { id: "sub-infra",  label: "Infra",  severity: "moderate", signal: "Pending review" },
              { id: "sub-pharma", label: "Pharma", severity: "clean",    signal: "On track"       },
            ],
          },
          {
            id: "ac-intl-pv",
            label: "Intl Funds",
            severity: "warning",
            subclasses: [
              { id: "sub-us", label: "US Equity", severity: "warning", signal: "FX exposure" },
            ],
          },
        ],
      },
    ],
  },
];

const TODAYS_TASKS: TaskItem[] = [
  { id: "1", label: "Send Rahul updated portfolio PDF", status: "pending", meta: "BY 10:00"        },
  { id: "2", label: "Share EV report with Anita",       status: "overdue", meta: "OVERDUE · 5 DAYS" },
  { id: "3", label: "KYC renewal — Suresh Nair",        status: "done",    meta: "DONE · 09:12"     },
  { id: "4", label: "Q4 review prep — Kapoor & Sons",   status: "pending", meta: "TOMORROW · 14:00" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayMeta(): string {
  const d = new Date();
  const day = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const date = d.getDate();
  return `${day}, ${month} ${date}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const greeting = getGreeting();
  const todayMeta = getTodayMeta();

  return (
    <div style={{ background: "var(--qc-bg)", minHeight: "100vh" }}>
      <main
        style={{
          padding: "28px 36px 60px",
          maxWidth: 1440,
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink)",
        }}
      >
        {/* ── Page header ───────────────────────────────────────────────── */}
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.15,
                color: "var(--qc-ink)",
                fontFamily: "var(--qc-font-sans)",
              }}
            >
              {greeting}, <span style={{ fontWeight: 500 }}>Palash</span>
            </h1>
            <div
              style={{
                marginTop: 6,
                fontFamily: "var(--qc-font-mono)",
                fontSize: 11,
                color: "var(--qc-ink-3)",
                letterSpacing: "0.04em",
              }}
            >
              {todayMeta}
              <span style={{ padding: "0 8px", color: "var(--qc-ink-3)" }}>·</span>
              18 CLIENTS
              <span style={{ padding: "0 8px", color: "var(--qc-ink-3)" }}>·</span>
              ₹796 CR BOOK
            </div>
          </div>
          <button
            style={{
              background: "var(--qc-ink)",
              color: "#fff",
              border: "1px solid var(--qc-ink)",
              borderRadius: 10,
              padding: "9px 14px",
              fontSize: 12.5,
              fontWeight: 500,
              fontFamily: "var(--qc-font-sans)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + New Review
          </button>
        </header>

        {/* ════════════════════════════════════════════════════════════
            TOP ROW — Today's Brief + RM Heartbeat
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 3fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <TodaysBriefing />
          <RMPortfolioSignalGraph rms={RM_GRAPH_DATA} className="h-full" />
        </section>

        {/* ════════════════════════════════════════════════════════════
            NEXT MEETING STRIP
        ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28 }}>
          <NextMeetingPrep />
        </div>

        {/* ════════════════════════════════════════════════════════════
            TWO-COLUMN — Who to call (left) + Book glance + Tasks (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 28,
            marginBottom: 28,
          }}
        >
          <WhoToCallToday />
          <aside>
            <BookAtAGlance />
            <TodaysTasks tasks={TODAYS_TASKS} />
          </aside>
        </section>

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

      </main>
    </div>
  );
}
