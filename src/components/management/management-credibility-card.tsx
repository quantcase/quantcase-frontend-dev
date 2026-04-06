import { Target, Shield, Briefcase, Star, Users } from "lucide-react";
import type { FactorScore, TrustScore, ConsistencyMetrics, TrustLevel } from "@/types/management";
import type { LucideIcon } from "lucide-react";

interface ManagementCredibilityCardProps {
  scores: FactorScore[];
  trust: TrustScore;
  consistency: ConsistencyMetrics;
}

const iconMap: Record<string, LucideIcon> = {
  "Guidance Accuracy": Target,
  "Disclosure Honesty": Shield,
  "Capital Allocation": Briefcase,
  "Customer Traction": Users,
};

function getTrustLevelColor(level: TrustLevel | string): string {
  const upper = String(level).toUpperCase();
  if (upper === "HIGH") return "#16a34a";
  if (upper === "LOW") return "#dc2626";
  return "#d97706";
}

function getRatingDisplay(rating: TrustLevel | string): string {
  if (!rating || rating === "N/A") return "N/A";
  return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
}

function getFilledBlocks(value: number): number {
  if (value >= 85) return 5;
  if (value >= 65) return 4;
  if (value >= 45) return 3;
  if (value >= 25) return 2;
  if (value > 0) return 1;
  return 0;
}

function getBarColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct <= 0.4) return "#dc2626";
  if (pct <= 0.7) return "#d97706";
  return "#16a34a";
}

export function ManagementCredibilityCard({
  scores,
  trust,
  consistency,
}: ManagementCredibilityCardProps) {
  const hasScore = consistency && consistency.score != null && consistency.maxScore != null;
  const totalScore = hasScore ? consistency.score : 0;
  const maxScore = hasScore ? consistency.maxScore : 20;
  const barColor = getBarColor(totalScore, maxScore);

  const overallLevel = trust.overall;
  const overallLevelColor = getTrustLevelColor(overallLevel);

  const subfactorKeyMap: Record<string, keyof typeof trust.subfactors> = {
    "Guidance Accuracy": "guidanceAccuracy",
    "Disclosure Honesty": "disclosureHonesty",
    "Capital Allocation": "capitalAllocation",
  };

  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid #E2E2E2",
        background: "#F5F5F5",
        padding: 8,
      }}
    >
      {/* Header — outside white box, same as TabularCard */}
      <div
        className="flex items-center justify-between"
        style={{ paddingBottom: 8, paddingLeft: 8, paddingRight: 8 }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#0F172B",
            textTransform: "uppercase",
            letterSpacing: "0.01em",
          }}
        >
          MANAGEMENT CREDIBILITY:{" "}
          <span style={{ color: overallLevelColor }}>{getRatingDisplay(overallLevel)}</span>
        </div>
      </div>

      {/* Inner white card */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid rgba(226, 226, 226, 0.10)",
          background: "#FFF",
          padding: 8,
        }}
      >
        <div className="flex items-stretch gap-8">
          {/* Left: factor rows */}
          <div className="flex flex-col divide-y divide-zinc-100 flex-1 min-w-0">
            {scores.map((score) => {
              const Icon = iconMap[score.factor] ?? Star;
              const ratingColor = getTrustLevelColor(score.rating);
              const subfactorKey = subfactorKeyMap[score.factor];
              const subfactorValue = subfactorKey != null ? trust.subfactors[subfactorKey] : null;
              const filledBlocks = subfactorValue != null ? getFilledBlocks(subfactorValue) : null;

              return (
                <div key={score.factor} className="flex items-center gap-4 py-2 first:pt-0 last:pb-0">
                  {/* Icon box */}
                  <div
                    style={{
                      display: "flex",
                      padding: 6,
                      borderRadius: 6,
                      border: "1px solid rgba(18,18,18,0.10)",
                      background: "rgba(18,18,18,0.03)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ height: 14, width: 14, color: "#888888" }} />
                  </div>

                  {/* Label + descriptor */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="uppercase tracking-wider"
                      style={{ fontSize: 10, fontWeight: 500, color: "#888888", letterSpacing: "0.08em" }}
                    >
                      {score.factor}
                    </p>
                    {score.descriptor && (
                      <p style={{ fontSize: 13, color: "#121212" }}>{score.descriptor}</p>
                    )}
                  </div>

                  {/* Mini bar — fixed width so all rows align */}
                  <div style={{ width: 47, flexShrink: 0, display: "flex", gap: 3 }}>
                    {filledBlocks != null &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 18,
                            borderRadius: 2,
                            backgroundColor: i < filledBlocks ? ratingColor : "#E2E2E2",
                          }}
                        />
                      ))}
                  </div>

                  {/* Rating pill — fixed width for alignment */}
                  <div style={{ width: 72, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: ratingColor,
                        background: `${ratingColor}14`,
                        border: `1px solid ${ratingColor}30`,
                        borderRadius: 4,
                        padding: "2px 7px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getRatingDisplay(score.rating)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: overall score + segmented bar */}
          <div
            className="flex flex-col justify-end items-end flex-shrink-0 gap-1"
            style={{ width: 280, borderLeft: "1px solid #E2E2E2", paddingLeft: 24 }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#888888",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              OVERALL SCORE
            </p>

            {/* Big score */}
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 52, fontWeight: 500, color: "#0F172B" }}>{totalScore}</span>
              <span style={{ fontSize: 24, fontWeight: 400, color: "rgba(18,18,18,0.40)" }}>
                /{maxScore}
              </span>
            </div>

            {/* Segmented bar */}
            <div className="space-y-1 w-full" style={{ marginTop: 4 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: maxScore }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 14,
                      borderRadius: 2,
                      backgroundColor: i < totalScore ? barColor : "#E2E2E2",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: 9, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Low</span>
                <span style={{ fontSize: 9, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>Moderate</span>
                <span style={{ fontSize: 9, color: "#888888", textTransform: "uppercase", letterSpacing: "0.06em" }}>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
