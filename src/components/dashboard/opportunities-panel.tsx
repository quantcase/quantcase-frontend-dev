import { Avatar, Badge, ActionButton, ColorRail, SectionHeader, MonoLabel } from "@/components/ds";
import type { BadgeVariant } from "@/components/ds/Badge";
import type { ReactNode } from "react";

type OppType = "crit" | "green" | "warn";

const RAIL_COLOR: Record<OppType, string> = {
  crit:  "var(--qc-down)",
  green: "var(--qc-up)",
  warn:  "var(--qc-warn)",
};

const TAG_VARIANT: Record<OppType, BadgeVariant> = {
  crit:  "crit",
  green: "up",
  warn:  "warn",
};

const TAG_LABEL: Record<OppType, string> = {
  crit:  "CLIENT ASKED",
  green: "LIFE EVENT",
  warn:  "IDLE CASH",
};

const FIT_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontFamily: "var(--qc-font-mono)",
  fontSize: 10.5,
  padding: "3px 8px",
  borderRadius: 999,
  background: "var(--qc-lime-soft)",
  color: "var(--qc-lime-ink)",
  border: "1px solid var(--qc-lime-edge)",
  letterSpacing: "0.04em",
};

interface Opp {
  id: string;
  type: OppType;
  initials: string;
  name: string;
  fit: string;
  lead: ReactNode;
  quote: string;
  value: string;
  valueBold: string;
}

const OPPS: Opp[] = [
  {
    id: "1",
    type: "crit",
    initials: "PV",
    name: "Priya Venkat",
    fit: "Fit 92%",
    lead: <>Asked about <i>NPS allocation</i> on last call. Never followed up.</>,
    quote: '"Should we be doing NPS? What\'s the actual tax benefit at our slab?" · 11 Apr',
    value: "~₹50K /yr value",
    valueBold: "₹50K",
  },
  {
    id: "2",
    type: "green",
    initials: "RM",
    name: "Rahul Mehta",
    fit: "Fit 88%",
    lead: <>Daughter <i>turns 14 this month</i>. No education corpus.</>,
    quote: "4 years to undergrad · current SIPs are general-purpose, no goal-linked plan",
    value: "₹35K/mo SIP",
    valueBold: "₹35K",
  },
  {
    id: "3",
    type: "warn",
    initials: "SN",
    name: "Suresh Nair",
    fit: "Fit 78%",
    lead: <><i>₹62 L</i> in savings for 4 months · ~₹2L/yr lost vs liquid funds</>,
    quote: "HDFC SB balance >₹50L since Dec · conservative profile fits liquid + ultra-short split",
    value: "₹2.1 L/yr uplift",
    valueBold: "₹2.1 L",
  },
];

export function OpportunitiesPanel() {
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MonoLabel tracking="0.16em">Opportunities worth a conversation</MonoLabel>
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                borderRadius: 999,
                background: "var(--qc-lime)",
                color: "var(--qc-ink)",
                fontFamily: "var(--qc-font-mono)",
                fontSize: 10,
                fontWeight: 500,
              }}
            >
              12
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--qc-ink-3)", marginTop: 6 }}>
            Observations from client data — ranked by receptivity, not commission
          </div>
        </div>
        <MonoLabel tracking="0.04em" color="var(--qc-ink-3)" style={{ cursor: "pointer" }}>
          All 12 →
        </MonoLabel>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {OPPS.map((opp) => (
          <article
            key={opp.id}
            style={{
              border: "1px solid var(--qc-hair)",
              borderRadius: 14,
              background: "#fff",
              padding: "16px 18px 14px",
              display: "flex",
              flexDirection: "column",
              minHeight: 220,
              position: "relative",
            }}
          >
            <ColorRail color={RAIL_COLOR[opp.type]} />

            {/* Head: avatar + fit */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={opp.initials} size={32} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)" }}>{opp.name}</span>
              </div>
              <span style={FIT_STYLE}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--qc-lime-ink)", display: "inline-block" }} />
                {opp.fit}
              </span>
            </div>

            <Badge variant={TAG_VARIANT[opp.type]} style={{ marginBottom: 10 }}>{TAG_LABEL[opp.type]}</Badge>

            {/* Lead */}
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--qc-ink)", marginBottom: 8 }}>
              {opp.lead}
            </div>

            {/* Quote */}
            <div
              style={{
                fontSize: 11.5,
                color: "var(--qc-ink-2)",
                fontStyle: "italic",
                padding: "8px 0",
                borderTop: "1px dashed var(--qc-hair-2)",
                lineHeight: 1.5,
              }}
            >
              {opp.quote}
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 8,
                borderTop: "1px dashed var(--qc-hair-2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <MonoLabel size={11.5} tracking="0.02em" color="var(--qc-ink-2)">
                ~<b style={{ color: "var(--qc-ink)", fontWeight: 500 }}>{opp.valueBold}</b>{" "}
                {opp.value.replace(opp.valueBold, "").trim()}
              </MonoLabel>
              <ActionButton size="sm">Brief →</ActionButton>
            </div>
          </article>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 12,
          borderTop: "1px solid var(--qc-hair)",
        }}
      >
        <MonoLabel size={11} tracking="0.02em" color="var(--qc-ink-2)">
          <b style={{ color: "var(--qc-ink)", fontWeight: 500 }}>9 more</b>{" "}
          opportunities · ₹38.4 Cr total opportunity AUM · 7 coverage gaps · ₹14.2 Cr idle cash across book
        </MonoLabel>
        <ActionButton noWrap>Open Opportunities →</ActionButton>
      </div>
    </section>
  );
}
