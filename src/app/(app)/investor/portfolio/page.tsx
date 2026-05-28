"use client";

import Link from "next/link";
import { useState } from "react";

import { HOLDINGS, MUTUAL_FUNDS, NEWS_ITEMS, fmtLakhs, fmt } from "./_components/portfolio-data";
import { HoldingsCard } from "./_components/holding-row";
import { SectorSidePanel } from "./_components/sector-side-panel";
import { MutualFundsTab } from "./_components/tab-mutual-funds";
import { NewsTab } from "./_components/tab-news";
import { JournalTab } from "./_components/tab-journal";

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
          <div key={h.symbol} style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: 12, alignItems: "center", padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #FDE68A" }}>
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

// ── Tab definitions ───────────────────────────────────────────────────────────

type Tab = "holdings" | "mf" | "news" | "sector" | "journal";

const TABS: { id: Tab; label: string; badgeFn?: (withThesis: number, total: number, newsCount: number) => string | undefined }[] = [
  { id: "holdings", label: "Equity Holdings" },
  { id: "mf",       label: "Mutual Funds" },
  { id: "news",     label: "News & MOD Impact", badgeFn: (_wt, _t, n) => `${n} new` },
  { id: "sector",   label: "Sector Overlay" },
  { id: "journal",  label: "📓 Investment Journal", badgeFn: (wt, t) => `${wt}/${t}` },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvestorPortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("holdings");

  const totalEquity     = HOLDINGS.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested   = HOLDINGS.reduce((s, h) => s + h.invested, 0);
  const totalMF         = MUTUAL_FUNDS.reduce((s, f) => s + f.currentValue, 0);
  const totalMFInvested = MUTUAL_FUNDS.reduce((s, f) => s + f.invested, 0);
  const totalPnl        = totalEquity - totalInvested;
  const totalPnlPct     = (totalPnl / totalInvested) * 100;
  const totalDayChange  = HOLDINGS.reduce((s, h) => s + h.dayChange * h.qty, 0);
  const totalPortfolio  = totalEquity + totalMF;
  const avgMOD          = Math.round(HOLDINGS.reduce((s, h) => s + h.modScore, 0) / HOLDINGS.length);

  const withThesis = HOLDINGS.filter(h => h.thesisHealth !== "none");
  const noThesis   = HOLDINGS.filter(h => h.thesisHealth === "none");

  return (
    <div style={{ background: "var(--qc-bg)", minHeight: "100vh", fontFamily: "var(--qc-font-sans)" }}>
      <main style={{ padding: "28px 36px 80px" }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 20, borderBottom: "1px solid var(--qc-hair)", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--qc-ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              <Link href="/investor/dashboard" style={{ color: "inherit", textDecoration: "none" }}>← Back to Dashboard</Link>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1, margin: 0, color: "var(--qc-ink)" }}>Portfolio</h1>
            <div style={{ fontSize: 12, color: "var(--qc-ink-3)", marginTop: 6, display: "flex", gap: 10, alignItems: "center" }}>
              <span>12 stocks · 5 mutual funds · synced 2 min ago</span>
              <span style={{ fontSize: 10, background: "var(--qc-ink)", color: "#fff", padding: "3px 8px", borderRadius: 999, fontWeight: 500, letterSpacing: "0.04em" }}>Demat-linked</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: "var(--qc-card)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Export PDF</button>
            <button style={{ background: "var(--qc-ink)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>+ Add holding</button>
          </div>
        </div>

        {/* ── Streak / journal progress banner ────────────────────── */}
        <div style={{ background: "linear-gradient(135deg, var(--qc-ink) 0%, #2C2820 100%)", borderRadius: 12, padding: "14px 20px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, background: "radial-gradient(circle,rgba(217,119,6,0.18),transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", gap: 14, alignItems: "center", zIndex: 1 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>🔥</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 400, color: "#fff", lineHeight: 1.2 }}>
                Journal progress — {withThesis.length} of {HOLDINGS.length} holdings
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
                Add thesis for{" "}
                <strong style={{ color: "rgba(255,255,255,0.8)" }}>{noThesis.map(h => h.symbol).join(", ")}</strong>
                {" "}to complete your book
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", zIndex: 1 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Array.from({ length: HOLDINGS.length }).map((_, i) => (
                <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < withThesis.length ? "#D97706" : i === withThesis.length ? "rgba(217,119,6,0.5)" : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <button onClick={() => setActiveTab("journal")} style={{ background: "transparent", border: "none", fontSize: 11, color: "#FCD34D", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer" }}>
              Complete journal →
            </button>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 22 }}>
          <StatCard label="Total Portfolio"    value={fmtLakhs(totalPortfolio)} sub="Equity + Mutual Funds"                                                              accentColor="linear-gradient(90deg,var(--qc-ink),#44403C)" />
          <StatCard label="Equity Value"       value={fmtLakhs(totalEquity)}    sub={`${totalDayChange >= 0 ? "+" : ""}₹${fmt(Math.abs(totalDayChange))} today`}         subColor={totalDayChange >= 0 ? "var(--qc-up)" : "#B91C1C"} accentColor="linear-gradient(90deg,var(--qc-up),#4ADE80)" />
          <StatCard label="Total P&L"          value={`${totalPnl >= 0 ? "+" : ""}${fmtLakhs(totalPnl)}`} sub={`${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(1)}% on ₹${(totalInvested / 100000).toFixed(1)}L invested`} subColor={totalPnl >= 0 ? "var(--qc-up)" : "#B91C1C"} accentColor="linear-gradient(90deg,var(--qc-blue),#60A5FA)" />
          <StatCard label="Mutual Funds"       value={fmtLakhs(totalMF)}        sub={`+${fmtLakhs(totalMF - totalMFInvested)} gain`}                                    subColor="var(--qc-up)"                                   accentColor="linear-gradient(90deg,#7C3AED,#A78BFA)" />
          <StatCard label="Avg Portfolio MOD"  value={`${avgMOD}/100`}          sub="Weighted mgmt quality"                                                              accentColor="linear-gradient(90deg,var(--qc-warn),#F59E0B)" />
        </div>

        {/* ── Alert band ──────────────────────────────────────────── */}
        <AlertBand />

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--qc-hair)", marginBottom: 22 }}>
          {TABS.map(t => {
            const badge = t.badgeFn?.(withThesis.length, HOLDINGS.length, NEWS_ITEMS.length);
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px", fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: "transparent", border: "none",
                  color: activeTab === t.id ? "var(--qc-ink)" : "var(--qc-ink-3)",
                  borderBottom: `2px solid ${activeTab === t.id ? "var(--qc-ink)" : "transparent"}`,
                  marginBottom: -1, transition: "color 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {t.label}
                {badge && (
                  <span style={{ fontSize: 10, background: t.id === "journal" ? "#EDE9FE" : "#FEF2F2", color: t.id === "journal" ? "#6D28D9" : "#B91C1C", padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ─────────────────────────────────────────── */}
        {activeTab === "holdings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
            <HoldingsCard holdings={HOLDINGS} />
            <SectorSidePanel holdings={HOLDINGS} />
          </div>
        )}
        {activeTab === "mf"      && <MutualFundsTab funds={MUTUAL_FUNDS} />}
        {activeTab === "news"    && <NewsTab items={NEWS_ITEMS} />}
        {activeTab === "sector"  && <div style={{ maxWidth: 700 }}><SectorSidePanel holdings={HOLDINGS} /></div>}
        {activeTab === "journal" && <JournalTab holdings={HOLDINGS} />}

      </main>
    </div>
  );
}
