export interface TechnicalsMetaRaw {
  macroSector: string;
  basicIndustry: string;
  pe: string;
  sheetTrend: string;
  srRange: string;
  nextEarningsDate: string;
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

export interface DecisionIntelligenceIndicator {
  tab: string;
  name: string;
  tag: string;
  explanation: string;
  sentiment: "positive" | "negative" | "transitional" | "neutral";
  growthWatchout: string | null;
  valueWatchout: string | null;
}

interface ActionableInsight {
  watch_for: string;
  new_position: string;
  existing_position: string;
}

export interface DecisionIntelligence {
  tag: string;
  lens: string;
  idealFor: string;
  playbook: string;
  timeframe: string;
  actionableInsight: ActionableInsight;
  actionableInsight_investor: ActionableInsight;
  actionableInsight_positional: ActionableInsight;
  convictionLevel: string;
  convictionScore: number;
  priorityWatchout: string;
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
  ruleEngine?: RuleEngine;
  decisionIntelligence?: DecisionIntelligence;
}

// Raw API envelope — decisionIntelligence is nested one level deeper in the response
export interface TechnicalsApiResponse extends Omit<TechnicalsResponse, "decisionIntelligence"> {
  decisionIntelligence?: {
    decisionIntelligence?: DecisionIntelligence;
    ruleEngine?: RuleEngine;
    scores?: Record<string, unknown>;
  };
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

export interface DominanceEngineData {
  leadership: {
    vsNifty: RelativeStrengthSingle;
    vsSector: RelativeStrengthSingle;
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
