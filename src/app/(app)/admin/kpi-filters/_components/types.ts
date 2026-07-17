// ── KPI threshold conditions — reusable, per "/admin/kpi-filters" ────────────

export type Operator = ">" | "<" | ">=" | "<=" | "=" | "!=" | "between";

export interface KpiFilter {
  slug: string;
  label: string;
  kpi_abbr: string;
  operator: Operator;
  value: number;
  value_max?: number | null;
  frequency?: "annual" | "quarterly" | "daily" | null;
}

export interface KpiFiltersResponse {
  success: boolean;
  data: KpiFilter[];
}

export interface KpiFilterResponse {
  success: boolean;
  data: KpiFilter;
}

export const OPERATORS: { value: Operator; label: string }[] = [
  { value: ">", label: "greater than" },
  { value: "<", label: "less than" },
  { value: ">=", label: "greater than or equal to" },
  { value: "<=", label: "less than or equal to" },
  { value: "=", label: "equal to" },
  { value: "!=", label: "not equal to" },
  { value: "between", label: "between" },
];

export function formatCondition(f: Pick<KpiFilter, "operator" | "value" | "value_max">): string {
  if (f.operator === "between") return `between ${f.value} and ${f.value_max ?? "?"}`;
  return `${f.operator} ${f.value}`;
}
