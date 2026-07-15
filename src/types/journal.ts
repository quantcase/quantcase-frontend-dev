// Unified Journal domain model.
//
// A *journal* is a named container of stock tickers; each ticker carries multiple
// timestamped *entries* that are either a plain note or a full M/O/D thesis.
// Every user auto-gets two default journals — Holdings (auto-synced from real
// holdings, add-only) and Tracking (user-managed) — and can create custom ones.
// See docs / the Investment Journal integration guide for the API contract.

export type Dimension = "M" | "O" | "D";
export type ThesisHealth = "intact" | "partial" | "broken" | "none";
export type JournalKind = "holdings" | "tracking" | "custom";
export type MarketConviction = "POSITIVE" | "NEUTRAL" | "WATCH";
export type TickerSource = "manual" | "holdings_sync";
export type EntryType = "note" | "thesis";

// ── Journal ─────────────────────────────────────────────────────────────────

export interface Journal {
  id: string;
  name: string;
  kind: JournalKind;
  isDefault: boolean;
  tickerCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Ticker + live market data ───────────────────────────────────────────────

export interface TickerMarket {
  ltp: number | null;
  change: number | null;
  changePercent: number | null;
  qcScore: number | null;
  conviction: MarketConviction | null;
  thesisTags: string[];
}

// ── Entry (discriminated on `type`) ─────────────────────────────────────────
// A note carries only `noteText`; a thesis carries dimension/subFactors/thesis/
// conviction and gets AI-evaluated for thesis health. Always branch on `type`
// before reading fields — never read thesis fields off a note.

export interface NoteEntry {
  id: string;
  type: "note";
  noteText: string;
  dimension: null;
  subFactors: null;
  thesis: null;
  conviction: null;
  thesisHealth: null;
  aiNudge: null;
  createdAt: string;
  updatedAt: string;
}

export interface ThesisEntry {
  id: string;
  type: "thesis";
  noteText: null;
  dimension: Dimension;
  subFactors: string[];
  thesis: string;
  conviction: 1 | 2 | 3 | 4 | 5;
  thesisHealth: ThesisHealth;
  aiNudge: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JournalEntry = NoteEntry | ThesisEntry;

// ── Journal detail (tickers with market data + latest entry) ────────────────

export interface JournalTicker {
  ticker: string;
  source: TickerSource;
  addedAt: string;
  entryCount: number;
  market: TickerMarket;
  latestEntry: JournalEntry | null;
  latestThesisHealth: ThesisHealth | null; // null = no thesis entries yet
}

export interface JournalDetail {
  journal: Journal;
  tickers: JournalTicker[];
}

// ── Request / response shapes ───────────────────────────────────────────────

export interface AddTickersResponse {
  added: number;
  tickers: string[];
}

export interface EvaluateResponse {
  entryId: string;
  thesisHealth: ThesisHealth;
  aiNudge: string | null;
  evaluatedAt: string;
}

export interface SyncHoldingsResponse {
  journalId: string;
  added: number;
  total: number;
}

export type NoteBody = { noteText: string };
export type ThesisBody = {
  dimension: Dimension;
  subFactors: string[];
  thesis: string;
  conviction: number;
};
export type EntryBody = NoteBody | ThesisBody;

// ── Domain constants + derivations ──────────────────────────────────────────

export const SUB_FACTORS: Record<Dimension, string[]> = {
  M: ["Guidance Accuracy", "Capital Allocation", "Disclosure Honesty"],
  O: ["Industry Tailwind", "Distribution Strength", "Competitive Edge", "TAM Expansion"],
  D: ["Valuation", "Earnings Growth/Quality", "P/E Re-rating Potential", "Risk-Reward"],
};

export const DIMENSION_LABEL: Record<Dimension, string> = {
  M: "Management",
  O: "Opportunity",
  D: "Deal",
};

// A ticker is "pending" (needs a thesis) when it has no thesis entries yet.
// `null` = no thesis; "none" = a thesis that evaluated to a neutral outcome.
export const isPending = (t: JournalTicker) => t.latestThesisHealth === null;
