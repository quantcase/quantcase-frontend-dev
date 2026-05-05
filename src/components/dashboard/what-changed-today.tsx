import { ActionButton, LimeCountPip, MonoLabel } from "@/components/ds";
import { Clock4 } from "lucide-react";

const DOT_COLOR: Record<string, string> = {
  alert:     "var(--qc-down)",
  research:  "var(--qc-blue)",
  completed: "var(--qc-up)",
  action:    "var(--qc-warn)",
};

const ITEMS = [
  {
    id: "1",
    time: "09:42",
    kind: "alert",
    kindLabel: "ALERT",
    title: "Meridian Holdings — portfolio value below threshold",
    desc: <>Triggered drift alert. Held by <b>Rahul Mehta</b> (₹3.2 Cr). Position size 4.2% of book.</>,
    cta: "Review →",
  },
  {
    id: "2",
    time: "08:15",
    kind: "research",
    kindLabel: "RESEARCH",
    title: "Emerging Markets Outlook — new note published",
    desc: <>Relevant to <b>4 clients</b>: Anita Shah, Priya Venkat, Suresh Nair, Kapoor &amp; Sons. Auto-tagged to portfolios.</>,
    cta: "Read →",
  },
  {
    id: "3",
    time: "07:50",
    kind: "completed",
    kindLabel: "COMPLETED",
    title: "Northwind Capital — rebalance executed",
    desc: <>6 holdings rebalanced successfully. Confirmation sent to client. No further action needed.</>,
    cta: "View →",
  },
  {
    id: "4",
    time: "Yest",
    kind: "action",
    kindLabel: "ACTION",
    title: "Apex Ventures — redemption request ₹8.2 Cr",
    desc: <>Submitted by client. Pending your approval. Settlement timeline: T+2.</>,
    cta: "Approve →",
  },
  {
    id: "5",
    time: "Yest",
    kind: "research",
    kindLabel: "RESEARCH",
    title: "Bluechip Growth Fund — Q4 transcript flagged",
    desc: <>Management tone analysis flagged for review. Held by <b>3 clients</b>. Worth reading before next call.</>,
    cta: "Open →",
  },
];

export function WhatChangedToday() {
  return (
    <section style={{ marginBottom: 28 }}>
      <div
        className="rounded-[10px] p-2"
        style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
      >
        {/* Header */}
        <div className="px-2 pt-1 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock4 className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
            <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">What changed today</MonoLabel>
            <LimeCountPip count={5} />
          </div>
          <MonoLabel tracking="0.04em" color="var(--qc-ink-3)" style={{ cursor: "pointer" }}>
            All activity →
          </MonoLabel>
        </div>

        {/* Content */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: "var(--qc-card)", padding: "4px 18px", position: "relative" }}
        >
          {/* Vertical rail line */}
          <div
            style={{
              position: "absolute",
              top: 28,
              bottom: 28,
              left: 116,
              width: 1,
              background: "var(--qc-hair)",
              pointerEvents: "none",
            }}
          />

          {ITEMS.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "84px 16px 1fr auto",
                gap: 14,
                padding: "16px 0",
                borderTop: i === 0 ? "none" : "1px dashed var(--qc-hair-2)",
                alignItems: "flex-start",
                position: "relative",
              }}
            >
              {/* Time + kind */}
              <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: 11, color: "var(--qc-ink-2)" }}>
                {item.time}
                <MonoLabel
                  size={9.5}
                  tracking="0.14em"
                  color={DOT_COLOR[item.kind]}
                  style={{ display: "block", marginTop: 4 }}
                >
                  {item.kindLabel}
                </MonoLabel>
              </div>

              {/* Timeline dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: DOT_COLOR[item.kind],
                  marginTop: 5,
                  border: "2px solid var(--qc-card)",
                  boxShadow: "0 0 0 1px var(--qc-hair)",
                  position: "relative",
                  zIndex: 1,
                  justifySelf: "center",
                }}
              />

              {/* Body */}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4, color: "var(--qc-ink)" }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--qc-ink-2)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>

              <ActionButton noWrap>{item.cta}</ActionButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
