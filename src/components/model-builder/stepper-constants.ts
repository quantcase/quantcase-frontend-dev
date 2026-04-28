import type {
  AssetClassKey,
  AssetClassAlloc,
  SubClassAlloc,
  RiskProfileDef,
  CapitalChipDef,
  AssetClassDef,
  SubClassDef,
  GoalDef,
  PassiveIncomeState,
  RetirementIncomeState,
  ChildEducationState,
} from "./stepper-types";
import type { RiskProfileType } from "@/types/portfolio";

export const RISK_PROFILES: RiskProfileDef[] = [
  { type: "conservative", label: "Conservative", description: "Capital preservation, steady income",  riskLabel: "Low risk",    allocs: "Eq 20 · Debt 55 · Cash 10 · Comm 10 · Alt 5" },
  { type: "balanced",     label: "Balanced",     description: "Mix of growth and stability",          riskLabel: "Medium risk", allocs: "Eq 50 · Debt 30 · Cash 7 · Comm 7 · Alt 6"  },
  { type: "aggressive",   label: "Aggressive",   description: "High growth, higher volatility",       riskLabel: "High risk",   allocs: "Eq 75 · Debt 10 · Cash 5 · Comm 5 · Alt 5"  },
];

export const GOALS: GoalDef[] = [
  { type: "emergency_fund",     label: "Emergency fund",     riskProfile: "conservative", hasSWP: false },
  { type: "home_purchase",      label: "Home purchase",      riskProfile: "conservative", hasSWP: false },
  { type: "child_education",    label: "Child education",    riskProfile: "balanced",     hasSWP: true  },
  { type: "child_marriage",     label: "Child marriage",     riskProfile: "balanced",     hasSWP: false },
  { type: "retirement_corpus",  label: "Retirement corpus",  riskProfile: "aggressive",   hasSWP: false },
  { type: "wealth_creation",    label: "Wealth creation",    riskProfile: "aggressive",   hasSWP: false },
  { type: "passive_income",     label: "Passive income",     riskProfile: "balanced",     hasSWP: true  },
  { type: "retirement_income",  label: "Retirement income",  riskProfile: "balanced",     hasSWP: true  },
];

export const PRESET_ALLOCS: Record<Exclude<RiskProfileType, "goal-based">, Record<AssetClassKey, number>> = {
  conservative: { equity: 20, debt: 55, cash: 10, commodities: 10, alternatives: 5 },
  balanced:     { equity: 50, debt: 30, cash: 7,  commodities: 7,  alternatives: 6 },
  aggressive:   { equity: 75, debt: 10, cash: 5,  commodities: 5,  alternatives: 5 },
};

export const CAPITAL_CHIPS: CapitalChipDef[] = [
  { label: "₹5 L",   value: 500000    },
  { label: "₹10 L",  value: 1000000   },
  { label: "₹25 L",  value: 2500000   },
  { label: "₹50 L",  value: 5000000   },
  { label: "₹1 Cr",  value: 10000000  },
  { label: "₹2 Cr",  value: 20000000  },
  { label: "₹5 Cr",  value: 50000000  },
  { label: "₹10 Cr", value: 100000000 },
];

export const ASSET_CLASSES: AssetClassDef[] = [
  { key: "equity",       label: "Equity",                  description: "Listed ownership in companies"           },
  { key: "debt",         label: "Debt / Fixed Income",     description: "Public lending instruments"              },
  { key: "cash",         label: "Cash & Equivalents",      description: "Liquidity & treasury holdings"           },
  { key: "commodities",  label: "Commodities",             description: "Store-of-value & raw material exposure"  },
  { key: "alternatives", label: "Alternative Investments", description: "Non-traditional, yield & derivatives"    },
];

export const SUB_CLASSES: Record<AssetClassKey, SubClassDef[]> = {
  equity:       [
    { key: "core",         label: "Core",         description: "Stable compounders, quality large caps" },
    { key: "growth",       label: "Growth",       description: "High earnings growth, scalable businesses" },
    { key: "satellite",    label: "Satellite",    description: "Cyclicals, thematic, event-driven" },
    { key: "mutual_funds", label: "Mutual Funds", description: "All equity MF exposures" },
    { key: "etfs",         label: "ETFs",         description: "All equity ETF exposures" },
  ],
  debt:         [
    { key: "govt_bonds", label: "Govt Bonds",     description: "Sovereign & PSU bonds" },
    { key: "corp_bonds", label: "Corp Bonds",     description: "Investment grade corporate debt" },
    { key: "fd",         label: "Fixed Deposits", description: "Bank & NBFC FDs" },
    { key: "debt_mf",    label: "Debt MFs",       description: "All debt mutual fund exposures" },
  ],
  cash:         [
    { key: "liquid_mf", label: "Liquid MFs", description: "Overnight & liquid mutual funds" },
    { key: "savings",   label: "Savings",    description: "Bank savings & sweep accounts" },
    { key: "tbills",    label: "T-Bills",    description: "Treasury bills & short-term govt paper" },
  ],
  commodities:  [
    { key: "precious",    label: "Precious Metals",  description: "Gold, Silver, Platinum" },
    { key: "industrial",  label: "Industrial Metals", description: "Copper, Aluminium, Lithium" },
    { key: "energy",      label: "Energy",            description: "Crude Oil, Natural Gas, Coal" },
    { key: "agriculture", label: "Agriculture",       description: "Wheat, Sugar, Cotton" },
  ],
  alternatives: [
    { key: "reits",  label: "REITs",  description: "Real estate investment trusts" },
    { key: "invits", label: "InvITs", description: "Infrastructure investment trusts" },
    { key: "pms",    label: "PMS",    description: "Portfolio management services" },
    { key: "aif",    label: "AIF",    description: "Alternative investment funds" },
  ],
};

