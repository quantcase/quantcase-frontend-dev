import { ActionButton, DarkGradientCard, MonoLabel } from "@/components/ds";

const CHIPS = [
  { pip: "var(--qc-down)", label: "Call Rahul" },
  { pip: "var(--qc-warn)", label: "EV report → Anita" },
  { pip: "var(--qc-blue)", label: "Rebalance Varun" },
];

export function TodaysBriefing() {
  return (
    <DarkGradientCard
      style={{
        padding: "22px 26px 20px",
        color: "#fff",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
      }}
    >

      <MonoLabel
        size={10}
        tracking="0.18em"
        color="rgba(255,255,255,0.5)"
        style={{ marginBottom: 28, position: "relative" }}
      >
        TODAY&apos;S BRIEF · 09:42 IST
      </MonoLabel>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
          margin: 0,
          maxWidth: "92%",
          position: "relative",
          fontFamily: "var(--qc-font-sans)",
          color: "var(--qc-on-dark)",
        }}
      >
        Three clients need a conversation before market open.{" "}
        <span style={{ color: "var(--qc-lime)", fontWeight: 500 }}>Rahul</span> first — small-cap drift +6%.
      </h2>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: "auto",
          paddingTop: 28,
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        {CHIPS.map(({ pip, label }) => (
          <ActionButton
            key={label}
            size="sm"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.92)",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: pip, flexShrink: 0, display: "inline-block" }} />
            {label}
          </ActionButton>
        ))}
      </div>
    </DarkGradientCard>
  );
}
