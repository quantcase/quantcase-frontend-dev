"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Users } from "lucide-react";
import { useScreenerPeers, type PeerRow } from "@/hooks/useScreenerPeers";
import { MonoLabel, LimeCountPip } from "@/components/ds";

function fmtCap(cr: number | null): string {
  if (cr === null) return "—";
  if (cr >= 1_00_000) return `₹${(cr / 1_00_000).toFixed(1)}L Cr`;
  if (cr >= 1_000) return `₹${(cr / 1_000).toFixed(0)}K Cr`;
  return `₹${cr.toFixed(0)} Cr`;
}

function fmtNum(val: number | null, decimals = 2): string {
  if (val === null) return "—";
  return val.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtVar(val: number | null): { text: string; color: string } {
  if (val === null) return { text: "—", color: "var(--qc-ink-3)" };
  const sign = val > 0 ? "+" : "";
  const color = val > 0 ? "var(--qc-up)" : val < 0 ? "var(--qc-down)" : "var(--qc-ink-3)";
  return { text: `${sign}${val.toFixed(2)}%`, color };
}

function verdictColor(verdict: string): string {
  const v = verdict?.toUpperCase();
  if (v === "STRONG") return "var(--qc-up)";
  if (v === "WEAK") return "var(--qc-down)";
  if (v === "MODERATE") return "var(--qc-warn)";
  return "var(--qc-ink-3)";
}

const COL_HEADER: React.CSSProperties = {
  fontSize: "var(--qc-fz-9)",
  fontWeight: "var(--qc-w-semi)",
  fontFamily: "var(--qc-font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.10em",
  color: "var(--qc-ink-3)",
  padding: "6px 10px",
  textAlign: "right",
  whiteSpace: "nowrap",
  borderBottom: "1px solid var(--qc-hair)",
};

const COL_CELL: React.CSSProperties = {
  fontSize: "var(--qc-fz-11)",
  color: "var(--qc-ink-2)",
  padding: "8px 10px",
  textAlign: "right",
  whiteSpace: "nowrap",
  fontFamily: "var(--qc-font-mono)",
  borderBottom: "1px solid var(--qc-hair)",
};

function ScoreChip({ score, verdict }: { score: number; verdict: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const color = verdictColor(verdict);

  const handleEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(rect.left > window.innerWidth / 2);
    }
    setShow(true);
  };

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 3 }}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-bold)", color, fontFamily: "var(--qc-font-mono)" }}>
        {score}
      </span>

      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            ...(alignRight ? { right: 0 } : { left: "50%", transform: "translateX(-50%)" }),
            zIndex: 50,
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: "5px 10px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-bold)", fontFamily: "var(--qc-font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color }}>
            {verdict}
          </span>
        </span>
      )}
    </span>
  );
}

