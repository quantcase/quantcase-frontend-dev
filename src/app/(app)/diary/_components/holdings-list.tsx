"use client";

import { useState } from "react";
import { Wallet, Link2, FileUp, RefreshCw } from "lucide-react";
import { fmtLakhs } from "@/lib/portfolio-format";

// Small "● Zerodha connected" status pill, reused in the header and connected empty state.
function ConnectedPill({ brokerLabel }: { brokerLabel?: string }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 500, color: "var(--qc-up)",
        background: "var(--qc-up-soft)", border: "1px solid rgba(31,122,74,0.20)",
        borderRadius: 999, padding: "3px 10px", whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--qc-up)" }} />
      {brokerLabel ?? "Broker"} connected
    </span>
  );
}

// "Sync Holdings" pill button — re-fetches holdings from the broker via the backend.
function SyncButton({ syncing, onSync }: { syncing?: boolean; onSync?: () => void }) {
  return (
    <button
      onClick={onSync}
      disabled={syncing}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        fontSize: 12, fontWeight: 500, color: "var(--qc-ink-2)",
        background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
        padding: "8px 14px", borderRadius: 999,
        cursor: syncing ? "default" : "pointer", opacity: syncing ? 0.6 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <RefreshCw size={14} strokeWidth={1.75} style={{ color: "var(--qc-ink-3)", animation: syncing ? "qc-spin 0.8s linear infinite" : undefined }} />
      <style>{`@keyframes qc-spin { to { transform: rotate(360deg); } }`}</style>
      {syncing ? "Syncing…" : "Sync Holdings"}
    </button>
  );
}

export interface DiaryHolding {
  ticker: string;
  name: string | null;
  amount: number;        // current value or amount invested, in raw rupees
  qty: number | null;
  broker: string | null; // broker attribution (backend note — may be null)
}

