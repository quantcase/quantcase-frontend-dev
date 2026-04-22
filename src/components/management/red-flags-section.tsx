import { SectionPanel } from "@/components/molecules/section-panel";
import type { RedFlag, RedFlagSeverity } from "@/types/management";

interface RedFlagsSectionProps {
  flags: RedFlag[];
}

function severityStyle(severity: RedFlagSeverity): { borderColor: string; titleColor: string; bulletColor: string; badgeBg: string; badgeText: string; badgeBorder: string } {
  if (severity === "caution") {
    return {
      borderColor: "var(--qc-warn)",
      titleColor: "var(--qc-warn)",
      bulletColor: "var(--qc-warn)",
      badgeBg: "var(--qc-warn-soft)",
      badgeText: "var(--qc-warn)",
      badgeBorder: "var(--qc-warn)",
    };
  }
  return {
    borderColor: "var(--qc-text-muted)",
    titleColor: "var(--qc-text-body)",
    bulletColor: "var(--qc-text-muted)",
    badgeBg: "var(--qc-surface-panel)",
    badgeText: "var(--qc-text-body)",
    badgeBorder: "var(--qc-border-default)",
  };
}

export function RedFlagsSection({ flags }: RedFlagsSectionProps) {
  const cautionCount = flags.filter(f => f.severity === "caution").length;
  const watchCount = flags.filter(f => f.severity === "watch").length;

  const headerAction = (
    <div className="flex items-center gap-2">
      {cautionCount > 0 && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--qc-warn)",
            background: "var(--qc-warn-soft)",
            border: "1px solid var(--qc-warn)",
            borderRadius: 4,
            padding: "3px 10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {cautionCount} Caution
        </div>
      )}
      {watchCount > 0 && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--qc-text-body)",
            background: "var(--qc-surface-panel)",
            border: "1px solid var(--qc-border-default)",
            borderRadius: 4,
            padding: "3px 10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {watchCount} Watch
        </div>
      )}
    </div>
  );

  return (
    <SectionPanel title="Red Flags" headerAction={headerAction} contentClassName="!p-0 overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: 400, borderTop: "1px solid var(--qc-border-inner)" }}>
        {flags.map((flag, i) => {
          const style = severityStyle(flag.severity);
          return (
            <div
              key={i}
              className="flex gap-0"
              style={{
                borderLeft: `3px solid ${style.borderColor}`,
                borderBottom: i < flags.length - 1 ? "1px solid var(--qc-border-inner)" : "none",
              }}
            >
              <div className="flex items-start gap-2 py-5 px-4 shrink-0" style={{ width: "30%" }}>
                <span style={{ color: style.bulletColor, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>■</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: style.titleColor, lineHeight: 1.45 }}>
                  {flag.title}
                </span>
              </div>

              <div style={{ width: 1, background: "var(--qc-border-default)", margin: "12px 0", flexShrink: 0 }} />

              <div className="flex-1 py-5 px-5">
                <p style={{ fontSize: 13, color: "var(--qc-text-muted)", lineHeight: 1.65 }}>
                  <span style={{ color: "var(--qc-text-body)", fontWeight: 500 }}>Evidence: </span>
                  {flag.evidence}
                </p>
                {flag.implication && (
                  <p style={{ fontSize: 13, color: "var(--qc-text-muted)", lineHeight: 1.65, marginTop: 6 }}>
                    <span style={{ color: "var(--qc-text-body)", fontWeight: 500 }}>Implication: </span>
                    {flag.implication}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}
