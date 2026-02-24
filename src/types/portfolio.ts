export type RiskProfileType = "conservative" | "balanced" | "aggressive";
export type AssetClass = "growth" | "quality_compounder" | "value" | "income";
export type ValuationZone = "Attractive" | "Fair" | "High" | "Speculative";
export type ConvictionLevel = "strong_buy" | "buy" | "hold" | "sell";

export interface Position {
  id: string;
  company: string;
  ticker: string;
  assetClass: AssetClass;
  score: number;
  allocation: number; // percentage
}

export interface ClientContext {
  clientName: string;
  aum: string;
  latestUpdate: string;
}

export interface RiskProfileOption {
  type: RiskProfileType;
  label: string;
  description: string;
  allocation: string;
  threshold: string;
}

export interface PortfolioData {
  id: string;
  name: string;
  style: string;
  activeProfile: RiskProfileType;
  client: ClientContext;
  positions: Position[];
  whyThisPortfolio: string[];
}

export interface RebalanceTrigger {
  id: string;
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  severity: "warning" | "critical";
}

export interface AssetScreenerItem {
  id: string;
  company: string;
  ticker: string;
  assetClass: AssetClass;
  score: number;
  qualityScore: number;
  growthScore: number;
  pe: string;
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
