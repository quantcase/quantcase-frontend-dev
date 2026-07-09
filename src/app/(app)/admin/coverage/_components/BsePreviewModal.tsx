"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, ExternalLink, Loader2, X } from "lucide-react";
import { rawFetch } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { BsePreviewResponse } from "./types";

const BASE = `${BACKEND_URL}/admin/bse-discovery`;

interface Props {
  url: string;
  title?: string;
  onClose: () => void;
}

export function BsePreviewModal({ url, title, onClose }: Props) {
  const [data, setData] = useState<BsePreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchPage(page: number) {
    rawFetch<BsePreviewResponse>(`${BASE}/preview?url=${encodeURIComponent(url)}&page=${page}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: setData,
      onError: () => setError("Preview unavailable."),
      onComplete: () => setLoading(false),
    });
  }

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[820px] max-h-[85vh] rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#E2E2E2] px-5 py-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-[#0F172B] truncate">{title ?? "PDF Preview"}</h3>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-[#888888] hover:text-[#0F172B] transition-colors truncate"
            >
              View PDF <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-[#888888] hover:text-[#0F172B] hover:border-[#E2E2E2] transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Text */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <Loader2 className="size-4 animate-spin" /> Loading preview…
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}
          {data && !loading && !error && (
            <p className="text-[13px] text-[#0F172B] leading-relaxed whitespace-pre-wrap">{data.text}</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E2E2E2] px-5 py-3 shrink-0">
          <button
            onClick={() => data && fetchPage(data.page - 1)}
            disabled={!data || data.page <= 1 || loading}
            className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-3 py-1.5 text-[12px] font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-3.5" /> Prev
          </button>
          <span className="text-[12px] text-[#888888]">
            {data ? `Page ${data.page} of ${data.totalPages}` : "—"}
          </span>
          <button
            onClick={() => data && fetchPage(data.page + 1)}
            disabled={!data || data.page >= data.totalPages || loading}
            className="flex items-center gap-1.5 rounded-md border border-[#E2E2E2] px-3 py-1.5 text-[12px] font-medium text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
