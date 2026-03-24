import { DataValue } from "@/components/molecules/data-value";
import { IconBox } from "@/components/molecules/icon-box";
import type { FactorScore, TrustLevel } from "@/types/management";
import type { LucideIcon } from "lucide-react";
import { Target, Shield, Briefcase, Star, Users } from "lucide-react";

interface ScoreOverviewCardsProps {
  scores: FactorScore[];
}

const iconMap: Record<string, LucideIcon> = {
  "Guidance Accuracy": Target,
  "Disclosure Honesty": Shield,
  "Capital Allocation": Briefcase,
  "Customer Traction": Users,
};

function getRatingDisplay(rating: TrustLevel | string): string {
  if (!rating || rating === "N/A") return "N/A";
  if (rating === "MODERATE") return "Good";
  return rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase();
}

function getRatingColor(rating: TrustLevel | string): string {
  const upper = String(rating).toUpperCase();
  if (upper === "HIGH") return "#22c55e";
  if (upper === "LOW") return "#ef4444";
  return "#0F172B";
}

function ScoreCard({ score }: { score: FactorScore }) {
  const Icon = iconMap[score.factor] ?? Star;
  const ratingDisplay = getRatingDisplay(score.rating);
  const ratingColor = getRatingColor(score.rating);
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E2E2",
        borderRadius: 10,
        padding: "16px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Card header row: factor name + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 400, color: "#0F172B" }}>{score.factor}</span>
        <IconBox icon={Icon} />
      </div>
      {/* Large rating value */}
      <p style={{ fontSize: 40, fontWeight: 500, color: ratingColor, lineHeight: 1, marginBottom: 6 }}>
        <DataValue value={ratingDisplay} />
      </p>
      {/* Descriptor */}
      {score.descriptor && (
        <p style={{ fontSize: 13, fontWeight: 400, color: "#888888", marginTop: 2 }}>
          <DataValue value={score.descriptor} />
        </p>
      )}
    </div>
  );
}

export function ScoreOverviewCards({ scores }: ScoreOverviewCardsProps) {
  const firstRow = scores.slice(0, 3);
  const secondRow = scores.slice(3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(firstRow.length, 3)}, 1fr)`, gap: 12 }}>
        {firstRow.map((score) => <ScoreCard key={score.factor} score={score} />)}
      </div>
      {secondRow.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(secondRow.length, 3)}, 1fr)`, gap: 12 }}>
          {secondRow.map((score) => <ScoreCard key={score.factor} score={score} />)}
        </div>
      )}
    </div>
  );
}
