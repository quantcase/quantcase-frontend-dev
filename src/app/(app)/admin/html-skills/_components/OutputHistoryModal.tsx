"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, ChevronLeft, ChevronRight, Pin, PinOff } from "lucide-react";
import { OutputHistoryResponse, OutputHistoryRow, API_BASE } from "./types";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Props {
  slug: string;
  ticker: string;
  pinnedFiscalYear: string | null;
  pinnedQuarter: string | null;
  pinnedHistoric: boolean | null;
  pinning: boolean;
  onPin: (fiscalYear: string | null, quarter: string | null, historic: boolean | null) => void;
  onClose: () => void;
}

const PAGE_SIZE = 20;

export function OutputHistoryModal({ slug, ticker, pinnedFiscalYear, pinnedQuarter, pinnedHistoric, pinning, onPin, onClose }: Props) {
  const [data, setData] = useState<OutputHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    authFetch(`${BACKEND_URL}${API_BASE}/${slug}/outputs/${ticker}/history?page=${page}&size=${PAGE_SIZE}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        setData(json as OutputHistoryResponse);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, ticker, page]);

  const rows: OutputHistoryRow[] = data?.rows ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const hasGlobalPin = pinnedFiscalYear != null || pinnedQuarter != null;

  function isRowPinned(row: OutputHistoryRow): boolean {
    if (!hasGlobalPin) return false;
    return row.fiscal_year === pinnedFiscalYear && row.quarter === pinnedQuarter && row.is_historic === pinnedHistoric;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[680px] max-h-[80vh] rounded-[10px] border border-[var(--qc-border-default)] bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-[14px] font-medium text-[var(--qc-ink)]">Output History</h3>
            <span className="text-[11px] text-ink-3 font-mono">{slug} · {ticker}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-border-default)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {hasGlobalPin ? (
          <div className="flex items-center justify-between px-5 py-2 border-b border-[var(--qc-border-default)] bg-secondary shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <Pin className="size-3" />
              Global base pin: <span className="font-mono text-[var(--qc-ink)]">{pinnedFiscalYear} {pinnedQuarter}</span> ({pinnedHistoric ? "Historic" : "Incremental"}) — applies to every ticker using this skill
            </span>
            <button
              onClick={() => onPin(null, null, null)}
              disabled={pinning}
              className="flex items-center gap-1 text-[11px] font-medium text-ink-3 hover:text-down transition-colors disabled:opacity-40 shrink-0"
            >
              <PinOff className="size-3" /> Clear pin
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-5 py-2 border-b border-[var(--qc-border-default)] bg-secondary shrink-0">
            <span className="text-[11px] text-ink-3">No global base pin set — incremental runs use the most recent N outputs. Pin a row below to set it.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mx-5 mt-3 rounded-md border border-down bg-down-soft px-4 py-2.5 text-[12px] text-down shrink-0">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-40 gap-3 text-ink-3">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-[13px]">Loading outputs…</span>
            </div>
          )}

          {!loading && rows.length === 0 && (
            <p className="text-center py-10 text-[13px] text-ink-3">No outputs yet for this ticker.</p>
          )}

          {!loading && rows.length > 0 && (
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_var(--qc-hair)]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Period</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Mode</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-ink-3">Created</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-ink-3">Cost</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {rows.map((row) => {
                  const pinned = isRowPinned(row);
                  return (
                    <tr key={row.id} className="hover:bg-secondary transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--qc-ink)] whitespace-nowrap">
                        {row.fiscal_year ?? "—"} {row.quarter ?? ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-sm px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${row.is_historic ? "bg-warn-soft text-warn" : "bg-secondary text-ink-2"}`}>
                            {row.is_historic ? "Historic" : "Incremental"}
                          </span>
                          {pinned && (
                            <span className="flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-medium whitespace-nowrap bg-ink text-[var(--qc-on-dark)]">
                              <Pin className="size-2.5" /> PINNED
                            </span>
                          )}
                          {row.config_key && (
                            <span className="rounded-sm px-2 py-0.5 text-[10px] font-medium whitespace-nowrap bg-blue-soft text-blue">
                              {row.config_key}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-ink-3">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap text-ink-3">${row.cost_usd?.toFixed(5) ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => onPin(pinned ? null : row.fiscal_year, pinned ? null : row.quarter, pinned ? null : row.is_historic)}
                          disabled={pinning}
                          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ml-auto disabled:opacity-40 ${
                            pinned
                              ? "border border-[var(--qc-border-default)] text-ink-3 hover:border-down hover:text-down"
                              : "border border-[var(--qc-border-default)] text-ink-3 hover:border-ink hover:text-ink"
                          }`}
                        >
                          {pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                          {pinned ? "Unpin" : "Pin"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        {!loading && data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-[var(--qc-border-default)] px-5 py-2.5 shrink-0 bg-secondary">
            <span className="text-[11px] text-ink-3">Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center justify-center size-7 rounded border border-[var(--qc-border-default)] text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
