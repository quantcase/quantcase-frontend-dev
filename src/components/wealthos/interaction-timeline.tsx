import { formatDate } from "@/lib/utils";
import { InteractionIcon } from "./interaction-icon";
import type { WealthInteraction } from "@/types/wealthos";

interface InteractionTimelineProps {
  interactions: WealthInteraction[];
}

const sentimentStyles: Record<string, React.CSSProperties> = {
  positive: {
    background: "var(--qc-up-soft)",
    border: "1px solid rgba(31,122,74,0.25)",
    color: "var(--qc-up)",
  },
  negative: {
    background: "var(--qc-down-soft)",
    border: "1px solid rgba(178,58,47,0.25)",
    color: "var(--qc-down)",
  },
  neutral: {
    background: "var(--qc-chip)",
    border: "1px solid var(--qc-hair)",
    color: "var(--qc-ink-2)",
  },
};

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  if (!interactions?.length) {
    return (
      <p className="py-6 text-center" style={{ fontSize: 13, color: "var(--qc-ink-2)" }}>
        No interactions recorded
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className="flex size-8 items-center justify-center rounded-full shrink-0"
              style={{
                border: "1px solid var(--qc-hair)",
                background: "var(--qc-card)",
              }}
            >
              <InteractionIcon type={interaction.type} />
            </div>
            <div className="w-px flex-1 mt-1" style={{ background: "var(--qc-hair-2)" }} />
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="capitalize"
                style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}
              >
                {interaction.type}
              </span>
              <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>
                {formatDate(interaction.timestamp)}
              </span>
              {interaction.sentiment && (
                <span
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 capitalize"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    ...(sentimentStyles[interaction.sentiment.toLowerCase()] ?? sentimentStyles.neutral),
                  }}
                >
                  {interaction.sentiment}
                </span>
              )}
            </div>
            {interaction.summary && (
              <p style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>{interaction.summary}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
