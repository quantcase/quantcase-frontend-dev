"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type IPaneApi,
  type CandlestickData,
  type LineData,
  type Time,
} from "lightweight-charts";
import type { PriceBar, IndicatorPoint, PriceIndicators } from "@/hooks/usePrices";
import type { EngineTab } from "./TechnicalsRuleEngine";

interface Props {
  prices: PriceBar[];
  indicators: PriceIndicators | null;
  activeEngine: EngineTab;
  loading: boolean;
  error: string | null;
}

function toLineData(series: IndicatorPoint[]): LineData[] {
  return series
    .filter((p): p is { date: string; value: number } => p.value !== null)
    .map((p) => ({ time: p.date as Time, value: p.value }));
}

interface LineConfig {
  key: keyof PriceIndicators;
  color: string;
  lineWidth: 1 | 2 | 3 | 4;
  title: string;
}

interface OscillatorConfig {
  key: keyof PriceIndicators;
  color: string;
  title: string;
  height: number;
}

const OVERLAY_CONFIGS: Record<EngineTab, LineConfig[]> = {
  STRUCTURE: [
    { key: "bbUpper",  color: "#94a3b8", lineWidth: 1, title: "BB Upper" },
    { key: "bbMiddle", color: "#64748b", lineWidth: 1, title: "BB Mid" },
    { key: "bbLower",  color: "#94a3b8", lineWidth: 1, title: "BB Lower" },
  ],
  TREND: [
    { key: "sma20",  color: "#f59e0b", lineWidth: 1, title: "SMA 20" },
    { key: "sma50",  color: "#3b82f6", lineWidth: 1, title: "SMA 50" },
    { key: "sma100", color: "#8b5cf6", lineWidth: 1, title: "SMA 100" },
    { key: "sma200", color: "#ef4444", lineWidth: 2, title: "SMA 200" },
    { key: "ema20",  color: "#f97316", lineWidth: 1, title: "EMA 20" },
    { key: "ema50",  color: "#06b6d4", lineWidth: 1, title: "EMA 50" },
  ],
  TIMING: [
    { key: "bbUpper",  color: "#94a3b8", lineWidth: 1, title: "BB Upper" },
    { key: "bbMiddle", color: "#64748b", lineWidth: 1, title: "BB Mid" },
    { key: "bbLower",  color: "#94a3b8", lineWidth: 1, title: "BB Lower" },
  ],
  DOMINANCE: [],
};

const OSCILLATOR_CONFIGS: Record<EngineTab, OscillatorConfig | null> = {
  STRUCTURE: { key: "cmf14", color: "#3b82f6", title: "CMF (14)", height: 80 },
  TREND:     { key: "adx14", color: "#8b5cf6", title: "ADX (14)", height: 80 },
  TIMING:    { key: "rsi14", color: "#f59e0b", title: "RSI (14)", height: 80 },
  DOMINANCE: null,
};

interface LegendItem {
  key: string;        // unique stable key (title)
  title: string;
  color: string;
  isOsc: boolean;
  visible: boolean;
}

