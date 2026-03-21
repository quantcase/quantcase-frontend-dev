import type { ReactNode } from "react";

interface SectionScoring {
  score: number;
  max_score: number;
  status?: string;
  status_color?: string;
}

function scoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct <= 0.4) return "#F8383C";
  if (pct <= 0.7) return "#FBBF24";
  return "#888888";
}

function SectionScoreBar({ scoring }: { scoring: SectionScoring }) {
  const parsedScore = parseFloat(String(scoring.score));
  const numericScore = !isNaN(parsedScore);
  const filled = numericScore ? Math.round(Math.min(parsedScore, scoring.max_score)) : 0;
  const total = scoring.max_score;
  const fillColor = numericScore ? scoreColor(parsedScore, scoring.max_score) : "#E2E8F0";
  const textColor = fillColor;

  return (
    <div className="shrink-0 flex items-center gap-2">
      <span style={{ fontSize: 13, fontWeight: 600, color: numericScore ? textColor : "#94a3b8", letterSpacing: "0.01em" }}>
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
                backgroundColor: i < filled ? fillColor : "#E2E8F0",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SectionPanelProps {
  title: string;
  subtitle?: string;
  scoring?: SectionScoring;
  children: ReactNode;
  contentClassName?: string;
}

export function SectionPanel({
  title,
  subtitle,
  scoring,
  children,
  contentClassName,
}: SectionPanelProps) {
  return (
    <div style={{ borderRadius: 10, border: "1px solid #E2E2E2", background: "#F5F5F5", padding: 8 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}>
        <div>
          <h5>{title}</h5>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {scoring && <SectionScoreBar scoring={scoring} />}
      </div>
      {/* Content box */}
      <div
        className={contentClassName}
        style={{
          borderRadius: 10,
          border: "1px solid rgba(226, 226, 226, 0.10)",
          background: "#FFF",
          paddingTop: 16,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
