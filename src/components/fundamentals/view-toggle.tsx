import { TableIcon, BarChart2 } from "lucide-react";

export function ViewToggle({
  view,
  onChange,
}: {
  view: "table" | "chart";
  onChange: (v: "table" | "chart") => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        background: "var(--qc-surface-panel)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 10,
        padding: 3,
      }}
    >
      {(["table", "chart"] as const).map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "none",
              background: active ? "var(--qc-accent-primary)" : "transparent",
              color: active ? "var(--qc-accent-primary-fg)" : "var(--qc-text-muted)",
              cursor: "pointer",
            }}
          >
            {v === "table" ? <TableIcon size={13} /> : <BarChart2 size={13} />}
          </button>
        );
      })}
    </div>
  );
}