function PeerTableRow({
  peer,
  isLast,
  onClick,
}: {
  peer: PeerRow;
  isLast: boolean;
  onClick: () => void;
}) {
  const profitVar = fmtVar(peer.qtrProfitVar);
  const salesVar = fmtVar(peer.qtrSalesVar);
  const cellStyle: React.CSSProperties = {
    ...COL_CELL,
    borderBottom: isLast ? "none" : "1px solid var(--qc-hair)",
  };
  const textCellStyle: React.CSSProperties = {
    ...cellStyle,
    textAlign: "left",
    fontFamily: "inherit",
  };

  return (
    <tr
      style={{ cursor: "pointer", transition: "background 0.12s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--qc-section)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = peer.isSubject ? "rgba(15,23,43,0.03)" : "transparent")}
      onClick={onClick}
    >
      <td style={{ ...textCellStyle, paddingLeft: 14, background: "inherit" }}>
        <span style={{ fontWeight: peer.isSubject ? "var(--qc-w-bold)" : "var(--qc-w-medium)", color: "var(--qc-ink)", fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-mono)" }}>
          {peer.symbol}
        </span>
        <br />
        <span style={{ fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-3)", fontWeight: "var(--qc-w-regular)", fontFamily: "var(--qc-font-sans)" }}>{peer.name}</span>
      </td>
      <td style={{ ...cellStyle, color: "var(--qc-ink)", fontWeight: peer.isSubject ? 600 : 400 }}>
        {peer.cmp !== null ? `₹${peer.cmp.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"}
      </td>
      <td style={cellStyle}>{fmtCap(peer.marketCapCr)}</td>
      <td style={cellStyle}>{fmtNum(peer.pe, 1)}</td>
      <td style={cellStyle}>{peer.divYld !== null ? `${peer.divYld.toFixed(2)}%` : "—"}</td>
      <td style={cellStyle}>{peer.salesQtrCr !== null ? `₹${fmtNum(peer.salesQtrCr, 0)} Cr` : "—"}</td>
      <td style={{ ...cellStyle, color: salesVar.color }}>{salesVar.text}</td>
      <td style={cellStyle}>{peer.npQtrCr !== null ? `₹${fmtNum(peer.npQtrCr, 0)} Cr` : "—"}</td>
      <td style={{ ...cellStyle, color: profitVar.color }}>{profitVar.text}</td>
      <td style={{ ...cellStyle, textAlign: "center" }}>
        <ScoreChip score={peer.management.score} verdict={peer.management.verdict} />
      </td>
      <td style={{ ...cellStyle, textAlign: "center" }}>
        <ScoreChip score={peer.opportunity.score} verdict={peer.opportunity.verdict} />
      </td>
      <td style={{ ...cellStyle, textAlign: "center", paddingRight: 14 }}>
        <ScoreChip score={peer.deal.score} verdict={peer.deal.verdict} />
      </td>
    </tr>
  );
}

interface SimilarStocksProps {
  symbol: string;
}

export function SimilarStocks({ symbol }: SimilarStocksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading } = useScreenerPeers(symbol);

  const [showAll, setShowAll] = useState(false);

  const handleClick = (peerSymbol: string) => {
    if (peerSymbol === symbol) return;
    router.push(`${pathname}?symbol=${encodeURIComponent(peerSymbol)}`);
  };

  if (loading) {
    return (
      <div style={{ padding: "16px 24px 20px", borderTop: "1px solid var(--qc-hair)" }}>
        <div style={{ height: 14, width: 160, borderRadius: 6, background: "var(--qc-section)", marginBottom: 10 }} />
        <div style={{ height: 120, borderRadius: 10, background: "var(--qc-section)" }} />
      </div>
    );
  }

  if (!data || data.peers.length === 0) return null;

  const allPeers = data.peers;
  const peers = showAll ? allPeers : allPeers.slice(0, 5);
  const hasMore = allPeers.length > 5;

  return (
    <div style={{ borderTop: "1px solid var(--qc-hair)", padding: "16px 24px 24px" }}>
      <div
        className="rounded-[10px] p-2"
        style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
      >
        <div className="px-2 pt-1 pb-3 flex items-center gap-2">
          <Users className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">
            Similar Stocks
          </MonoLabel>
          <span style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", marginLeft: 2 }}>{data.basicIndustry}</span>
          <LimeCountPip count={allPeers.length} />
          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              style={{
                marginLeft: "auto",
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-semi)",
                fontFamily: "var(--qc-font-mono)",
                letterSpacing: "0.06em",
                color: "var(--qc-ink-2)",
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {showAll ? "Show Less" : `View All ${allPeers.length}`}
            </button>
          )}
        </div>

        <div className="rounded-[10px] overflow-hidden" style={{ background: "var(--qc-card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--qc-section)" }}>
                <th style={{ ...COL_HEADER, textAlign: "left", paddingLeft: 14 }}>Company</th>
                <th style={COL_HEADER}>CMP</th>
                <th style={COL_HEADER}>Mkt Cap</th>
                <th style={COL_HEADER}>P/E</th>
                <th style={COL_HEADER}>Div Yld</th>
                <th style={COL_HEADER}>Qtr Sales</th>
                <th style={COL_HEADER}>Sales Var</th>
                <th style={COL_HEADER}>Qtr Profit</th>
                <th style={COL_HEADER}>Profit Var</th>
                <th style={{ ...COL_HEADER, textAlign: "center" }}>Mgmt</th>
                <th style={{ ...COL_HEADER, textAlign: "center" }}>Opp</th>
                <th style={{ ...COL_HEADER, textAlign: "center", paddingRight: 14 }}>Deal</th>
              </tr>
            </thead>
            <tbody>
              {peers.map((peer, idx) => (
                <PeerTableRow
                  key={peer.symbol}
                  peer={peer}
                  isLast={idx === peers.length - 1}
                  onClick={() => handleClick(peer.symbol)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
