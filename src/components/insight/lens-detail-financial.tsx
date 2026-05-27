"use client";

import { useState } from "react";
import { LensDrawerSummaryCard } from "@/components/insight/LensDrawerSummaryCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import type { LensDetail, TopSignal } from "@/hooks/useLenses";
import type { Signal } from "@/hooks/useSignals";

interface Props {
  lens: LensDetail;
  signals: Signal[];
}

// ── static sparkline data per metric (quarterly Q1FY25→Q3FY26) ──────────────
const REVENUE_DATA = [
  { q: "Q1FY25", value: 1680 },
  { q: "Q2FY25", value: 1820 },
  { q: "Q3FY25", value: 1910 },
  { q: "Q4FY25", value: 1980 },
  { q: "Q1FY26", value: 2160 },
  { q: "Q2FY26", value: 2650 },
  { q: "Q3FY26", value: 2887 },
];

const EBITDA_MARGIN_DATA = [
  { q: "Q1FY25", reported: 11.4, exGf: 11.4 },
  { q: "Q2FY25", reported: 11.5, exGf: 11.4 },
  { q: "Q3FY25", reported: 11.2, exGf: 12.1 },
  { q: "Q4FY25", reported: 10.8, exGf: 12.0 },
  { q: "Q1FY26", reported: 10.3, exGf: 11.6 },
  { q: "Q2FY26", reported: 10.1, exGf: 11.4 },
  { q: "Q3FY26", reported: 9.1, exGf: 11.3 },
];

const NET_CASH_DATA = [
  { q: "Q1FY25", value: 148 },
  { q: "Q2FY25", value: 162 },
  { q: "Q3FY25", value: 130 },
  { q: "Q4FY25", value: 128 },
  { q: "Q1FY26", value: 118 },
  { q: "Q2FY26", value: 104 },
  { q: "Q3FY26", value: 98 },
];

const DSO_DATA = [
  { q: "Q1FY25", value: 37, target: 39 },
  { q: "Q2FY25", value: 37, target: 39 },
  { q: "Q3FY25", value: 37, target: 39 },
  { q: "Q4FY25", value: 38, target: 39 },
  { q: "Q1FY26", value: 41, target: 39 },
  { q: "Q2FY26", value: 47, target: 39 },
  { q: "Q3FY26", value: 49, target: 39 },
];

const CAPEX_DATA = [
  { q: "Q1FY25", value: 66 },
  { q: "Q2FY25", value: 70 },
  { q: "Q3FY25", value: 73 },
  { q: "Q4FY25", value: 95 },
  { q: "Q1FY26", value: 108 },
  { q: "Q2FY26", value: 115 },
  { q: "Q3FY26", value: 150 },
];

const ROCE_DATA = [
  { name: "MSUMI", value: 40, highlight: true },
  { name: "MOTHERSON", value: 15.4, highlight: false },
  { name: "Ind. Avg", value: 16.8, highlight: false },
  { name: "MINDA", value: 17.2, highlight: false },
  { name: "SCHAEFFLER", value: 23.9, highlight: false },
];

type RowKey = "revenue" | "margin" | "balance" | "workingcap" | "capex" | "returns";

interface FinRow {
  key: RowKey;
  category: string;
  metric: string;
  sub: string;
  current: string;
  vsPrior: string;
  vsPriorColor: string;
  status: string;
  statusColor: string;
  statusBg: string;
}

