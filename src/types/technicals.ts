export interface TechnicalsMetaRaw {
  macroSector: string;
  basicIndustry: string;
  pe: string;
  sheetTrend: string;
  srRange: string;
  nextEarningsDate: string | null;
}

export interface TechnicalsPriceRaw {
  cmp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  avgVolume20d: number;
  volumeRatio: number;
  high52w: number;
  low52w: number;
  distanceFrom52wHigh: number;
  distanceFrom52wLow: number;
  allTimeHigh?: number;
  distanceFromATH?: number;
  allTimeLow?: number;
  distanceFromATL?: number;
  high52wDate?: string;
  low52wDate?: string;
  allTimeHighDate?: string;
  allTimeLowDate?: string;
}

export interface TechnicalsTrendRaw {
  direction: string;    // "UPTREND" | "DOWNTREND" | "SIDEWAYS"
  strength: string;     // "STRONG" | "MODERATE" | "WEAK"
  adx14: number;
  structure: { higherHighs: boolean; higherLows: boolean };
  phase: string;        // "ACCUMULATION" | "DISTRIBUTION" | "MARK-UP" | "MARK-DOWN"
}

export interface TechnicalsMovingAveragesRaw {
  sma: { 20: number; 50: number; 100: number; 200: number };
  ema: { 20: number; 50: number };
  pricePosition: { aboveSMA20: boolean; aboveSMA50: boolean; aboveSMA200: boolean };
  crossovers: { goldenCross: boolean; deathCross: boolean; lastCrossoverDate: string };
}

export interface TechnicalsMomentumRaw {
  rsi: { value: number; zone: string; trend: string };
  macd: { value: number; signal: number; histogram: number; crossover: string };
  stochastic: { k: number; d: number; signal: string };
}

export interface TechnicalsVolumeRaw {
  current: number;
  avg20: number;
  ratio: number;
  trend: string;    // "INCREASING" | "DECREASING" | "FLAT"
  signals: { volumeBreakout: boolean; accumulation: boolean; distribution: boolean };
}

export interface TechnicalsVolatilityRaw {
  atr14: number;
  atrPercent: number;
  bollingerBands: { upper: number; middle: number; lower: number; width: number; squeeze: boolean };
}

export interface TechnicalsSupportResistanceRaw {
  static: { support: number[]; resistance: number[] };
  pivotPoints: { pivot: number; r1: number; r2: number; s1: number; s2: number };
  dynamic: { support: string[]; resistance: string[] };
  fibonacci: number[];
}

export interface TechnicalsPattern {
  name: string;
  type: string;
  confidence: number | null;
  timeframe: string;
  breakoutLevel: number;
  breakdownLevel: number;
}

export interface TechnicalsSignalsRaw {
  overall: string;    // "STRONG_BUY" | "BUY" | "WEAK_BUY" | "NEUTRAL" | "WEAK_SELL" | "SELL" | "STRONG_SELL"
  score: number;      // 0–100
  timeframeSignals: { shortTerm: string; mediumTerm: string; longTerm: string };
  components: { trend: number; momentum: number; volume: number; volatility: number };
}

export interface TechnicalsTimeframesRaw {
  daily: { trend: string; signal: string };
  weekly: { trend: string; signal: string };
  monthly: { trend: string; signal: string };
  multiTimeframeScore: number;
  multiTimeframeSignal: string;
}

/**
 * Stable per-bucket keys emitted by the backend. Always switch on `id` — the
 * `name`/`tab` strings are derived server-side and may be reworded.
 */
export const INDICATOR_IDS = [
  "market_structure",
  "capital_participation",
  "price_architecture",
  "trend_direction",
  "trend_quality",
  "momentum",
  "volatility",
  "relative_strength",
] as const;

export type IndicatorId = (typeof INDICATOR_IDS)[number];

export interface DecisionIntelligenceIndicator {
  /** Optional — insights stored before the rewrite have no `id`. */
  id?: IndicatorId;
  tab: string;
  name: string;
  tag: string;
  explanation: string;
  sentiment: "positive" | "negative" | "transitional" | "neutral";
  growthWatchout: string | null;
  valueWatchout: string | null;
}

