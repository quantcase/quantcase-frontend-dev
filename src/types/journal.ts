export type ThesisHealth = "intact" | "partial" | "broken" | "none";
export type Pillar = "mgmt" | "opp" | "deal";
export type ModRating = "STRONG" | "FAIR" | "STRETCHED";
export type Dimension = "M" | "O" | "D";
export type SignalType = "green" | "amber" | "red" | "neutral";
export type PriceDir = "pos" | "neg";

export interface SubScore {
  label: string;
  pillar: Pillar;
  score: number;
}

export type PortfolioType = "user" | "shadow";

export interface JournalEntry {
  entryId: string;
  dimension: Dimension;
  subFactors: string[];
  thesis: string;
  conviction: 1 | 2 | 3 | 4 | 5;
  aiNudge: string | null;
  updatedAt: string;
  portfolioType: PortfolioType;
}

export interface JournalEntryItem {
  symbol: string;
  name: string | null;
  sector: string | null;
  capType: string | null;
  modScore: number;
  modRating: ModRating;
  trendDir: "up" | "down" | "flat" | null;
  pnl: number;
  pnlPct: number;
  thesisHealth: ThesisHealth;
  alert: string | null;
  subScores: SubScore[];
  journal: JournalEntry | null;
  portfolioType: PortfolioType;
}

export interface JournalSummary {
  intact: number;
  partial: number;
  broken: number;
  none: number;
  total: number;
  entryCount: number;   // lifetime count of journal rows, monotonic
  streakDays: number;   // consecutive-day writing streak ending today (0 = no active streak)
}

export type JournalChangeKind = "score" | "guidance" | "thesis" | "event" | "news";

export interface JournalChange {
  symbol: string;
  thesisHealth: ThesisHealth;   // drives the dot color
  description: string;
  changedAt: string;            // ISO 8601
  kind?: JournalChangeKind;
  delta?: number;               // optional signed score delta (not yet populated by backend)
}

export interface JournalEntriesResponse {
  summary: JournalSummary;
  entries: JournalEntryItem[];
  changes: JournalChange[];
}

export interface StockSignal {
  label: string;
  type: SignalType;
}

export interface JournalPendingHolding {
  symbol: string;
  name: string | null;
  sector: string | null;
  capType: string | null;
  price: number;
  priceChange: number;
  priceChangeDir: PriceDir;
  mod: { M: number | null; O: number | null; D: number | null };
  aiContext: { M: string | null; O: string | null; D: string | null };
  signals: StockSignal[];
  subFactors: { M: string[]; O: string[]; D: string[] };
  prompts: string[];
  portfolioType: PortfolioType;
}

export interface JournalPendingResponse {
  totalHoldings: number;
  withThesis: number;
  pending: number;
  holdings: JournalPendingHolding[];
}

export interface SaveEntryRequest {
  symbol: string;
  portfolioType: PortfolioType;
  dimension: Dimension;
  subFactors: string[];
  thesis: string;
  conviction: number;
}

export interface SaveEntryResponse {
  entryId: string;
  holdingId: string;
  thesisHealth: ThesisHealth;
  aiNudge: string | null;
  createdAt: string;
}
