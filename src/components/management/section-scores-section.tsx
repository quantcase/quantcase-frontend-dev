import { SectionPanel } from "@/components/molecules/section-panel";
import type { IntelligenceSignalItem } from "@/types/management";

function sentimentColor(sentiment: IntelligenceSignalItem["sentiment"]): string {
  if (sentiment === "positive") return "var(--qc-up)";
  if (sentiment === "negative") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function sentimentBg(sentiment: IntelligenceSignalItem["sentiment"]): string {
  if (sentiment === "positive") return "var(--qc-up-soft)";
  if (sentiment === "negative") return "var(--qc-down-soft)";
  return "var(--qc-warn-soft)";
}

function ratingLabel(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return "DISCIPLINED";
  if (pct >= 0.4) return "MIXED";
  return "REACTIVE";
}

function DonutGauge({
  score,
  maxScore,
  color,
}: {
  score: number;
  maxScore: number;
  color: string;
}) {
  const size = 72;
  const strokeW = 6;
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = maxScore > 0 ? Math.min(1, score / maxScore) : 0;
  const filledDash = circumference * pct;

  return (
    <svg
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--qc-hair)"
        strokeWidth={strokeW}
      />
      {pct > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={`${filledDash} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontSize={16}
        fontWeight={600}
        fill="var(--qc-ink)"
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontSize={8}
        fill="var(--qc-ink-3)"
        fontFamily="inherit"
      >
        /{maxScore}
      </text>
    </svg>
  );
}

function SectionScoreCard({
  item,
  index,
}: {
  item: IntelligenceSignalItem;
  index: number;
}) {
  const color = sentimentColor(item.sentiment);
  const bg = sentimentBg(item.sentiment);
  const rating = ratingLabel(item.score, item.max_score);
  const dimLabel = item.label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const description = item.details?.[0] ?? "";

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 10,
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
      }}
    >
      <DonutGauge score={item.score} maxScore={item.max_score} color={color} />

      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: 9,
            fontWeight: 600,
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Section {index + 1}
        </p>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--qc-ink)",
            lineHeight: 1.3,
          }}
        >
          {dimLabel}
        </p>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            fontWeight: 600,
            color: color,
            background: bg,
            border: `1px solid ${color}`,
            borderRadius: 4,
            padding: "2px 8px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          {rating}
        </span>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--qc-ink-2)",
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

interface SectionScoresSectionProps {
  signals: IntelligenceSignalItem[];
}

export function SectionScoresSection({ signals }: SectionScoresSectionProps) {
  const visible = signals.filter((s) => s.max_score > 0);
  if (visible.length === 0) return null;

  return (
    <SectionPanel title="Section Scores" subtitle="Three lenses on management" contentClassName="!p-0 !border-0 !bg-transparent !rounded-none">
      <div style={{ display: "flex", gap: 12 }}>
        {visible.map((item, i) => (
          <SectionScoreCard key={item.key} item={item} index={i} />
        ))}
      </div>
    </SectionPanel>
  );
}
