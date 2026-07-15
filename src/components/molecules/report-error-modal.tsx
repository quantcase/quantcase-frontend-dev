"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { apiAuthPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ERROR_REPORT_CATEGORIES,
  type CreateErrorReportRequest,
  type ErrorReportCategory,
  type ErrorReportResponse,
} from "@/types/error-reports";

const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

interface Props {
  onClose: () => void;
  /** Pre-fill when launched from a caught exception / error boundary. */
  prefill?: { category?: ErrorReportCategory; errorMessage?: string; stack?: string };
}

export function ReportErrorModal({ onClose, prefill }: Props) {
  const pathname = usePathname();
  const [category, setCategory] = useState<ErrorReportCategory>(prefill?.category ?? "bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please describe the issue before submitting.");
      return;
    }

    const body: CreateErrorReportRequest = {
      message: trimmed,
      category,
      pageUrl: typeof window !== "undefined" ? window.location.href : pathname,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      errorMessage: prefill?.errorMessage,
      metadata: {
        viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : undefined,
        route: pathname,
        ...(prefill?.stack ? { stack: prefill.stack } : {}),
      },
    };

    setSubmitting(true);
    setError(null);

    apiAuthPost<ErrorReportResponse>(
      `${BACKEND_URL}/api/error-reports`,
      {
        onSuccess: () => setSubmitted(true),
        onError: (err) => setError(err),
        onComplete: () => setSubmitting(false),
      },
      body
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-[480px] max-h-[85vh] bg-card rounded-[10px] border border-hair shadow-2xl overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-hair">
          <h3 className="text-[16px] font-medium text-ink">Report an issue</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <div className="flex items-center justify-center size-10 rounded-full bg-up-soft text-up">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="text-sm font-medium text-ink">Thanks — we&apos;ve logged this.</p>
            <p className="text-[13px] text-ink-3 max-w-[320px]">
              Our team will take a look. You don&apos;t need to do anything else.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className={LABEL_CLS} htmlFor="report-error-category">
                  Category
                </label>
                <select
                  id="report-error-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ErrorReportCategory)}
                  className={cn(INPUT_CLS, "bg-white")}
                >
                  {ERROR_REPORT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS} htmlFor="report-error-message">
                  What happened?
                </label>
                <textarea
                  id="report-error-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="Describe what you were doing and what went wrong…"
                  className={cn(INPUT_CLS, "resize-none")}
                />
                <p className="mt-1 text-[11px] text-ink-3 text-right">{message.length}/5000</p>
              </div>

              {prefill?.errorMessage && (
                <div className="rounded-md border border-hair bg-secondary px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1">
                    Captured error
                  </p>
                  <p className="text-[12px] font-mono text-ink break-words">{prefill.errorMessage}</p>
                </div>
              )}

              <p className="text-[11px] text-ink-3">
                We&apos;ll automatically include the current page URL and browser info to help us investigate.
              </p>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
              {error ? (
                <p className="flex items-center gap-1.5 text-xs text-down max-w-[260px]">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {error}
                </p>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink-3 hover:text-ink hover:border-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !message.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="size-3.5 animate-spin" />}
                  Submit report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