// A small deterministic color per broker chip (until the backend provides one).
function brokerColor(broker: string) {
  const palette = [
    "var(--qc-blue)",
    "var(--qc-brand-accent)",
    "var(--qc-up)",
    "var(--qc-warn)",
    "var(--qc-down)",
    "var(--qc-ink-2)",
  ];
  let hash = 0;
  for (let i = 0; i < broker.length; i++) hash = (hash * 31 + broker.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function ListView({ holdings }: { holdings: DiaryHolding[] }) {
  return (
    <div>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto 1.2fr", gap: 16, padding: "12px 4px", borderBottom: "1px solid var(--qc-hair)" }}>
        {["HOLDING", "AMOUNT", "QTY", "BROKER"].map((h, i) => (
          <div key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "var(--qc-ink-3)", textAlign: i === 1 || i === 2 ? "right" : i === 3 ? "right" : "left" }}>{h}</div>
        ))}
      </div>

      {holdings.map((h, i) => (
        <div
          key={`${h.ticker}-${i}`}
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto 1.2fr", gap: 16, padding: "16px 4px", borderBottom: i < holdings.length - 1 ? "1px solid var(--qc-hair)" : "none", alignItems: "center" }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.02em", color: "var(--qc-ink)" }}>{h.ticker}</div>
            {h.name && <div style={{ fontSize: 12, color: "var(--qc-ink-3)", marginTop: 2 }}>{h.name}</div>}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)", textAlign: "right" }}>
            {fmtLakhs(h.amount)}
          </div>
          <div style={{ fontSize: 14, color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)", textAlign: "right", minWidth: 32 }}>
            {h.qty ?? "—"}
          </div>
          <div style={{ textAlign: "right" }}>
            {h.broker ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--qc-ink-2)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: brokerColor(h.broker) }} />
                {h.broker}
              </span>
            ) : (
              <span style={{ fontSize: 13, color: "var(--qc-ink-3)" }}>—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartView({ holdings }: { holdings: DiaryHolding[] }) {
  const total = holdings.reduce((s, h) => s + h.amount, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
      {holdings.map((h, i) => {
        const pct = (h.amount / total) * 100;
        return (
          <div key={`${h.ticker}-${i}`} style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{h.ticker}</div>
            <div style={{ height: 10, background: "var(--qc-bg)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "var(--qc-ink)", borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-mono)", minWidth: 44, textAlign: "right" }}>
              {pct.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Empty state for an unconnected book — illustrative wallet badge + two source actions.
function EmptyState({ onConnectBroker, onUploadCsv }: { onConnectBroker?: () => void; onUploadCsv?: () => void }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "44px 24px 40px", textAlign: "center",
        border: "1px dashed var(--qc-hair)", borderRadius: 14, background: "var(--qc-bg)",
      }}
    >
      {/* Illustrative badge — layered discs behind a wallet glyph */}
      <div style={{ position: "relative", width: 72, height: 72, marginBottom: 20 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }} />
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "var(--qc-card)", border: "1px solid var(--qc-hair)", boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wallet size={30} strokeWidth={1.5} style={{ color: "var(--qc-ink)" }} />
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--qc-ink)" }}>No holdings yet</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--qc-ink-3)", marginTop: 6, maxWidth: 300 }}>
        Add your portfolio to see everything you own, tracked against your journal.
      </div>

      {/* Two source actions — same flows as the old "Add holdings" button */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 20 }}>
        {[
          { icon: Link2, label: "Connect broker", onClick: onConnectBroker },
          { icon: FileUp, label: "Upload a CSV", onClick: onUploadCsv },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: 12, fontWeight: 500, color: "var(--qc-ink-2)",
              background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
              padding: "8px 14px", borderRadius: 999, cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--qc-ink-3)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--qc-hair)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <Icon size={14} strokeWidth={1.75} style={{ color: "var(--qc-ink-3)" }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Empty state for a *connected* broker with no synced holdings — the user likely
// hasn't traded, so we offer only a re-sync rather than another connect prompt.
function ConnectedEmptyState({ brokerLabel, syncing, onSync }: { brokerLabel?: string; syncing?: boolean; onSync?: () => void }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "44px 24px 40px", textAlign: "center",
        border: "1px dashed var(--qc-hair)", borderRadius: 14, background: "var(--qc-bg)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <ConnectedPill brokerLabel={brokerLabel} />
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--qc-ink)" }}>
        No active holdings in your {brokerLabel ?? "broker"} account
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--qc-ink-3)", marginTop: 6, maxWidth: 320 }}>
        We couldn&apos;t find any holdings to track. If you&apos;ve traded recently, re-sync to pull the latest from your broker.
      </div>

      <div style={{ marginTop: 20 }}>
        <SyncButton syncing={syncing} onSync={onSync} />
      </div>
    </div>
  );
}

// "EVERYTHING YOU OWN" — the full holdings list with a List / Chart toggle.
export function HoldingsList({
  holdings,
  loading,
  brokerConnected,
  brokerLabel,
  syncing,
  onConnectBroker,
  onUploadCsv,
  onSync,
}: {
  holdings: DiaryHolding[];
  loading?: boolean;
  /** True when a broker/smallcase account is linked (from /auth/me), regardless of holdings count. */
  brokerConnected?: boolean;
  /** Display name of the connected broker, e.g. "Zerodha". */
  brokerLabel?: string;
  /** True while a broker-side re-sync is in flight. */
  syncing?: boolean;
  onConnectBroker?: () => void;
  onUploadCsv?: () => void;
  onSync?: () => void;
}) {
  const [view, setView] = useState<"list" | "chart">("list");

  const total = holdings.reduce((s, h) => s + h.amount, 0);
  const brokerCount = new Set(holdings.map(h => h.broker).filter(Boolean)).size;
  const hasHoldings = !loading && holdings.length > 0;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-3)" }}>Everything you own</div>
          {/* Value line — shown only once real holdings exist, so an empty book never reads "₹0" */}
          {hasHoldings && (
            <div style={{ fontSize: 20, fontWeight: 600, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)", letterSpacing: "-0.01em", marginTop: 6 }}>
              {fmtLakhs(total)}
              {brokerCount > 0 && (
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)" }}>
                  {" "}· {brokerCount} broker account{brokerCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* List / Chart toggle + Sync — only meaningful with data */}
        {hasHoldings && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, alignSelf: "flex-start" }}>
            {brokerConnected && <SyncButton syncing={syncing} onSync={onSync} />}
            <div style={{ display: "inline-flex", background: "var(--qc-bg)", borderRadius: 8, padding: 3 }}>
              {(["list", "chart"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 16px", fontSize: 13, borderRadius: 6, border: "none", cursor: "pointer", textTransform: "capitalize",
                    background: view === v ? "var(--qc-ink)" : "transparent",
                    color: view === v ? "var(--qc-on-dark)" : "var(--qc-ink-2)",
                    fontWeight: view === v ? 600 : 400,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 44, background: "var(--qc-bg)", borderRadius: 8 }} />
          ))}
        </div>
      ) : holdings.length === 0 ? (
        brokerConnected ? (
          <ConnectedEmptyState brokerLabel={brokerLabel} syncing={syncing} onSync={onSync} />
        ) : (
          <EmptyState onConnectBroker={onConnectBroker} onUploadCsv={onUploadCsv} />
        )
      ) : view === "list" ? (
        <ListView holdings={holdings} />
      ) : (
        <ChartView holdings={holdings} />
      )}
    </div>
  );
}
