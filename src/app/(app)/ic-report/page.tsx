import { ConfidentialBanner } from "@/components/portfolio/confidential-banner";
import { CompanyHeaderCard } from "@/components/portfolio/company-header-card";
import { FinalConclusionCard } from "@/components/ic-report/final-conclusion-card";
import type { ICConclusion } from "@/types/portfolio";

const SAMPLE_CONCLUSION: ICConclusion = {
  company: "Jupiter Wagons Ltd",
  ticker: "JWL",
  date: "2024-12-17",
  dataConfidence: "High",
  conclusionText:
    "Jupiter Wagons is in the middle of a structural transition from a cyclical rail OEM to a vertically integrated industrial infrastructure platform with EV and energy storage optionality.",
  styleClassification: "Core Portfolio Industrial Compounder",
  confidenceLevel: "High",
  targetOwner:
    "Investors who buy EPS inflection before ROCE inflection. Patient capital with 3-5 year horizon.",
  whyNow:
    "EPS growth is strong and accelerating, but valuation rerating will trail until return ratios and cash conversion move into elite zone. Entry point before ROCE catalyst.",
  imScore: 84,
};

export default function ICReportPage() {
  return (
    <div className="min-h-screen">
      {/* Confidential Banner */}
      <ConfidentialBanner />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Company Header */}
        <CompanyHeaderCard
          company={SAMPLE_CONCLUSION.company}
          ticker={SAMPLE_CONCLUSION.ticker}
          date={SAMPLE_CONCLUSION.date}
          dataConfidence={SAMPLE_CONCLUSION.dataConfidence}
          badgeLabel="FULL IM"
        />

        {/* Section heading */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink-3">§9</span>
          <h2 className="text-lg font-bold text-ink tracking-tight uppercase">
            Final IC Conclusion
          </h2>
        </div>

        {/* Main conclusion card */}
        <FinalConclusionCard conclusion={SAMPLE_CONCLUSION} />
      </div>
    </div>
  );
}
