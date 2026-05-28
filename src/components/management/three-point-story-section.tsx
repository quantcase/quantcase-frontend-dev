import { SectionPanel } from "@/components/molecules/section-panel";

export type StoryPointType = "strength" | "risk" | "neutral";

export interface StoryPoint {
  type: StoryPointType;
  headline: string;
}

interface ThreePointStorySectionProps {
  points: StoryPoint[];
}

function typeConfig(type: StoryPointType): {
  color: string;
  dotColor: string;
  label: string;
} {
  if (type === "strength") {
    return { color: "var(--qc-up)", dotColor: "var(--qc-up)", label: "STRENGTH" };
  }
  if (type === "risk") {
    return { color: "var(--qc-down)", dotColor: "var(--qc-down)", label: "RISK" };
  }
  return { color: "var(--qc-ink-2)", dotColor: "var(--qc-ink-3)", label: "NEUTRAL" };
}

function StoryCard({ point }: { point: StoryPoint }) {
  const cfg = typeConfig(point.type);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
        overflow: "hidden",
      }}
    >
      {/* Colored top accent */}
      <div style={{ height: 3, background: cfg.color, flexShrink: 0 }} />

      {/* Body */}
      <div style={{ flex: 1, padding: "14px 16px 0" }}>
        {/* Type badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: cfg.dotColor, flexShrink: 0, display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: cfg.color,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Headline */}
        <p style={{ margin: 0, fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-regular)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", lineHeight: 1.6 }}>
          {point.headline}
        </p>
      </div>

    </div>
  );
}

export function ThreePointStorySection({ points }: ThreePointStorySectionProps) {
  if (points.length === 0) return null;

  return (
    <SectionPanel title="The 3-Point Story" subtitle="What you need to know" contentClassName="!p-0 !border-0 !bg-transparent !rounded-none">
      <div style={{ display: "flex", gap: 12 }}>
        {points.map((point, i) => (
          <StoryCard key={i} point={point} />
        ))}
      </div>
    </SectionPanel>
  );
}
