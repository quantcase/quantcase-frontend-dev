// Hardcoded reference data for the journal empty states.
// Used when a journal has no tickers yet — we surface rotating Nifty50 ideas
// and fall back to concise thesis prompts so the composer is never blank.

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

// Concise thesis-prompt fallbacks for the composer's Step 3 prompt row.
// Clicking one fills the thesis textarea.
export const DEFAULT_THESIS_PROMPTS: string[] = [
  "Management has consistently met guidance.",
  "Structural industry tailwind at my back.",
  "Trading below intrinsic value vs peers.",
  "Durable competitive moat protects margins.",
  "Re-rating trigger as debt pays down.",
];
