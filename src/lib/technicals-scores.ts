import type { TechnicalsScores } from "@/types/technicals";

export interface ScoreModule {
  key: keyof Omit<TechnicalsScores, "final_score" | "grade" | "label">;
  label: string;
  max: number;
}

/** The 7 scoring modules, in weight order. Maxes sum to 100. */
export const SCORE_MODULES: ScoreModule[] = [
  { key: "structure_wyckoff_sr", label: "Structure / Wyckoff", max: 20 },
  { key: "trend_sma", label: "Trend (SMA)", max: 20 },
  { key: "momentum_rsi", label: "Momentum (RSI)", max: 15 },
  { key: "trend_maturity_adx", label: "Trend Maturity (ADX)", max: 15 },
  { key: "leadership_rs", label: "Leadership (RS)", max: 15 },
  { key: "capital_flow", label: "Capital Flow", max: 10 },
  { key: "volatility_bbw", label: "Volatility (BBW)", max: 5 },
];

export type ScoreArrow = "up" | "down" | "flat";

export interface ScoreDirection {
  /** null on a ticker's first-ever run — render no badge, not "0". */
  delta: number | null;
  arrow: ScoreArrow | null;
  /**
   * Whether `directionFlag` agrees with the computed delta. The backend flag is
   * known to be inverted, so we suppress it in the UI whenever this is false.
   */
  flagAgrees: boolean;
}

function flagDirection(flag: string | null | undefined): ScoreArrow | null {
  if (!flag) return null;
  const f = flag.toLowerCase();
  if (f.includes("rising")) return "up";
  if (f.includes("falling")) return "down";
  if (f.includes("flat")) return "flat";
  return null;
}

/**
 * Direction is derived from `final_score - previousScore` only. `directionFlag`
 * is advisory (it has been observed inverted) and is used solely to decide
 * whether it is safe to display.
 *
 * PARKED — not currently rendered. Backend scoring has ±5 run-to-run variance on
 * identical input (three HDFCBANK runs returned 43 → 41 → 38), so a delta badge
 * would present model noise as real movement. Wire this back into
 * TechnicalsScoreCard once scoring is deterministic.
 */
export function resolveScoreDirection(
  scores: TechnicalsScores | null | undefined,
  previousScore: number | null | undefined,
  directionFlag?: string | null,
): ScoreDirection {
  if (!scores || previousScore == null) {
    return { delta: null, arrow: null, flagAgrees: false };
  }

  const delta = scores.final_score - previousScore;
  const arrow: ScoreArrow = delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  return { delta, arrow, flagAgrees: flagDirection(directionFlag) === arrow };
}
