import { SectionPanel } from "@/components/molecules/section-panel";
import type { RedFlag, RedFlagSeverity } from "@/types/management";

interface RedFlagsSectionProps {
  flags: RedFlag[];
}

function severityStyle(severity: RedFlagSeverity): { borderColor: string; titleColor: string; bulletColor: string; badgeBg: string; badgeText: string } {
  if (severity === "caution") {
    return {
      borderColor: "#d97706",   // amber-600
      titleColor: "#b45309",    // amber-700
      bulletColor: "#d97706",
      badgeBg: "#fffbeb",
      badgeText: "#b45309",
    };
  }
  // watch
  return {
    borderColor: "#71717a",     // zinc-500
    titleColor: "#52525b",      // zinc-600
    bulletColor: "#71717a",
    badgeBg: "#f4f4f5",
    badgeText: "#52525b",
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
            color: "#b45309",
            background: "#fffbeb",
            border: "1px solid #fde68a",
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
            color: "#52525b",
            background: "#f4f4f5",
            border: "1px solid #e4e4e7",
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
    <SectionPanel title="Red Flags" headerAction={headerAction} contentClassName="!p-0">
      <div className="divide-y divide-zinc-100">
        {flags.map((flag, i) => {
          const style = severityStyle(flag.severity);
          return (
            <div
              key={i}
              className="flex gap-0"
              style={{ borderLeft: `3px solid ${style.borderColor}` }}
            >
              {/* Left: title */}
              <div
                className="flex items-start gap-2 py-5 px-4 shrink-0"
                style={{ width: "30%" }}
              >
                <span style={{ color: style.bulletColor, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>■</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: style.titleColor,
                    lineHeight: 1.45,
                  }}
                >
                  {flag.title}
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: 1, background: "#E2E2E2", margin: "12px 0", flexShrink: 0 }} />

              {/* Right: evidence + implication */}
              <div className="flex-1 py-5 px-5">
                <p style={{ fontSize: 13, color: "#888888", lineHeight: 1.65 }}>
                  <span style={{ color: "#555555", fontWeight: 500 }}>Evidence: </span>
                  {flag.evidence}
                </p>
                {flag.implication && (
                  <p style={{ fontSize: 13, color: "#888888", lineHeight: 1.65, marginTop: 6 }}>
                    <span style={{ color: "#555555", fontWeight: 500 }}>Implication: </span>
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
