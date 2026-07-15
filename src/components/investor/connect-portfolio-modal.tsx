"use client";

import { useEffect } from "react";
import { useSmallcaseConnect, type ConnectStep } from "@/hooks/useSmallcaseConnect";

interface ConnectPortfolioModalProps {
  open: boolean;
  onClose: () => void;
  onOpenCsvUpload: () => void;
  onConnected?: () => void;
}

type Step = "intro" | "connecting" | "syncing" | "done" | "error";

// Map the connect hook's fine-grained step to the modal's visual step.
function toModalStep(step: ConnectStep): Step {
  switch (step) {
    case "idle":         return "intro";
    case "creating":     return "connecting";
    case "awaiting_sdk": return "connecting";
    case "confirming":   return "syncing";
    case "done":         return "done";
    case "error":        return "error";
  }
}

// Broker brand colors — intentional, not part of the --qc-* semantic system.
const BROKERS = [
  { name: "Zerodha",    logo: "Z",  bg: "#387ED1", color: "#fff" },
  { name: "Groww",      logo: "G",  bg: "#00D09C", color: "#fff" },
  { name: "Angel One",  logo: "A",  bg: "#E53935", color: "#fff" },
  { name: "HDFC Sec",   logo: "H",  bg: "#003087", color: "#fff" },
  { name: "Upstox",     logo: "U",  bg: "#6B3FA0", color: "#fff" },
  { name: "Kotak Sec",  logo: "K",  bg: "#ED1C24", color: "#fff" },
  { name: "5paisa",     logo: "5",  bg: "#1A5276", color: "#fff" },
  { name: "AxisDirect", logo: "Ax", bg: "#800000", color: "#fff" },
  { name: "+ 5 more",   logo: "",   bg: "var(--qc-section)", color: "var(--qc-ink-3)", isMore: true },
];

const BENEFITS = [
  { icon: LinkIcon,  text: "One-click broker linking — no CSV exports needed" },
  { icon: SyncIcon,  text: "Auto-sync holdings after every trade" },
  { icon: ChartIcon, text: "Real-time P&L tracking across all accounts" },
  { icon: AiIcon,    text: "AI analysis on your actual portfolio, not shadow data" },
];