export function CandlestickChart({ prices, indicators, activeEngine, loading, error }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const subPaneRef = useRef<IPaneApi<Time> | null>(null);

  // Series store — keyed by title for stable lookup
  const overlayMapRef = useRef<Map<string, { series: ISeriesApi<"Line">; isOsc: boolean }>>(new Map());

  // React state drives legend UI re-renders
  const [legendItems, setLegendItems] = useState<LegendItem[]>([]);

  // Initialize chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#888888",
        fontFamily: "IBM Plex Sans, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#E2E2E2" },
      timeScale: { borderColor: "#E2E2E2", timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#059669",
      downColor: "#dc2626",
      borderUpColor: "#059669",
      borderDownColor: "#dc2626",
      wickUpColor: "#059669",
      wickDownColor: "#dc2626",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(containerRef.current);

    chart.subscribeCrosshairMove((param) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      if (!param.time || !param.seriesData.size) { tooltip.style.display = "none"; return; }
      const data = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      if (!data) { tooltip.style.display = "none"; return; }

      const container = containerRef.current!;
      const { x, y } = param.point ?? { x: 0, y: 0 };
      tooltip.style.display = "block";
      tooltip.style.left = `${Math.min(x + 16, container.clientWidth - 200)}px`;
      tooltip.style.top = `${Math.max(y - 80, 8)}px`;

      const dateStr = typeof data.time === "string"
        ? data.time
        : new Date((data.time as number) * 1000).toISOString().slice(0, 10);

      const mainRows: string[] = [];
      const oscRows: string[] = [];

      overlayMapRef.current.forEach(({ series, isOsc }, title) => {
        const d = param.seriesData.get(series) as { value: number } | undefined;
        if (!d) return;
        // Get color from series options
        const opts = series.options() as { color?: string };
        const color = opts.color ?? "#888888";
        const row = `<span style="color:#888888">${title}</span><span style="color:${color};font-weight:500">${d.value.toFixed(2)}</span>`;
        if (isOsc) oscRows.push(row); else mainRows.push(row);
      });

      const divider = oscRows.length
        ? `<div style="border-top:1px solid rgba(226,226,226,0.6);margin:5px 0"></div>`
        : "";

      tooltip.innerHTML = `
        <div style="font-size:10px;font-weight:600;color:#0F172B;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em">${dateStr}</div>
        <div style="display:grid;grid-template-columns:auto auto;column-gap:12px;row-gap:3px;font-size:11px">
          <span style="color:#888888">O</span><span style="color:#0F172B;font-weight:500">${data.open.toFixed(2)}</span>
          <span style="color:#888888">H</span><span style="color:#059669;font-weight:500">${data.high.toFixed(2)}</span>
          <span style="color:#888888">L</span><span style="color:#dc2626;font-weight:500">${data.low.toFixed(2)}</span>
          <span style="color:#888888">C</span><span style="color:#0F172B;font-weight:500">${data.close.toFixed(2)}</span>
          ${mainRows.join("")}
        </div>
        ${divider}
        ${oscRows.length ? `<div style="display:grid;grid-template-columns:auto auto;column-gap:12px;row-gap:3px;font-size:11px">${oscRows.join("")}</div>` : ""}
      `;
    });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      overlayMapRef.current.clear();
      subPaneRef.current = null;
    };
  }, []);

  // Load candle data
  useEffect(() => {
    if (!candleSeriesRef.current || prices.length === 0) return;
    const sorted = [...prices]
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((p, i, arr) => i === 0 || p.date !== arr[i - 1].date);
    candleSeriesRef.current.setData(sorted.map((p) => ({
      time: p.date as Time,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    })));
    chartRef.current?.timeScale().fitContent();
  }, [prices]);

  // Rebuild overlays on tab/indicators change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove all existing overlay series
    overlayMapRef.current.forEach(({ series }) => {
      try { chart.removeSeries(series); } catch { /* ok */ }
    });
    overlayMapRef.current.clear();

    // Remove oscillator sub-pane
    if (subPaneRef.current) {
      chart.removePane(1);
      subPaneRef.current = null;
    }

    if (!indicators) {
      setLegendItems([]);
      return;
    }

    const nextLegend: LegendItem[] = [];

    // Main pane overlays
    for (const cfg of OVERLAY_CONFIGS[activeEngine]) {
      const data = toLineData(indicators[cfg.key]);
      if (data.length === 0) continue;
      const s = chart.addSeries(LineSeries, {
        color: cfg.color,
        lineWidth: cfg.lineWidth,
        title: cfg.title,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: false,
      });
      s.setData(data);
      overlayMapRef.current.set(cfg.title, { series: s, isOsc: false });
      nextLegend.push({ key: cfg.title, title: cfg.title, color: cfg.color, isOsc: false, visible: true });
    }

    // Oscillator sub-pane
    const oscCfg = OSCILLATOR_CONFIGS[activeEngine];
    if (oscCfg) {
      const data = toLineData(indicators[oscCfg.key]);
      if (data.length > 0) {
        subPaneRef.current = chart.addPane();
        const s = chart.addSeries(LineSeries, {
          color: oscCfg.color,
          lineWidth: 1 as const,
          title: oscCfg.title,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: false,
        }, 1);
        s.setData(data);
        overlayMapRef.current.set(oscCfg.title, { series: s, isOsc: true });
        nextLegend.push({ key: oscCfg.title, title: oscCfg.title, color: oscCfg.color, isOsc: true, visible: true });
      }
    }

    setLegendItems(nextLegend);
  }, [activeEngine, indicators]);

  const toggleLegendItem = useCallback((key: string) => {
    setLegendItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      const next = !item.visible;
      overlayMapRef.current.get(key)?.series.applyOptions({ visible: next });
      return { ...item, visible: next };
    }));
  }, []);

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <span className="text-sm text-[#888888]">Loading prices...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      <div ref={containerRef} className="w-full" />

      {/* Legend */}
      {legendItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 pt-2 pb-1">
          {legendItems.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleLegendItem(item.key)}
              className="flex items-center gap-1.5 group"
              style={{ opacity: item.visible ? 1 : 0.35 }}
            >
              {/* Swatch — line for main overlays, circle for oscillators */}
              {item.isOsc ? (
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
              ) : (
                <span
                  className="inline-block h-[2px] w-4 flex-shrink-0 rounded-full"
                  style={{ background: item.color }}
                />
              )}
              <span
                className="text-[10px] font-medium uppercase tracking-wide transition-colors"
                style={{ color: item.visible ? item.color : "#aaa" }}
              >
                {item.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-20 hidden rounded-[8px] border border-[#E2E2E2] px-3 py-2 shadow-md backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.82)", minWidth: 160 }}
      />
    </div>
  );
}
