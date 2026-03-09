// Static JSON data for the "View Detailed Analysis" sections

export const epsEngineData = {
  title: "Earnings Trajectory & Quality",
  subtitle: "How earnings are growing and whether they're high quality",
  subSectionTitle: "EPS ENGINE: WHAT DRIVES EARNINGS IN EACH SCENARIO",
  subSectionSubtitle:
    "Revenue growth, margin expansion, and execution alpha create the earnings trajectory",
  scenarios: {
    bear: {
      industryCagr: { value: "3.5%", note: "Infrastructure sector slows" },
      revenueGrowth: {
        value: "9.5%",
        note: "Competitive pressure",
        mgmtGuidance: '"15-20%"',
        mgmtResult: "9.5%",
      },
      marginTrajectory: {
        value: "-100bps",
        note: "Margin compression",
        mgmtGuidance: '"26-28%"',
        mgmtResult: "25.3%",
      },
      executionAlpha: { rating: "8.4/10", value: "0.5x", note: "Underperform" },
      expectedEpsCagr: { value: "8.2%", subtitle: "Below industry standard" },
    },
    base: {
      industryCagr: { value: "5.0%", note: "Steady growth" },
      revenueGrowth: {
        value: "15.2%",
        note: "On-track execution",
        mgmtGuidance: '"15-20%"',
        mgmtResult: "15%",
      },
      marginTrajectory: {
        value: "+50bps",
        note: "Stable improvement",
        mgmtGuidance: '"26-28%"',
        mgmtResult: "26.8%",
      },
      executionAlpha: { rating: "8.4/10", value: "1.0x", note: "Meet guidance" },
      expectedEpsCagr: { value: "16.8%", subtitle: "Solid growth + margin tailwind" },
    },
    bull: {
      industryCagr: { value: "7.5%", note: "Supercycle" },
      revenueGrowth: {
        value: "21.8%",
        note: "Beat guidance",
        mgmtGuidance: '"15-20%"',
        mgmtResult: "22%",
      },
      marginTrajectory: {
        value: "+150bps",
        note: "Operating leverage",
        mgmtGuidance: '"26-28%"',
        mgmtResult: "28.8%",
      },
      executionAlpha: { rating: "8.4/10", value: "1.3x", note: "Exceed guidance" },
      expectedEpsCagr: { value: "24.6%", subtitle: "Accelerated growth" },
    },
  },
  insight:
    'Management\'s 8.4/10 execution score (based on our Management section analysis) is a critical multiplier. Their guidance of "15-20% revenue growth" and "26-28% sustainable margins" provides the base case anchor, with execution alpha determining whether we land at 8.2%, 16.8%, or 24.6% EPS CAGR.',
};

export const historicalPerformanceData = {
  title: "HISTORICAL PERFORMANCE: COMPANY EPS CAGR VS INDUSTRY EARNINGS GROWTH",
  subtitle: "5-year earnings trajectory comparison shows consistent outperformance",
  companyGrowth: { value: "24.2%", label: "5 yr CAGR" },
  industryGrowth: { value: "4.5%", label: "5 yr CAGR" },
  companyName: "Adani Enterprises",
  industryName: "Infrastructure Industry",
  chartData: [
    { year: "FY20", company: 19, industry: 4 },
    { year: "FY21", company: 11, industry: 3 },
    { year: "FY22", company: 36, industry: 6 },
    { year: "FY23", company: 28, industry: 6.5 },
    { year: "FY24", company: 25, industry: 5 },
    { year: "FY25E", company: 26, industry: 4.5 },
  ],
  stats: [
    { value: "+19.7%", label: "Avg outperformance vs industry", color: "emerald" },
    { value: "6/6 Yrs", label: "Beat industry every year", color: "blue" },
    { value: "26.5%", label: "FY25E growth (sustained)", color: "purple" },
  ],
};

