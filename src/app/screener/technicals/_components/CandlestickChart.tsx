"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import type { PriceBar } from "@/hooks/usePrices";

interface Props {
  prices: PriceBar[];
  loading: boolean;
  error: string | null;
}

export function CandlestickChart({ prices, loading, error }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#E2E2E2",
      },
      timeScale: {
        borderColor: "#E2E2E2",
        timeVisible: true,
      },
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

      if (!param.time || !param.seriesData.size) {
        tooltip.style.display = "none";
        return;
      }

      const data = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      if (!data) {
        tooltip.style.display = "none";
        return;
      }

      const container = containerRef.current!;
      const { x, y } = param.point ?? { x: 0, y: 0 };
      const left = Math.min(x + 16, container.clientWidth - 200);
      const top = Math.max(y - 80, 8);

      tooltip.style.display = "block";
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;

      const dateStr = typeof data.time === "string"
        ? data.time
        : new Date((data.time as number) * 1000).toISOString().slice(0, 10);

      tooltip.innerHTML = `
        <div style="font-size:10px;font-weight:600;color:#0F172B;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">${dateStr}</div>
        <div style="display:grid;grid-template-columns:auto auto;column-gap:12px;row-gap:2px;font-size:11px">
          <span style="color:#888888">Open</span><span style="color:#0F172B;font-weight:500">${data.open.toFixed(2)}</span>
          <span style="color:#888888">High</span><span style="color:#059669;font-weight:500">${data.high.toFixed(2)}</span>
          <span style="color:#888888">Low</span><span style="color:#dc2626;font-weight:500">${data.low.toFixed(2)}</span>
          <span style="color:#888888">Close</span><span style="color:#0F172B;font-weight:500">${data.close.toFixed(2)}</span>
        </div>
      `;
    });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || prices.length === 0) return;

    const sorted = [...prices]
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((p, i, arr) => i === 0 || p.date !== arr[i - 1].date);
    const candleData: CandlestickData[] = sorted.map((p) => ({
      time: p.date as Time,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    }));

    candleSeriesRef.current.setData(candleData);
    chartRef.current?.timeScale().fitContent();
  }, [prices]);

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
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-20 hidden rounded-[8px] border border-[#E2E2E2] bg-white px-3 py-2 shadow-md"
        style={{ minWidth: 160 }}
      />
    </div>
  );
}
