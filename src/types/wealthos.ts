// ─── Enums & Domain Literals ──────────────────────────────────────────────────

export type Segment = "HNI" | "UHNI" | "Retail" | "Institutional" | "Private";
export type RiskProfile = "conservative" | "moderate" | "aggressive";
export type ClientStatus = "prospect" | "onboarding" | "active" | "dormant" | "churned";
export type KycStatus = "not_started" | "pending" | "complete" | "expired";
export type ClientSource = "referral" | "walk_in" | "digital" | "inherited" | "cold_outreach";

export type AssetClass =
  | "equity"
  | "debt"
  | "mutual_fund"
  | "etf"
  | "pms"
  | "aif"
  | "reit"
  | "real_estate"
  | "gold"
  | "cash"
  | "other";

export type HoldingAlertType =
  | "critical_drift"
  | "overweight"
  | "underweight"
  | "rebalance_due"
  | "policy_breach"
  | "value_below_threshold";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export type InteractionType =
  | "call"
  | "email"
  | "whatsapp"
  | "whatsapp_note"
  | "meeting"
  | "sms";

export type InteractionOutcome =
  | "positive"
  | "neutral"
  | "negative"
  | "needs_follow_up"
  | "no_show";

export type SuggestionPriority = "HIGH" | "MEDIUM" | "LOW";
export type SuggestionStatus = "pending" | "used" | "ignored";
export type ModelType = "equity" | "debt" | "hybrid" | "structured" | "pms" | "aif";
export type MessageChannel = "call" | "email" | "whatsapp";

export type TaskType =
  | "call"
  | "meeting"
  | "email"
  | "portfolio_review"
  | "document_collection"
  | "compliance"
  | "other";

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled" | "overdue";

export type OpportunityCategory =
  | "client_asked"
  | "life_event"
  | "idle_cash"
  | "coverage_gap"
  | "rebalance"
  | "tax_saving"
  | "new_product"
  | "estate_planning";

export type OpportunityStatus = "open" | "actioned" | "dismissed" | "expired";
export type OrgRole = "super_admin" | "cio" | "rm";

// ─── Core Entities ─────────────────────────────────────────────────────────────

export interface WealthHoldingAlert {
  id: string;
  holding_id: string;
  alert_type: HoldingAlertType;
  severity: AlertSeverity;
  message?: string;
  threshold?: number;
  actual_value?: number;
  is_resolved: boolean;
  resolved_at?: string;
  created_at?: string;
}

export interface WealthHolding {
  id: string;
  portfolio_id?: string;
  ticker?: string;
  isin?: string;
  scheme_name?: string;
  amfi_code?: string;
  asset_class: AssetClass;
  quantity?: number;
  avg_price?: number;
  current_value_cr?: number;
  weight_pct?: number;
  as_of_date?: string;
  alerts?: WealthHoldingAlert[];

  // Backward compatibility aliases
  symbol?: string;
  weight?: number;
  qty?: number;
}

export type PortfolioHolding = WealthHolding;

export interface WealthPortfolio {
  id?: string;
  client_id: string;
  total_value_cr: number;
  total_value?: number; // fallback compatibility alias
  equity_value_cr?: number;
  debt_value_cr?: number;
  mf_value_cr?: number;
  reit_value_cr?: number;
  alt_value_cr?: number;
  cash_value_cr?: number;
  risk_score?: number;
  last_rebalance_date?: string;
  holdings: WealthHolding[];
}

export interface WealthRmProfile {
  id: string;
  org_id: string;
  member_id: string;
  display_name: string;
  name?: string; // backward compat alias
  email?: string;
  phone?: string;
  team?: string;
  performance_score?: number;
  target_aum_cr?: number;
  total_aum_cr?: number;
  notes?: string;
  _count?: {
    clients?: number;
    interactions?: number;
    tasks?: number;
    opportunities?: number;
  };
  clients?: WealthClient[];
}

export type WealthRM = WealthRmProfile;

export interface FamilyMember {
  name: string;
  relation: string;
  dob?: string;
  notes?: string;
}

