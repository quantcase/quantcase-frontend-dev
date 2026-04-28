import type { RiskProfileType, GoalType, SwpConfig } from "@/types/portfolio";

// ── Asset class keys ───────────────────────────────────────────────────────────

export type AssetClassKey = "equity" | "debt" | "cash" | "commodities" | "alternatives";

export interface AssetClassAlloc { enabled: boolean; pct: number }
export interface SubClassAlloc   { enabled: boolean; pct: number }

// ── Config types ───────────────────────────────────────────────────────────────

export interface RiskProfileDef {
  type: Exclude<RiskProfileType, "goal-based">;
  label: string;
  description: string;
  riskLabel: string;
  allocs: string;
}

export interface CapitalChipDef  { label: string; value: number }
export interface AssetClassDef   { key: AssetClassKey; label: string; description: string }
export interface SubClassDef     { key: string; label: string; description: string }

export interface GoalDef {
  type: GoalType;
  label: string;
  riskProfile: Exclude<RiskProfileType, "goal-based">;
  hasSWP: boolean;
}

// ── SWP form states ────────────────────────────────────────────────────────────

export interface PassiveIncomeState {
  withdrawalMethod: "fixed" | "percentage";
  fixedAmount: string;
  withdrawalRate: string;
  frequency: string;
  payoutDate: string;
  startDate: string;
  endDate: string;
  stepUpRate: string;
  cagr: string;
}

export interface RetirementIncomeState {
  clientDob: string;
  retirementAge: string;
  targetLongevityAge: string;
  withdrawalMethod: "fixed" | "percentage";
  fixedAmount: string;
  withdrawalRate: string;
  frequency: string;
  stepUpRate: string;
  cagr: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeContact: string;
}

export interface ChildEducationState {
  childDob: string;
  inflationRate: string;
  cagr: string;
  milestoneSchool: boolean;
  milestoneUg: boolean;
  milestonePg: boolean;
  milestonePro: boolean;
}

// ── Re-export SwpConfig so consumers don't need to import from two places ──────
export type { SwpConfig };
