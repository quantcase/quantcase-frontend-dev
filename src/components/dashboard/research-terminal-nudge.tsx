import { Search } from "lucide-react";

export function ResearchTerminalNudge() {
  return (
    <div
      className="flex items-center justify-between px-5 py-5 rounded-[10px]"
      style={{ border: "1px dashed var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", color: "var(--qc-text-body)" }}
        >
          <Search className="size-5" />
        </div>
        <div>
          <p className="text-[17px] font-normal" style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}>
            Research Terminal
          </p>
          <p className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>
            <strong style={{ color: "var(--qc-text-heading)", fontWeight: 500 }}>3 thesis updates</strong>
            {" · "}
            <strong style={{ color: "var(--qc-text-heading)", fontWeight: 500 }}>5 catalysts in next 30 days</strong>
            {" · IC drafts, watchlists & signal changes"}
          </p>
        </div>
      </div>
      <button
        className="text-[11px] font-medium px-3.5 py-1.5 rounded-md whitespace-nowrap"
        style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", color: "var(--qc-text-body)" }}
      >
        Open Research →
      </button>
    </div>
  );
}
