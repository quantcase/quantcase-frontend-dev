"use client";

import Link from "next/link";
import { useState } from "react";

import { HOLDINGS, MUTUAL_FUNDS, fmtLakhs } from "./_components/portfolio-data";
import { JournalTab } from "./_components/tab-journal";
import { CompleteJournalModal } from "@/components/investor/complete-journal-modal";
import { ConnectPortfolioModal } from "@/components/investor/connect-portfolio-modal";
import { UploadPortfolioModal } from "@/components/investor/upload-portfolio-modal";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useJournalPending } from "@/hooks/useJournalPending";
import { useUserPortfolio } from "@/hooks/useUserPortfolio";
import { useSmallcaseHoldings } from "@/hooks/useSmallcaseHoldings";
import { useSmallcaseOrders } from "@/hooks/useSmallcaseOrders";
import type { Holding as ApiHolding } from "@/types/investor-portfolio";
import type { SmallcaseHolding, SmallcaseOrder, SmallcaseOrderStatus } from "@/types/smallcase";

// ── User holdings (real API data) ────────────────────────────────────────────

function ConvictionPill({ value }: { value: string | null }) {
  if (!value) return null;
  const map: Record<string, { bg: string; color: string }> = {
    POSITIVE: { bg: "rgba(31,122,74,0.10)", color: "var(--qc-up,#1F7A4A)" },
    WATCH:    { bg: "#FEF3C7",              color: "#92400E" },
    NEUTRAL:  { bg: "#F5F5F5",              color: "#888" },
  };
  const style = map[value] ?? map.NEUTRAL;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.05em", textTransform: "uppercase", ...style }}>
      {value}
    </span>
  );
}

function ThesisTagPills({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  const TAG_COLOR: Record<string, string> = { MANAGEMENT: "#4338CA", OPPORTUNITY: "#0369A1", DEAL: "#7C3AED" };
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {tags.map(t => (
        <span key={t} style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: "#F0F0FF", color: TAG_COLOR[t] ?? "#555", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {t}
        </span>
      ))}
    </div>
  );
}

function UserHoldingsCard({ holdings, loading, empty, onConnect }: { holdings: ApiHolding[]; loading: boolean; empty: boolean; onConnect: () => void }) {
  if (loading) {
    return (
      <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: "16px 18px", borderBottom: "1px solid var(--qc-hair)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 80, height: 14, background: "#E5E7EB", borderRadius: 4 }} />
            <div style={{ flex: 1, height: 14, background: "#E5E7EB", borderRadius: 4 }} />
            <div style={{ width: 60, height: 14, background: "#E5E7EB", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  if (empty || !holdings.length) {
    return (
      <div style={{ border: "1px dashed var(--qc-hair)", borderRadius: 12, padding: "48px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--qc-ink)", marginBottom: 6 }}>No portfolio yet</div>
        <div style={{ fontSize: 13, color: "var(--qc-ink-3)", marginBottom: 20 }}>
          Connect your broker or upload a CSV to see your holdings here.
        </div>
        <button
          onClick={onConnect}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--qc-ink)", color: "#fff", borderRadius: 8,
            padding: "9px 18px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
          }}
        >
          Connect your portfolio
        </button>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, padding: "10px 18px", background: "var(--qc-bg)", borderBottom: "1px solid var(--qc-hair)" }}>
        {["TICKER", "INVESTED", "QC SCORE", "ANALYSIS"].map(h => (
          <div key={h} style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)" }}>{h}</div>
        ))}
      </div>

      {holdings.map((h, i) => {
        const score = h.market_data?.qc_score;
        const scoreColor = score == null ? "#888" : score >= 75 ? "var(--qc-up)" : score >= 55 ? "var(--qc-warn)" : "#B91C1C";
        const investedDate = h.invested_at ? new Date(h.invested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

        return (
          <div
            key={h.id}
            style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto",
              gap: 12, padding: "14px 18px",
              borderBottom: i < holdings.length - 1 ? "1px solid var(--qc-hair)" : "none",
              alignItems: "center",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-bg)")}
            onMouseLeave={e => (e.currentTarget.style.background = "")}
          >
            {/* Ticker + tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", letterSpacing: "0.02em" }}>{h.ticker}</span>
                <ConvictionPill value={h.market_data?.conviction ?? null} />
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>Since {investedDate}</span>
                <ThesisTagPills tags={h.market_data?.thesis_tags ?? []} />
              </div>
            </div>

            {/* Invested amount */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>
                {fmtLakhs(h.amount_invested)}
              </div>
              <div style={{ fontSize: 11, color: "var(--qc-ink-3)", marginTop: 2 }}>invested</div>
            </div>

            {/* QC score */}
            <div>
              {score != null ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor, fontFamily: "var(--qc-font-mono)" }}>{score.toFixed(0)}</div>
                  <div style={{ width: 36, height: 4, background: "var(--qc-hair)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${score}%`, height: "100%", background: scoreColor, borderRadius: 2 }} />
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: "var(--qc-ink-3)" }}>—</span>
              )}
            </div>

            {/* Analysis link */}
            <Link
              href={`/screener/management?symbol=${h.ticker}`}
              style={{ fontSize: 11, color: "var(--qc-ink)", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", opacity: 0.7 }}
            >
              View →
            </Link>
          </div>
        );
      })}

      <div style={{ padding: "10px 18px", background: "var(--qc-bg)", borderTop: "1px solid var(--qc-hair)", fontSize: 11, color: "var(--qc-ink-3)" }}>
        Showing investment amounts only — live portfolio value requires broker connection via smallcase.
      </div>
    </div>
  );
}

