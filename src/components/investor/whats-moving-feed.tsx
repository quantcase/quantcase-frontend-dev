"use client";

import Link from "next/link";

export type MovingItemKind = "score_upgrade" | "score_downgrade" | "earnings";

export interface MovingItem {
  id: string;
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePositive: boolean;
  kind: MovingItemKind;
  headlineLabel: string;
  headlineDetail: string;
  body: string;
  holdingDetail: string;
  qcScore: number;
  ctaLabel: string;
  ctaHref: string;
}

interface WhatsMovingFeedProps {
  count: number;
  items: MovingItem[];
}

const kindColors: Record<MovingItemKind, string> = {
  score_upgrade:   "#22c55e",
  score_downgrade: "#ef4444",
  earnings:        "#f59e0b",
};

export function WhatsMovingFeed({ count, items }: WhatsMovingFeedProps) {
  return (
    <div
      style={{
        background: "var(--qc-card, #fff)",
        border: "1px solid var(--qc-hair, #E2E2E2)",
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--qc-ink, #0F172B)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            WHAT&apos;S MOVING IN YOUR STOCKS
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#888",
              background: "#F5F5F5",
              borderRadius: 4,
              padding: "1px 7px",
            }}
          >
            {count}
          </span>
        </div>
        <Link href="#" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>
          All updates →
        </Link>
      </div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
        Updates on stocks you hold or watch · scored by QC Insight
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr auto",
              gap: 16,
              alignItems: "start",
              padding: "14px 0",
              borderTop: idx > 0 ? "1px solid var(--qc-hair, #E2E2E2)" : undefined,
            }}
          >
            {/* Symbol + price */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink, #0F172B)" }}>{item.symbol}</div>
              <div style={{ fontSize: 12, color: item.priceChangePositive ? "#22c55e" : "#ef4444" }}>
                {item.price} {item.priceChange}
              </div>
            </div>

            {/* Body */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: kindColors[item.kind], marginBottom: 3 }}>
                {item.headlineLabel}
                {item.headlineDetail && (
                  <span style={{ color: "var(--qc-ink, #0F172B)", fontWeight: 400 }}> · {item.headlineDetail}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5, marginBottom: 3 }}>{item.body}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{item.holdingDetail}</div>
            </div>

            {/* QC Score + CTA */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                  QC SCORE
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: item.qcScore >= 70 ? "#22c55e" : item.qcScore >= 50 ? "#f59e0b" : "#ef4444",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink, #0F172B)" }}>{item.qcScore}</span>
                </div>
              </div>
              <Link
                href={item.ctaHref}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--qc-ink, #0F172B)",
                  background: "#F5F5F5",
                  border: "1px solid #E2E2E2",
                  borderRadius: 8,
                  padding: "5px 12px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {item.ctaLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
