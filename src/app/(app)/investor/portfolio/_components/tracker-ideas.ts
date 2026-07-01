// Hardcoded reference data for the journal/tracker empty states.
// Used when a user has no Trackers yet — we surface rotating Nifty50 ideas
// and fall back to concise thesis prompts so the wizard is never blank.

export interface TrackerIdea {
  symbol: string;
  name: string;
  sector: string;
  rationale: string;
}

// NSE Nifty50 constituents (symbols). Order is stable so the rotating window
// is deterministic across renders.
export const NIFTY50_TICKERS: string[] = [
  "RELIANCE", "HDFCBANK", "ICICIBANK", "INFY", "TCS",
  "ITC", "LT", "KOTAKBANK", "AXISBANK", "SBIN",
  "BHARTIARTL", "BAJFINANCE", "ASIANPAINT", "HINDUNILVR", "MARUTI",
  "SUNPHARMA", "TITAN", "ULTRACEMCO", "NESTLEIND", "WIPRO",
  "HCLTECH", "POWERGRID", "NTPC", "TATAMOTORS", "TATASTEEL",
  "JSWSTEEL", "ADANIENT", "ADANIPORTS", "GRASIM", "TECHM",
  "BAJAJFINSV", "HDFCLIFE", "SBILIFE", "DIVISLAB", "DRREDDY",
  "CIPLA", "BRITANNIA", "COALINDIA", "EICHERMOT", "HEROMOTOCO",
  "BAJAJ-AUTO", "INDUSINDBK", "ONGC", "BPCL", "TATACONSUM",
  "APOLLOHOSP", "HINDALCO", "UPL", "M&M", "SHRIRAMFIN",
];

// A curated subset with a one-line rationale, for richer "Tracker ideas" rows.
export const TRACKER_IDEAS: TrackerIdea[] = [
  { symbol: "RELIANCE",   name: "Reliance Industries", sector: "Energy",       rationale: "Jio + retail value unlock vs O2C cyclicality." },
  { symbol: "HDFCBANK",   name: "HDFC Bank",           sector: "Financials",   rationale: "Post-merger deposit accretion and steady RoA." },
  { symbol: "INFY",       name: "Infosys",             sector: "IT",           rationale: "Deal pipeline vs discretionary spend slowdown." },
  { symbol: "ITC",        name: "ITC",                 sector: "FMCG",         rationale: "Cigarette cash flows funding FMCG/hotels re-rating." },
  { symbol: "LT",         name: "Larsen & Toubro",     sector: "Industrials",  rationale: "Order book strength on capex upcycle." },
  { symbol: "BHARTIARTL", name: "Bharti Airtel",       sector: "Telecom",      rationale: "ARPU expansion and Africa free cash flow." },
  { symbol: "TITAN",      name: "Titan Company",        sector: "Consumer",     rationale: "Jewellery formalisation and store-led growth." },
  { symbol: "SUNPHARMA",  name: "Sun Pharma",          sector: "Pharma",       rationale: "Specialty US franchise margin tailwind." },
  { symbol: "MARUTI",     name: "Maruti Suzuki",        sector: "Auto",         rationale: "SUV mix and premiumisation driving realisations." },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement",     sector: "Materials",    rationale: "Capacity adds vs pricing discipline in cement." },
];

// Concise thesis-prompt fallbacks shown when the backend returns none,
// so the prompt row in Step 3 is never empty. Clicking fills the textarea.
export const DEFAULT_THESIS_PROMPTS: string[] = [
  "Management has consistently met guidance.",
  "Structural industry tailwind at my back.",
  "Trading below intrinsic value vs peers.",
  "Durable competitive moat protects margins.",
  "Re-rating trigger as debt pays down.",
];