export const RISK_ALLOC_BARS: Record<Exclude<RiskProfileType, "goal-based">, { label: string; color: string; pct: number }[]> = {
  conservative: [
    { label: "Equity",  color: "#0F172B", pct: 20 },
    { label: "Debt",    color: "#475569", pct: 55 },
    { label: "Cash",    color: "#94A3B8", pct: 10 },
    { label: "Comm",    color: "#CBD5E1", pct: 10 },
    { label: "Alt",     color: "#E2E8F0", pct: 5  },
  ],
  balanced: [
    { label: "Equity",  color: "#0F172B", pct: 50 },
    { label: "Debt",    color: "#475569", pct: 30 },
    { label: "Cash",    color: "#94A3B8", pct: 7  },
    { label: "Comm",    color: "#CBD5E1", pct: 7  },
    { label: "Alt",     color: "#E2E8F0", pct: 6  },
  ],
  aggressive: [
    { label: "Equity",  color: "#0F172B", pct: 75 },
    { label: "Debt",    color: "#475569", pct: 10 },
    { label: "Cash",    color: "#94A3B8", pct: 5  },
    { label: "Comm",    color: "#CBD5E1", pct: 5  },
    { label: "Alt",     color: "#E2E8F0", pct: 5  },
  ],
};

export const RISK_METER: Record<Exclude<RiskProfileType, "goal-based">, { dots: number; color: string; accent: string }> = {
  conservative: { dots: 3, color: "#3B82F6", accent: "#EFF6FF" },
  balanced:     { dots: 6, color: "#10B981", accent: "#ECFDF5" },
  aggressive:   { dots: 9, color: "#EF4444", accent: "#FEF2F2" },
};

// ── Default SWP states ────────────────────────────────────────────────────────

export const DEFAULT_PASSIVE: PassiveIncomeState = {
  withdrawalMethod: "fixed",
  fixedAmount:      "",
  withdrawalRate:   "",
  frequency:        "monthly",
  payoutDate:       "1",
  startDate:        "",
  endDate:          "",
  stepUpRate:       "",
  cagr:             "8",
};

export const DEFAULT_RETIREMENT: RetirementIncomeState = {
  clientDob:          "",
  retirementAge:      "",
  targetLongevityAge: "",
  withdrawalMethod:   "fixed",
  fixedAmount:        "",
  withdrawalRate:     "",
  frequency:          "monthly",
  stepUpRate:         "",
  cagr:               "7",
  nomineeName:        "",
  nomineeRelation:    "",
  nomineeContact:     "",
};

export const DEFAULT_CHILD_EDUCATION: ChildEducationState = {
  childDob:        "",
  inflationRate:   "6",
  cagr:            "8",
  milestoneSchool: true,
  milestoneUg:     true,
  milestonePg:     true,
  milestonePro:    false,
};

export const MILESTONE_DEFS = [
  {
    id: "school" as const,
    key: "milestoneSchool" as const,
    label: "School",
    tag: "Class 9 & Class 11",
    age: "Age 14 & 16 · semi-annual",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    id: "ug" as const,
    key: "milestoneUg" as const,
    label: "Graduation",
    tag: "UG — 4 years",
    age: "Age 18 · 8 payouts · semi-annual",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    id: "pg" as const,
    key: "milestonePg" as const,
    label: "Post-grad",
    tag: "PG — 2 years",
    age: "Age 22 · 4 payouts · semi-annual",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    id: "pro" as const,
    key: "milestonePro" as const,
    label: "Higher / Professional",
    tag: "",
    age: "Age 24–26 · custom · semi-annual",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatCapital(val: number): string {
  if (val >= 10000000) return `₹${Math.round(val / 10000000)} Cr`;
  if (val >= 100000)   return `₹${Math.round(val / 100000)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export function parseCapitalInput(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (/cr/i.test(raw)) return Math.round(num * 10000000);
  if (/l/i.test(raw))  return Math.round(num * 100000);
  return Math.round(num);
}

export function defaultSubAllocs(key: AssetClassKey): Record<string, SubClassAlloc> {
  const result: Record<string, SubClassAlloc> = {};
  SUB_CLASSES[key].forEach((s, i) => {
    result[s.key] = { enabled: i === 0, pct: i === 0 ? 100 : 0 };
  });
  return result;
}

export function resolvedRiskProfile(
  riskProfile: import("@/types/portfolio").RiskProfileType,
  selectedGoal: import("@/types/portfolio").GoalType | null
): Exclude<import("@/types/portfolio").RiskProfileType, "goal-based"> {
  if (riskProfile === "goal-based" && selectedGoal) {
    const goal = GOALS.find((g) => g.type === selectedGoal);
    return goal?.riskProfile ?? "balanced";
  }
  return riskProfile as Exclude<import("@/types/portfolio").RiskProfileType, "goal-based">;
}

export function getStepConfig(hasSWP: boolean) {
  const base = [
    { number: 1, shortTitle: "Risk profile & capital", subtitle: "Choose risk level and investment amount" },
    { number: 2, shortTitle: "Asset class selection",  subtitle: "Toggle asset classes on/off"            },
    { number: 3, shortTitle: "Sub-class instruments",  subtitle: "Configure sub-classes"                  },
  ] as const;
  if (!hasSWP) return base;
  return [
    ...base,
    { number: 4, shortTitle: "SWP conditions", subtitle: "Configure withdrawal plan" },
  ] as const;
}
