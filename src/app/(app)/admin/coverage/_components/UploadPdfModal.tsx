"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { apiAuthUpload } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { BseDocType, DocumentUploadResponse } from "./types";

const INPUT_CLS =
  "rounded-md border border-hair px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

const MAX_FILE_BYTES = 75 * 1024 * 1024;

const DOC_TYPE_OPTIONS: { value: BseDocType; label: string }[] = [
  { value: "transcript", label: "Transcript" },
  { value: "ppt", label: "PPT" },
  { value: "annual_report", label: "Annual Report" },
];

export interface UploadPrefill {
  docType?: BseDocType;
  company?: string;
  fiscalYear?: string;
  quarter?: string;
}

interface Props {
  prefill?: UploadPrefill;
  onClose: () => void;
}

export function UploadPdfModal({ prefill, onClose }: Props) {
  const [docType, setDocType] = useState<BseDocType>(prefill?.docType ?? "transcript");
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState(prefill?.company ?? "");
  const [fiscalYear, setFiscalYear] = useState(prefill?.fiscalYear ?? "");
  const [quarter, setQuarter] = useState(prefill?.quarter ?? "");
  const [callDate, setCallDate] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentUploadResponse | null>(null);

  const isAnnual = docType === "annual_report";
  const canSubmit =
    !!file && company.trim() !== "" && fiscalYear.trim() !== "" && (isAnnual || quarter.trim() !== "") && !uploading;

  function handleFileChange(f: File | null) {
    if (!f) { setFile(null); setFileError(null); return; }
    // Some browsers/OSes report an empty or generic MIME type for local files (e.g. cloud-synced
    // drives), so fall back to the extension rather than rejecting a valid PDF outright.
    const looksLikePdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!looksLikePdf) { setFile(null); setFileError("File must be a PDF."); return; }
    if (f.size > MAX_FILE_BYTES) { setFile(null); setFileError("File exceeds the 75MB limit."); return; }
    setFile(f);
    setFileError(null);
  }

  function submit() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("company", company.trim().toUpperCase());
    formData.append("fiscal_year", fiscalYear.trim().toUpperCase());
    if (!isAnnual) formData.append("quarter", quarter.trim().toUpperCase());
    if (callDate.trim()) formData.append("call_date", callDate.trim());

    apiAuthUpload<DocumentUploadResponse>(
      `${BACKEND_URL}/admin/documents/upload/${docType}`,
      {
        onStart: () => { setUploading(true); setUploadError(null); },
        onSuccess: (res) => setResult(res),
        onError: setUploadError,
        onComplete: () => setUploading(false),
      },
      formData
    );
  }

  function uploadAnother() {
    setResult(null);
    setFile(null);
    setUploadError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[520px] max-h-[85vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-ink">Upload PDF instead</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[12px] text-ink-3">
            For a candidate BSE couldn&apos;t resolve, or a company that never showed up in the scrape at
            all. Uploading again for the same company / fiscal year / quarter overwrites the existing URL
            — there&apos;s no separate confirm step on this endpoint.
          </p>

          {uploadError && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
              <AlertCircle className="size-4 shrink-0" /> {uploadError}
            </div>
          )}

          {result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-md border border-up bg-up-soft px-4 py-3 text-sm text-up">
                <CheckCircle2 className="size-4 shrink-0" /> Uploaded and saved.
              </div>
              <div>
                <label className={LABEL_CLS}>Stored URL</label>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[12px] font-mono text-ink underline break-all"
                >
                  {result.url}
                </a>
              </div>
              <button onClick={uploadAnother} className="text-sm text-ink-3 hover:text-ink">
                Upload another
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Document Type</label>
                <div className="flex gap-2">
                  {DOC_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setDocType(opt.value); if (opt.value === "annual_report") setQuarter(""); }}
                      className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                        docType === opt.value
                          ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]"
                          : "border-hair text-ink hover:border-[var(--qc-ink)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>PDF File (max 75MB)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="block w-full text-[12px] text-ink-3 cursor-pointer file:cursor-pointer file:mr-3 file:rounded-md file:border file:border-hair file:bg-card file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-ink hover:file:border-[var(--qc-ink)] file:transition-colors"
                />
                {fileError && <p className="text-[11px] text-down mt-1">{fileError}</p>}
                {file && !fileError && (
                  <p className="text-[11px] text-ink-3 mt-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>

              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className={LABEL_CLS}>Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value.toUpperCase())}
                    placeholder="Ticker"
                    className={`${INPUT_CLS} w-32 uppercase`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Fiscal Year</label>
                  <input
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value.toUpperCase())}
                    placeholder="FY2027"
                    className={`${INPUT_CLS} w-28 uppercase`}
                  />
                </div>
                {!isAnnual && (
                  <div>
                    <label className={LABEL_CLS}>Quarter</label>
                    <input
                      value={quarter}
                      onChange={(e) => setQuarter(e.target.value.toUpperCase())}
                      placeholder="Q1"
                      className={`${INPUT_CLS} w-20 uppercase`}
                    />
                  </div>
                )}
                <div>
                  <label className={LABEL_CLS}>Call Date (optional)</label>
                  <input
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                    placeholder="e.g. 12 Jul 2026"
                    className={`${INPUT_CLS} w-40`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {!result && (
          <div className="flex items-center gap-3 border-t border-hair px-5 py-3 shrink-0">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
