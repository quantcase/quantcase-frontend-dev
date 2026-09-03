import { TodaysBriefing } from "@/components/dashboard/todays-briefing";
import { ClientsAttentionScroll } from "@/components/dashboard/clients-attention-scroll";
import { ObsidianHoldingsGraph } from "@/components/dashboard/obsidian-holdings-graph";
import { NextMeetingPrep } from "@/components/dashboard/next-meeting-prep";
import { WhoToCallToday } from "@/components/dashboard/who-to-call-today";
import { BookAtAGlance } from "@/components/dashboard/book-at-a-glance";
import { TodaysTasks } from "@/components/dashboard/todays-tasks";
import { WhatChangedToday } from "@/components/dashboard/what-changed-today";
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
    <div style={{ background: "var(--qc-bg)", minHeight: "100vh" }}>
      <main
        style={{
          padding: "24px 32px 60px",
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
            marginBottom: 20,
          }}
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
            TOP ROW — Today's Brief (Compact) + Horizontally Scrollable Clients Needing Attention
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "330px 1fr",
            gap: 14,
            marginBottom: 20,
            alignItems: "stretch",
          }}
        >
          <TodaysBriefing />
          <ClientsAttentionScroll />
        </section>

        {/* ════════════════════════════════════════════════════════════
            OBSIDIAN HOLDINGS NETWORK GRAPH (RM at Center, Clients & Holdings Branching Out)
        ═══════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 24 }}>
          <ObsidianHoldingsGraph />
        </section>

        {/* ════════════════════════════════════════════════════════════
            NEXT MEETING STRIP
        ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 24 }}>
          <NextMeetingPrep />
        </div>

        {/* ════════════════════════════════════════════════════════════
            TWO-COLUMN — Who to call (left) + Book glance + Tasks (right)
        ═══════════════════════════════════════════════════════════════ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 24,
            marginBottom: 24,
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
            OPPORTUNITIES WORTH A CONVERSATION
        ═══════════════════════════════════════════════════════════════ */}
        <OpportunitiesPanel />

      </main>
    </div>
  );
}
