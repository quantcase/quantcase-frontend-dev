export interface FinancialRow {
  key: string;
  label: string;
  values: (number | null)[];
  highlight?: boolean;
  format?: "percent" | "number";
}

export interface FinancialTable {
  periods: string[];
  rows: FinancialRow[];
}

export interface BalanceSheetData {
  annual: FinancialTable;
}

export interface GrowthMetric {
  "3y"?: number | null;
  "5y"?: number | null;
  ttm?: number | null;
  last?: number | null;
}

export interface StockPriceCagr {
  "1y"?: number | null;
  "3y"?: number | null;
}

export interface FinancialsMetrics {
  salesGrowth: GrowthMetric;
  profitGrowth: GrowthMetric;
  roe: GrowthMetric;
  stockPriceCagr: StockPriceCagr;
}

export interface FinancialsValuation {
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

export interface FinancialsTTM {
  revenue: number | null;
  ebitda: number | null;
  netProfit: number | null;
  eps: number | null;
}

export interface FinancialsStandardized {
  quarterly: FinancialTable;
  annual: FinancialTable;
  balanceSheet: BalanceSheetData;
  cashFlow: FinancialTable;
  ttm: FinancialsTTM;
  metrics: FinancialsMetrics;
  valuation: FinancialsValuation;
}

export interface FinancialsResponse {
  symbol: string;
  exchange: string;
  currency: string;
  unit: string;
  timestamp: string;
  standardized: FinancialsStandardized;
}