function buildRows(lens: LensDetail, topSignals: TopSignal[]): FinRow[] {
  const km = lens.key_metrics;

  const revGrowth = topSignals.find((s) => s.metric === "MSWIL_REV" && s.unit === "%");
  const revAbs = topSignals.find((s) => s.metric === "MSWIL_REV" && s.unit === "Cr");
  const ebitdaMargin = topSignals.find((s) => s.metric === "EBITDA_MARGIN_REP");
  const ebitdaGrowth = topSignals.find((s) => s.metric === "MSWIL_EBITDA" && s.unit === "%");
  const gfRevGrowth = topSignals.find((s) => s.metric === "SEG_GREENFIELD_REV" && s.label.includes("9M"));
  const gfEbitdaGrowth = topSignals.find((s) => s.metric === "SEG_GREENFIELD_EBITDA" && s.label.includes("9M"));

  return [
    {
      key: "revenue",
      category: "Revenue",
      metric: "Top-line growth",
      sub: "Volume + copper pass-through",
      current: revAbs ? `₹${revAbs.actual_value?.toLocaleString("en-IN")} Cr` : `₹${km["MSWIL_Revenue_Q3_FY26"] ?? "2,887"} Cr`,
      vsPrior: revGrowth ? `↑ +${revGrowth.actual_value}% YoY` : `↑ +${km["MSWIL_Revenue_Growth_YoY"] ?? "25.5%"} YoY`,
      vsPriorColor: "var(--qc-up)",
      status: "STRONG",
      statusColor: "var(--qc-up)",
      statusBg: "var(--qc-up-soft)",
    },
    {
      key: "margin",
      category: "Margin",
      metric: "EBITDA margin",
      sub: "Greenfield + copper drag",
      current: ebitdaMargin ? `${ebitdaMargin.actual_value}%` : km["Reported_EBITDA_Margin_Q3"] ?? "12.5%",
      vsPrior: ebitdaGrowth ? `↓ -${(25.5 - (ebitdaGrowth.actual_value ?? 10.5)).toFixed(0)}bps YoY` : "↓ -200bps YoY",
      vsPriorColor: "var(--qc-down)",
      status: "PRESSURED",
      statusColor: "var(--qc-warn)",
      statusBg: "var(--qc-warn-soft)",
    },
    {
      key: "balance",
      category: "Balance sheet",
      metric: "Net debt / cash",
      sub: "No equity dilution",
      current: "Net cash ₹98 Cr",
      vsPrior: "D/E 0.01",
      vsPriorColor: "var(--qc-up)",
      status: "PRISTINE",
      statusColor: "var(--qc-up)",
      statusBg: "var(--qc-up-soft)",
    },
    {
      key: "workingcap",
      category: "Working cap",
      metric: "DSO expansion",
      sub: "Recv. +38.8% vs rev +12.1%",
      current: "49 days",
      vsPrior: "↑ +10 days YoY",
      vsPriorColor: "var(--qc-warn)",
      status: "WATCH",
      statusColor: "var(--qc-warn)",
      statusBg: "var(--qc-warn-soft)",
    },
    {
      key: "capex",
      category: "Capex",
      metric: "Capital expenditure",
      sub: "Greenfield investment cycle",
      current: "₹150 Cr",
      vsPrior: "↑ from ₹104 Cr",
      vsPriorColor: "var(--qc-warn)",
      status: "RISING",
      statusColor: "var(--qc-warn)",
      statusBg: "var(--qc-warn-soft)",
    },
    {
      key: "returns",
      category: "Returns",
      metric: "ROCE",
      sub: "Parent MSUMI consolidated",
      current: "40%+",
      vsPrior: "vs industry 16.8%",
      vsPriorColor: "var(--qc-up)",
      status: "BEST-IN-CLASS",
      statusColor: "var(--qc-up)",
      statusBg: "var(--qc-up-soft)",
    },
  ];
}

// ── Chart panel ──────────────────────────────────────────────────────────────

const CHART_UP = "#1F7A4A";
const CHART_WARN = "#B4731A";
const CHART_MUTED = "#9A9A92";
const CHART_PEER = "#d1d5db";

function ChartRevenue() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>Revenue — Top-line Growth</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quarterly · FY25–Q3 FY26 · ₹ Crore</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Q3 FY26", value: "₹2,887 Cr" },
            { label: "YoY Growth", value: "+25.5%" },
            { label: "QoQ", value: "+4.5%" },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: CHART_UP, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_UP} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_UP} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="q" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} domain={[1400, "auto"]} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number) => [`₹${v.toLocaleString("en-IN")} Cr`, "Revenue"]}
            />
            <Area type="monotone" dataKey="value" stroke={CHART_UP} strokeWidth={2} fill="url(#revGrad)" dot={(props: { cx: number; cy: number; index: number }) => {
              const isLast = props.index === REVENUE_DATA.length - 1;
              return isLast ? <circle key="dot-last" cx={props.cx} cy={props.cy} r={4} fill={CHART_UP} stroke="white" strokeWidth={1.5} /> : <g key={`dot-${props.index}`} />;
            }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <span style={{ display: "inline-block", width: 16, height: 2, background: CHART_UP, borderRadius: 1 }} />
        <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue (₹ Cr)</span>
      </div>
    </div>
  );
}

