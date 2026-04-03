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
  revenue: number | null;
  ebitda: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  eps: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
  netDebt: number | null;
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
    ebitdaGrowth: number | null;
    ebitdaMargins: number;
    operatingMargins: number;
    netProfit: number | null;
    netProfitGrowth: number | null;
    profitMargins: number;
    earningsGrowth: number;
    revenuePerShare: number;
    operatingCashflow: number;
    cfoGrowth: number | null;
    freeCashflow: number;
    fcfGrowth: number | null;
    reserves: number | null;
    reservesGrowth: number | null;
    quarterlyTrend: QuarterlyTrend[];
  };
  valuation: {
    peRatio: number;
    peValuationLabel: string | null;
    forwardPE: number;
    pbRatio: number;
    pegRatio: number | null;
    evToEbitda: number;
    evToRevenue: number;
    enterpriseValue: number;
    profitMargins: number;
    industryPE: number | null;
    industryPELabel: string | null;
  };
  efficiency: {
    returnOnEquity: number | null;
    returnOnAssets: number | null;
    debtToEquity: number;
    debtGrowth: number | null;
    totalCash: number;
    totalDebt: number;
    totalCashPerShare: number;
  };
  ratios: {
    roce: number | null;
    roce3yAvg: number | null;
    roe: number | null;
    roe3yAvg: number | null;
    debtStatus: string | null;
  };
  ownership: {
    promoter: number | null;
    institutions: number | null;
    fii: number | null;
    dii: number | null;
    public: number | null;
    publicLabel: string | null;
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
  financials: {
    eps_cagr_3y: number | null;
    ebitda_ev_yield: number | null;
    cfo_ebitda_pct: number | null;
    net_debt_ebitda: number | null;
  };
}
