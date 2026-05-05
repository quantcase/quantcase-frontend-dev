"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, ArrowLeft, AlertCircle, ChevronRight,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import type { DrhpApiResponse, DrhpRecord, DrhpListApiResponse } from "@/types/drhp";
import { VerdictBadge } from "@/components/drhp/verdict-badge";

// ─── Upload area ──────────────────────────────────────────────────────────────

function UploadArea({
  file, onFile, onAnalyse, status, error,
}: {
  file: File | null;
  onFile: (f: File) => void;
  onAnalyse: () => void;
  status: "idle" | "uploading" | "error";
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (f: File) => {
    if (f.size > 50 * 1024 * 1024) return;
    onFile(f);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className="rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center gap-3 px-8 py-14 cursor-pointer transition-all"
        style={{ borderColor: drag ? "var(--qc-ink)" : "var(--qc-hair)", background: drag ? "var(--qc-section)" : "var(--qc-bg)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <>
            <FileText className="size-8" style={{ color: "var(--qc-ink)" }} />
            <div className="text-center">
              <p className="text-[14px] font-medium" style={{ color: "var(--qc-ink)" }}>{file.name}</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--qc-ink-2)" }}>
                {(file.size / (1024 * 1024)).toFixed(1)} MB · Click to change
              </p>
            </div>
          </>
        ) : (
          <>
            <Upload className="size-8" style={{ color: "var(--qc-ink-2)" }} />
            <div className="text-center">
              <p className="text-[14px] font-medium" style={{ color: "var(--qc-ink)" }}>Drop your DRHP here</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--qc-ink-2)" }}>PDF or .txt · max 50 MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="size-4 text-red-600 flex-shrink-0" />
          <p className="text-[13px] text-red-600">{error}</p>
        </div>
      )}

      <button
        disabled={!file || status === "uploading"}
        onClick={onAnalyse}
        className="w-full rounded-md py-3 text-[13px] font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "var(--qc-ink)", color: "var(--qc-card)" }}
      >
        {status === "uploading" ? "Analysing… this may take a minute" : "Analyse Document"}
      </button>
    </div>
  );
}

// ─── Past analyses list ───────────────────────────────────────────────────────

function PastAnalysesList({ items, onSelect }: { items: DrhpRecord[]; onSelect: (id: string) => void }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: "var(--qc-ink-2)" }}>
        Past Analyses
      </p>
      <div className="flex flex-col gap-2">
        {items.map((record) => {
          const { heroHeader, quickVerdict } = record.insight.core;
          const totalIssue = heroHeader.totalIssueSizeCr;
          return (
            <button
              key={record.id}
              onClick={() => onSelect(record.id)}
              className="flex items-center gap-4 rounded-[10px] border border-[var(--qc-hair)] bg-white px-4 py-3.5 text-left hover:border-[var(--qc-ink)] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate" style={{ color: "var(--qc-ink)" }}>
                  {heroHeader.companyName || "Untitled Analysis"}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                    {new Date(record.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {totalIssue > 0 && (
                    <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                      ₹{totalIssue.toLocaleString("en-IN")} Cr
                    </span>
                  )}
                </div>
              </div>
              <VerdictBadge verdict={quickVerdict.verdict} size="sm" />
              <ChevronRight className="size-4 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--qc-ink-2)" }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function PreIpoPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<DrhpRecord[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/private-equity/drhp-analyses`)
      .then((r) => r.json())
      .then((json: DrhpListApiResponse) => {
        if (json.success) setPastAnalyses(json.data);
      })
      .catch(() => {});
  }, []);

  const handleAnalyse = async () => {
    if (!file) return;
    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/private-equity/drhp-analyser`, {
        method: "POST",
        body: formData,
      });
      const json: DrhpApiResponse = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message ?? "Analysis failed");

      router.push(`/private-equity/pre-ipo/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="text-white text-xs font-semibold text-center py-2 px-4 sticky top-0 z-10" style={{ background: "var(--qc-ink)" }}>
        CONFIDENTIAL — For authorised use only
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <button
          onClick={() => router.push("/screener/home")}
          className="flex items-center gap-1.5 text-[12px] mb-6 transition-opacity hover:opacity-60"
          style={{ color: "var(--qc-ink-2)" }}
        >
          <ArrowLeft className="size-3.5" />
          Back to screener
        </button>

        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--qc-ink-2)" }}>
            Private Equity · Pre-IPO
          </p>
          <h1 className="text-[28px] font-medium leading-tight" style={{ color: "var(--qc-ink)" }}>DRHP Analyser</h1>
          <p className="text-[14px] mt-2" style={{ color: "var(--qc-ink-2)" }}>
            Upload a Draft Red Herring Prospectus to get an AI-powered analysis of business quality, promoter integrity, and red flags.
          </p>
        </div>

        <UploadArea
          file={file}
          onFile={setFile}
          onAnalyse={handleAnalyse}
          status={status}
          error={error}
        />

        <PastAnalysesList
          items={pastAnalyses}
          onSelect={(id) => router.push(`/private-equity/pre-ipo/${id}`)}
        />
      </div>
    </div>
  );
}