// ── Live broker holdings (smallcase) ─────────────────────────────────────────

function fmtInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function fmtSignedInr(n: number) {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number) {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(2)}%`;
}

function pnlColor(n: number) {
  return n >= 0 ? "var(--qc-up, #1F7A4A)" : "var(--qc-down, #dc2626)";
}

function SmallcaseHoldingsCard({ holdings }: { holdings: SmallcaseHolding[] }) {
  if (!holdings.length) {
    return (
      <div style={{ border: "1px dashed var(--qc-hair)", borderRadius: 12, padding: "32px", textAlign: "center", fontSize: 13, color: "var(--qc-ink-3)" }}>
        No holdings found in your connected broker account yet.
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 12, padding: "10px 18px", background: "var(--qc-bg)", borderBottom: "1px solid var(--qc-hair)" }}>
        {["TICKER", "QTY", "AVG · LTP", "VALUE", "P&L"].map(h => (
          <div key={h} style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)" }}>{h}</div>
        ))}
      </div>

      {holdings.map((h, i) => (
        <div
          key={h.id ?? `${h.ticker}-${i}`}
          style={{
            display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
            gap: 12, padding: "14px 18px",
            borderBottom: i < holdings.length - 1 ? "1px solid var(--qc-hair)" : "none",
            alignItems: "center",
          }}
        >
          {/* Ticker + exchange */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--qc-ink)", letterSpacing: "0.02em" }}>{h.ticker}</span>
            <span style={{ fontSize: 11, color: "var(--qc-ink-3)" }}>{h.exchange}</span>
          </div>

          {/* Quantity */}
          <div style={{ fontSize: 13, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>{h.quantity}</div>

          {/* Avg · LTP */}
          <div style={{ fontSize: 12, color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>
            <div>{fmtInr(h.avg_price)}</div>
            <div style={{ color: "var(--qc-ink-3)", marginTop: 2 }}>{fmtInr(h.current_price)}</div>
          </div>

          {/* Current value */}
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>
            {fmtInr(h.current_value)}
          </div>

          {/* P&L */}
          <div style={{ fontSize: 13, fontWeight: 600, color: pnlColor(h.pnl), fontFamily: "var(--qc-font-mono)" }}>
            <div>{fmtSignedInr(h.pnl)}</div>
            <div style={{ fontSize: 11, marginTop: 2 }}>{fmtPct(h.pnl_pct)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Broker orders (smallcase) ────────────────────────────────────────────────

const ORDER_STATUS_STYLE: Record<SmallcaseOrderStatus, { bg: string; color: string }> = {
  pending:   { bg: "rgba(37,99,235,0.10)",  color: "var(--qc-blue, #2563eb)" },
  placed:    { bg: "rgba(37,99,235,0.10)",  color: "var(--qc-blue, #2563eb)" },
  completed: { bg: "rgba(31,122,74,0.10)",  color: "var(--qc-up, #1F7A4A)" },
  failed:    { bg: "rgba(220,38,38,0.10)",  color: "var(--qc-down, #dc2626)" },
  cancelled: { bg: "#F5F5F5",               color: "#888" },
};

function OrderStatusBadge({ status }: { status: SmallcaseOrderStatus }) {
  const s = ORDER_STATUS_STYLE[status] ?? ORDER_STATUS_STYLE.pending;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.05em", textTransform: "uppercase", background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function fmtOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function SmallcaseOrdersSection({ orders }: { orders: SmallcaseOrder[] }) {
  if (!orders.length) return null;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ borderBottom: "1px solid var(--qc-hair)", marginBottom: 16 }}>
        <div style={{ padding: "10px 0", fontSize: 12, fontWeight: 500, color: "var(--qc-ink)", borderBottom: "2px solid var(--qc-ink)", display: "inline-block", marginBottom: -1 }}>
          Recent Orders
        </div>
      </div>
      <div style={{ border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
        {orders.map((o, i) => (
          <div
            key={o.order_id}
            style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12,
              padding: "12px 18px", alignItems: "center",
              borderBottom: i < orders.length - 1 ? "1px solid var(--qc-hair)" : "none",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>
              {o.type}
            </span>
            <span style={{ fontSize: 13, color: "var(--qc-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {o.smallcase_name ?? o.order_id}
            </span>
            <span style={{ fontSize: 11, color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-mono)" }}>
              {fmtOrderDate(o.placed_at)}
            </span>
            <OrderStatusBadge status={o.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Summary stat card ─────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor, accentColor }: {
  label: string; value: string; sub?: string; subColor?: string; accentColor: string;
}) {
  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 10, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: accentColor }} />
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1, color: "var(--qc-ink)" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor ?? "var(--qc-ink-3)", marginTop: 4, fontFamily: "var(--qc-font-mono)" }}>{sub}</div>}
    </div>
  );
}

// ── Alert band ────────────────────────────────────────────────────────────────

function AlertBand() {
  const alerts = HOLDINGS.filter(h => h.alert);
  if (!alerts.length) return null;

  return (
    <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FEF9EE)", border: "1px solid #FCD34D", borderRadius: 10, padding: "14px 18px", marginBottom: 22 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "var(--qc-warn)", marginBottom: 10 }}>
        ⚠ Portfolio alerts · {alerts.length} holdings need attention
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {alerts.map(h => (
          <div key={h.symbol} className="grid grid-cols-[auto_auto_1fr_auto] gap-3 items-center" style={{ padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #FDE68A" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--qc-ink)", letterSpacing: "0.02em" }}>{h.symbol}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, background: h.modRating === "STRETCHED" ? "#FEE2E2" : "#FEF3C7", color: h.modRating === "STRETCHED" ? "#991B1B" : "#92400E" }}>
              {h.modRating === "STRETCHED" ? "Stretched" : "Fair"}
            </span>
            <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>{h.alert}</span>
            <Link href={`/screener/management?symbol=${h.symbol}`} style={{ fontSize: 11, color: "var(--qc-warn)", fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}>
              Review →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvestorPortfolioPage() {
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [journalTargetSymbol, setJournalTargetSymbol] = useState<string | undefined>();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: journalData, loading: journalLoading, error: journalError, refetch: refetchJournal } = useJournalEntries();
  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } = useJournalPending();
  const { data: userPortfolio, loading: portfolioLoading, notFound: portfolioEmpty, refetch: refetchUserPortfolio } = useUserPortfolio();
  const { data: smallcaseData, notConnected: brokerNotConnected, refetch: refetchSmallcase } = useSmallcaseHoldings();
  const { orders: brokerOrders, refetch: refetchOrders } = useSmallcaseOrders();

  const brokerPortfolio = smallcaseData?.portfolio ?? null;
  const brokerHoldings = smallcaseData?.holdings ?? [];
  const brokerConnected = !brokerNotConnected && !!brokerPortfolio;

  const summary = journalData?.summary;
  const withThesisCount = summary ? (summary.intact + summary.partial + summary.broken) : 0;
  const totalCount = summary?.total ?? 0;
  const noneCount = summary?.none ?? 0;
  const noneSymbols = (journalData?.entries ?? []).filter(e => e.thesisHealth === "none").map(e => e.symbol);

  const apiHoldings: ApiHolding[] = userPortfolio?.holdings ?? [];
  const totalInvested   = apiHoldings.reduce((s, h) => s + h.amount_invested, 0);
  const totalMF         = MUTUAL_FUNDS.reduce((s, f) => s + f.currentValue, 0);
  const totalPortfolio  = totalInvested + totalMF;

  const qcScores = apiHoldings.map(h => h.market_data?.qc_score).filter((v): v is number => v != null);
  const avgMOD = qcScores.length ? Math.round(qcScores.reduce((s, v) => s + v, 0) / qcScores.length) : null;

  const stockCount = apiHoldings.length;

  function openJournalModal(symbol?: string) {
    setJournalTargetSymbol(symbol);
    setJournalModalOpen(true);
  }

  function handleJournalComplete() {
    refetchJournal();
    refetchPending();
  }

  return (
    <div style={{ background: "var(--qc-bg)", minHeight: "100vh", fontFamily: "var(--qc-font-sans)" }}>
      <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-9">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" style={{ paddingBottom: 20, borderBottom: "1px solid var(--qc-hair)", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--qc-ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              <Link href="/investor/dashboard" style={{ color: "inherit", textDecoration: "none" }}>← Back to Dashboard</Link>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, margin: 0, color: "var(--qc-ink)" }}>Portfolio</h1>
            <div style={{ fontSize: 12, color: "var(--qc-ink-3)", marginTop: 6, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {portfolioLoading ? (
                <span>Loading…</span>
              ) : portfolioEmpty ? (
                <span>No portfolio connected</span>
              ) : (
                <span>{stockCount} stocks · {MUTUAL_FUNDS.length} mutual funds</span>
              )}
              {!portfolioEmpty && !portfolioLoading && (
                <span style={{ fontSize: 10, background: "var(--qc-ink)", color: "#fff", padding: "3px 8px", borderRadius: 999, fontWeight: 500, letterSpacing: "0.04em" }}>Uploaded</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConnectModalOpen(true)} style={{ background: "var(--qc-ink)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>+ Add holdings</button>
          </div>
        </div>

        {/* ── Journal progress banner ──────────────────────────────── */}
        <div style={{ background: "linear-gradient(135deg, var(--qc-ink) 0%, #2C2820 100%)", borderRadius: 12, padding: "14px 20px", marginBottom: 22, position: "relative", overflow: "hidden" }} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, background: "radial-gradient(circle,rgba(217,119,6,0.18),transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", gap: 14, alignItems: "center", zIndex: 1 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>🔥</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 400, color: "#fff", lineHeight: 1.2 }}>
                Journal progress — {withThesisCount} of {totalCount || "…"} holdings
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                {noneCount > 0 ? (
                  <>
                    Add thesis for{" "}
                    <strong style={{ color: "rgba(255,255,255,0.8)" }}>{noneSymbols.join(", ")}</strong>
                    {" "}to complete your book
                  </>
                ) : (
                  <strong style={{ color: "rgba(255,255,255,0.8)" }}>All holdings have a thesis ✓</strong>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", zIndex: 1 }} className="sm:items-end">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Array.from({ length: totalCount || 12 }).map((_, i) => (
                <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < withThesisCount ? "#D97706" : i === withThesisCount ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <button onClick={() => openJournalModal()} style={{ background: "transparent", border: "none", fontSize: 11, color: "#FCD34D", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer" }}>
              Complete journal →
            </button>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 mb-5">
          <StatCard
            label="Total Portfolio"
            value={
              brokerConnected
                ? fmtLakhs(brokerPortfolio!.total_value)
                : portfolioLoading ? "…" : totalPortfolio > 0 ? fmtLakhs(totalPortfolio) : "—"
            }
            sub={brokerConnected ? "Live broker value" : portfolioEmpty ? "No portfolio connected" : "Invested + Mutual Funds"}
            accentColor="linear-gradient(90deg,var(--qc-ink),#44403C)"
          />
          <StatCard
            label="Total P&L"
            value={brokerConnected ? fmtSignedInr(brokerPortfolio!.total_pnl) : "—"}
            sub={brokerConnected ? fmtPct(brokerPortfolio!.total_pnl_pct) : "Connect broker for live P&L"}
            subColor={brokerConnected ? pnlColor(brokerPortfolio!.total_pnl) : undefined}
            accentColor="linear-gradient(90deg,var(--qc-blue),#60A5FA)"
          />
          <StatCard
            label="Avg QC Score"
            value={portfolioLoading ? "…" : avgMOD != null ? `${avgMOD}/100` : "—"}
            sub={avgMOD != null ? "Based on holdings with scores" : portfolioEmpty ? "No holdings yet" : "Scores unavailable"}
            accentColor="linear-gradient(90deg,var(--qc-warn),#F59E0B)"
          />
        </div>

        {/* ── Alert band ──────────────────────────────────────────── */}
        <AlertBand />

        {/* ── Split layout: holdings (+ sub-tabs) left · journal right ─ */}
        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[1fr_minmax(420px,40%)]">

          {/* Left column — equity holdings */}
          <div>
            <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--qc-hair)", marginBottom: 22 }}>
              <div style={{ padding: "10px 0", fontSize: 12, fontWeight: 500, color: "var(--qc-ink)", borderBottom: "2px solid var(--qc-ink)", display: "inline-block", marginBottom: -1 }}>
                Equity Holdings
              </div>
              {brokerConnected && (
                <span style={{ fontSize: 10, background: "var(--qc-up, #1F7A4A)", color: "#fff", padding: "3px 8px", borderRadius: 999, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Live · smallcase
                </span>
              )}
            </div>

            {brokerConnected ? (
              <SmallcaseHoldingsCard holdings={brokerHoldings} />
            ) : (
              <UserHoldingsCard
                holdings={apiHoldings}
                loading={portfolioLoading}
                empty={portfolioEmpty}
                onConnect={() => setConnectModalOpen(true)}
              />
            )}

            {brokerConnected && <SmallcaseOrdersSection orders={brokerOrders} />}
          </div>

          {/* Right column — investment journal, sticky on desktop */}
          <div className="lg:sticky" style={{ top: 24 }}>
            <JournalTab
              entries={journalData?.entries ?? []}
              summary={journalData?.summary ?? { intact: 0, partial: 0, broken: 0, none: 0, total: 0 }}
              loading={journalLoading}
              error={journalError}
              onAddThesis={openJournalModal}
            />
          </div>
        </div>

      </main>

      <CompleteJournalModal
        open={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        onComplete={handleJournalComplete}
        onConnect={() => setConnectModalOpen(true)}
        holdings={pendingData?.holdings ?? []}
        totalHoldings={pendingData?.totalHoldings}
        loadingHoldings={pendingLoading}
        targetSymbol={journalTargetSymbol}
      />

      <ConnectPortfolioModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onOpenCsvUpload={() => setUploadModalOpen(true)}
        onConnected={() => { setConnectModalOpen(false); refetchUserPortfolio(); refetchSmallcase(); refetchOrders(); }}
      />

      <UploadPortfolioModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => { setUploadModalOpen(false); window.location.reload(); }}
      />
    </div>
  );
}
