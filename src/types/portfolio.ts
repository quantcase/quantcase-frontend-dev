export type RiskProfileType = "conservative" | "balanced" | "aggressive" | "goal-based";

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

// ── Model holding (stock with weight) ───────────────────────────────────────

export interface ModelHolding {
  ticker: string;       // e.g. "CANFINHOME"
  companyName: string;  // e.g. "Can Fin Homes Ltd"
  industry: string;
  weight: number;       // percentage, 0–100
}

// ── Core model ──────────────────────────────────────────────────────────────

// ── SWP types ────────────────────────────────────────────────────────────────

export type GoalType =
  | "child_education"
  | "passive_income"
  | "child_marriage"
  | "retirement_corpus"
  | "wealth_creation"
  | "emergency_fund"
  | "home_purchase"
  | "retirement_income";

export type SwpGoalType = "child_education" | "passive_income" | "retirement_income";

export interface SwpPassiveIncome {
  goal_type: "passive_income";
  corpus: number;
  start_date: string;
  end_date: string | null;
  withdrawal_method: "fixed" | "percentage";
  fixed_amount: number | null;
  withdrawal_rate_pa: number | null;
  frequency: "monthly" | "quarterly" | "half-yearly" | "annual";
  payout_date: 1 | 15;
  step_up_rate: number | null;
  portfolio_cagr_assumed: number;
  status: "active" | "paused" | "closed";
}

export interface SwpRetirementIncome {
  goal_type: "retirement_income";
  client_dob: string;
  retirement_age: number;
  target_longevity_age: number;
  corpus: number;
  withdrawal_method: "fixed" | "percentage";
  fixed_amount: number | null;
  withdrawal_rate_pa: number | null;
  frequency: "monthly" | "quarterly" | "half-yearly" | "annual";
  step_up_rate: number | null;
  inflation_rate: number;
  portfolio_cagr_assumed: number;
  nominee: { name: string; relation: string; contact: string };
  status: "active" | "paused" | "pending_approval" | "closed";
}

export interface SwpMilestone {
  id: "school" | "ug" | "pg" | "pro";
  active: boolean;
  trigger_age: number;
}

export interface SwpChildEducation {
  goal_type: "child_education";
  child_dob: string;
  corpus: number;
  inflation_rate: number;
  portfolio_cagr_assumed: number;
  milestones: SwpMilestone[];
  status: "active" | "paused" | "closed";
}

export type SwpConfig = SwpPassiveIncome | SwpRetirementIncome | SwpChildEducation;

export interface PortfolioData {
  id: string;
  name: string;
  riskProfile: RiskProfileType;
  capital: number;
  assetClasses: AssetClassEntry[];
  client: ClientContext;
  positions: EquityPosition[];
  whyThisPortfolio: string[];
  linkedClientIds?: string[];
  holdings?: ModelHolding[];
  goalType?: GoalType;
  swpConfig?: SwpConfig;
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
type AssetClass = "growth" | "quality_compounder" | "value" | "income";

// Old position type (still referenced by allocated-positions-card)
interface Position {
  id: string;
  company: string;
  ticker: string;
  assetClass: AssetClass;
  score: number;
  allocation: number;
}

interface RebalanceTrigger {
  id: string;
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  severity: "warning" | "critical";
}

interface RiskProfileOption {
  type: RiskProfileType;
  label: string;
  description: string;
  allocation: string;
  threshold: string;
}

interface AllocationSegment {
  name: string;
  value: number;
  color: string;
}

interface DriftItem {
  id: string;
  assetClass: string;
  currentAllocation: number;
  targetAllocation: number;
  driftPercent: number;
  direction: "up" | "down";
}

type ConvictionLevel = "strong_buy" | "buy" | "hold" | "sell";
type ValuationZone   = "Attractive" | "Fair" | "High" | "Speculative";

interface ScoreDimension {
  label: string;
  value: number;
  maxValue: number;
  sublabel: string;
  color: "green" | "amber" | "orange" | "red";
}

interface AssetDeepDive {
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
