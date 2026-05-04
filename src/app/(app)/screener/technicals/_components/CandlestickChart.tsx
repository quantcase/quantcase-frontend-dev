"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type IPaneApi,
  type CandlestickData,
  type LineData,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import type { PriceBar, IndicatorPoint, PriceIndicators } from "@/hooks/usePrices";
import type { EngineTab } from "./TechnicalsRuleEngine";
import type {
  TechnicalsSupportResistanceRaw,
  StructureEngineData,
} from "@/types/technicals";

export type ChartMode = "DEFAULT" | EngineTab;

interface Props {
  prices: PriceBar[];
  indicators: PriceIndicators | null;
  chartMode: ChartMode;
  loading: boolean;
  error: string | null;
  supportResistance?: TechnicalsSupportResistanceRaw;
  structureEngine?: StructureEngineData;
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

// Design token hex values — resolved for purple theme (mirrored from --qc-* CSS vars for chart API use)
const QC_HEADING = "#1A0A2E";
const QC_MUTED   = "#7C6998";
const QC_UP      = "#15803D";
const QC_DOWN    = "#B91C1C";
const QC_BORDER  = "#E4DCF0";
const QC_GRID    = "#EDE8F5";

const OVERLAY_CONFIGS: Record<ChartMode, LineConfig[]> = {
  DEFAULT: [
    { key: "sma50",  color: QC_DOWN,    lineWidth: 1, title: "SMA 50" },
    { key: "sma200", color: QC_HEADING, lineWidth: 2, title: "SMA 200" },
  ],
  STRUCTURE: [],
  TREND: [
    { key: "sma20",  color: QC_MUTED,   lineWidth: 1, title: "SMA 20" },
    { key: "sma50",  color: "#9333EA",  lineWidth: 1, title: "SMA 50" },
    { key: "sma100", color: "#6B21A8",  lineWidth: 1, title: "SMA 100" },
    { key: "sma200", color: QC_HEADING, lineWidth: 2, title: "SMA 200" },
  ],
  TIMING: [
    { key: "bbUpper",  color: QC_MUTED,   lineWidth: 1, title: "BB Upper" },
    { key: "bbMiddle", color: QC_HEADING, lineWidth: 1, title: "BB Mid" },
    { key: "bbLower",  color: QC_MUTED,   lineWidth: 1, title: "BB Lower" },
  ],
  "RELATIVE STRENGTH": [],
};

const OSCILLATOR_CONFIGS: Record<ChartMode, OscillatorConfig | null> = {
  DEFAULT:   { key: "rsi14", color: QC_HEADING, title: "RSI (14)", height: 80 },
  STRUCTURE: { key: "cmf14", color: QC_HEADING, title: "CMF (14)", height: 80 },
  TREND:     { key: "adx14", color: QC_HEADING, title: "ADX (14)", height: 80 },
  TIMING:    { key: "bbWidth" as keyof PriceIndicators, color: QC_HEADING, title: "BB Width", height: 80 },
  "RELATIVE STRENGTH": null,
};

// RSI divergence detection
interface DivergenceMarker {
  time: Time;
  value: number;
  type: "bull" | "bear";
}

function detectRsiDivergences(
  priceBars: PriceBar[],
  rsiPoints: IndicatorPoint[],
  lookback: number = 5,
  minSpan: number = 10,
): DivergenceMarker[] {
  // Build aligned arrays: only dates present in both
  const rsiMap = new Map<string, number>();
  for (const p of rsiPoints) {
    if (p.value !== null) rsiMap.set(p.date, p.value);
  }

  const sorted = [...priceBars]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((p) => rsiMap.has(p.date));

  if (sorted.length < minSpan + lookback * 2) return [];

  const highs = sorted.map((p) => p.high);
  const lows = sorted.map((p) => p.low);
  const rsis = sorted.map((p) => rsiMap.get(p.date)!);
  const dates = sorted.map((p) => p.date);

  // Find local peaks and troughs in RSI
  const peaks: number[] = [];
  const troughs: number[] = [];

  for (let i = lookback; i < rsis.length - lookback; i++) {
    let isPeak = true;
    let isTrough = true;
    for (let j = 1; j <= lookback; j++) {
      if (rsis[i] <= rsis[i - j] || rsis[i] <= rsis[i + j]) isPeak = false;
      if (rsis[i] >= rsis[i - j] || rsis[i] >= rsis[i + j]) isTrough = false;
    }
    if (isPeak) peaks.push(i);
    if (isTrough) troughs.push(i);
  }

  const markers: DivergenceMarker[] = [];

  // Bearish divergence: price higher high but RSI lower high
  for (let k = 1; k < peaks.length; k++) {
    const prev = peaks[k - 1];
    const curr = peaks[k];
    if (curr - prev < minSpan) continue;
    if (highs[curr] > highs[prev] && rsis[curr] < rsis[prev] - 2) {
      markers.push({ time: dates[curr] as Time, value: rsis[curr], type: "bear" });
    }
  }

  // Bullish divergence: price lower low but RSI higher low
  for (let k = 1; k < troughs.length; k++) {
    const prev = troughs[k - 1];
    const curr = troughs[k];
    if (curr - prev < minSpan) continue;
    if (lows[curr] < lows[prev] && rsis[curr] > rsis[prev] + 2) {
      markers.push({ time: dates[curr] as Time, value: rsis[curr], type: "bull" });
    }
  }

  return markers;
}

interface LegendItem {
  key: string;
  title: string;
  color: string;
  isOsc: boolean;
  visible: boolean;
}



export function CandlestickChart({
  prices, indicators, chartMode, loading, error,
  supportResistance, structureEngine,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const subPanesRef = useRef<IPaneApi<Time>[]>([]);
  const srLinesRef = useRef<ISeriesApi<"Line">[]>([]);

  const overlayMapRef = useRef<Map<string, { series: ISeriesApi<"Line">; isOsc: boolean }>>(new Map());
  const rsiMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  const [legendItems, setLegendItems] = useState<LegendItem[]>([]);

  const ohlcBarRef = useRef<HTMLDivElement>(null);

  // Initialize chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#FFFFFF" }, // --qc-surface-white
        textColor: QC_MUTED,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: QC_GRID },
        horzLines: { color: QC_GRID },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: QC_BORDER },
      timeScale: { borderColor: QC_BORDER, timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 380,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: QC_UP,
      downColor: QC_DOWN,
      borderUpColor: QC_UP,
      borderDownColor: QC_DOWN,
      wickUpColor: QC_UP,
      wickDownColor: QC_DOWN,
    });

    // Volume histogram overlay on the main pane
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderVisible: false,
      visible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

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
        const opts = series.options() as { color?: string };
        const color = opts.color ?? QC_MUTED;
        const row = `<span style="color:${QC_MUTED}">${title}</span><span style="color:${color};font-weight:500">${d.value.toFixed(2)}</span>`;
        if (isOsc) oscRows.push(row); else mainRows.push(row);
      });

      // Volume tooltip
      const volData = param.seriesData.get(volumeSeries) as { value: number } | undefined;
      const volRow = volData
        ? `<span style="color:${QC_MUTED}">Vol</span><span style="color:${QC_HEADING};font-weight:500">${formatVolume(volData.value)}</span>`
        : "";

      const divider = oscRows.length
        ? `<div style="border-top:1px solid ${QC_BORDER};margin:5px 0"></div>`
        : "";

      tooltip.innerHTML = `
        <div style="font-size:10px;font-weight:600;color:${QC_HEADING};margin-bottom:5px;font-family:IBM Plex Mono,monospace;text-transform:uppercase;letter-spacing:0.12em">${dateStr}</div>
        <div style="display:grid;grid-template-columns:auto auto;column-gap:12px;row-gap:3px;font-size:11px">
          <span style="color:${QC_MUTED}">O</span><span style="color:${QC_HEADING};font-weight:500">${data.open.toFixed(2)}</span>
          <span style="color:${QC_MUTED}">H</span><span style="color:${QC_UP};font-weight:500">${data.high.toFixed(2)}</span>
          <span style="color:${QC_MUTED}">L</span><span style="color:${QC_DOWN};font-weight:500">${data.low.toFixed(2)}</span>
          <span style="color:${QC_MUTED}">C</span><span style="color:${QC_HEADING};font-weight:500">${data.close.toFixed(2)}</span>
          ${volRow}
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
      volumeSeriesRef.current = null;
      overlayMapRef.current.clear();
      srLinesRef.current = [];
      subPanesRef.current = [];
      if (rsiMarkersRef.current) { rsiMarkersRef.current.detach(); rsiMarkersRef.current = null; }
    };
  }, []);

  // Load candle + volume data
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || prices.length === 0) return;
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

    // Write latest candle OHLC directly to DOM — never changes on hover
    const last = sorted[sorted.length - 1];
    if (last && ohlcBarRef.current) {
      const chg = last.close - last.open;
      const chgPct = last.open !== 0 ? (chg / last.open) * 100 : 0;
      const sign = chg >= 0 ? "+" : "";
      const chgColor = chg >= 0 ? QC_UP : QC_DOWN;
      const tiles = [
        { label: "O", value: last.open.toFixed(2), color: QC_HEADING },
        { label: "H", value: last.high.toFixed(2), color: QC_UP },
        { label: "L", value: last.low.toFixed(2), color: QC_DOWN },
        { label: "C", value: last.close.toFixed(2), color: QC_HEADING },
        { label: "CHG", value: `${sign}${chg.toFixed(2)}`, color: chgColor },
        { label: "CHG%", value: `${sign}${chgPct.toFixed(2)}%`, color: chgColor },
      ];
      ohlcBarRef.current.innerHTML = tiles.map((t, i) =>
        `<div style="display:flex;flex-direction:column;align-items:flex-start;${i < tiles.length - 1 ? `padding-right:10px;border-right:1px solid ${QC_BORDER};margin-right:2px` : ""}">
          <span style="font-size:9px;color:${QC_MUTED};font-weight:500;text-transform:uppercase;letter-spacing:0.08em;line-height:1.2">${t.label}</span>
          <span style="font-size:11px;color:${t.color};font-weight:600;line-height:1.4">${t.value}</span>
        </div>`
      ).join("");
      ohlcBarRef.current.style.display = "flex";
    }

    // Volume bars colored by candle direction
    volumeSeriesRef.current.setData(sorted.map((p) => ({
      time: p.date as Time,
      value: p.volume,
      color: p.close >= p.open ? "rgba(21,128,61,0.22)" : "rgba(185,28,28,0.22)",
    })));

    chartRef.current?.timeScale().fitContent();
  }, [prices]);

  // Support / Resistance horizontal lines
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const showSR = chartMode === "DEFAULT" || chartMode === "STRUCTURE";
    if (!chart || !candleSeries || !supportResistance || !showSR) {
      // Remove existing S/R lines when not in structure mode
      srLinesRef.current.forEach((s) => {
        try { chart?.removeSeries(s); } catch { /* ok */ }
      });
      srLinesRef.current = [];
      return;
    }

    // Remove old S/R lines
    srLinesRef.current.forEach((s) => {
      try { chart.removeSeries(s); } catch { /* ok */ }
    });
    srLinesRef.current = [];

    if (prices.length === 0) return;

    const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = sorted[0].date as Time;
    const lastDate = sorted[sorted.length - 1].date as Time;

    // Draw support lines (green)
    for (const level of supportResistance.static.support.slice(0, 2)) {
      if (!level) continue;
      const s = chart.addSeries(LineSeries, {
        color: QC_UP,
        lineWidth: 1,
        lineStyle: 0, // Solid
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: false,
        title: "SUPPORT",
      });
      s.setData([
        { time: firstDate, value: level },
        { time: lastDate, value: level },
      ]);
      srLinesRef.current.push(s);
    }

    // Draw resistance lines (red)
    for (const level of supportResistance.static.resistance.slice(0, 2)) {
      if (!level) continue;
      const s = chart.addSeries(LineSeries, {
        color: QC_DOWN,
        lineWidth: 1,
        lineStyle: 0,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: false,
        title: "RESISTANCE",
      });
      s.setData([
        { time: firstDate, value: level },
        { time: lastDate, value: level },
      ]);
      srLinesRef.current.push(s);
    }
  }, [supportResistance, prices, chartMode]);

  // Rebuild overlays on tab/indicators change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Remove all existing overlay series
    overlayMapRef.current.forEach(({ series }) => {
      try { chart.removeSeries(series); } catch { /* ok */ }
    });
    overlayMapRef.current.clear();

    // Remove RSI divergence markers
    if (rsiMarkersRef.current) { rsiMarkersRef.current.detach(); rsiMarkersRef.current = null; }

    // Remove oscillator sub-panes (remove from highest index down)
    for (let i = subPanesRef.current.length; i >= 1; i--) {
      try { chart.removePane(i); } catch { /* ok */ }
    }
    subPanesRef.current = [];

    if (!indicators) {
      setLegendItems([]);
      return;
    }

    const nextLegend: LegendItem[] = [];

    // Main pane overlays
    for (const cfg of OVERLAY_CONFIGS[chartMode]) {
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

    const sorted = [...prices].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = sorted[0]?.date as Time | undefined;
    const lastDate = sorted[sorted.length - 1]?.date as Time | undefined;

    // Helper: add one oscillator pane with a line series, returning the series and pane index
    const addOscPane = (
      paneIndex: number,
      data: LineData[],
      color: string,
      title: string,
      legendKey: string,
    ): ISeriesApi<"Line"> | null => {
      if (data.length === 0) return null;
      subPanesRef.current.push(chart.addPane());
      const s = chart.addSeries(LineSeries, {
        color, lineWidth: 1 as const, title,
        priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false,
      }, paneIndex);
      s.setData(data);
      overlayMapRef.current.set(legendKey, { series: s, isOsc: true });
      nextLegend.push({ key: legendKey, title, color, isOsc: true, visible: true });
      return s;
    };

    // TIMING: two panes — BBWidth (pane 1) + RSI (pane 2)
    if (chartMode === "TIMING") {
      const bbwData = (() => {
        const upperMap = new Map(indicators.bbUpper.filter(p => p.value !== null).map(p => [p.date, p.value as number]));
        const middleMap = new Map(indicators.bbMiddle.filter(p => p.value !== null).map(p => [p.date, p.value as number]));
        const lowerMap = new Map(indicators.bbLower.filter(p => p.value !== null).map(p => [p.date, p.value as number]));
        const result: LineData[] = [];
        upperMap.forEach((upper, date) => {
          const middle = middleMap.get(date);
          const lower = lowerMap.get(date);
          if (middle && lower && middle !== 0) {
            result.push({ time: date as Time, value: (upper - lower) / middle * 100 });
          }
        });
        return result.sort((a, b) => String(a.time).localeCompare(String(b.time)));
      })();
      addOscPane(1, bbwData, QC_HEADING, "BB Width", "BB Width");

      const rsiData = toLineData(indicators.rsi14);
      const rsiSeries = addOscPane(2, rsiData, QC_HEADING, "RSI (14)", "RSI (14)");
      if (rsiSeries && firstDate && lastDate) {
        for (const [refVal, label] of [[30, "__rsi_30"], [70, "__rsi_70"]] as const) {
          const refLine = chart.addSeries(LineSeries, {
            color: QC_MUTED, lineWidth: 1, lineStyle: 2,
            priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: "",
          }, 2);
          refLine.setData([{ time: firstDate, value: refVal }, { time: lastDate, value: refVal }]);
          overlayMapRef.current.set(label, { series: refLine, isOsc: true });
        }
        const divergences = detectRsiDivergences(prices, indicators.rsi14);
        if (divergences.length > 0) {
          const markers: SeriesMarker<Time>[] = divergences.map((d) => ({
            time: d.time,
            position: d.type === "bear" ? "aboveBar" as const : "belowBar" as const,
            shape: "square" as const,
            color: d.type === "bear" ? QC_DOWN : QC_UP,
            text: d.type === "bear" ? "Bear" : "Bull",
            size: 0.5,
          }));
          rsiMarkersRef.current = createSeriesMarkers(rsiSeries, markers);
        }
      }
    } else {
      // Single oscillator pane for all other modes
      const oscCfg = OSCILLATOR_CONFIGS[chartMode];
      if (oscCfg) {
        const data = toLineData(indicators[oscCfg.key]);
        const s = addOscPane(1, data, oscCfg.color, oscCfg.title, oscCfg.title);
        if (s && firstDate && lastDate) {
          if (oscCfg.key === "cmf14") {
            const zeroLine = chart.addSeries(LineSeries, {
              color: QC_MUTED, lineWidth: 1, lineStyle: 0,
              priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: "",
            }, 1);
            zeroLine.setData([{ time: firstDate, value: 0 }, { time: lastDate, value: 0 }]);
            overlayMapRef.current.set("__cmf_zero", { series: zeroLine, isOsc: true });
          }
          if (oscCfg.key === "adx14") {
            const adx15Line = chart.addSeries(LineSeries, {
              color: QC_MUTED, lineWidth: 1, lineStyle: 0,
              priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: "",
            }, 1);
            adx15Line.setData([{ time: firstDate, value: 15 }, { time: lastDate, value: 15 }]);
            overlayMapRef.current.set("__adx_15", { series: adx15Line, isOsc: true });
          }
          if (oscCfg.key === "rsi14") {
            for (const [refVal, label] of [[30, "__rsi_30"], [70, "__rsi_70"]] as const) {
              const refLine = chart.addSeries(LineSeries, {
                color: QC_MUTED, lineWidth: 1, lineStyle: 2,
                priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: "",
              }, 1);
              refLine.setData([{ time: firstDate, value: refVal }, { time: lastDate, value: refVal }]);
              overlayMapRef.current.set(label, { series: refLine, isOsc: true });
            }
            const divergences = detectRsiDivergences(prices, indicators.rsi14);
            if (divergences.length > 0) {
              const markers: SeriesMarker<Time>[] = divergences.map((d) => ({
                time: d.time,
                position: d.type === "bear" ? "aboveBar" as const : "belowBar" as const,
                shape: "square" as const,
                color: d.type === "bear" ? QC_DOWN : QC_UP,
                text: d.type === "bear" ? "Bear" : "Bull",
                size: 0.5,
              }));
              rsiMarkersRef.current = createSeriesMarkers(s, markers);
            }
          }
        }
      }
    }

    // Average volume line (DEFAULT + STRUCTURE modes)
    if ((chartMode === "DEFAULT" || chartMode === "STRUCTURE") && prices.length > 0) {
      const sortedPrices = [...prices].sort((a, b) => a.date.localeCompare(b.date));
      const period = 20;
      const avgVolData: LineData[] = [];
      for (let i = period - 1; i < sortedPrices.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) sum += sortedPrices[j].volume;
        avgVolData.push({ time: sortedPrices[i].date as Time, value: sum / period });
      }
      if (avgVolData.length > 0) {
        const avgVolSeries = chart.addSeries(LineSeries, {
          color: QC_MUTED,
          lineWidth: 1,
          priceScaleId: "volume",
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
          title: "",
        });
        avgVolSeries.setData(avgVolData);
        overlayMapRef.current.set("Avg Vol (20)", { series: avgVolSeries, isOsc: false });
        nextLegend.push({ key: "Avg Vol (20)", title: "Avg Vol (20)", color: QC_MUTED, isOsc: false, visible: true });
      }
    }

    setLegendItems(nextLegend);
  }, [chartMode, indicators, prices]);

  const toggleLegendItem = useCallback((key: string) => {
    setLegendItems(prev => prev.map(item => {
      if (item.key !== key) return item;
      const next = !item.visible;
      overlayMapRef.current.get(key)?.series.applyOptions({ visible: next });
      return { ...item, visible: next };
    }));
  }, []);

  // Derive Wyckoff phase and volume signal for the structure badge
  const showStructureBadges = chartMode === "STRUCTURE";
  const wyckoffPhase = showStructureBadges ? structureEngine?.marketStructure?.wyckoffPhase : null;
  const volumeSignal = showStructureBadges ? structureEngine?.participation?.volumeSignal : null;

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "rgba(255,255,255,0.85)" }}>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--qc-text-muted)" }}>Loading prices...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "rgba(255,255,255,0.85)" }}>
          <span className="font-mono text-[11px]" style={{ color: "var(--qc-down)" }}>{error}</span>
        </div>
      )}

      {/* OHLC info bar — written once via DOM ref when prices load, never touched by React re-renders */}
      <div
        ref={ohlcBarRef}
        className="absolute top-2 left-2 z-10 items-center gap-1 font-mono select-none backdrop-blur-sm rounded-[6px] px-2 py-1.5"
        style={{ display: "none", background: "rgba(255,255,255,0.88)", border: `1px solid ${QC_BORDER}` }}
      />

      {/* Phase + Volume Signal badges */}
      {(wyckoffPhase || volumeSignal) && (
        <div className="absolute top-2 right-14 z-10 flex items-center gap-2">
          {wyckoffPhase && (
            <span
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-[4px] backdrop-blur-sm"
              style={{ color: "var(--qc-down)", background: "var(--qc-down-soft)" }}
            >
              PHASE: {wyckoffPhase.toUpperCase()}
            </span>
          )}
          {volumeSignal && (
            <span
              className="font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-0.5 rounded-[4px] backdrop-blur-sm"
              style={{ color: "var(--qc-text-muted)", background: "var(--qc-surface-row-alt)" }}
            >
              Vol: {volumeSignal}
            </span>
          )}
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
                className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                style={{ color: item.visible ? item.color : "var(--qc-text-muted)" }}
              >
                {item.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-20 hidden rounded-[8px] border px-3 py-2 shadow-md backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: "var(--qc-border-default)", minWidth: 160 }}
      />
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(0);
}