function ChartMargin() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>EBITDA Margin — Compression Trend</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quarterly · Reported vs Ex-Greenfield · %</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Reported", value: "9.1%", color: CHART_WARN },
            { label: "Ex-Greenfield", value: "11.3%", color: CHART_UP },
            { label: "YoY Δ", value: "-200bps", color: CHART_WARN },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={EBITDA_MARGIN_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="q" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[8, 13]} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number, name: string) => [`${v}%`, name === "reported" ? "Reported EBITDA %" : "Ex-Greenfield %"]}
            />
            <Line type="monotone" dataKey="reported" stroke={CHART_WARN} strokeWidth={2} dot={(props: { cx: number; cy: number; index: number }) => {
              const isLast = props.index === EBITDA_MARGIN_DATA.length - 1;
              return isLast ? <circle key="dot-r" cx={props.cx} cy={props.cy} r={4} fill={CHART_WARN} stroke="white" strokeWidth={1.5} /> : <circle key={`dot-r-${props.index}`} cx={props.cx} cy={props.cy} r={2} fill={CHART_WARN} />;
            }} />
            <Line type="monotone" dataKey="exGf" stroke={CHART_UP} strokeWidth={1.5} strokeDasharray="5 3" dot={(props: { cx: number; cy: number; index: number }) => {
              const isLast = props.index === EBITDA_MARGIN_DATA.length - 1;
              return isLast ? <circle key="dot-g" cx={props.cx} cy={props.cy} r={4} fill={CHART_UP} stroke="white" strokeWidth={1.5} /> : <circle key={`dot-g-${props.index}`} cx={props.cx} cy={props.cy} r={2} fill={CHART_UP} />;
            }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 16, height: 2, background: CHART_WARN, borderRadius: 1 }} />
          <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Reported EBITDA %</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke={CHART_UP} strokeWidth="1.5" strokeDasharray="5 3" /></svg>
          <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Ex-Greenfield</span>
        </div>
      </div>
    </div>
  );
}

function ChartBalance() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>Balance Sheet — Net Cash Position</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quarterly · ₹ Crore · Positive = Net Cash</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Net Cash", value: "₹98 Cr" },
            { label: "D/E Ratio", value: "0.01" },
            { label: "Int. Coverage", value: "28.5×" },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: CHART_UP, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={NET_CASH_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="q" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} domain={[0, 200]} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number) => [`₹${v} Cr`, "Net Cash"]}
            />
            <Bar dataKey="value" fill={CHART_UP} fillOpacity={0.55} radius={[2, 2, 0, 0]}
              label={false}
            >
              {NET_CASH_DATA.map((_, i) => (
                <rect key={i} fill={i === NET_CASH_DATA.length - 1 ? CHART_UP : `${CHART_UP}88`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <span style={{ display: "inline-block", width: 10, height: 10, background: CHART_UP, borderRadius: 2 }} />
        <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Net Cash (₹ Cr)</span>
      </div>
    </div>
  );
}

function ChartWorkingCap() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>Working Capital — DSO Expansion</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Days Sales Outstanding · Quarterly Trend</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Current DSO", value: "49 days", color: CHART_WARN },
            { label: "YoY Δ", value: "+10d", color: CHART_WARN },
            { label: "Prior Year", value: "39d", color: CHART_MUTED },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DSO_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="q" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} domain={[30, 56]} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number, name: string) => [`${v}d`, name === "value" ? "DSO" : "Target"]}
            />
            <Line type="monotone" dataKey="value" stroke={CHART_WARN} strokeWidth={2} dot={(props: { cx: number; cy: number; index: number }) => {
              const isLast = props.index === DSO_DATA.length - 1;
              return isLast ? <circle key="dso-last" cx={props.cx} cy={props.cy} r={4} fill={CHART_WARN} stroke="white" strokeWidth={1.5} /> : <circle key={`dso-${props.index}`} cx={props.cx} cy={props.cy} r={2} fill={CHART_WARN} />;
            }} />
            <Line type="monotone" dataKey="target" stroke={CHART_MUTED} strokeWidth={1} strokeDasharray="5 3" dot={(props: { cx: number; cy: number; index: number }) => <circle key={`t-${props.index}`} cx={props.cx} cy={props.cy} r={2} fill={CHART_MUTED} />} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 16, height: 2, background: CHART_WARN, borderRadius: 1 }} />
          <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>DSO (Days)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke={CHART_MUTED} strokeWidth="1.5" strokeDasharray="5 3" /></svg>
          <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Target (39d)</span>
        </div>
      </div>
    </div>
  );
}

