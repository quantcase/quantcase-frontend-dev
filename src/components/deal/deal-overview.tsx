import type { OverviewSection } from "@/types/deal";
import { SectionPanel } from "@/components/molecules/section-panel";
import { IconBox } from "@/components/molecules/icon-box";
import { TrendingUp, CircleDot } from "lucide-react";

interface DealOverviewProps {
  data?: OverviewSection;
}

/** Vertical tick gauge matching SectionPanel's SectionScoreBar style */
function TickGauge({
  score,
  max,
  ticks,
}: {
  score: number;
  max: number;
  ticks: number;
}) {
  const pct = max > 0 ? score / max : 0;
  const fillColor = pct <= 0.4 ? "#F8383C" : pct <= 0.7 ? "#FBBF24" : "#888888";
  const filled = Math.round(Math.min(score, max));

  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: ticks }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 24,
            borderRadius: 2,
            backgroundColor: i < filled ? fillColor : "#E2E8F0",
          }}
        />
      ))}
    </div>
  );
}

/** Mini tick bar for sub-score rows (mirrors SectionScoreBar at 12px height) */
function MiniTickBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  const fillColor = pct <= 0.4 ? "#F8383C" : pct <= 0.7 ? "#FBBF24" : "#888888";
  const filled = Math.round(Math.min(score, max));

  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 12,
            borderRadius: 1,
            backgroundColor: i < filled ? fillColor : "#E2E8F0",
          }}
        />
      ))}
    </div>
  );
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

      {/* ── Left 2 columns ─────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-4">

        {/* Row 1: EPS Engine + Valuation Re-Rating */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SectionPanel
            title="EPS Engine"
            scoring={eps_engine_card?.score != null ? { score: eps_engine_card.score, max_score: 10 } : undefined}
          >
            <div className="space-y-3">
              <p style={{ fontSize: 28, fontWeight: 500, color: "#0F172B", lineHeight: 1 }}>
                {eps_engine_card?.score}
                <span style={{ fontSize: 14, fontWeight: 400, color: "#888888" }}>/10</span>
              </p>
              <div className="space-y-2">
                {eps_engine_card?.drivers?.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <IconBox icon={TrendingUp} />
                    <span style={{ fontSize: 13, color: "#888888" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionPanel>

          <SectionPanel
            title="Valuation Re-Rating"
            scoring={valuation_rerating_card?.score != null ? { score: valuation_rerating_card.score, max_score: 10 } : undefined}
          >
            <div className="space-y-3">
              <p style={{ fontSize: 28, fontWeight: 500, color: "#0F172B", lineHeight: 1 }}>
                {valuation_rerating_card?.score}
                <span style={{ fontSize: 14, fontWeight: 400, color: "#888888" }}>/10</span>
              </p>
              <div className="space-y-2">
                {valuation_rerating_card?.drivers?.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <IconBox icon={TrendingUp} />
                    <span style={{ fontSize: 13, color: "#888888" }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionPanel>
        </div>

        {/* Row 2: Key Takeaway + Scenario Summary */}
        <SectionPanel title="Key Takeaway">
          <div className="space-y-4">
            {/* Bullet points */}
            <div className="space-y-3">
              {key_takeaway?.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <IconBox icon={CircleDot} />
                  <span style={{ fontSize: 14, color: "#888888", lineHeight: "1.5" }}>{point}</span>
                </div>
              ))}
            </div>

            {/* Bear / Base / Bull divider row */}
            {scenario_summary && (
              <div
                className="grid grid-cols-3 divide-x divide-[#E2E2E2]"
                style={{ borderTop: "1px dashed #E2E2E2", paddingTop: 16 }}
              >
                {(["bear", "base", "bull"] as const).map((key) => {
                  const s = scenario_summary[key];
                  if (!s) return null;
                  return (
                    <div key={key} className="px-4 first:pl-0 last:pr-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <IconBox icon={TrendingUp} />
                        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0F172B" }}>
                          {s.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#0F172B", lineHeight: "1.4" }}>
                        {s.headline?.split(" ").slice(0, 2).length ? (
                          <>
                            <strong>{s.headline.split(" ").slice(0, 2).join(" ")}</strong>
                            {" "}{s.headline.split(" ").slice(2).join(" ")}
                          </>
                        ) : s.headline}
                      </p>
                      <p style={{ fontSize: 12, color: "#888888" }}>{s.subtext}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionPanel>
      </div>

      {/* ── Right column ───────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Deal Factor Score */}
        {deal_factor_score && (
          <div
            style={{
              borderRadius: 10,
              background: "#F5F5F5",
              padding: 8,
            }}
          >
            <div style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}>
              <h5>Deal Factor Score</h5>
            </div>
            <div
              style={{
                borderRadius: 10,
                border: "1px solid rgba(226, 226, 226, 0.10)",
                background: "#FFF",
                padding: 16,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888888", marginBottom: 8 }}>
                Overall Deal Factor
              </p>
              <p style={{ fontSize: 40, fontWeight: 500, color: "#0F172B", lineHeight: 1, marginBottom: 12 }}>
                {String(deal_factor_score.overall ?? 0).padStart(2, "0")}
                <span style={{ fontSize: 16, fontWeight: 400, color: "#888888" }}>/20</span>
              </p>

              {/* LOW / MODERATE / HIGH labels */}
              <div className="flex justify-between" style={{ marginBottom: 6 }}>
                {["LOW", "MODERATE", "HIGH"].map((l) => (
                  <span key={l} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888888" }}>
                    {l}
                  </span>
                ))}
              </div>

              {/* Big tick gauge */}
              <TickGauge score={deal_factor_score.overall ?? 0} max={20} ticks={20} />

              {/* Sub-score rows */}
              <div style={{ borderTop: "1px solid #E2E2E2", marginTop: 16, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontSize: 12, color: "#888888", whiteSpace: "nowrap" }}>EPS Engine</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B" }}>{deal_factor_score.eps_engine}</span>
                    <MiniTickBar score={deal_factor_score.eps_engine ?? 0} max={10} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontSize: 12, color: "#888888", whiteSpace: "nowrap" }}>Valuation Re-Rating</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172B" }}>{deal_factor_score.valuation_rerating}</span>
                    <MiniTickBar score={deal_factor_score.valuation_rerating ?? 0} max={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deal Verdict */}
        {deal_verdict && (
          <SectionPanel title="Deal Verdict">
            <div className="flex items-start gap-3">
              <IconBox icon={TrendingUp} />
              <div className="space-y-1">
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172B", lineHeight: "1.3" }}>
                  {deal_verdict.title}
                </p>
                <p style={{ fontSize: 13, color: "#888888", lineHeight: "1.5" }}>
                  {deal_verdict.description}
                </p>
              </div>
            </div>
          </SectionPanel>
        )}
      </div>
    </div>
  );
}
