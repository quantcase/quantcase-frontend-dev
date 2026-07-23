// ── Technicals skill config + bulk analysis ──────────────────────────────────
// The `technical-intelligence` skill is a generic Skill row managed via
// /admin/skills (config) and /admin/technicals/bulk-* (analysis). Different
// backend surface from the post-HTML configs in ./types.ts.

import type { Skill } from "../../pipelines/_components/types";

export const TECHNICALS_SKILL_SLUG = "technical-intelligence";

/** The Skill row plus the fields the list/read endpoints return beyond the base type. */
export type TechnicalsSkill = Skill & {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

// ── /admin/skills ─────────────────────────────────────────────────────────────

export interface SkillsListResponse {
  success: boolean;
  data: TechnicalsSkill[];
}

export interface SkillResponse {
  success: boolean;
  data: TechnicalsSkill;
}

/**
 * Partial update body for PUT /admin/skills/:id. Deliberately omits `promptKey`
 * — it must stay the registered key (`decisionIntelligencePrompt`) or the update
 * 400s. `outputSchema` is sent verbatim, keeping the
 * `{ type, json_schema: { name, strict, schema } }` wrapper.
 */
export interface SkillUpdateBody {
  promptTemplate?: string | null;
  outputSchema?: Record<string, unknown> | null;
  model?: string;
  maxTokens?: number;
  isActive?: boolean;
}

// Known models for the dropdown; the loaded skill's model is added if absent.
export const TECHNICALS_MODEL_OPTIONS = [
  "anthropic/claude-haiku-4.5",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-sonnet-4-6",
];

export const TECHNICALS_DEFAULT_MAX_TOKENS = 20000;

// ── /admin/technicals/bulk-analyze ────────────────────────────────────────────

export interface BulkAnalyzeBody {
  tickers: string[];
  force: boolean;
}

export type BulkAnalyzeStatus = "queued" | "processing" | "exists" | "failed" | "error";

export interface BulkAnalyzeResult {
  ticker: string;
  jobId: string;
  status: BulkAnalyzeStatus;
  error?: string;
}

export interface BulkAnalyzeResponse {
  success: boolean;
  requested: number;
  counts: Record<string, number>;
  results: BulkAnalyzeResult[];
}

// ── /admin/technicals/bulk-status ─────────────────────────────────────────────

export interface BulkStatusBody {
  tickers: string[];
}

export type BulkStatusStatus = "queued" | "processing" | "ready" | "failed" | "missing";

export interface BulkStatusResult {
  ticker: string;
  status: BulkStatusStatus;
  updatedAt: string | null;
  error?: string;
}

export interface BulkStatusResponse {
  success: boolean;
  requested: number;
  counts: Record<string, number>;
  results: BulkStatusResult[];
}

// One row in the bulk-run table — seeded from bulk-analyze, then kept fresh by
// bulk-status polling. `status` widens to cover both endpoints' vocabularies.
export interface BulkRow {
  ticker: string;
  status: BulkAnalyzeStatus | BulkStatusStatus;
  updatedAt: string | null;
  error?: string;
}
