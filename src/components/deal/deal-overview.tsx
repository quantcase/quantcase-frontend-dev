import type { OverviewSection } from "@/types/deal";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { DealScoreBreakdownCard } from "@/components/deal/deal-score-breakdown-card";
import { TrendingUp } from "lucide-react";

interface DealOverviewProps {
  data?: OverviewSection;
}

export function DealOverview({ data }: DealOverviewProps) {
  if (!data) return null;

  const { eps_engine_card, valuation_rerating_card, deal_factor_score, deal_verdict, key_takeaway } = data;

  const epsScore = deal_factor_score?.eps_engine ?? 0;
  const valScore = deal_factor_score?.valuation_rerating ?? 0;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>

      {/* Left: dark scorecard */}
      <div style={{ flex: "0 0 40%", minWidth: 0 }}>
        {deal_factor_score && (
          <ScreenerScorecard
            title="DEAL FACTOR"
            overallLevel={deal_factor_score.level}
            score={deal_factor_score.overall ?? 0}
            maxScore={100}
            verdictAfter={deal_verdict?.title}
            verdictSubtitle={key_takeaway?.[0]}
            items={[
              {
                label: "EPS Engine",
                icon: TrendingUp,
                barValue: (epsScore / 50) * 100,
                rating: epsScore >= 35 ? "HIGH" : epsScore >= 20 ? "MODERATE" : "LOW",
                descriptor: eps_engine_card?.drivers?.[0] ?? `${epsScore}/50`,
                scrollToId: "eps-engine",
              },
              {
                label: "Valuation Re-Rating",
                icon: TrendingUp,
                barValue: (valScore / 50) * 100,
                rating: valScore >= 35 ? "HIGH" : valScore >= 20 ? "MODERATE" : "LOW",
                descriptor: valuation_rerating_card?.drivers?.[0] ?? `${valScore}/50`,
                scrollToId: "pe-rerating",
              },
            ]}
          />
        )}
      </div>

      {/* Right: score breakdown card */}
      <div style={{ flex: "0 0 60%", minWidth: 0 }}>
        <DealScoreBreakdownCard overview={data} />
      </div>

    </div>
  );
}
