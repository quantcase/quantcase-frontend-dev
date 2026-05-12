// Enums
export type Segment = "HNI" | "UHNI" | "Retail" | "Institutional" | "Private";
export type RiskProfile = "conservative" | "moderate" | "aggressive";
export type InteractionType = "call" | "email" | "whatsapp" | "meeting" | "sms";
export type SuggestionPriority = "HIGH" | "MEDIUM" | "LOW";
export type SuggestionStatus = "pending" | "used" | "ignored";
type ModelType = "equity" | "debt" | "hybrid" | "structured" | "pms" | "aif";
export type MessageChannel = "call" | "email" | "whatsapp";

// Core entities
export interface WealthClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rm_id?: string;
  segment: Segment;
  risk_profile: RiskProfile;
  engagement_score: number;
  churn_probability: number;
  last_contact_at?: string;
  portfolio?: WealthPortfolio;
  rm?: WealthRM;
  metadata?: Record<string, unknown>;
}

export interface WealthPortfolio {
  client_id: string;
  total_value: number;
  risk_score: number;
  last_rebalance_date?: string;
  holdings: PortfolioHolding[];
}

interface PortfolioHolding {
  symbol: string;
  weight: number;
  qty: number;
}

export interface WealthInteraction {
  id: string;
  type: InteractionType;
  summary?: string;
  sentiment?: string;
  timestamp: string;
  rm_id?: string;
  metadata?: Record<string, unknown>;
}

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

export interface WealthRM {
  id: string;
  name: string;
  email?: string;
  team?: string;
  performance_score?: number;
  _count?: { clients: number };
  clients?: WealthClient[];
}

export interface WealthModel {
  id: string;
  name: string;
  description?: string;
  model_type: ModelType;
  data?: Record<string, unknown>;
}

// Dashboard types
export interface ScoreComponents {
  drawdown: number;
  daysSinceContact: number;
  churnProbability: number;
  riskMismatch: number;
}

export interface PriorityListItem {
  client: Pick<WealthClient, "id" | "name" | "segment" | "churn_probability">;
  score: number;
  priority: SuggestionPriority;
  score_components: ScoreComponents;
  suggested_action: string;
}

export interface DashboardData {
  date: string;
  rm_id: string;
  priority_list: PriorityListItem[];
}

// Analytics types
export interface RMAnalytics {
  rm_id: string;
  total_clients: number;
  avg_engagement_score: number;
  avg_churn_probability: number;
  interactions_last_30d: number;
  suggestion_adoption_rate: number;
  avg_portfolio_risk_score: number;
}

export interface SegmentAnalytic {
  segment: Segment;
  count: number;
  avg_engagement: number;
  avg_churn: number;
}

interface InteractionTypeCount {
  type: InteractionType;
  count: number;
}

export interface ClientAnalytics {
  by_segment: SegmentAnalytic[];
  by_interaction_type: InteractionTypeCount[];
}

// Generic paginated wrapper
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Job response types (async AI endpoints)
interface WealthJobResponse {
  success: boolean;
  message: string;
  job: { id: string; status: string };
}

export interface WealthJobsResponse {
  success: boolean;
  message: string;
  jobs: Array<{ id: string; status: string; client_count: number }>;
}