function ChartCapex() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>Capital Expenditure — Greenfield Cycle</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quarterly Capex · ₹ Crore</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Q3 FY26", value: "₹150 Cr", color: CHART_WARN },
            { label: "vs Prior Yr", value: "+44%", color: CHART_WARN },
            { label: "Primary Driver", value: "Greenfield", color: "var(--qc-ink)" },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CAPEX_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" vertical={false} />
            <XAxis dataKey="q" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} domain={[0, 190]} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number) => [`₹${v} Cr`, "Capex"]}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {CAPEX_DATA.map((_, i) => (
                <rect key={i} fill={i === CAPEX_DATA.length - 1 ? CHART_WARN : `${CHART_WARN}66`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <span style={{ display: "inline-block", width: 10, height: 10, background: CHART_WARN, borderRadius: 2 }} />
        <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>Capex (₹ Cr)</span>
      </div>
    </div>
  );
}

function ChartReturns() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", margin: "0 0 2px" }}>ROCE — Best-in-Class vs Peers</p>
        <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Return on Capital Employed · FY26 · %</p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "MSUMI ROCE", value: "40%+", color: CHART_UP },
            { label: "vs Industry", value: "+2320bps", color: CHART_UP },
            { label: "Sector Avg", value: "16.8%", color: CHART_MUTED },
          ].map((m) => (
            <div key={m.label}>
              <p style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--qc-ink-3)", margin: "0 0 2px" }}>{m.label}</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: m.color, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ROCE_DATA} layout="vertical" margin={{ top: 8, right: 40, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--qc-hair)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 48]} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: CHART_MUTED }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              contentStyle={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 6, fontSize: 11 }}
              formatter={(v: number) => [`${v}%`, "ROCE"]}
            />
            <Bar dataKey="value" radius={[0, 2, 2, 0]}
              label={{ position: "right", fontSize: 9, fill: CHART_MUTED, formatter: (v: number) => `${v}%` }}
            >
              {ROCE_DATA.map((d, i) => (
                <rect key={i} fill={d.highlight ? CHART_UP : CHART_PEER} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <span style={{ display: "inline-block", width: 10, height: 10, background: CHART_UP, borderRadius: 2 }} />
        <span style={{ fontSize: 9, color: CHART_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>ROCE (%)</span>
      </div>
    </div>
  );
}

function ChartPanel({ activeKey }: { activeKey: RowKey }) {
  switch (activeKey) {
    case "revenue": return <ChartRevenue />;
    case "margin": return <ChartMargin />;
    case "balance": return <ChartBalance />;
    case "workingcap": return <ChartWorkingCap />;
    case "capex": return <ChartCapex />;
    case "returns": return <ChartReturns />;
  }
}

// ── KPI strip ────────────────────────────────────────────────────────────────

function KpiStrip({ topSignals, km }: { topSignals: TopSignal[]; km: Record<string, string> }) {
  const revAbs = topSignals.find((s) => s.metric === "MSWIL_REV" && s.unit === "Cr");
  const revGrowth = topSignals.find((s) => s.metric === "MSWIL_REV" && s.unit === "%");
  const ebitdaMargin = topSignals.find((s) => s.metric === "EBITDA_MARGIN_REP");
  const ebitdaAbs = topSignals.find((s) => s.metric === "MSWIL_EBITDA" && s.unit === "Cr");

  const tiles = [
    {
      label: "REVENUE TTM",
      value: revAbs ? `₹${revAbs.actual_value?.toLocaleString("en-IN")} Cr` : `₹${km["MSWIL_Revenue_Q3_FY26"] ?? "2,887"} Cr`,
      sub: revGrowth ? `+${revGrowth.actual_value}% YoY — volume + copper pass-through` : "+25.5% YoY — volume + copper pass-through",
      color: "var(--qc-up)",
    },
    {
      label: "EBITDA MARGIN",
      value: ebitdaMargin ? `${ebitdaMargin.actual_value}%` : km["Reported_EBITDA_Margin_Q3"] ?? "12.5%",
      sub: `Ex-greenfield: ${km["MSWIL_EBITDA_Growth_YoY"] ?? "10.5%"} — drag is temporary`,
      color: "var(--qc-warn)",
    },
    {
      label: "INTEREST COVERAGE",
      value: "28.5×",
      sub: "Net cash ₹98 Cr — effectively debt-free",
      color: "var(--qc-up)",
    },
    {
      label: "DSO (DAYS)",
      value: "49d",
      sub: "Up from 39d — receivables stretch emerging",
      color: "var(--qc-warn)",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>
      {tiles.map((t, i) => (
        <div
          key={t.label}
          style={{
            padding: "14px 16px",
            background: "var(--qc-section)",
            borderRight: i < 3 ? "1px solid var(--qc-hair)" : undefined,
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: t.color, margin: "0 0 4px" }}>{t.label}</p>
          <p style={{ fontSize: 22, fontWeight: 600, color: t.color, margin: "0 0 4px", lineHeight: 1.1 }}>{t.value}</p>
          <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, lineHeight: 1.4 }}>{t.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export function LensDetailFinancial({ lens, signals }: Props) {
  const topSignals: TopSignal[] = lens.top_signals ?? [];
  const [activeKey, setActiveKey] = useState<RowKey>("revenue");

  const rows = buildRows(lens, topSignals);
  const activeRow = rows.find((r) => r.key === activeKey)!;

  const rowBorderColor = (key: RowKey) => {
    const r = rows.find((x) => x.key === key)!;
    return r.statusColor;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI strip */}
      <KpiStrip topSignals={topSignals} km={lens.key_metrics} />

      {/* Main split: table | chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px solid var(--qc-hair)", borderRadius: 10, overflow: "hidden" }}>

        {/* Left — signal table */}
        <div style={{ borderRight: "1px solid var(--qc-hair)" }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "70px 1fr 90px 110px 90px",
            gap: 8,
            padding: "8px 14px",
            background: "var(--qc-section)",
            borderBottom: "1px solid var(--qc-hair)",
          }}>
            {["SIGNAL", "METRIC", "CURRENT", "VS PRIOR", "STATUS"].map((h) => (
              <p key={h} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", margin: 0 }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, i) => {
            const isActive = row.key === activeKey;
            return (
              <div
                key={row.key}
                onClick={() => setActiveKey(row.key)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 90px 110px 90px",
                  gap: 8,
                  alignItems: "center",
                  padding: "11px 14px",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--qc-hair)" : undefined,
                  background: isActive ? `${rowBorderColor(row.key)}10` : "var(--qc-card)",
                  borderLeft: isActive ? `3px solid ${rowBorderColor(row.key)}` : "3px solid transparent",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: 0, fontWeight: 500, lineHeight: 1.3 }}>{row.category}</p>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.metric}</p>
                  <p style={{ fontSize: 9, color: "var(--qc-ink-3)", margin: "2px 0 0", lineHeight: 1.3 }}>{row.sub}</p>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", margin: 0 }}>{row.current}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: row.vsPriorColor, margin: 0 }}>{row.vsPrior}</p>
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: row.statusColor, background: row.statusBg,
                  padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap",
                }}>
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right — chart panel */}
        <div style={{ padding: "16px 16px 12px", background: "var(--qc-card)", display: "flex", flexDirection: "column", minHeight: 320 }}>
          <ChartPanel activeKey={activeKey} />
        </div>
      </div>

      {/* Summary footer */}
      <LensDrawerSummaryCard
        title="Robust financial strength with best-in-class capital returns."
        body={lens.takeaway}
        metrics={[
          { label: "Revenue Q3", value: `₹${lens.key_metrics["MSWIL_Revenue_Q3_FY26"] ?? "2,887"} Cr`, sub: `+${lens.key_metrics["MSWIL_Revenue_Growth_YoY"] ?? "25.5%"} YoY` },
          { label: "ROCE", value: "40%+", sub: "vs industry 16.8%" },
          { label: "Net Cash", value: "₹98 Cr", sub: "D/E ratio 0.01" },
        ]}
      />
    </div>
  );
}
