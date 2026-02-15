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
