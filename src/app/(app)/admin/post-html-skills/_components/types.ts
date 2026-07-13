// ── Post-HTML Analysis (L3/L4) — /api/post-html-analysis ─────────────────────

export type PostHtmlLayer = "l3" | "l4";

export type L3Type = "management" | "opportunity" | "deal";
export type L4Type = "summary";
export type PostHtmlType = L3Type | L4Type;

export const L3_TYPES: L3Type[] = ["management", "opportunity", "deal"];

export const POST_HTML_TYPE_LABELS: Record<PostHtmlType, string> = {
  management: "Management",
  opportunity: "Opportunity",
  deal: "Deal",
  summary: "Summary",
};

export interface PostHtmlEnqueueBody {
  ticker: string;
  layer_id: PostHtmlLayer;
  types?: PostHtmlType[];
  fiscal_year?: string;
  quarter?: string;
  forceRefresh?: boolean;
}

export interface PostHtmlEnqueuedJob {
  type: PostHtmlType;
  jobId: string;
  bullmqId: string;
}

export interface PostHtmlEnqueueResponse {
  success: boolean;
  message: string;
  ticker: string;
  layer_id: PostHtmlLayer;
  jobs: PostHtmlEnqueuedJob[];
}

export interface PostHtmlResult {
  id: string;
  layer_id: PostHtmlLayer;
  type: PostHtmlType;
  ticker: string;
  fiscal_year: string | null;
  quarter: string | null;
  config_id: string | null;
  input_hash: string;
  result: Record<string, unknown>;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  created_at: string;
  updated_at: string;
}

export interface PostHtmlResultsResponse {
  success: boolean;
  data: {
    ticker: string;
    layer_id: PostHtmlLayer;
    results: PostHtmlResult[];
  };
}

// Tracks one enqueued job's polling state in the UI — job disappears from "pending"
// once a matching (type, updated_at) result row shows up, or is marked failed after timing out.
export interface TrackedJob {
  type: PostHtmlType;
  jobId: string;
  bullmqId: string;
  enqueuedAt: number;
  status: "pending" | "done" | "timeout";
  /** updated_at of the result row observed BEFORE this job was enqueued — used to detect a fresh row. */
  baselineUpdatedAt: string | null;
}

// ── Config CRUD — /api/post-html-analysis/configs ─────────────────────────────
// Fixed set of 4 rows (l3: management/opportunity/deal, l4: summary) — seeded once on the backend.
// No create/delete-row endpoints; only edit fields on the existing row and soft-deactivate it.

export interface PostHtmlConfig {
  id: string;
  layer_id: PostHtmlLayer;
  type: PostHtmlType;
  name: string;
  prompt: string;
  output_schema: Record<string, unknown> | null;
  model: string | null;
  max_tokens: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostHtmlConfigsListResponse {
  success: boolean;
  count: number;
  configs: PostHtmlConfig[];
}

export interface PostHtmlConfigResponse {
  success: boolean;
  config?: PostHtmlConfig;
}

export interface PostHtmlConfigUpdateBody {
  name?: string;
  prompt?: string;
  output_schema?: Record<string, unknown>;
  model?: string | null;
  max_tokens?: number | null;
  is_active?: boolean;
}

export interface PostHtmlConfigSourceLens {
  slug: string;
  available: boolean;
  fiscal_year: string | null;
  quarter: string | null;
}

export interface PostHtmlConfigPreviewResponse {
  success: boolean;
  ticker: string;
  layer_id: PostHtmlLayer;
  type: PostHtmlType;
  config: {
    id: string;
    name: string;
    model: string | null;
    max_tokens: number | null;
    updated_at: string;
  };
  dataBlock: string;
  prompt: string;
  // L3: per-lens HTML availability. L4: which L3 types have stored results. Shape differs by layer.
  sourceMeta: {
    lenses?: PostHtmlConfigSourceLens[];
    sourceTypes?: PostHtmlType[];
  };
}

export const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";
export const DEFAULT_MAX_TOKENS = 16000;

// Fixed row identity — layer_id/type pairs that exist on the backend (seeded, not creatable).
export const CONFIG_ROWS: { layer_id: PostHtmlLayer; type: PostHtmlType }[] = [
  { layer_id: "l3", type: "management" },
  { layer_id: "l3", type: "opportunity" },
  { layer_id: "l3", type: "deal" },
  { layer_id: "l4", type: "summary" },
];