export interface ActionableInsight {
  watch_for: string | null;
  new_position: string | null;
  existing_position: string | null;
}

export interface IdealForScores {
  swing: number;
  positional: number;
  investor: number;
}

export interface DecisionIntelligence {
  tag: string;
  lens: string;
  idealFor: string;
  playbook: string;
  timeframe: string;
  /** The swing-horizon insight. Any horizon may be null if the model skipped it. */
  actionableInsight: ActionableInsight | null;
  actionableInsight_investor: ActionableInsight | null;
  actionableInsight_positional: ActionableInsight | null;
  convictionLevel: string;
  convictionScore: number;
  priorityWatchout: string | null;
  /** Prior run's final_score. Null on a ticker's first-ever run. */
  previousScore: number | null;
  /** Advisory only — known to be inverted; derive direction from the score delta. */
  directionFlag: string | null;
  breakoutQuality: string | null;
  idealForScores: IdealForScores | null;
  indicators: DecisionIntelligenceIndicator[];
  whatCanChange: string[];
  currentRegime: {
    label: string;
    description: string;
  };
  levelsToWatch: {
    regime: { label: string; price: number };
    immediate: { label: string; price: number };
    structural: { label: string; price: number };
    horizonNote: string;
  };
  ruleEngine: {
    tabSummaries: {
      trend: string;
      timing: string;
      structure: string;
      relativeStrength: string;
    };
  };
}

export interface TechnicalsScores {
  final_score: number;
  grade: string;
  label: string;
  structure_wyckoff_sr: number; // /20
  trend_sma: number;            // /20
  momentum_rsi: number;         // /15
  trend_maturity_adx: number;   // /15
  leadership_rs: number;        // /15
  capital_flow: number;         // /10
  volatility_bbw: number;       // /5
}

export type StockTypeLabel = "Growth" | "Value" | "Mixed";

export interface StockClassification {
  stock_type: StockTypeLabel;
  growth_score: number;
  value_score: number;
  classification_note: string;
  /** Non-null when a Growth call conflicts with the detected Wyckoff phase. */
  wyckoff_growth_warning: string | null;
}

export interface SmaDistancePct {
  sma20: number | null;
  sma50: number | null;
  sma100: number | null;
  sma200: number | null;
}

/** Raw inputs to the Growth/Value classification. Null when <200 bars available. */
export interface TechnicalsStockType {
  stats: Record<string, number> | null;
  validSMA200Cross: unknown | null;
}

/**
 * Lifecycle of the stored AI insight, reported by the backend.
 * `failed` is sticky — the backend does not silently retry, so stop polling.
 * `absent` means nothing stored and nothing queued.
 */
export type InsightLifecycle = "ready" | "generating" | "failed" | "absent";

export interface TechnicalsInsightJob {
  id: string;
  status: string;
  progress?: number | null;
}

/**
 * `GET /api/screener/:symbol/technicals/status` — cheap; does NOT recompute TA.
 * Poll this rather than the full technicals endpoint.
 */
export interface TechnicalsStatusResponse {
  symbol: string;
  insightStatus: InsightLifecycle;
  insightJob: TechnicalsInsightJob | null;
  insightUpdatedAt: string | null;
}

export interface TechnicalsResponse {
  symbol: string;
  exchange: string;
  timestamp: string;
  meta: TechnicalsMetaRaw;
  price: TechnicalsPriceRaw;
  trend: TechnicalsTrendRaw;
  movingAverages: TechnicalsMovingAveragesRaw;
  momentum: TechnicalsMomentumRaw;
  volume: TechnicalsVolumeRaw;
  volatility: TechnicalsVolatilityRaw;
  supportResistance: TechnicalsSupportResistanceRaw;
  patterns: TechnicalsPattern[];
  signals: TechnicalsSignalsRaw;
  timeframes: TechnicalsTimeframesRaw;
  insights: string[];
  stockType?: TechnicalsStockType | null;
  smaDistancePct?: SmaDistancePct | null;
  insightStatus?: InsightLifecycle;
  /** Non-null alongside `insightStatus: "ready"` means a newer insight is coming. */
  insightJob?: TechnicalsInsightJob | null;
  insightUpdatedAt?: string | null;
  ruleEngine?: RuleEngine;
  decisionIntelligence?: DecisionIntelligence | null;
  scores?: TechnicalsScores | null;
  stockClassification?: StockClassification | null;
}

