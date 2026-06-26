"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LensDetail } from "@/hooks/useLenses";
import { LensHtmlPreview } from "@/components/insight/lens-html-preview";
import { LensDetailGuidance } from "@/components/insight/lens-detail-guidance";
import { LensDetailPromoter } from "@/components/insight/lens-detail-promoter";
import { LensDetailDisclosure } from "@/components/insight/lens-detail-disclosure";
import { LensDetailCapital } from "@/components/insight/lens-detail-capital";
import { LensDetailIndustry } from "@/components/insight/lens-detail-industry";
import { LensDetailCompetition } from "@/components/insight/lens-detail-competition";
import { LensDetailFinancial } from "@/components/insight/lens-detail-financial";
import { LensDetailCustomer } from "@/components/insight/lens-detail-customer";
import { LensDetailEps } from "@/components/insight/lens-detail-eps";
import { LensDetailPeRerating } from "@/components/insight/lens-detail-pe-rerating";
import { LensDetailEarningQuality } from "@/components/insight/lens-detail-earning-quality";
import { LensDetailTargetPriceMatrix } from "@/components/insight/lens-detail-target-price-matrix";
import { LensDetailEarningsForecast } from "@/components/insight/lens-detail-earnings-forecast";

interface LensDrawerProps {
  lens: LensDetail | null;
  onClose: () => void;
  ticker?: string;
  isBfsi?: boolean;
}

function statusColor(status: string | null | undefined) {
  if (!status) return "var(--qc-warn)";
  const s = status.toUpperCase();
  if (s === "STRONG") return "var(--qc-up)";
  if (s === "WEAK") return "var(--qc-down)";
  return "var(--qc-warn)";
}

function statusBg(status: string | null | undefined) {
  if (!status) return "rgba(180,115,26,0.12)";
  const s = status.toUpperCase();
  if (s === "STRONG") return "rgba(31,122,74,0.12)";
  if (s === "WEAK") return "rgba(220,38,38,0.12)";
  return "rgba(180,115,26,0.12)";
}


function LensDetailView({ lens, ticker, isBfsi }: { lens: LensDetail; ticker?: string; isBfsi?: boolean }) {
  switch (lens.slug) {
    case "guidance-credibility":
      return <LensDetailGuidance lens={lens} />;
    case "promoter-activity":
      return <LensDetailPromoter lens={lens} />;
    case "disclosure-honesty":
      return <LensDetailDisclosure lens={lens} />;
    case "capital-allocation":
      return <LensDetailCapital lens={lens} />;
    case "industry-analysis":
      return <LensDetailIndustry lens={lens} isBfsi={isBfsi} />;
    case "competition":
      return <LensDetailCompetition lens={lens} ticker={ticker} />;
    case "financial-strength":
      return <LensDetailFinancial lens={lens} ticker={ticker} isBfsi={isBfsi} />;
    case "customer-distribution":
      return <LensDetailCustomer lens={lens} />;
    case "earnings-forecast":
      return <LensDetailEarningsForecast lens={lens} ticker={ticker} />;
    case "pe-rerating-potential":
      return <LensDetailPeRerating lens={lens} ticker={ticker} />;
    case "earning-quality":
      return <LensDetailEarningQuality lens={lens} ticker={ticker} />;
    case "target-price-matrix":
      return <LensDetailTargetPriceMatrix lens={lens} />;
    default:
      return null;
  }
}

export function LensDrawer({ lens, onClose, ticker, isBfsi }: LensDrawerProps) {
  useEffect(() => {
    if (!lens) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lens, onClose]);

  const color = lens ? statusColor(lens.status) : "var(--qc-up)";
  const bg = lens ? statusBg(lens.status) : "rgba(31,122,74,0.12)";

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
              position: "fixed", inset: 0, zIndex: 60,
              background: "rgba(0,0,0,0.30)", backdropFilter: "blur(2px)",
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
              background: "var(--qc-card)",
              borderBottom: "1px solid var(--qc-hair)",
              paddingTop: "18px", paddingBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow-l)",
                    textTransform: "uppercase", color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)",
                  }}>
                    {lens.category} lens
                  </span>
                  <span style={{
                    fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", letterSpacing: "var(--qc-track-eyebrow)",
                    color, background: bg, border: `1px solid ${color}`,
                    borderRadius: 4, padding: "2px 8px", textTransform: "uppercase",
                    fontFamily: "var(--qc-font-sans)",
                  }}>
                    {lens.status}
                  </span>
                </div>
                <h2 style={{
                  fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-regular)", margin: 0, lineHeight: 1.3,
                  color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif)",
                }}>
                  {lens.name}
                </h2>
              </div>
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

            {/* Body — iframe-based HTML skill output */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
              {ticker ? (
                <LensHtmlPreview slug={lens.slug} ticker={ticker} />
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "var(--qc-ink-3)", fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)" }}>No ticker selected</span>
                </div>
              )}
            </div>

            {/* --- Legacy lens detail components (kept for future reuse) ---
            <div className="px-4 sm:px-6 overflow-x-hidden" style={{ flex: 1, paddingTop: 20, paddingBottom: 32, display: "flex", flexDirection: "column", gap: 20 }}>
              <LensDetailView lens={lens} ticker={ticker} isBfsi={isBfsi} />
              {!["guidance-credibility", "promoter-activity", "disclosure-honesty", "capital-allocation", "industry-analysis", "competition", "financial-strength", "customer-distribution", "eps-engine", "earnings-forecast", "pe-rerating-potential", "earning-quality", "target-price-matrix"].includes(lens.slug) && (
                <>
                  {Object.keys(lens.key_metrics).length > 0 && (
                    <div style={{ padding: "14px 16px", background: "var(--qc-section)", borderRadius: 10, border: "1px solid var(--qc-hair)" }}>
                      <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)", margin: "0 0 12px", fontFamily: "var(--qc-font-sans)" }}>
                        Key Metrics
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                        {Object.entries(lens.key_metrics).map(([k, v]) => (
                          <div key={k}>
                            <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-ink-3)", margin: "0 0 2px", fontFamily: "var(--qc-font-sans)" }}>{k}</p>
                            <p style={{ fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", margin: 0, lineHeight: 1.3, fontFamily: "var(--qc-font-sans)" }}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {lens.highlights.length > 0 && (
                    <div style={{ padding: "14px 16px", background: "var(--qc-section)", borderRadius: 10, border: "1px solid var(--qc-hair)" }}>
                      <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-up)", margin: "0 0 10px", fontFamily: "var(--qc-font-sans)" }}>
                        Highlights
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {lens.highlights.map((h, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)" }} />
                            <span style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink)", lineHeight: 1.6, fontFamily: "var(--qc-font-sans)" }}>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lens.risks.length > 0 && (
                    <div style={{ padding: "14px 16px", background: "var(--qc-section)", borderRadius: 10, border: "1px solid var(--qc-hair)" }}>
                      <p style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-semi)", textTransform: "uppercase", letterSpacing: "var(--qc-track-eyebrow)", color: "var(--qc-down)", margin: "0 0 10px", fontFamily: "var(--qc-font-sans)" }}>
                        Risks
                      </p>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {lens.risks.map((r, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: "50%", background: "var(--qc-down)" }} />
                            <span style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink)", lineHeight: 1.6, fontFamily: "var(--qc-font-sans)" }}>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              <p style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-3)", margin: 0, textAlign: "right", fontFamily: "var(--qc-font-sans)" }}>
                {lens.computed_at && <>Computed {new Date(lens.computed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}
              </p>
            </div>
            --- End legacy --- */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
