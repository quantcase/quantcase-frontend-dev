import type {
  DecisionIntelligenceIndicator,
  IndicatorId,
  SectorVsIndexStrength,
} from "@/types/technicals";

/**
 * Fallback lookup for insights stored before the backend emitted `indicators[].id`.
 * Delete this (and the fallback branch in `findIndicator`) once the backend
 * confirms every stored insight has been backfilled with ids.
 */
const LEGACY_INDICATOR_NAMES: Record<IndicatorId, string[]> = {
  market_structure: ["Market Structure"],
  capital_participation: ["Capital Participation"],
  // The card is titled "Price Structure" but the indicator has been named both ways.
  price_architecture: ["Price Architecture", "Price Structure"],
  trend_direction: ["Trend Direction"],
  trend_quality: ["Trend Quality"],
  momentum: ["Momentum"],
  volatility: ["Volatility"],
  relative_strength: ["Relative Strength"],
};

export function findIndicator(
  indicators: DecisionIntelligenceIndicator[] | undefined,
  id: IndicatorId,
): DecisionIntelligenceIndicator | null {
  if (!indicators?.length) return null;

  const byId = indicators.find((ind) => ind.id === id);
  if (byId) return byId;

  const names = LEGACY_INDICATOR_NAMES[id];
  return indicators.find((ind) => names.includes(ind.name)) ?? null;
}

export function watchoutFor(
  indicators: DecisionIntelligenceIndicator[] | undefined,
  id: IndicatorId,
  perspective: "GROWTH" | "VALUE",
): string | null {
  const match = findIndicator(indicators, id);
  if (!match) return null;
  return perspective === "GROWTH" ? match.growthWatchout : match.valueWatchout;
}

/**
 * `vsSectorNifty` ships no narrative, so build one deterministically from the
 * numbers rather than leaving the card's interpretation block empty.
 */
export function describeSectorLeadership(rs: SectorVsIndexStrength): string | null {
  if (!rs.signal) return null;

  const sector = rs.sectorTicker ?? "The sector";
  const verb = rs.signal.toUpperCase() === "OUTPERFORMING" ? "outperforming" : "underperforming";
  const base = `${sector} is ${verb} the broader market`;

  if (rs.crsValue == null) return `${base}.`;

  const crs = rs.crsValue.toFixed(2);
  if (rs.prevCrsValue == null) return `${base} (CRS ${crs}).`;

  const prev = rs.prevCrsValue.toFixed(2);
  const drift = rs.crsValue >= rs.prevCrsValue ? "improving" : "weakening";
  return `${base} (CRS ${crs} vs ${prev} prior — ${drift}).`;
}