/**
 * The stored AI insight, as the controller assigns it to `result.decisionIntelligence`.
 * Note the insight itself carries a `decisionIntelligence` key — hence the nesting.
 */
export interface TechnicalsInsightEnvelope {
  decisionIntelligence?: DecisionIntelligence | null;
  ruleEngine?: RuleEngine | null;
  scores?: TechnicalsScores | null;
  stockClassification?: StockClassification | null;
}

/** Raw API envelope — decisionIntelligence may be nested, flat, or null. */
export interface TechnicalsApiResponse
  extends Omit<TechnicalsResponse, "decisionIntelligence" | "scores" | "stockClassification"> {
  decisionIntelligence?: DecisionIntelligence | TechnicalsInsightEnvelope | null;
}

export interface TechnicalsDerived {
  supportNum: number;
  resistanceNum: number;
  positionInRange: number;    // 0–100, percent from support
  upsideToResistance: number; // percent
  downsideToSupport: number;  // percent
  riskReward: number;
  srMidpoint: number;
}

// Rule Engine types
interface RuleEngineIndicator {
  growthOutput: string | null;
  valueOutput: string | null;
}

interface MarketPhaseIndicator extends RuleEngineIndicator {
  wyckoffPhase: string;
}

interface CapitalParticipationIndicator extends RuleEngineIndicator {
  volumeSignal: string;
  cmfSignal: string;
  cmf: number;
}

interface PriceArchitectureIndicator extends RuleEngineIndicator {
  zone: string | null;
}

export interface DirectionalBiasIndicator extends RuleEngineIndicator {
  priceVsSMA20: string;
  priceVsSMA50: string;
  priceVsSMA100: string;
  priceVsSMA200: string;
}

interface TrendMaturityIndicator extends RuleEngineIndicator {
  adx: number;
  adxTrend: string;
  adxBand: string;
  condition: string;
}

interface MomentumThrustIndicator extends RuleEngineIndicator {
  rsi: number;
  rsiZone: string;
}

interface VolatilityRegimeIndicator extends RuleEngineIndicator {
  bbWidth: number;
  prevBbWidth: number;
  expanding: boolean;
  condition: string;
}

export interface RelativeStrengthSingle extends RuleEngineIndicator {
  crsValue: number | null;
  prevCrsValue: number | null;
  signal: string | null;
  sectorTicker?: string | null;
}

export interface StructureEngineData {
  marketStructure: MarketPhaseIndicator;
  participation: CapitalParticipationIndicator;
  priceStructure: PriceArchitectureIndicator;
}

export interface TrendEngineData {
  trendDirection: DirectionalBiasIndicator;
  trendQuality: TrendMaturityIndicator;
}

export interface TimingEngineData {
  momentum: MomentumThrustIndicator;
  volatility: VolatilityRegimeIndicator;
}

/**
 * Sector-vs-market leg. Deliberately does NOT extend RuleEngineIndicator — the
 * backend ships no growthOutput/valueOutput/watchouts for it.
 */
export interface SectorVsIndexStrength {
  signal: string | null;
  crsValue: number | null;
  prevCrsValue: number | null;
  sectorTicker?: string | null;
}

export interface DominanceEngineData {
  leadership: {
    vsNifty: RelativeStrengthSingle;
    vsSector: RelativeStrengthSingle;
    /** Absent on pre-rewrite payloads; null for sectors with no NSE index. */
    vsSectorNifty?: SectorVsIndexStrength | null;
  };
}

export interface RuleEngine {
  structureEngine: StructureEngineData;
  trendEngine: TrendEngineData;
  timingEngine: TimingEngineData;
  dominanceEngine: DominanceEngineData;
  decisionContext: {
    summary: string;
    alerts: string[];
    marketBias: string;
    overallCondition: string;
  };
}