export const qualityOfEarningsData = {
  title: "QUALITY OF EARNINGS: ATOMIC METRICS",
  subtitle: "The underlying drivers that make these earnings high quality and sustainable",
  metrics: [
    { label: "EBITDA MARGIN", value: "26.3%", change: "+390 bps (FY20→FY24)", changeColor: "emerald" },
    { label: "RETURN ON EQUITY", value: "22.8%", change: "+460 bps (FY20→FY24)", changeColor: "blue" },
    { label: "MARKET SHARE", value: "12.3%", change: "+410 bps (FY20→FY24)", changeColor: "purple" },
    { label: "CASH CONVERSION", value: "94%", change: "High quality earnings", changeColor: "amber" },
  ],
  chartData: [
    { year: "FY20", roe: 18, roic: 15, marketShare: 8 },
    { year: "FY21", roe: 19, roic: 16, marketShare: 8.5 },
    { year: "FY22", roe: 21, roic: 18, marketShare: 9.5 },
    { year: "FY23", roe: 23, roic: 19.5, marketShare: 10.5 },
    { year: "FY24", roe: 25, roic: 21, marketShare: 11.5 },
    { year: "FY25E", roe: 28, roic: 23, marketShare: 12.3 },
  ],
  bottomLine:
    "High-quality earnings. Margins expanded 390 bps while growing revenue 18% CAGR. ROE improvement (+460 bps) + market share gains (+410 bps) = strengthening moat. 94% cash conversion confirms profits translate to cash. Network effects visible in infrastructure ecosystem creating self-reinforcing growth loop.",
};

export type DescriptionSegment = {
  text: string;
  bold?: boolean;
  color?: "emerald" | "blue" | "red";
};

export const valuationVsPeersData = {
  title: "Valuation vs Peers",
  subtitle: "How current valuation compares to similar companies",
  currentPosition: [
    { label: "P/E MULTIPLE", value: "+38%", detail: "32.4x vs 23.5x", color: "amber" },
    { label: "EV/EBITDA", value: "+32%", detail: "18.2x vs 13.8x", color: "amber" },
    { label: "ROE QUALITY", value: "+66%", detail: "22.8% vs 13.7%", color: "emerald" },
    { label: "GROWTH RATE", value: "+73%", detail: "18.2% vs 10.5%", color: "emerald" },
  ],
  reRatingView: {
    badge: "EXPAND",
    title: "P/E Multiple Expected to Expand",
    description: [
      { text: "Currently trading at " },
      { text: "32.4X P/E", bold: true },
      { text: ", we expect the multiple to expand toward " },
      { text: "35-40x in bull case", bold: true, color: "emerald" },
      { text: " as the market recognizes sustained execution, quality improvement, and infrastructure tailwinds. Base case maintains " },
      { text: "30-35x", bold: true, color: "blue" },
      { text: ", while bear case contracts to " },
      { text: "22-25x", bold: true, color: "red" },
      { text: "." },
    ] as DescriptionSegment[],
  },
  expansionDrivers: [
    { text: "Quality recognition:", detail: "ROE 22.8%, improving 460 bps" },
    { text: "Earnings consistency:", detail: "Beat industry 6/6 years" },
    { text: "Market share gains:", detail: "+410 bps in 5 years" },
    { text: "Infrastructure supercycle:", detail: "Sectoral tailwinds" },
  ],
  contractionRisks: [
    { text: "Execution miss:", detail: "Guidance not met triggers derating" },
    { text: "Margin pressure:", detail: "Competition intensifies" },
    { text: "Macro headwinds:", detail: "Infrastructure spend slows" },
    { text: "Already at premium:", detail: "Limited cushion for mistakes" },
  ],
  scenarioMultiples: [
    { label: "Bull Case Exit P/E", value: "35-40x", change: "+9% to +23% expansion", color: "emerald" },
    { label: "Base Case Exit P/E", value: "30-35x", change: "-7% to +8% (sustain)", color: "blue" },
    { label: "Bear Case Exit P/E", value: "22-25x", change: "-32% to -23% contraction", color: "red" },
  ],
};