export function ConnectPortfolioModal({ open, onClose, onOpenCsvUpload, onConnected }: ConnectPortfolioModalProps) {
  // The real smallcase Gateway connect flow lives in useSmallcaseConnect:
  //   POST /connect → SDK triggerTransaction → POST /transactions/:id/confirm.
  const { step: connectStep, error, connect, reset } = useSmallcaseConnect({
    onConnected: () => onConnected?.(),
  });

  const step = toModalStep(connectStep);
  const errorMsg = error ?? "";

  // On success the modal lingers on the "done" state briefly, then closes.
  useEffect(() => {
    if (connectStep !== "done") return;
    const t = setTimeout(() => handleClose(), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectStep]);

  if (!open) return null;

  function handleClose() {
    reset();
    onClose();
  }

  function handleCsvUpload() {
    handleClose();
    onOpenCsvUpload();
  }

  function handleConnect() {
    connect();
  }

  const isInProgress = step === "connecting" || step === "syncing";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={isInProgress ? undefined : handleClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,43,0.50)",
          zIndex: 1000, backdropFilter: "blur(3px)",
          cursor: isInProgress ? "default" : "pointer",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff", borderRadius: 18,
          width: 520, maxWidth: "calc(100vw - 32px)",
          zIndex: 1001,
          boxShadow: "0 24px 80px rgba(15,23,43,0.20)",
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--qc-ink) 0%, #1e3a5f 100%)",
            padding: "28px 28px 24px",
            position: "relative",
          }}
        >
          {/* Close */}
          {!isInProgress && (
            <button
              onClick={handleClose}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(255,255,255,0.12)", border: "none",
                borderRadius: 6, width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,0.70)",
                fontSize: 16, lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>
          )}

          {/* smallcase badge */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 20, padding: "4px 10px 4px 6px",
              marginBottom: 14,
            }}
          >
            <SmallcaseIcon />
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.80)", fontFamily: "var(--qc-font-sans)", letterSpacing: "0.04em" }}>
              Powered by smallcase Gateway
            </span>
          </div>

          {step === "intro" ? (
            <>
              <h2
                style={{
                  fontSize: 20, fontWeight: 500, color: "#fff",
                  fontFamily: "var(--qc-font-serif)", margin: "0 0 6px",
                  lineHeight: 1.3,
                }}
              >
                Connect your broker,<br />get real-time insights
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--qc-font-sans)", margin: 0 }}>
                Link your demat account in seconds. We never store credentials.
              </p>

              {/* Broker grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 20 }}>
                {BROKERS.map((b) => (
                  <div
                    key={b.name}
                    style={{
                      background: b.isMore ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.09)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    {b.isMore ? (
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontFamily: "var(--qc-font-sans)", fontWeight: 500 }}>
                        {b.name}
                      </span>
                    ) : (
                      <>
                        <div
                          style={{
                            width: 22, height: 22, borderRadius: 5,
                            background: b.bg, color: b.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, flexShrink: 0,
                            fontFamily: "var(--qc-font-sans)",
                          }}
                        >
                          {b.logo}
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontFamily: "var(--qc-font-sans)", fontWeight: 400 }}>
                          {b.name}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* In-progress / done / error header */
            <div style={{ minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {step === "done" ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                  <h2 style={{ fontSize: 20, fontWeight: 500, color: "#fff", fontFamily: "var(--qc-font-serif)", margin: "0 0 6px" }}>
                    Broker connected!
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--qc-font-sans)", margin: 0 }}>
                    Your holdings will appear shortly once the first sync completes.
                  </p>
                </>
              ) : step === "error" ? (
                <>
                  <h2 style={{ fontSize: 20, fontWeight: 500, color: "#fff", fontFamily: "var(--qc-font-serif)", margin: "0 0 6px" }}>
                    Connection failed
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,100,100,0.80)", fontFamily: "var(--qc-font-sans)", margin: 0 }}>
                    {errorMsg || "Something went wrong. Please try again."}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Spinner />
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: "#fff", fontFamily: "var(--qc-font-serif)", margin: 0 }}>
                      {step === "connecting" ? "Connecting to broker…" : "Syncing your holdings…"}
                    </h2>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", fontFamily: "var(--qc-font-sans)", margin: 0 }}>
                    {step === "connecting"
                      ? "Authenticating securely via smallcase Gateway."
                      : "Fetching your holdings from the broker. This may take a moment."}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px 24px" }}>
          {step === "intro" && (
            <>
              {/* Benefits */}
              <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <li key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: "var(--qc-section)",
                        border: "1px solid rgba(18,18,18,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon />
                    </div>
                    <span style={{ fontSize: 13, color: "#444", fontFamily: "var(--qc-font-sans)" }}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Primary CTA */}
              <button
                onClick={handleConnect}
                style={{
                  width: "100%",
                  background: "var(--qc-ink)", color: "var(--qc-on-dark)",
                  border: "none", borderRadius: 10,
                  padding: "13px 20px",
                  fontSize: 14, fontWeight: 600,
                  fontFamily: "var(--qc-font-sans)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  letterSpacing: "0.01em",
                }}
              >
                <ExternalLinkIcon />
                Open Smallcase Gateway
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--qc-hair)" }} />
                <span style={{ fontSize: 11, color: "#aaa", fontFamily: "var(--qc-font-sans)" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "var(--qc-hair)" }} />
              </div>

              {/* Secondary CTA */}
              <button
                onClick={handleCsvUpload}
                style={{
                  width: "100%",
                  background: "#fff", color: "#555",
                  border: "1px solid var(--qc-hair)", borderRadius: 10,
                  padding: "11px 20px",
                  fontSize: 13, fontWeight: 500,
                  fontFamily: "var(--qc-font-sans)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                <UploadIcon />
                Upload CSV Holdings
              </button>

              <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", fontFamily: "var(--qc-font-sans)", margin: "12px 0 0" }}>
                We never share your data. All broker access is read-only.
              </p>
            </>
          )}

          {(step === "connecting" || step === "syncing") && (
            <div style={{ textAlign: "center", padding: "12px 0 8px", color: "var(--qc-ink-3)", fontSize: 13, fontFamily: "var(--qc-font-sans)" }}>
              Please wait, do not close this window…
            </div>
          )}

          {step === "error" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              <button
                onClick={handleConnect}
                style={{
                  width: "100%", background: "var(--qc-ink)", color: "var(--qc-on-dark)",
                  border: "none", borderRadius: 10, padding: "13px 20px",
                  fontSize: 14, fontWeight: 600, fontFamily: "var(--qc-font-sans)", cursor: "pointer",
                }}
              >
                Try again
              </button>
              <button
                onClick={handleClose}
                style={{
                  width: "100%", background: "#fff", color: "#555",
                  border: "1px solid var(--qc-hair)", borderRadius: 10, padding: "11px 20px",
                  fontSize: 13, fontWeight: 500, fontFamily: "var(--qc-font-sans)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "12px 0 8px", color: "var(--qc-ink-3)", fontSize: 13, fontFamily: "var(--qc-font-sans)" }}>
              Refreshing your dashboard…
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SmallcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#1DB954" />
      <path d="M6 12l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--qc-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--qc-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--qc-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--qc-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
