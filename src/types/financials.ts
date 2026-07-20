export interface FinancialRow {
  key: string;
  label: string;
  values: (number | null)[];
  format?: "percent" | "number";
  /** Same shape recursively — present only on rows with a drill-down. */
  children?: FinancialRow[];
  meta?: { expandable?: boolean };
}

export interface FinancialTable {
  periods: string[];
  rows: FinancialRow[];
}

interface BalanceSheetData {
  annual: FinancialTable;
  quarterly?: FinancialTable;
}

interface GrowthMetric {
  "10y"?: number | null;
  "5y"?: number | null;
  "3y"?: number | null;
  ttm?: number | null;
  last?: number | null;
}

interface StockPriceCagr {
  "10y"?: number | null;
  "5y"?: number | null;
  "3y"?: number | null;
  "1y"?: number | null;
}

interface FinancialsMetrics {
  salesGrowth: GrowthMetric;
  profitGrowth: GrowthMetric;
  roe: GrowthMetric;
  stockPriceCagr: StockPriceCagr;
}

interface FinancialsValuation {
  marketCap: number | null;
  peRatio: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  evToEbitda: number | null;
  evToRevenue: number | null;
  dividendYield: number | null;
  bookValue: number | null;
  eps: number | null;
}

interface FinancialsTTM {
  revenue: number | null;
  ebitda: number | null;
  netProfit: number | null;
  eps: number | null;
}

interface FinancialsStandardized {
  quarterly: FinancialTable;
  annual: FinancialTable;
  balanceSheet: BalanceSheetData;
  cashFlow: FinancialTable;
  cashFlowQuarterly?: FinancialTable;
  ttm: FinancialsTTM;
  metrics: FinancialsMetrics;
  valuation: FinancialsValuation;
}

interface FundamentalsSignals {
  growth: string;
  valuation: string;
  balanceSheet: string;
  profitability: string;
  cashConversion: string;
}

interface FundamentalsActionableInsight {
  action: string;
  rationale: string;
  reEvaluateCondition?: string;
  existingHolderAction?: string;
}

export interface FundamentalsKeyMetric {
  name: string;
  value: string;
  comment: string;
  assessment: "Positive" | "Negative" | "Neutral";
}

export interface SwotItem {
  title: string;
  description: string;
}

export interface FundamentalsSwot {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export interface FundamentalsIntelligence {
  tag: string;
  fundamentalGrade: string;
  convictionLevel: string;
  actionBias: string;
  signals: FundamentalsSignals;
  actionableInsight: FundamentalsActionableInsight;
  swot: FundamentalsSwot;
  riskAlerts: string[];
  whatCanChange: string[];
  keyMetricsSummary: FundamentalsKeyMetric[];
}

export interface FinancialsResponse {
  symbol: string;
  exchange: string;
  currency: string;
  unit: string;
  timestamp: string;
  standardized: FinancialsStandardized;
  fundamentalsIntelligence?: FundamentalsIntelligence;
}

// ─── Chart types ───────────────────────────────────────────────────────────────

interface ChartDataPoint {
  x: string;
  y: number | null;
}

interface ChartSeriesDefinition {
  dataKey: string;
  name: string;
  data: ChartDataPoint[];
}

export interface ChartGroup {
  group: string;
  barSeries: ChartSeriesDefinition[];
  lineSeries: ChartSeriesDefinition[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
}

export interface FinancialsChartsResponse {
  chartGroups: ChartGroup[];
}
