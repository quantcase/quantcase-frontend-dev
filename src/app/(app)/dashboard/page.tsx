import { TodaysBriefing } from "@/components/dashboard/todays-briefing";
import { ClientsAttentionScroll } from "@/components/dashboard/clients-attention-scroll";
import { RMHeartbeatGraph } from "@/components/dashboard/rm-heartbeat-graph";
import { WhatChangedToday } from "@/components/dashboard/what-changed-today";
import { NextMeetingPrep } from "@/components/dashboard/next-meeting-prep";
import { WhoToCallToday } from "@/components/dashboard/who-to-call-today";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { SmartSegmentsPills } from "@/components/dashboard/smart-segments-pills";
import { OpportunitiesPanel } from "@/components/dashboard/opportunities-panel";
import type { TaskItem } from "@/components/dashboard/todays-tasks";

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
    <div style={{ background: "var(--qc-bg)", minHeight: "100vh" }} className="w-full min-w-0">
      <main
        style={{
          padding: "24px 32px 60px",
          maxWidth: 1440,
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-ink)",
        }}
        className="w-full min-w-0 mx-auto"
      >
        {/* ── Page header ───────────────────────────────────────────────── */}
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
          className="w-full min-w-0"
        >
          <div>
            <h1
              style={{
                fontSize: 28,
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
                marginTop: 5,
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
              padding: "8px 14px",
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
            1. TOP ROW — Today's Brief (Compact) + Horizontally Scrollable Clients Needing Attention
        ═══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] gap-3.5 mb-5 items-stretch w-full min-w-0">
          <div className="w-full min-w-0 flex flex-col">
            <TodaysBriefing />
          </div>
          <div className="w-full min-w-0 flex flex-col">
            <ClientsAttentionScroll />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. RM HEARTBEAT GRAPH (RM at Center, Clients & Holdings Branching Out)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="mb-6 w-full min-w-0">
          <RMHeartbeatGraph />
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. WHAT CHANGED TODAY (Directly below the graph)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full min-w-0 mb-6">
          <WhatChangedToday />
        </div>

        {/* ════════════════════════════════════════════════════════════
            4. NEXT MEETING STRIP
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-6 w-full min-w-0">
          <NextMeetingPrep />
        </div>

        {/* ════════════════════════════════════════════════════════════
            5. TWO-COLUMN — Who to call (left) + Today's Tasks (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 mb-6 w-full min-w-0 items-start">
          <div className="w-full min-w-0">
            <WhoToCallToday />
          </div>
          <div className="w-full min-w-0">
            <TodaysTasks tasks={TODAYS_TASKS} />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            6. SMART SEGMENTS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full min-w-0 mb-6">
          <SmartSegmentsPills />
        </div>

        {/* ════════════════════════════════════════════════════════════
            7. OPPORTUNITIES WORTH A CONVERSATION
        ═══════════════════════════════════════════════════════════════ */}
        <div className="w-full min-w-0">
          <OpportunitiesPanel />
        </div>

      </main>
    </div>
  );
}
