import { Avatar, ActionButton, MonoLabel, GoldenCard } from "@/components/ds";

const AGENDA = [
  <><strong>Infra holding</strong> pending review (flagged 2w ago)</>,
  <>She asked about <strong>NPS allocation</strong> last call — never followed up</>,
  <><strong>Birthday next week</strong> · personal note worth sending</>,
];

const RAIL = (
  <>
    <MonoLabel size={10} tracking="0.14em" color="var(--qc-ink)" style={{ display: "block", marginBottom: 6 }}>
      NEXT MEETING · IN 47 MIN
    </MonoLabel>
    <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, color: "var(--qc-lime-ink)", fontFamily: "var(--qc-font-sans)" }}>
      11:30
    </div>
    <MonoLabel size={10.5} tracking="0.08em" color="var(--qc-ink)" style={{ display: "block", marginTop: 4 }}>
      Zoom · 30 min
    </MonoLabel>
  </>
);

const ENTITY = (
  <>
    <Avatar initials="PV" size={32} />
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--qc-lime-ink)" }}>
        Priya Venkat{" "}
        <MonoLabel size={11.5} tracking="0.02em" color="var(--qc-ink)" style={{ fontWeight: 400 }}>₹4.6 Cr</MonoLabel>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--qc-ink)", marginTop: 4 }}>
        Client since Mar 2022 · last met 11 Apr
      </div>
    </div>
  </>
);

const CONTENT = (
  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
    {AGENDA.map((item, i) => (
      <li key={i} style={{ fontSize: 12.5, color: "var(--qc-ink)", display: "flex", gap: 6, lineHeight: 1.5 }}>
        <span style={{ color: "var(--qc-ink)", flexShrink: 0 }}>→</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const ACTIONS = (
  <>
    <ActionButton style={{ borderRadius: 10, textAlign: "center", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)", color: "var(--qc-lime-ink)" }}>
      Brief me
    </ActionButton>
    <ActionButton variant="primary" style={{ borderRadius: 10, textAlign: "center" }}>
      Open file
    </ActionButton>
  </>
);

export function NextMeetingPrep() {
  return (
    <GoldenCard
      rail={RAIL}
      entity={ENTITY}
      sectionLabel="What to bring up"
      content={CONTENT}
      actions={ACTIONS}
    />
  );
}
