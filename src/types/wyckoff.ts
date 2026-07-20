/**
 * Wyckoff API types — mirrors GET /api/screener/:symbol/wyckoff.
 *
 * The envelope is FLAT (no { success, data } wrapper), matching /technicals,
 * /prices and /peers. All analysis runs server-side; nothing here is derived
 * on the client.
 */

export type WyckoffPhaseType =
  | "Accumulation"
  | "Markup"
  | "Re-Accumulation"
  | "Distribution"
  | "Markdown"
  | "Re-Distribution";

export type WyckoffSubPhase =
  | ""
  | "Phase A"
  | "Phase B"
  | "Phase C"
  | "Phase D"
  | "Spring"
  | "SOS Pullback"
  | "SOS Breakout"
  | "UTAD"
  | "LPSY"
  | "Insufficient Data";

export type SignalDirection = "bullish" | "bearish" | "neutral";
export type StructureTrend = "uptrend" | "downtrend" | "insufficient";
export type VolumeBias = "bullish" | "bearish" | "neutral";

export interface WyckoffSplitEvent {
  date: string;
  prevClose: number;
  close: number;
  changePct: number;
}

export interface WyckoffMeta {
  insufficientData: boolean;
  minBarsRequired: number;
  barInterval: string;
  /** Percentile-of-swings threshold actually used (not ATR-based). */
  zigzagMinPct: number;
  engineVersion: string;
  /** First bar actually analysed — the engine drops non-daily leading history. */
  analysisStart: string;
  historyTruncated: boolean;
  droppedLeadingBars: number;
  droppedTrailingBars: number;
  totalRowsAvailable: number;
  /** When true the lookback exceeds the series and the return collapses to full-history. */
  returnsSaturated: { r365: boolean; r504: boolean; r756: boolean };
  /** Prices are NOT split-adjusted upstream — a split reads as a crash. */
  suspectedSplit: boolean;
  suspectedSplitEvents: WyckoffSplitEvent[];
}

export interface WyckoffPhase {
  type: WyckoffPhaseType;
  subPhase: WyckoffSubPhase;
  /** 0..95 integer */
  confidence: number;
  cycleIndex: number;
  /** Raw classifier score — only meaningful when tradingRange is non-null. */
  score: number;
  description: string;
}

export interface WyckoffSignal {
  emoji: string;
  title: string;
  body: string;
  /** Drive colour off this — never string-match the title. */
  direction: SignalDirection;
}

export interface WyckoffMetrics {
  lastClose: number;
  priceChangePct: number;
  structure: StructureTrend;
  priorStructure: "up" | "down";
  priorPctChg: number;
  pivotCount: number;
  volumeBias: VolumeBias;
  volumeDrying: boolean;
  volumeRatio: number;
  sma20: number;
  allTimeHigh: number;
  allTimeLow: number;
  /** 0..1 within the all-time range */
  pricePosition: number;
  posIn2yrRange: number;
  nearSwingHigh2yr: boolean;
  nearSwingLow2yr: boolean;
  correctionInUptrend: boolean;
  returns: { r126: number; r365: number; r504: number; r756: number; rMacro: number };
  pctFromATH: number;
}

export interface WyckoffRangeLevel {
  label: string;
  lookback: number;
  top: number;
  bottom: number;
  mid: number;
  widthPct: number;
  density: number;
  members: number;
  isPrimary: boolean;
}

export interface WyckoffTradingRange {
  top: number;
  bottom: number;
  mid: number;
  widthPct: number;
  startBarIdx: number;
  barCount: number;
  /** 0..1, computed server-side */
  positionInRange: number;
  density: number;
  totalMembers: number;
  lookback: number;
  resistanceCount: number;
  supportCount: number;
  /** Nested bands, widest → narrowest. Draw these as layered zones. */
  levels: WyckoffRangeLevel[];
}

export interface WyckoffPriorRange extends WyckoffTradingRange {
  brokeUp: boolean;
  brokeDown: boolean;
  peakAfter: number;
  troughAfter: number;
  returnPct: number;
}

export interface WyckoffLocalBreakout extends WyckoffTradingRange {
  breakoutDate: string;
  breakoutClose: number;
  breakoutVolume: number;
  rangeAvgVolume: number;
  volumeRatio: number;
  priorRallyPct: number;
}

/**
 * When `detected` is false the object has ONLY that key — always guard before
 * reading date/price. `spring`/`upthrust` are states, so they never carry a bar.
 */
export interface WyckoffDetection {
  detected: boolean;
  date?: string;
  barIdx?: number;
  price?: number;
  /** sc only */
  arHigh?: number;
  /** bc only */
  arLow?: number;
}

export interface WyckoffDetections {
  ps: WyckoffDetection;
  sc: WyckoffDetection;
  st: WyckoffDetection;
  psy: WyckoffDetection;
  bc: WyckoffDetection;
  sow: WyckoffDetection;
  spring: WyckoffDetection;
  upthrust: WyckoffDetection;
}

export interface WyckoffEvent {
  tag: string;
  label: string;
  ok: boolean;
  /** Pre-rendered copy — render as-is. */
  text: string;
  /** `{}` when the event is undetected. */
  values: Record<string, string | number | boolean>;
}

export type PivotStructureLabel = "HH" | "LH" | "EH" | "HL" | "LL" | "EL";
export type PivotEventBadge = "SC" | "BC" | "SPR" | "UT";

export interface WyckoffPivot {
  type: "high" | "low";
  /** Index into the ANALYSED series — match to chart bars by date, not index. */
  index: number;
  date: string;
  price: number;
  /** null on the first pivot of its type. ±1.5% dead zone yields EH/EL. */
  structureLabel: PivotStructureLabel | null;
  /** % change from the previous pivot. null on the first pivot. */
  swingPct: number | null;
  eventBadge: PivotEventBadge | null;
}

export interface WyckoffChartBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WyckoffChart {
  years: number;
  bars: WyckoffChartBar[];
  /** Aligned 1:1 with bars; leading nulls during warmup. */
  sma20: (number | null)[];
}

export interface WyckoffResponse {
  symbol: string;
  ticker: string;
  /** Drive the currency symbol off this — don't hardcode ₹. */
  currency: string;
  /** Last ANALYSED bar — not necessarily today. */
  asOf: string;
  barCount: number;
  meta: WyckoffMeta;
  phase: WyckoffPhase;
  signal: WyckoffSignal;
  metrics: WyckoffMetrics;
  /** All three ranges may be null — typically only one is populated. */
  tradingRange: WyckoffTradingRange | null;
  priorRange: WyckoffPriorRange | null;
  localBreakout: WyckoffLocalBreakout | null;
  detections: WyckoffDetections;
  events: WyckoffEvent[];
  pivots: WyckoffPivot[];
  cycle: { phases: WyckoffPhaseType[]; activeIndex: number };
  /** Omitted entirely when includeBars=false. */
  chart?: WyckoffChart;
}
