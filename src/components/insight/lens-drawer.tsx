"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag } from "lucide-react";
import { TabToggle } from "@/components/molecules/tab-toggle";
import type { LensDetail } from "@/hooks/useLenses";
import { ReportErrorModal } from "@/components/molecules/report-error-modal";
import { LensHtmlPreview } from "@/components/insight/lens-html-preview";
import { StatusBadge, type StatusSentiment } from "@/components/ds";

interface LensDrawerProps {
  lens: LensDetail | null;
  onClose: () => void;
  ticker?: string;
  isBfsi?: boolean;
}

function statusSentiment(status: string | null | undefined): StatusSentiment {
  const s = (status ?? "").toUpperCase();
  if (s === "STRONG") return "positive";
  if (s === "WEAK") return "negative";
  return "caution";
}

export function LensDrawer({ lens, onClose, ticker }: LensDrawerProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [mode, setMode] = useState<"Compressed" | "Detailed">("Detailed");

  useEffect(() => {
    if (!lens) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lens, onClose]);

  const sentiment = lens ? statusSentiment(lens.status) : "positive";

  return (
    <AnimatePresence>
      {lens && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              // Standard app scrim: 40% dark, no blur (blur was a one-off here).
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.40)",
            }}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="w-full sm:w-[min(85vw,1100px)]"
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 70,
              background: "var(--qc-card)",
              borderLeft: "1px solid var(--qc-hair)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="px-4 sm:px-6" style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "var(--qc-section, #f5f5f5)",
              borderBottom: "1px solid var(--qc-hair)",
              paddingTop: "8px", paddingBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
                <TabToggle
                  variant="outline"
                  options={["Compressed", "Detailed"]}
                  value={mode}
                  onChange={(v) => setMode(v as "Compressed" | "Detailed")}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setReportOpen(true)}
                  aria-label="Flag Error"
                  style={{
                    flexShrink: 0, background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                    borderRadius: 8, height: 32, padding: "0 10px", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer",
                    color: "var(--qc-ink-3)", fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)",
                  }}
                >
                  <Flag size={14} strokeWidth={1.8} />
                  Flag Error
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    flexShrink: 0, background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
                    borderRadius: 8, width: 32, height: 32, display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                    color: "var(--qc-ink-3)", fontSize: 16, lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {reportOpen && lens && (
              <ReportErrorModal
                onClose={() => setReportOpen(false)}
                prefill={{ category: "data_issue", errorMessage: `Lens: ${lens.name}` }}
              />
            )}

            {/* Body — iframe-based HTML skill output */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
              {ticker ? (
                <LensHtmlPreview slug={lens.slug} ticker={ticker} mode={mode} />
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "var(--qc-ink-3)", fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)" }}>No ticker selected</span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
