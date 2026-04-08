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
  name: string;
  tag: string;
  explanation: string;
  sentiment: "positive" | "negative" | "transitional";
  growthWatchout: string | null;
  valueWatchout: string | null;
}

export interface ActionableInsight {
  action: string;
  firstShift: string;
  existingHolderAction: string;
  reEvaluateCondition: string;
}

export interface DecisionIntelligence {
  tag: string;
  lens: string;
  idealFor: string;
  timeframe: string;
  actionableInsight: ActionableInsight;
  convictionLevel: string;
  indicators: DecisionIntelligenceIndicator[];
  whatCanChange: string[];
  currentRegime: {
    label: string;
    description: string;
  };
  actionBias: string;
  strategyViews: {
    growth: string;
    value: string;
  };
  riskAlerts: string[];
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
export interface RuleEngineIndicator {
  growthOutput: string | null;
  valueOutput: string | null;
}

export interface MarketPhaseIndicator extends RuleEngineIndicator {
  wyckoffPhase: string;
}

export interface CapitalParticipationIndicator extends RuleEngineIndicator {
  volumeSignal: string;
  cmfSignal: string;
  cmf: number;
}

export interface PriceArchitectureIndicator extends RuleEngineIndicator {
  zone: string | null;
}

export interface DirectionalBiasIndicator extends RuleEngineIndicator {
  priceVsSMA20: string;
  priceVsSMA50: string;
  priceVsSMA100: string;
  priceVsSMA200: string;
}

export interface TrendMaturityIndicator extends RuleEngineIndicator {
  adx: number;
  adxTrend: string;
  adxBand: string;
  condition: string;
}

export interface MomentumThrustIndicator extends RuleEngineIndicator {
  rsi: number;
  rsiZone: string;
}

export interface VolatilityRegimeIndicator extends RuleEngineIndicator {
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
