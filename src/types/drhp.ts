export interface DrhpHeroHeader {
  companyName: string;
  companyDescription: string;
  listingExchanges?: string[];
  totalIssueSizeCr: number;
  fairValueRange?: { low?: number; high?: number };
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
  summary: string;
  businessQualityAssessment: string;
  ofsVsFreshSplit: DrhpOfsVsFreshSplit;
}

export interface DrhpShareholder {
  name: string;
  holdingPct?: number | null;
  status: "EXIT" | "HOLDING";
  exitCr?: number | null;
}

export interface DrhpRiskItem {
  flag: string;
  evidence: string;
  implication: string;
  impact?: { label: string; severity: "high" | "medium" | "low" | "extreme" };
  probability?: string;
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

export interface DrhpAnalysis {
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

export interface DrhpApiResponse {
  success: boolean;
  message?: string;
  data: DrhpAnalysis;
}
