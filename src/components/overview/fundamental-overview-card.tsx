"use client";

import { formatINR } from "@/lib/utils";
import type { ScreenerData, QuarterlyTrend } from "@/types/screener";


function yoyText(growth: number | null | undefined, invert = false): { text: string; cls: string } {
  if (growth == null) return { text: "—", cls: "na" };
  const sign = growth >= 0 ? "+" : "";
  const pctStr = `${sign}${(growth * 100).toFixed(1)}% YoY`;
  const isPositiveRaw = growth >= 0;
  const isPositive = invert ? !isPositiveRaw : isPositiveRaw;
  return { text: pctStr, cls: isPositive ? "pos" : "neg" };
}

function sparkPoints(data: QuarterlyTrend[], key: keyof QuarterlyTrend, invert = false): string {
  const vals = data
    .map((q) => q[key] as number | null)
    .filter((v) => v != null) as number[];
  if (vals.length === 0) return "";
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = 100 / Math.max(vals.length - 1, 1);
  return vals
    .map((v, i) => {
      const x = i * step;
      const normalized = (v - min) / range;
      const y = invert ? normalized * 18 + 2 : (1 - normalized) * 18 + 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface SparklineProps {
  data: QuarterlyTrend[];
  dataKey: keyof QuarterlyTrend;
  positive: boolean;
  invert?: boolean;
}

function Sparkline({ data, dataKey, positive, invert = false }: SparklineProps) {
  const points = sparkPoints(data, dataKey, invert);
  if (!points) return null;
  const color = positive ? "var(--qc-up, #1F7A4A)" : "var(--qc-down, #B23A2F)";
  return (
    <svg
      viewBox="0 0 100 22"
      preserveAspectRatio="none"
      style={{ height: 22, marginTop: 2, display: "block", width: "100%" }}
    >
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  yoy: { text: string; cls: string };
  muted?: boolean;
  spark?: React.ReactNode;
}

function KpiCard({ label, value, unit, yoy, muted, spark }: KpiCardProps) {
  return (
    <div
      style={{
        background: muted ? "var(--qc-surface-tinted, #F5F5F5)" : "var(--qc-surface-white, #FFFFFF)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minHeight: 112,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11.5, color: "var(--qc-text-body, #5A5A54)", letterSpacing: ".01em" }}>
          {label}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5,
            padding: "2px 6px",
            borderRadius: 4,
            letterSpacing: ".02em",
            fontWeight: 500,
            lineHeight: 1.3,
            background:
              yoy.cls === "pos"
                ? "var(--qc-up-soft, #E3F1E8)"
                : yoy.cls === "neg"
                ? "var(--qc-down-soft, #F7E6E3)"
                : "var(--qc-chip, #F2F1EC)",
            color:
              yoy.cls === "pos"
                ? "var(--qc-up, #1F7A4A)"
                : yoy.cls === "neg"
                ? "var(--qc-down, #B23A2F)"
                : "var(--qc-text-muted, #9A9A92)",
          }}
        >
          {yoy.text}
        </span>
      </div>
      {muted ? (
        <div
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: "var(--qc-text-muted, #9A9A92)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.1,
            marginTop: "auto",
          }}
        >
          —
        </div>
      ) : (
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            color: "var(--qc-text-heading, #0E0E0C)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.1,
            marginTop: "auto",
          }}
        >
          {value}
          {unit && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "var(--qc-text-muted, #9A9A92)",
                marginLeft: 3,
                letterSpacing: 0,
              }}
            >
              {unit}
            </span>
          )}
        </div>
      )}
      {spark}
    </div>
  );
}

interface QBarProps {
  label: string;
  value: string;
  fillPct: number;
  fillColor: string;
  benchmarkPct: number;
  subLeft: string;
  subRight: string;
}

