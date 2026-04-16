export type RiskProfileType = "conservative" | "balanced" | "aggressive";

// ── New asset-class schema (matches backend) ────────────────────────────────

export type AssetClassKey = "equity" | "debt" | "cash" | "commodities" | "alternatives";

export interface SubClassEntry {
  key: string;
  label: string;
  pct: number;
  amount: number;
}

export interface AssetClassEntry {
  key: AssetClassKey;
  label: string;
  pct: number;
  amount: number;
  subClasses: SubClassEntry[];
}

// ── Client context ──────────────────────────────────────────────────────────

export interface ClientContext {
  clientName: string;
  aum: string;
  latestUpdate: string;
}

// ── Core model ──────────────────────────────────────────────────────────────

export interface PortfolioData {
  id: string;
  name: string;
  riskProfile: RiskProfileType;
  capital: number;
  assetClasses: AssetClassEntry[];
  client: ClientContext;
  positions: EquityPosition[];
  whyThisPortfolio: string[];
}

export interface StoredModel extends PortfolioData {
  createdAt: string;
  updatedAt: string;
}

// ── Equity positions (within the equity asset class) ────────────────────────

export interface EquityPosition {
  id: string;
  company: string;
  ticker: string;
  subClass: string; // e.g. "core", "growth", "satellite"
  score: number;
  allocation: number; // percentage within equity class
}

// ── Legacy types (used by model-analytics, ic-report, and older components) ──

// Old 4-category asset class (model-analytics still uses this)
export type AssetClass = "growth" | "quality_compounder" | "value" | "income";

// Old position type (still referenced by allocated-positions-card)
export interface Position {
  id: string;
  company: string;
  ticker: string;
  assetClass: AssetClass;
  score: number;
  allocation: number;
}

export interface RebalanceTrigger {
  id: string;
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  severity: "warning" | "critical";
}

export interface RiskProfileOption {
  type: RiskProfileType;
  label: string;
  description: string;
  allocation: string;
  threshold: string;
}

export interface AllocationSegment {
  name: string;
  value: number;
  color: string;
}

export interface DriftItem {
  id: string;
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  driftPercent: number;
  direction: "up" | "down";
}

export type ConvictionLevel = "strong_buy" | "buy" | "hold" | "sell";
export type ValuationZone   = "Attractive" | "Fair" | "High" | "Speculative";

export interface ScoreDimension {
  label: string;
  value: number;
  maxValue: number;
  sublabel: string;
  color: "green" | "amber" | "orange" | "red";
}

export interface AssetDeepDive {
  company: string;
  ticker: string;
  sector: string;
  conviction: ConvictionLevel;
  qualityScore: ScoreDimension;
  growthScore: ScoreDimension;
  peZone: ScoreDimension;
  totalScore: number;
  assetClass: string;
  valuationZone: ValuationZone;
  suitableFor: string[];
  positiveFactors: string[];
  riskFactors: string[];
}

export interface ICConclusion {
  company: string;
  ticker: string;
  date: string;
  dataConfidence: "High" | "Medium" | "Low";
  conclusionText: string;
  styleClassification: string;
  confidenceLevel: string;
  targetOwner: string;
  whyNow: string;
  imScore: number;
}
