"use client";

import { useState } from "react";
import { ArrowUpRight, Layers } from "lucide-react";
import { fmtLakhs, fmtSignedPct } from "@/lib/portfolio-format";
import { Badge } from "@/components/ds";
import type { SmallcaseBasket } from "@/types/smallcase";

// Return % for a basket: total_returns as a share of invested (current − returns).
// smallcase gives absolute returns, not a %, so we derive it from the cost base.
function basketReturnPct(basket: SmallcaseBasket): number | null {
  const invested = basket.current_value - basket.total_returns;
  if (invested <= 0) return null;
  return (basket.total_returns / invested) * 100;
}

// Square thumbnail for the basket's smallcase image, with a glyph fallback on error
// (external CDN images can 404 or be blocked).
function BasketThumb({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const box: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
    border: "1px solid var(--qc-hair)", background: "var(--qc-bg)",
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
  };
  if (failed || !src) {
    return (
      <div style={box}>
        <Layers size={18} strokeWidth={1.75} style={{ color: "var(--qc-ink-3)" }} />
      </div>
    );
  }
  return (
    <div style={box}>
      {/* eslint-disable-next-line @next/next/no-img-element -- external smallcase CDN asset */}
      <img
        src={src}
        alt={name}
        width={40}
        height={40}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function BasketRow({ basket, last }: { basket: SmallcaseBasket; last: boolean }) {
  const returnPct = basketReturnPct(basket);
  const positive = basket.total_returns >= 0;

  return (
    <a
      href={basket.investment_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 14, alignItems: "center",
        padding: "14px 4px", textDecoration: "none",
        borderBottom: last ? "none" : "1px solid var(--qc-hair)",
      }}
    >
      <BasketThumb src={basket.image_url} name={basket.name} />

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {basket.name}
          </span>
          <ArrowUpRight size={13} strokeWidth={2} style={{ color: "var(--qc-ink-3)", flexShrink: 0 }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--qc-ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {basket.short_description || `${basket.constituents.length} stock${basket.constituents.length === 1 ? "" : "s"}`}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--qc-ink)", fontFamily: "var(--qc-font-mono)" }}>
          {fmtLakhs(basket.current_value)}
        </span>
        {returnPct != null && (
          <Badge variant={positive ? "up" : "crit"}>{fmtSignedPct(returnPct)}</Badge>
        )}
      </div>
    </a>
  );
}

// "BASKETS YOU OWN" — the smallcase baskets held in the connected account.
export function BasketsList({ baskets }: { baskets: SmallcaseBasket[] }) {
  if (baskets.length === 0) return null;

  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-3)", marginBottom: 12 }}>
        Baskets you own
      </div>
      <div>
        {baskets.map((b, i) => (
          <BasketRow key={b.scid} basket={b} last={i === baskets.length - 1} />
        ))}
      </div>
    </div>
  );
}
