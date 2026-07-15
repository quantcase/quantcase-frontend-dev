"use client";

import { useRef, useState } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthUpload } from "@/lib/api";

interface UploadPortfolioModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadPortfolioModal({ open, onClose, onSuccess }: UploadPortfolioModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) return null;

  function handleFile(file: File) {
    const accepted = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!accepted.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      setErrorMessage("Please upload a CSV, XLS, or XLSX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File must be under 10 MB.");
      return;
    }
    setErrorMessage("");
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleUpload() {
    if (!selectedFile) return;
    const fd = new FormData();
    fd.append("file", selectedFile);
    setUploadState("uploading");
    setErrorMessage("");
    apiAuthUpload<{ success: boolean }>(
      `${BACKEND_URL}/api/portfolio/user/upload`,
      {
        onSuccess: () => {
          setUploadState("success");
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 1200);
        },
        onError: (err) => {
          setUploadState("error");
          setErrorMessage(err);
        },
      },
      fd
    );
  }

  function handleClose() {
    setSelectedFile(null);
    setUploadState("idle");
    setErrorMessage("");
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(15,23,43,0.45)",
          zIndex: 1000, backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "var(--qc-card)", borderRadius: 16,
          padding: "32px 32px 28px",
          width: 480, maxWidth: "calc(100vw - 32px)",
          zIndex: 1001,
          boxShadow: "0 20px 60px rgba(15,23,43,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <h2 style={{ fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-serif)", color: "var(--qc-ink)", margin: 0 }}>
              Upload your portfolio
            </h2>
            <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", margin: "4px 0 0" }}>
              Upload a CSV or Excel file with your holdings.
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "2px 6px", fontSize: "var(--qc-fz-18)", color: "var(--qc-ink-3)", lineHeight: 1,
              borderRadius: 6,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Download sample */}
        <a
          href="/sample_portfolio.xlsx"
          download
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", fontWeight: "var(--qc-w-medium)",
            fontFamily: "var(--qc-font-sans)",
            background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
            borderRadius: 6, padding: "5px 12px",
            textDecoration: "none", marginBottom: 20,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download sample file
        </a>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragOver ? "var(--qc-ink)" : selectedFile ? "var(--qc-up)" : "var(--qc-hair)"}`,
            borderRadius: 10,
            padding: "28px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "var(--qc-section)" : selectedFile ? "rgba(34,197,94,0.04)" : "var(--qc-section)",
            transition: "all 0.15s",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            style={{ display: "none" }}
            onChange={handleInputChange}
          />
          {selectedFile ? (
            <>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
              <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>{selectedFile.name}</div>
              <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: 2 }}>
                {(selectedFile.size / 1024).toFixed(0)} KB · click to replace
              </div>
            </>
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--qc-ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)" }}>
                Drop your file here, or <span style={{ textDecoration: "underline" }}>browse</span>
              </div>
              <div style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginTop: 4 }}>
                CSV, XLS, or XLSX · max 10 MB
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {errorMessage && (
          <div style={{ marginTop: 10, fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down)" }}>
            {errorMessage}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={handleClose}
            style={{
              fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", padding: "8px 18px",
              background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
              borderRadius: 8, cursor: "pointer", color: "var(--qc-ink)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadState === "uploading" || uploadState === "success"}
            style={{
              fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", padding: "8px 20px",
              background: uploadState === "success" ? "var(--qc-up)" : "var(--qc-ink)",
              color: "#fff", border: "none", borderRadius: 8,
              cursor: selectedFile && uploadState === "idle" ? "pointer" : "not-allowed",
              opacity: !selectedFile || uploadState === "uploading" ? 0.6 : 1,
              transition: "background 0.2s",
              minWidth: 100,
            }}
          >
            {uploadState === "uploading" ? "Uploading…" : uploadState === "success" ? "Uploaded ✓" : "Upload"}
          </button>
        </div>
      </div>
    </>
  );
}
