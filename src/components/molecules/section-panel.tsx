import type { ReactNode } from "react";

interface SectionScoring {
  score: number;
  max_score: number;
  status?: string;
  status_color?: string;
}

function scoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct <= 0.4) return "var(--qc-down)";
  if (pct <= 0.7) return "var(--qc-warn)";
  return "var(--qc-up)";
}

function SectionScoreBar({ scoring }: { scoring: SectionScoring }) {
  const parsedScore = parseFloat(String(scoring.score));
  const numericScore = !isNaN(parsedScore);
  const filled = numericScore ? Math.round(Math.min(parsedScore, scoring.max_score)) : 0;
  const total = scoring.max_score;
  const fillColor = numericScore ? scoreColor(parsedScore, scoring.max_score) : "var(--qc-hair)";
  const textColor = fillColor;

  return (
    <div className="shrink-0 flex items-center gap-2">
      <span style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: numericScore ? textColor : "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)", letterSpacing: "0.01em" }}>
        {numericScore ? `${parsedScore}/${scoring.max_score}` : "N/A"}
      </span>
      {numericScore && (
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 12,
                flexShrink: 0,
                borderRadius: 1,
                backgroundColor: i < filled ? fillColor : "var(--qc-hair)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SectionPanelProps {
  title: ReactNode;
  subtitle?: string;
  scoring?: SectionScoring;
  headerAction?: ReactNode;
  subHeader?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionPanel({
  title,
  subtitle,
  scoring,
  headerAction,
  subHeader,
  children,
  className,
  contentClassName,
}: SectionPanelProps) {
  return (
    <div
      className={`flex flex-col${className ? ` ${className}` : ""}`}
      style={{
        borderRadius: 10,
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-section)",
        padding: 8,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}>
        <div className="flex flex-col" style={{ gap: subHeader ? 6 : 0 }}>
          {typeof title === "string" ? (
            <div style={{ fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", fontFamily: "var(--qc-font-sans)", letterSpacing: "0.01em" }}>{title}</div>
          ) : title}
          {subtitle && <p style={{ margin: 0, fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-regular)", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.3 }}>{subtitle}</p>}
          {subHeader && <div>{subHeader}</div>}
        </div>
        {scoring && <SectionScoreBar scoring={scoring} />}
        {headerAction && <div>{headerAction}</div>}
      </div>
      {/* Content box */}
      <div
        className={`flex-1 ${contentClassName ?? ""}`}
        style={{
          borderRadius: 10,
          border: "1px solid var(--qc-hair-2)",
          background: "var(--qc-card)",
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