export interface WealthClient {
  id: string;
  org_id?: string;
  rm_profile_id?: string;
  rm_id?: string; // backward compat alias
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  date_of_birth?: string;
  pan_number?: string;
  aum_cr: number;
  segment: Segment;
  risk_profile: RiskProfile;
  lifecycle_status: ClientStatus;
  kyc_status: KycStatus;
  source?: ClientSource;
  engagement_score: number;
  churn_probability: number;
  last_contact_at?: string;
  family_members?: FamilyMember[];
  tags?: string[];
  portfolio?: WealthPortfolio;
  rm?: WealthRmProfile;
  model_mappings?: Array<{ id: string; client_id?: string; model_id: string; model?: WealthModel }>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface WealthInteraction {
  id: string;
  org_id?: string;
  client_id: string;
  rm_profile_id?: string;
  type: InteractionType;
  summary?: string;
  sentiment?: string;
  outcome?: InteractionOutcome;
  duration_minutes?: number;
  is_pinned?: boolean;
  follow_up_date?: string;
  timestamp: string;
  rm?: { id: string; display_name: string };
  attachments?: Array<{ id: string; file_name: string; file_url: string; file_type: string }>;
  metadata?: Record<string, unknown>;
}

export interface WealthTask {
  id: string;
  org_id: string;
  client_id?: string;
  rm_profile_id?: string;
  created_by_member_id?: string;
  title: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  linked_interaction_id?: string;
  client?: {
    id: string;
    name: string;
    segment?: Segment;
    aum_cr?: number;
    phone?: string;
    email?: string;
  };
  rm?: {
    id: string;
    display_name: string;
    team?: string;
  };
  created_at: string;
}

export interface WealthOpportunity {
  id: string;
  org_id: string;
  client_id: string;
  rm_profile_id?: string;
  category: OpportunityCategory;
  sub_category?: string;
  headline: string;
  evidence?: string;
  source_type?: string;
  fit_score: number;
  indicative_value_cr?: number;
  status: OpportunityStatus;
  talking_points?: string[];
  client?: {
    id: string;
    name: string;
    segment?: Segment;
    aum_cr?: number;
    risk_profile?: RiskProfile;
  };
  rm?: {
    id: string;
    display_name: string;
  };
  created_at: string;
}

export interface WealthClientNote {
  id: string;
  org_id: string;
  client_id: string;
  author_member_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at?: string;
}

export type WealthNote = WealthClientNote;

export interface WealthSuggestion {
  id: string;
  priority: SuggestionPriority;
  reason: string;
  suggested_action: string;
  talking_points: string[];
  message?: string;
  status: SuggestionStatus;
  score: number;
  created_at: string;
}

export interface WealthAction {
  id: string;
  client_id: string;
  rm_id?: string;
  suggestion_id?: string;
  action_type: string;
  content?: string;
  outcome?: string;
  created_at: string;
}

export interface WealthModel {
  id: string;
  name: string;
  description?: string;
  model_type: ModelType;
  version?: string;
  min_investment_cr?: number;
  is_published?: boolean;
  data?: Record<string, unknown>;
  _count?: { client_mappings: number };
}

// ─── Dashboard & Analytics ────────────────────────────────────────────────────

export interface ScoreComponents {
  drawdown: number;
  daysSinceContact: number;
  churnProbability: number;
  riskMismatch: number;
}

export interface PriorityListItem {
  client: Pick<WealthClient, "id" | "name" | "segment" | "churn_probability" | "aum_cr"> & {
    rm?: { id: string; display_name: string };
  };
  score: number;
  priority: SuggestionPriority;
  score_components: ScoreComponents;
  suggested_action: WealthSuggestion | null;
}

export interface DashboardData {
  date: string;
  rm_profile_id?: string;
  priority_list: PriorityListItem[];
  tasks_today?: WealthTask[];
  opportunities_today?: WealthOpportunity[];
}

export interface DashboardSummary {
  total_clients: number;
  total_aum_cr: number;
  open_tasks: number;
  open_opportunities: number;
  opportunity_aum_cr: number;
}

export interface RMAnalytics {
  rm: {
    id: string;
    display_name: string;
    team?: string;
    performance_score?: number;
    target_aum_cr?: number;
    total_aum_cr: number;
  };
  clients: {
    total: number;
    avg_engagement_score: number;
    avg_churn_probability: number;
    total_aum_cr: number;
  };
  interactions_last_30d: number;
  suggestions_last_30d: {
    used: number;
    ignored: number;
    adoption_rate: number | null;
  };
  portfolio: {
    avg_risk_score: number | null;
    avg_total_value: number;
    sum_total_value: number;
  };
  workload?: {
    open_tasks: number;
    open_opportunities: number;
  };

  // Backward compatibility convenience fields
  total_clients?: number;
  avg_engagement_score?: number;
  avg_churn_probability?: number;
  suggestion_adoption_rate?: number;
  avg_portfolio_risk_score?: number;
}

export interface SegmentAnalytic {
  segment: Segment;
  client_count: number;
  total_aum_cr: number;
  avg_engagement_score: number;
  avg_churn_probability: number;
}

export interface InteractionTypeCount {
  type: InteractionType;
  count: number;
}

export interface ClientAnalytics {
  segments: SegmentAnalytic[];
  by_segment?: SegmentAnalytic[];
  interactions_last_30d: InteractionTypeCount[];
  risk_profiles?: Array<{ risk_profile: RiskProfile; client_count: number; total_aum_cr: number }>;
  lifecycle_stages?: Array<{ lifecycle_status: ClientStatus; client_count: number; total_aum_cr: number }>;
}

// ─── Network Graph Data Model ─────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: "cio" | "rm" | "client" | "holding";
  label: string;
  initials?: string;
  aum_cr?: number;
  current_value_cr?: number;
  weight_pct?: number;
  asset_class?: AssetClass;
  segment?: Segment;
  lifecycle_status?: ClientStatus;
  churn_probability?: number;
  team?: string;
  alert_count?: number;
  has_alert?: boolean;
  raw_id: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type?: string;
}

export interface GraphAlert {
  id: string;
  holding_id: string;
  client_id: string;
  rm_id?: string;
  raw_holding_id?: string;
  raw_client_id?: string;
  alert_type: HoldingAlertType;
  severity: AlertSeverity;
  message?: string;
  threshold?: number;
  actual_value?: number;
}

export interface HeartbeatGraphData {
  meta: {
    type: "rm_heartbeat" | "cio_heartbeat";
    rm_id?: string;
    rm_name?: string;
    org_id?: string;
    org_name?: string;
    total_aum_cr: number;
    total_rms?: number;
    total_clients: number;
    total_alerts: number;
    generated_at: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  alerts: GraphAlert[];
}

// ─── Auth & Organization ───────────────────────────────────────────────────────

export interface WealthOrgMembership {
  id: string;
  org_id: string;
  org_name: string;
  org_slug: string;
  role: OrgRole;
  joined_at: string;
  rm_profile?: {
    id: string;
    display_name: string;
    team?: string;
    target_aum_cr?: number;
    total_aum_cr?: number;
  } | null;
}

// ─── Generic Wrappers ──────────────────────────────────────────────────────────

export interface Paginated<T> {
  data?: T[];
  items?: T[];
  total?: number;
  page?: number;
  size?: number;
  pagination?: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface WealthJobsResponse {
  success: boolean;
  message: string;
  jobs: Array<{ id: string; status: string; clientCount?: number }>;
}
