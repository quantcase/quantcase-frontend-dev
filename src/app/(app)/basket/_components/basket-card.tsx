"use client";

import Link from "next/link";
import type { SampleBasket } from "../_lib/types";
import { fmtInr } from "../_lib/utils";

function riskTone(risk: string) {
  if (risk === "High") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)", border: "var(--qc-down)" };
  if (risk === "Low") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)", border: "var(--qc-up)" };
  return { color: "var(--qc-warn)", bg: "var(--qc-warn-soft)", border: "var(--qc-warn)" };
}

function healthTone(health: string) {
  if (health === "Improving") return { color: "var(--qc-up)", bg: "var(--qc-up-soft)" };
  if (health === "Weakening") return { color: "var(--qc-down)", bg: "var(--qc-down-soft)" };
  return { color: "var(--qc-ink-3)", bg: "var(--qc-section)" };
}

export function BasketCard({ basket }: { basket: SampleBasket }) {
  const risk = riskTone(basket.risk);
  const health = healthTone(basket.health);
  const retPos = basket.returnVal >= 0;
  const slug = basket.slug!;

  return (
    <Link
      href={`/basket/${encodeURIComponent(slug)}`}
      className="flex flex-col gap-2.5 rounded-[10px] border p-4 transition-shadow hover:shadow-[var(--qc-shadow-shell)]"
      style={{ background: "var(--qc-card)", borderColor: "var(--qc-hair)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold leading-snug" style={{ color: "var(--qc-ink)" }}>
          {basket.name}
        </h3>
        <span
          className="shrink-0 rounded-full border px-2 py-0.5 text-[9.5px] font-medium"
          style={{ color: risk.color, background: risk.bg, borderColor: risk.border }}
        >
          {basket.risk} Risk
        </span>
      </div>

      <p className="min-h-[32px] text-[11px] leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
        {basket.rationale}
      </p>

      <div
        className="grid grid-cols-2 gap-x-3 gap-y-2 border-t pt-2.5"
        style={{ borderColor: "var(--qc-hair)" }}
      >
        <Stat label="Stocks" value={String(basket.stocks)} />
        <Stat label="Min. Investment" value={fmtInr(basket.minInv)} />
        <Stat
          label={basket.returnLabel}
          value={`${retPos ? "+" : ""}${basket.returnVal}%`}
          valueColor={retPos ? "var(--qc-up)" : "var(--qc-down)"}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--qc-ink-3)" }}>
            Volatility
          </span>
          <span className="flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--qc-ink)" }}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  basket.volatility === "High"
                    ? "var(--qc-down)"
                    : basket.volatility === "Low"
                      ? "var(--qc-up)"
                      : "var(--qc-warn)",
              }}
            />
            {basket.volatility}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <span
          className="rounded-full px-2 py-0.5 text-[9.5px] font-medium"
          style={{ color: health.color, background: health.bg }}
        >
          {basket.health}
        </span>
        <span
          className="text-[11px]"
          style={{ color: basket.fee === "Free" ? "var(--qc-up)" : "var(--qc-ink-2)" }}
        >
          {basket.fee}
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] uppercase tracking-wide" style={{ color: "var(--qc-ink-3)" }}>
        {label}
      </span>
      <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: valueColor ?? "var(--qc-ink)" }}>
        {value}
      </span>
    </div>
  );
}