function QBar({ label, value, fillPct, fillColor, benchmarkPct, subLeft, subRight }: QBarProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--qc-text-body, #5A5A54)", fontWeight: 500 }}>{label}</span>
        <span
          style={{
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            color: "var(--qc-text-heading, #0E0E0C)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--qc-chip, #F2F1EC)",
          borderRadius: 999,
          overflow: "visible",
          marginBottom: 6,
          position: "relative",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            borderRadius: 999,
            width: `${Math.min(fillPct, 100)}%`,
            background: fillColor,
          }}
        />
        <span
          style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            width: 2,
            left: `${benchmarkPct}%`,
            background: "var(--qc-text-heading, #0E0E0C)",
            opacity: 0.5,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--qc-text-muted, #9A9A92)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{subLeft}</span>
        <b
          style={{
            color: "var(--qc-text-body, #5A5A54)",
            fontWeight: 500,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {subRight}
        </b>
      </div>
    </div>
  );
}

interface Props {
  data: ScreenerData;
}

export function FundamentalOverviewCard({ data }: Props) {
  const fp = data.financialPerformance;
  const val = data.valuation;
  const eff = data.efficiency;
  const own = data.ownership;
  const ratios = data.ratios;
  const perShare = data.perShare;
  const qt = fp.quarterlyTrend ?? [];

  const pe = val.peRatio;
  const industryPE = val.industryPE;

  const verdictLabel =
    val.peValuationLabel === "Discount" || val.peValuationLabel === "Undervalued"
      ? "Undervalued"
      : val.peValuationLabel === "Premium" || val.peValuationLabel === "Overvalued"
      ? "Overvalued"
      : val.peValuationLabel === "Fair"
      ? "Fair Value"
      : val.peValuationLabel ?? "—";

  const benchmarkPct =
    industryPE && pe
      ? Math.min(Math.max((pe / (industryPE * 2)) * 100, 5), 95)
      : 33;

  const roceVal = ratios.roce;
  const roeVal = ratios.roe;
  const deVal = eff.debtToEquity;

  const roceFillPct = roceVal != null ? Math.min((roceVal / 50) * 100, 100) : 0;
  const roeFillPct = roeVal != null ? Math.min((roeVal / 50) * 100, 100) : 0;
  const deFillPct = deVal != null ? Math.min((deVal / 3) * 100, 100) : 0;

  const roceIsGood = roceVal != null && roceVal > 15;
  const roeIsGood = roeVal != null && roeVal > 12;
  const deIsGood = deVal != null && deVal < 1;

  const promoterPct = own.promoter != null ? own.promoter * 100 : null;
  const fiiPct = own.fii != null ? own.fii * 100 : own.institutions != null ? own.institutions * 100 : null;
  const diiPct = own.dii != null ? own.dii * 100 : null;
  const publicPct = own.public != null ? own.public * 100 : null;

  const ownTotal = (promoterPct ?? 0) + (fiiPct ?? 0) + (diiPct ?? 0) + (publicPct ?? 0);
  const hasOwnData = ownTotal > 0;

  const ownSegments = [
    { label: "Promoter", pct: promoterPct, color: "var(--qc-text-heading, #0E0E0C)" },
    { label: "FII", pct: fiiPct, color: "var(--qc-blue, #3A6BEF)" },
    { label: "DII", pct: diiPct, color: "var(--qc-up, #1F7A4A)" },
    { label: "Public", pct: publicPct, color: "var(--qc-text-muted, #9A9A92)" },
  ];

  const revenueYoy = yoyText(fp.revenueGrowth);
  const ebitdaYoy = yoyText(fp.ebitdaGrowth);
  const netProfitYoy = yoyText(fp.netProfitGrowth);
  const cfoYoy = yoyText(fp.cfoGrowth);
  const fcfYoy = yoyText(fp.fcfGrowth);
  const reservesYoy = yoyText(fp.reservesGrowth);
  const debtYoy = yoyText(eff.debtGrowth, true);

  const narr = (() => {
    const parts: string[] = [];
    if (verdictLabel === "Undervalued") parts.push("Trading at a discount to the sector median.");
    else if (verdictLabel === "Overvalued") parts.push("Trading at a premium to the sector median.");
    else parts.push("Valuation is broadly in line with sector peers.");
    if (roceIsGood) parts.push("Returns on capital are strong.");
    if (deIsGood) parts.push("Balance sheet leverage is modest.");
    return parts.join(" ");
  })();

  const tags: { label: string; color: string }[] = [];
  if (verdictLabel === "Undervalued") tags.push({ label: "Undervalued", color: "var(--qc-up, #1F7A4A)" });
  if (verdictLabel === "Overvalued") tags.push({ label: "Overvalued", color: "var(--qc-down, #B23A2F)" });
  if (roceIsGood) tags.push({ label: "High ROCE", color: "var(--qc-up, #1F7A4A)" });
  if (roeIsGood) tags.push({ label: "High ROE", color: "var(--qc-up, #1F7A4A)" });
  if (!deIsGood && deVal != null) tags.push({ label: "Elevated D/E", color: "var(--qc-warn, #B4731A)" });
  if (deIsGood && deVal != null) tags.push({ label: "Low leverage", color: "var(--qc-text-muted, #9A9A92)" });

  return (
    <div
      style={{
        background: "var(--qc-surface-row-alt, #EFEDE7)",
        border: "1px solid var(--qc-border-default, #E9E7E1)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      {/* Section title */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          letterSpacing: ".12em",
          color: "var(--qc-text-body, #5A5A54)",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Fundamentals
      </div>

      {/* Hero row: Valuation hero (left) + Narrative (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, marginBottom: 14 }}>

        {/* LEFT: Valuation hero card */}
        <section
          style={{
            background: "var(--qc-surface-white, #FFFFFF)",
            border: "1px solid var(--qc-border-default, #E9E7E1)",
            borderRadius: 18,
            padding: "18px 22px 20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: ".16em",
                color: "var(--qc-text-muted, #9A9A92)",
                textTransform: "uppercase",
              }}
            >
              Valuation · P/E
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 999,
                background: "var(--qc-lime-soft, #EAF7BC)",
                border: "1px solid #D9E8A6",
                color: "#2E4A0A",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".04em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#6B9E1F", display: "inline-block" }}
              />
              {verdictLabel}
            </span>
          </div>

          {/* Main: PE figure + benchmark bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 24,
              alignItems: "end",
              paddingBottom: 18,
              borderBottom: "1px solid var(--qc-border-inner, #EFEDE7)",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12.5, color: "var(--qc-text-body, #5A5A54)", marginBottom: 4 }}>
                Current P/E ratio
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 500,
                  letterSpacing: "-0.035em",
                  lineHeight: 1,
                  color: "var(--qc-text-heading, #0E0E0C)",
                  fontVariantNumeric: "tabular-nums",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                {pe != null ? pe.toFixed(1) : "—"}
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    color: "var(--qc-text-muted, #9A9A92)",
                  }}
                >
                  x
                </span>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--qc-text-body, #5A5A54)",
                  marginTop: 8,
                  lineHeight: 1.4,
                  maxWidth: 340,
                }}
              >
                {narr}
              </div>
            </div>

            {/* Benchmark bar */}
            <div style={{ minWidth: 260 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                  fontSize: 12,
                  color: "var(--qc-text-body, #5A5A54)",
                }}
              >
                <span>vs. Industry</span>
                <b
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 500,
                    color: "var(--qc-text-heading, #0E0E0C)",
                  }}
                >
                  {industryPE != null ? `${industryPE.toFixed(1)}x` : "—"}
                </b>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 22,
                  background: "linear-gradient(90deg,#E8F3C9 0%, #F3EBC8 55%, #F7D8C8 100%)",
                  borderRadius: 6,
                  overflow: "visible",
                }}
              >
                {/* Median tick at 50% */}
                <div
                  style={{
                    position: "absolute",
                    top: -3,
                    bottom: -3,
                    left: "50%",
                    width: 2,
                    background: "rgba(14,14,12,0.3)",
                  }}
                />
                {/* Current PE marker */}
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    bottom: -6,
                    left: `calc(${benchmarkPct}% - 6px)`,
                    width: 12,
                    borderRadius: 4,
                    background: "#0E0E0C",
                    border: "2px solid #fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,.18)",
                  }}
                  title={`P/E ${pe?.toFixed(1)}x`}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  color: "var(--qc-text-muted, #9A9A92)",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                <span>Cheap</span>
                <span>Median</span>
                <span>Rich</span>
              </div>
            </div>
          </div>

          {/* Sub metrics: PEG / EV·EBITDA / P/B / Div Yield */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 0,
            }}
          >
            {[
              { k: "PEG", v: val.pegRatio != null ? `${val.pegRatio.toFixed(1)}x` : "—", sub: "Growth-adjusted" },
              { k: "EV / EBITDA", v: val.evToEbitda != null ? `${val.evToEbitda.toFixed(1)}x` : "—", sub: "Enterprise multiple" },
              { k: "P / B", v: perShare.bookValue != null && pe != null ? `${(pe / (pe / (val.pbRatio ?? 1))).toFixed(1)}x` : (val.pbRatio != null ? `${val.pbRatio.toFixed(1)}x` : "—"), sub: "Book value" },
              { k: "Dividend Yield", v: perShare.dividendYield != null ? `${(perShare.dividendYield * 100).toFixed(2)}%` : "—", sub: "Trailing 12M" },
            ].map(({ k, v, sub }, i, arr) => (
              <div
                key={k}
                style={{
                  padding: "0 16px",
                  borderRight: i < arr.length - 1 ? "1px solid var(--qc-border-inner, #EFEDE7)" : "none",
                  minWidth: 0,
                  paddingLeft: i === 0 ? 0 : undefined,
                  paddingRight: i === arr.length - 1 ? 0 : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--qc-text-muted, #9A9A92)",
                    letterSpacing: ".02em",
                    marginBottom: 4,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: v === "—" ? 400 : 500,
                    letterSpacing: "-0.01em",
                    color: v === "—" ? "var(--qc-text-muted, #9A9A92)" : "var(--qc-text-heading, #0E0E0C)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {v}
                </div>
                <div style={{ fontSize: 11, color: "var(--qc-text-muted, #9A9A92)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: Narrative card */}
        <aside
          style={{
            background: "var(--qc-surface-white, #FFFFFF)",
            border: "1px solid var(--qc-border-default, #E9E7E1)",
            borderRadius: 18,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Lime gradient overlay at bottom */}
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              height: "60%",
              background: "linear-gradient(180deg, transparent 0%, var(--qc-lime-bg, #E9F4C4) 100%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: ".16em",
                color: "var(--qc-text-muted, #9A9A92)",
                textTransform: "uppercase",
              }}
            >
              What the numbers say
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                color: "var(--qc-text-heading, #0E0E0C)",
              }}
            >
              {verdictLabel === "Undervalued"
                ? "Cheap on earnings — potential upside if growth holds."
                : verdictLabel === "Overvalued"
                ? "Priced at a premium — execution must justify the multiple."
                : "Fairly valued against sector peers."}
            </div>
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--qc-text-body, #5A5A54)",
                margin: 0,
              }}
            >
              {narr}
              {roceIsGood || roeIsGood
                ? " Return metrics indicate efficient capital deployment."
                : " Return metrics warrant monitoring."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
              {tags.map(({ label, color }) => (
                <span
                  key={label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "var(--qc-surface-white, #FFFFFF)",
                    border: "1px solid var(--qc-border-default, #E9E7E1)",
                    fontSize: 11.5,
                    color: "var(--qc-text-body, #5A5A54)",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Key Metrics eyebrow */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          letterSpacing: ".14em",
          color: "var(--qc-text-muted, #9A9A92)",
          textTransform: "uppercase",
          margin: "4px 0 10px",
        }}
      >
        Key Metrics · Latest fiscal
      </div>

      {/* KPI grid — 4 columns, 2 rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 1,
          background: "var(--qc-border-default, #E9E7E1)",
          border: "1px solid var(--qc-border-default, #E9E7E1)",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <KpiCard
          label="Revenue"
          value={formatINR(fp.revenue)}
          yoy={revenueYoy}
          spark={
            <Sparkline
              data={qt}
              dataKey="revenue"
              positive={revenueYoy.cls === "pos"}
            />
          }
        />
        <KpiCard
          label="EBITDA"
          value={fp.ebitda != null ? formatINR(fp.ebitda) : "—"}
          yoy={ebitdaYoy}
          muted={fp.ebitda == null}
          spark={
            fp.ebitda != null ? (
              <Sparkline data={qt} dataKey="ebitda" positive={ebitdaYoy.cls === "pos"} />
            ) : undefined
          }
        />
        <KpiCard
          label="Net Profit"
          value={fp.netProfit != null ? formatINR(fp.netProfit) : "—"}
          yoy={netProfitYoy}
          muted={fp.netProfit == null}
          spark={
            fp.netProfit != null ? (
              <Sparkline data={qt} dataKey="netIncome" positive={netProfitYoy.cls === "pos"} />
            ) : undefined
          }
        />
        <KpiCard
          label="CFO"
          value={fp.operatingCashflow != null ? formatINR(fp.operatingCashflow) : "—"}
          yoy={cfoYoy}
          muted={fp.operatingCashflow == null}
          spark={
            fp.operatingCashflow != null ? (
              <Sparkline data={qt} dataKey="revenue" positive={cfoYoy.cls === "pos"} />
            ) : undefined
          }
        />
        <KpiCard
          label="FCF"
          value={fp.freeCashflow != null ? formatINR(fp.freeCashflow) : "—"}
          yoy={fcfYoy}
          muted={fp.freeCashflow == null}
          spark={
            fp.freeCashflow != null ? (
              <Sparkline data={qt} dataKey="revenue" positive={fcfYoy.cls === "pos"} />
            ) : undefined
          }
        />
        <KpiCard
          label="Reserves"
          value={fp.reserves != null ? formatINR(fp.reserves) : "—"}
          yoy={reservesYoy}
          muted={fp.reserves == null}
          spark={
            fp.reserves != null ? (
              <Sparkline data={qt} dataKey="totalEquity" positive={reservesYoy.cls === "pos"} />
            ) : undefined
          }
        />
        <KpiCard
          label="Debt"
          value={eff.totalDebt != null ? formatINR(eff.totalDebt) : "—"}
          yoy={debtYoy}
          muted={eff.totalDebt == null}
          spark={
            eff.totalDebt != null ? (
              <Sparkline data={qt} dataKey="totalDebt" positive={debtYoy.cls === "pos"} invert />
            ) : undefined
          }
        />
        <KpiCard
          label="Interest Coverage"
          value="—"
          yoy={{ text: "—", cls: "na" }}
          muted
        />
      </div>

      {/* Quality: ROCE / ROE / D/E with benchmarks */}
      <div
        style={{
          background: "var(--qc-surface-white, #FFFFFF)",
          border: "1px solid var(--qc-border-default, #E9E7E1)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 14,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div
          style={{
            minWidth: 160,
            paddingRight: 16,
            borderRight: "1px solid var(--qc-border-inner, #EFEDE7)",
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: ".16em",
              color: "var(--qc-text-muted, #9A9A92)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Returns &amp; Leverage
          </div>
          <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 500, letterSpacing: "-0.005em" }}>
            {roceIsGood && roeIsGood
              ? "Strong capital efficiency"
              : deIsGood
              ? "Conservative balance sheet"
              : "Capital metrics in review"}
          </h4>
          <p style={{ margin: 0, fontSize: 11.5, color: "var(--qc-text-body, #5A5A54)", lineHeight: 1.45 }}>
            {roceIsGood
              ? "ROCE is comfortably above industry benchmarks, reflecting efficient use of capital."
              : "Return metrics are being tracked against industry peers."}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <QBar
            label="ROCE"
            value={roceVal != null ? `${roceVal.toFixed(1)}%` : "—"}
            fillPct={roceFillPct}
            fillColor={roceIsGood ? "var(--qc-up, #1F7A4A)" : "var(--qc-warn, #B4731A)"}
            benchmarkPct={30}
            subLeft="Industry avg"
            subRight={ratios.roce3yAvg != null ? `~${ratios.roce3yAvg.toFixed(0)}%` : "~15%"}
          />
          <QBar
            label="ROE"
            value={roeVal != null ? `${roeVal.toFixed(1)}%` : "—"}
            fillPct={roeFillPct}
            fillColor={roeIsGood ? "var(--qc-up, #1F7A4A)" : "var(--qc-warn, #B4731A)"}
            benchmarkPct={25}
            subLeft="Industry avg"
            subRight={ratios.roe3yAvg != null ? `~${ratios.roe3yAvg.toFixed(0)}%` : "~12%"}
          />
          <QBar
            label="Debt / Equity"
            value={deVal != null ? `${deVal.toFixed(2)}x` : "—"}
            fillPct={deFillPct}
            fillColor={deIsGood ? "var(--qc-warn, #B4731A)" : "var(--qc-down, #B23A2F)"}
            benchmarkPct={33}
            subLeft={deIsGood ? "Moderate" : "Elevated"}
            subRight="≤1.0 healthy"
          />
        </div>
      </div>

      {/* Ownership */}
      <div
        style={{
          background: "var(--qc-surface-white, #FFFFFF)",
          border: "1px solid var(--qc-border-default, #E9E7E1)",
          borderRadius: 14,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
          }}
        >
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Shareholding</h4>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10.5,
              color: "var(--qc-text-muted, #9A9A92)",
              letterSpacing: ".06em",
              textTransform: "uppercase",
            }}
          >
            Latest disclosure
          </span>
        </div>

        {/* Stacked ownership bar */}
        <div
          style={{
            display: "flex",
            height: 28,
            borderRadius: 8,
            overflow: "hidden",
            gap: 2,
            marginBottom: 10,
          }}
        >
          {hasOwnData ? (
            ownSegments
              .filter((s) => s.pct != null && s.pct > 0)
              .map(({ label, pct: p, color }) => (
                <div
                  key={label}
                  style={{
                    flex: p ?? 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    padding: "0 10px",
                    color: "#fff",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 500,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    background: color,
                    minWidth: 0,
                  }}
                >
                  {(p ?? 0) > 10 ? `${p?.toFixed(1)}%` : ""}
                </div>
              ))
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "0 10px",
                color: "var(--qc-text-muted, #9A9A92)",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                background:
                  "repeating-linear-gradient(45deg,#F2F1EC,#F2F1EC 6px,#EAE9E2 6px,#EAE9E2 12px)",
              }}
            >
              Awaiting disclosure
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {ownSegments.map(({ label, pct: p, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                paddingLeft: 10,
                borderLeft: `2px solid ${color}`,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--qc-text-muted, #9A9A92)",
                  letterSpacing: ".02em",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: p != null ? 500 : 400,
                  color:
                    p != null
                      ? "var(--qc-text-heading, #0E0E0C)"
                      : "var(--qc-text-muted, #9A9A92)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.005em",
                }}
              >
                {p != null ? `${p.toFixed(1)}%` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
