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
      className="inline-flex items-center gap-0.5"
      style={{ border: "1px solid #E2E2E2", borderRadius: 6, padding: 2 }}
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
              borderRadius: 4,
              border: "none",
              background: active ? "#0F172B" : "transparent",
              color: active ? "#fff" : "#888888",
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
