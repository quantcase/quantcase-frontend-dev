import type { ReactNode } from "react";

interface SectionScoring {
  score: number;
  max_score: number;
  status?: string;
  status_color?: string;
}

const SEGMENT_FILL_COLORS: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const SEGMENT_TEXT_COLORS: Record<string, string> = {
  green: "#16a34a",
  yellow: "#a16207",
  red: "#dc2626",
};

function SectionScoreBar({ scoring }: { scoring: SectionScoring }) {
  const filled = Math.round(Math.min(scoring.score, scoring.max_score));
  const total = scoring.max_score;
  const colorKey = scoring.status_color ?? "green";
  const fillColor = SEGMENT_FILL_COLORS[colorKey] ?? SEGMENT_FILL_COLORS.green;
  const textColor = SEGMENT_TEXT_COLORS[colorKey] ?? SEGMENT_TEXT_COLORS.green;

  return (
    <div className="shrink-0 flex items-center gap-2">
      <span style={{ fontSize: 13, fontWeight: 600, color: textColor, letterSpacing: "0.01em" }}>
        {scoring.score}/{scoring.max_score}
      </span>
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
          paddingTop: 32,
          paddingBottom: 20,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
