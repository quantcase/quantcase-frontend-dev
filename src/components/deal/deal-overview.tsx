import type { OverviewSection } from "@/types/deal";
import { SectionPanel } from "@/components/molecules/section-panel";
import { ScreenerScorecard } from "@/components/molecules/screener-scorecard";
import { IconBox } from "@/components/molecules/icon-box";
import { TrendingUp, CircleDot } from "lucide-react";

interface DealOverviewProps {
  data?: OverviewSection;
}

export function DealOverview({ data }: DealOverviewProps) {
  if (!data) return null;

  const {
    deal_verdict,
    key_takeaway,
    eps_engine_card,
    valuation_rerating_card,
    scenario_summary,
    deal_factor_score,
  } = data;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">


      {/* ── Right column ───────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Deal Factor Score */}
        {deal_factor_score && (
          <ScreenerScorecard
            title="DEAL FACTOR"
            overallLevel={deal_factor_score.level}
            score={deal_factor_score.overall ?? 0}
            maxScore={20}
            scoreLabel="Overall Deal Factor"
            items={[
              {
                label: "EPS Engine",
                icon: TrendingUp,
                barValue: ((deal_factor_score.eps_engine ?? 0) / 10) * 100,
                rating: (deal_factor_score.eps_engine ?? 0) >= 7 ? "HIGH" : (deal_factor_score.eps_engine ?? 0) >= 4 ? "MODERATE" : "LOW",
                descriptor: `${deal_factor_score.eps_engine ?? 0}/10`,
              },
              {
                label: "Valuation Re-Rating",
                icon: TrendingUp,
                barValue: ((deal_factor_score.valuation_rerating ?? 0) / 10) * 100,
                rating: (deal_factor_score.valuation_rerating ?? 0) >= 7 ? "HIGH" : (deal_factor_score.valuation_rerating ?? 0) >= 4 ? "MODERATE" : "LOW",
                descriptor: `${deal_factor_score.valuation_rerating ?? 0}/10`,
              },
            ]}
          />
        )}

      </div>
    </div>
  );
}
