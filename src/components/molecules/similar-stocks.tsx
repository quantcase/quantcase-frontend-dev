"use client";

import { useRouter, usePathname } from "next/navigation";
import { useScreenerPeers } from "@/hooks/useScreenerPeers";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function fmtCap(cr: number | null): string {
  if (cr === null) return "";
  if (cr >= 1_00_000) return `₹${(cr / 1_00_000).toFixed(1)}L Cr`;
  if (cr >= 1_000) return `₹${(cr / 1_000).toFixed(0)}K Cr`;
  return `₹${cr.toFixed(0)} Cr`;
}

function fmtProfitVar(val: number | null) {
  if (val === null) return null;
  return val;
}

interface SimilarStocksProps {
  symbol: string;
}

export function SimilarStocks({ symbol }: SimilarStocksProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading } = useScreenerPeers(symbol);

  if (loading) {
    return (
      <div style={{ padding: "12px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 80,
                borderRadius: 10,
                background: "var(--qc-section)",
                animation: "pulse 1.5s ease-in-out infinite",
                opacity: 1 - i * 0.08,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.peers.length === 0) return null;

  const peers = data.peers.filter((p) => !p.isSubject);
  if (peers.length === 0) return null;

  const handleClick = (peerSymbol: string) => {
    router.push(`${pathname}?symbol=${encodeURIComponent(peerSymbol)}`);
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--qc-hair)",
        padding: "10px 24px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Similar Stocks
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--qc-ink-2)",
            opacity: 0.6,
          }}
        >
          {data.basicIndustry}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {peers.map((peer) => {
          const profitVar = fmtProfitVar(peer.qtrProfitVar);
          const isUp = profitVar !== null && profitVar > 0;
          const isDown = profitVar !== null && profitVar < 0;
          const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
          const trendColor = isUp
            ? "var(--qc-up)"
            : isDown
            ? "var(--qc-down)"
            : "var(--qc-ink-2)";

          return (
            <button
              key={peer.symbol}
              onClick={() => handleClick(peer.symbol)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid var(--qc-hair)",
                background: "var(--qc-card)",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--qc-ink-2)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--qc-section)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--qc-hair)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--qc-card)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--qc-ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {peer.symbol}
                </span>
                {profitVar !== null && (
                  <TrendIcon
                    style={{ width: 12, height: 12, color: trendColor, flexShrink: 0 }}
                  />
                )}
              </div>

              <span
                style={{
                  fontSize: 10,
                  color: "var(--qc-ink-2)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  lineHeight: 1.3,
                }}
                title={peer.name}
              >
                {peer.name}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                {peer.cmp !== null && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--qc-ink)",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    ₹{peer.cmp.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                )}
                {peer.marketCapCr !== null && (
                  <span
                    style={{
                      fontSize: 9,
                      color: "var(--qc-ink-2)",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {fmtCap(peer.marketCapCr)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
