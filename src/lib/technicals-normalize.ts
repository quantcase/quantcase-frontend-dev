import type {
  DecisionIntelligence,
  RuleEngine,
  StockTypeLabel,
  TechnicalsApiResponse,
  TechnicalsInsightEnvelope,
  TechnicalsResponse,
} from "@/types/technicals";

type RawInsight = TechnicalsApiResponse["decisionIntelligence"];

const ENVELOPE_KEYS = ["decisionIntelligence", "scores", "stockClassification", "ruleEngine"] as const;
/** Fields only ever found on a flat, pre-rewrite narrative. */
const NARRATIVE_KEYS = ["tag", "indicators", "convictionScore"] as const;

/**
 * The controller assigns the whole stored insight to `decisionIntelligence`, and
 * that insight itself has a `decisionIntelligence` key.
 *
 * Detection must not key off `decisionIntelligence` alone: ~11% of stored rows
 * (191/1669) are envelopes with scores/ruleEngine but no `decisionIntelligence`
 * key at all, and treating one of those as a narrative yields an object with no
 * `indicators` array.
 */
export function isInsightEnvelope(raw: NonNullable<RawInsight>): raw is TechnicalsInsightEnvelope {
  if (NARRATIVE_KEYS.some((k) => k in raw)) return false;
  return ENVELOPE_KEYS.some((k) => k in raw);
}

/**
 * The controller strips only `growthWatchout`/`valueWatchout` from the top-level
 * buckets — `growthOutput`/`valueOutput` always survive, including while an
 * insight is generating. So the fresh copy is simply preferred; no per-bucket
 * merge is needed. (Watchouts are read from `decisionIntelligence.indicators`,
 * which is never stripped.)
 *
 * The stored fallback only covers legacy payloads that omit the top-level block;
 * on any 200 the backend guarantees it is present.
 */
export function pickRuleEngine(
  fresh: RuleEngine | undefined,
  stored: RuleEngine | null | undefined,
): RuleEngine | undefined {
  return fresh ?? stored ?? undefined;
}

/** Never let an unrecognised backend string leak into the union-typed field. */
export function coerceStockType(raw: string | null | undefined): StockTypeLabel {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "growth") return "Growth";
  if (v === "value") return "Value";
  return "Mixed";
}

/**
 * Flattens the API envelope into the shape components consume. Critically, this
 * preserves `scores` / `stockClassification` / the nested ruleEngine, which the
 * previous unwrap discarded.
 */
export function normalizeTechnicals(raw: TechnicalsApiResponse): TechnicalsResponse {
  const insight = raw.decisionIntelligence;

  let di: DecisionIntelligence | null = null;
  let envelope: TechnicalsInsightEnvelope | null = null;

  if (insight) {
    if (isInsightEnvelope(insight)) {
      envelope = insight;
      di = insight.decisionIntelligence ?? null;
    } else if ("tag" in insight) {
      di = insight;
    }
    // Anything else (e.g. `{}`) carries no usable narrative — leave di null
    // rather than handing components an object with no `indicators` array.
  }

  const classification = envelope?.stockClassification ?? null;

  return {
    ...raw,
    decisionIntelligence: di,
    scores: envelope?.scores ?? null,
    stockClassification: classification
      ? { ...classification, stock_type: coerceStockType(classification.stock_type) }
      : null,
    ruleEngine: pickRuleEngine(raw.ruleEngine, envelope?.ruleEngine),
  };
}
