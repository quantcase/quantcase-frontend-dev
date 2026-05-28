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
    borderColor: "var(--qc-ink-2)",
    titleColor: "var(--qc-ink)",
    bulletColor: "var(--qc-ink-2)",
    badgeBg: "var(--qc-section)",
    badgeText: "var(--qc-ink)",
    badgeBorder: "var(--qc-hair)",
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
            fontSize: "var(--qc-fz-11)",
            fontWeight: "var(--qc-w-semi)",
            fontFamily: "var(--qc-font-sans)",
            color: "var(--qc-warn)",
            background: "var(--qc-warn-soft)",
            border: "1px solid var(--qc-warn)",
            borderRadius: 4,
            padding: "3px 10px",
            textTransform: "uppercase",
            letterSpacing: "var(--qc-track-pill)",
          }}
        >
          {cautionCount} Caution
        </div>
      )}
      {watchCount > 0 && (
        <div
          style={{
            fontSize: "var(--qc-fz-11)",
            fontWeight: "var(--qc-w-semi)",
            fontFamily: "var(--qc-font-sans)",
            color: "var(--qc-ink)",
            background: "var(--qc-section)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 4,
            padding: "3px 10px",
            textTransform: "uppercase",
            letterSpacing: "var(--qc-track-pill)",
          }}
        >
          {watchCount} Watch
        </div>
      )}
    </div>
  );

  return (
    <SectionPanel title="Red Flags" headerAction={headerAction} contentClassName="!p-0 overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: 400, borderTop: "1px solid var(--qc-hair-2)" }}>
        {flags.map((flag, i) => {
          const style = severityStyle(flag.severity);
          return (
            <div
              key={i}
              className="flex gap-0"
              style={{
                borderLeft: `3px solid ${style.borderColor}`,
                borderBottom: i < flags.length - 1 ? "1px solid var(--qc-hair-2)" : "none",
              }}
            >
              <div className="flex items-start gap-2 py-5 px-4 shrink-0" style={{ width: "30%" }}>
                <span style={{ color: style.bulletColor, fontSize: "var(--qc-fz-14)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.4, flexShrink: 0 }}>■</span>
                <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: style.titleColor, lineHeight: 1.45 }}>
                  {flag.title}
                </span>
              </div>

              <div style={{ width: 1, background: "var(--qc-hair)", margin: "12px 0", flexShrink: 0 }} />

              <div className="flex-1 py-5 px-5">
                <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", lineHeight: 1.65 }}>
                  <span style={{ color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)" }}>Evidence: </span>
                  {flag.evidence}
                </p>
                {flag.implication && (
                  <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-2)", lineHeight: 1.65, marginTop: 6 }}>
                    <span style={{ color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)" }}>Implication: </span>
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
