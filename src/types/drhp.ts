export interface DrhpHeroHeader {
  companyName: string;
  companyDescription: string;
  totalIssueSizeCr: number;
  listingGainPotential: string;
  adjEbitdaMarginPct: number;
  nineMonthRevenueCr: number;
  issueDate: string;
}

export interface DrhpOfsVsFreshSplit {
  freshIssueCr: number;
  ofsCr: number;
  ofsPct: number;
  ofsHeavyFlag: boolean;
}

export interface DrhpQuickVerdict {
  verdict: string;
  verdictHeadline: string;
  verdictBullets: string[];
  ofsVsFreshSplit: DrhpOfsVsFreshSplit;
}

export interface DrhpShareholder {
  name: string;
  status: "EXIT" | "HOLDING";
}

export interface DrhpRiskItem {
  flag: string;
  evidence: string;
  implication: string;
}

export interface DrhpRedFlagsAndRisks {
  critical: DrhpRiskItem[];
  caution: DrhpRiskItem[];
  watch: DrhpRiskItem[];
}

export interface DrhpProceedsBreakdown {
  purpose: string;
  pct: number | null;
}

export interface DrhpIpoPricingAssessment {
  freshIssueCr: number;
  ofsCr: number;
  ofsPct: number;
  priceBandLower?: number;
  priceBandUpper?: number;
  useOfProceedsBreakdown: DrhpProceedsBreakdown[];
  useOfProceedsRedFlags: string[];
  anchorInvestorQuality?: string;
}

export interface DrhpInsight {
  core: {
    heroHeader: DrhpHeroHeader;
    quickVerdict: DrhpQuickVerdict;
    redFlagsAndRisks: DrhpRedFlagsAndRisks;
  };
  analysis: {
    ipoPricingAssessment: DrhpIpoPricingAssessment;
    sellingShareholdersList: DrhpShareholder[];
  };
}

export interface DrhpRecord {
  id: string;
  ticker: string;
  type: string;
  created_at: string;
  updated_at: string;
  insight: DrhpInsight;
}

export interface DrhpApiResponse {
  success: boolean;
  message?: string;
  data: DrhpRecord;
}

export interface DrhpListApiResponse {
  success: boolean;
  message?: string;
  data: DrhpRecord[];
}
