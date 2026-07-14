export type ErrorReportCategory =
  | "bug"
  | "data_issue"
  | "performance"
  | "ui_ux"
  | "login_auth"
  | "payment_billing"
  | "other";

export type ErrorReportStatus = "open" | "in_progress" | "resolved" | "wont_fix";

export const ERROR_REPORT_CATEGORIES: { value: ErrorReportCategory; label: string }[] = [
  { value: "bug", label: "Something's broken" },
  { value: "data_issue", label: "Data looks wrong" },
  { value: "performance", label: "Slow / unresponsive" },
  { value: "ui_ux", label: "Confusing / hard to use" },
  { value: "login_auth", label: "Login / account issue" },
  { value: "payment_billing", label: "Billing / payment issue" },
  { value: "other", label: "Something else" },
];

/** POST /api/error-reports body */
export interface CreateErrorReportRequest {
  message: string;
  category?: ErrorReportCategory;
  pageUrl?: string;
  errorMessage?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  id: string;
  category: ErrorReportCategory;
  message: string;
  page_url: string | null;
  error_message: string | null;
  user_id: string;
  user_email: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  status: ErrorReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErrorReportWithUser extends ErrorReport {
  user: { id: string; email: string | null; display_name: string | null } | null;
}

/** POST /api/error-reports response */
export interface ErrorReportResponse {
  success: true;
  data: ErrorReport;
}

/** GET /admin/error-reports response */
export interface ListErrorReportsResponse {
  success: true;
  data: ErrorReportWithUser[];
  pagination: { page: number; size: number; total: number; totalPages: number };
}

/** PATCH /admin/error-reports/:id body */
export interface UpdateErrorReportRequest {
  status?: ErrorReportStatus;
  adminNotes?: string;
}
