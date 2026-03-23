// Screener type definitions

export interface StockData {
  company: string;
  company_name: string;
  basic_industry: string;
}

export interface StocksApiResponse {
  success: boolean;
  data: StockData[];
}

export interface QuarterlyTrend {
  period: string;
  revenue: number;
  ebitda: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
}

export interface ScreenerData {
  symbol: string;
  ticker: string;
  company: {
    name: string;
    exchange: string;
    sector: string;
    industry: string;
    description: string;
    website: string;
    employees: number;
    country: string;
  };
  quote: {
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    volume: number;
    avgVolume: number;
    week52High: number;
    week52Low: number;
    marketCap: number;
    currency: string;
    marketState: string;
    lastUpdated: string;
  };
  financialPerformance: {
    revenue: number;
    revenueGrowth: number;
    grossProfits: number;
    grossMargins: number;
    ebitda: number;
    ebitdaMargins: number;
    operatingMargins: number;
    profitMargins: number;
    earningsGrowth: number;
    revenuePerShare: number;
    quarterlyTrend: QuarterlyTrend[];
  };
  valuation: {
    peRatio: number;
    forwardPE: number;
    pbRatio: number;
    evToEbitda: number;
    evToRevenue: number;
    enterpriseValue: number;
    profitMargins: number;
  };
  efficiency: {
    returnOnEquity: number | null;
    returnOnAssets: number | null;
    debtToEquity: number;
    totalCash: number;
    totalDebt: number;
    totalCashPerShare: number;
  };
  perShare: {
    eps: number;
    epsForward: number;
    bookValue: number;
    dividendRate: number;
    dividendYield: number;
    payoutRatio: number | null;
  };
  analystRatings: {
    targetHighPrice: number;
    targetLowPrice: number;
    targetMeanPrice: number;
    targetMedianPrice: number;
    recommendationKey: string;
    numberOfAnalystOpinions: number;
  };
  keyStats: {
    beta: number | null;
    sharesOutstanding: number;
    floatShares: number;
    heldPercentInsiders: number;
    heldPercentInstitutions: number;
    earningsQuarterlyGrowth: number;
    fiftyDayAverage: number;
    twoHundredDayAverage: number;
    week52Change: number;
  };
}
