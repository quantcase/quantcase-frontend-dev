import { ActionButton, LimeGradientCard, MonoLabel } from "@/components/ds";

export function ResearchTerminalNudge() {
  return (
    <LimeGradientCard
      radius={14}
      style={{
        padding: "16px 22px",
        display: "grid",
        gridTemplateColumns: "28px 1fr auto",
        gap: 14,
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        style={{ width: 24, height: 24, color: "var(--qc-lime-ink)" }}
      >
        <circle cx="11" cy="11" r="7"/>
        <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
      </svg>

      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: "var(--qc-lime-ink)" }}>
          Research Terminal
        </div>
        <MonoLabel size={11} tracking="0.04em" color="var(--qc-lime-ink-2)">
          3 thesis updates · 5 catalysts in next 30 days · IC drafts, watchlists &amp; signal changes
        </MonoLabel>
      </div>

      <ActionButton
        noWrap
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.7)",
          color: "var(--qc-lime-ink)",
          borderRadius: 999,
        }}
      >
        Open Research →
      </ActionButton>
    </LimeGradientCard>
  );
}
