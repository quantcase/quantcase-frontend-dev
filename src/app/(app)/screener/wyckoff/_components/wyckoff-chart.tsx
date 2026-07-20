"use client";

/**
 * Wyckoff candlestick chart.
 *
 * Renders ONLY what the API returns — pivot structure labels, swing percentages
 * and event badges are all precomputed server-side, so the draw loop derives
 * nothing. Pivots are matched to bars by DATE, not index: `pivot.index` is
 * relative to the analysed series, which is not the same slice as `chart.bars`
 * unless chartYears happens to cover the whole history.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  WyckoffChart,
  WyckoffPivot,
  WyckoffTradingRange,
  WyckoffPriorRange,
  WyckoffLocalBreakout,
  SignalDirection,
} from "@/types/wyckoff";
import { currencySymbol, fmtVolume } from "./presentation";

const PAD = { L: 64, R: 18, T: 22, B: 30 };
const PRICE_H = 380;
const VOL_H = 96;

interface CanvasPalette {
  grid: string;
  axis: string;
  sma: string;
  up: string;
  down: string;
  ink: string;
  ink3: string;
  hair: string;
  /** Tone of the active trading range, driven off signal.direction. */
  range: string;
}

function readPalette(direction: SignalDirection): CanvasPalette {
  const cs = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const t = (name: string, fallback: string) => cs?.getPropertyValue(name).trim() || fallback;
  const up = t("--qc-up", "#1F7A4A");
  const down = t("--qc-down", "#B23A2F");
  const ink = t("--qc-ink", "#210B2C");
  return {
    grid: t("--qc-hair", "#E9E7E1"),
    axis: t("--qc-ink-3", "#9A9A92"),
    sma: t("--qc-ink-3", "#9A9A92"),
    up,
    down,
    ink,
    ink3: t("--qc-ink-3", "#9A9A92"),
    hair: t("--qc-hair", "#E9E7E1"),
    range: direction === "bullish" ? up : direction === "bearish" ? down : ink,
  };
}

/** #RRGGBB → rgba(). Canvas has no colour-mix, so tints are built here. */
function alpha(hex: string, a: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  return `rgba(${r},${g},${b},${a})`;
}

interface HoverState {
  barIndex: number;
  x: number;
}

interface WyckoffChartProps {
  chart: WyckoffChart;
  pivots: WyckoffPivot[];
  tradingRange: WyckoffTradingRange | null;
  priorRange: WyckoffPriorRange | null;
  localBreakout: WyckoffLocalBreakout | null;
  currency: string;
  direction: SignalDirection;
}

export function WyckoffChart({
  chart,
  pivots,
  tradingRange,
  priorRange,
  localBreakout,
  currency,
  direction,
}: WyckoffChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLCanvasElement>(null);
  const volRef = useRef<HTMLCanvasElement>(null);

  const [width, setWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<HoverState | null>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startOffset: number }>({
    active: false,
    startX: 0,
    startOffset: 0,
  });

  const bars = chart.bars;
  const sym = currencySymbol(currency);

  /** date → bar index, so pivots land on the right candle regardless of slicing. */
  const pivotByBar = useMemo(() => {
    const dateToIdx = new Map<string, number>();
    bars.forEach((b, i) => dateToIdx.set(b.date, i));
    const map = new Map<number, WyckoffPivot>();
    for (const p of pivots) {
      const idx = dateToIdx.get(p.date);
      if (idx !== undefined) map.set(idx, p);
    }
    return map;
  }, [bars, pivots]);

  /** Candle width tuned so the full series fits by default. */
  const { candleW, gap } = useMemo(() => {
    const drawW = Math.max(1, width - PAD.L - PAD.R);
    const slot = drawW / Math.max(bars.length, 1);
    if (slot < 2) return { candleW: 1, gap: 0 };
    return { candleW: Math.min(12, Math.max(1, Math.floor(slot) - 1)), gap: 1 };
  }, [width, bars.length]);

  const slot = candleW + gap;
  const visibleCount = Math.max(1, Math.floor((width - PAD.L - PAD.R) / slot));
  const maxOffset = Math.max(0, bars.length - visibleCount);

  // Track container width
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    setWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const draw = useCallback(() => {
    const priceEl = priceRef.current;
    const volEl = volRef.current;
    if (!priceEl || !volEl || !width || !bars.length) return;

    const C = readPalette(direction);
    const dpr = window.devicePixelRatio || 1;
    for (const [el, h] of [
      [priceEl, PRICE_H],
      [volEl, VOL_H],
    ] as const) {
      el.width = width * dpr;
      el.height = h * dpr;
      el.style.height = `${h}px`;
    }

    const start = Math.max(0, Math.min(offset, maxOffset));
    const end = Math.min(bars.length, start + visibleCount + 1);
    const vis = bars.slice(start, end);
    if (!vis.length) return;

    // ── Price pane ──────────────────────────────────────────────────────────
    const pc = priceEl.getContext("2d")!;
    pc.setTransform(dpr, 0, 0, dpr, 0, 0);
    pc.clearRect(0, 0, width, PRICE_H);

    const plotH = PRICE_H - PAD.T - PAD.B;
    let lo = Infinity;
    let hi = -Infinity;
    for (const b of vis) {
      lo = Math.min(lo, b.low);
      hi = Math.max(hi, b.high);
    }
    for (let i = 0; i < vis.length; i++) {
      const s = chart.sma20[start + i];
      if (s != null) {
        lo = Math.min(lo, s);
        hi = Math.max(hi, s);
      }
    }
    // Keep the active range in frame so its bands are never drawn off-canvas.
    if (tradingRange) {
      lo = Math.min(lo, tradingRange.bottom);
      hi = Math.max(hi, tradingRange.top);
    }
    const headroom = (hi - lo) * 0.06 || 1;
    lo -= headroom;
    hi += headroom;
    const toY = (p: number) => PAD.T + ((hi - p) / (hi - lo)) * plotH;
    const toX = (i: number) => PAD.L + i * slot + candleW / 2;

    pc.font = "9px 'IBM Plex Mono', monospace";

    // Horizontal grid + price axis
    for (let i = 0; i <= 5; i++) {
      const p = lo + ((hi - lo) * i) / 5;
      const y = Math.round(toY(p)) + 0.5;
      pc.strokeStyle = alpha(C.grid, 0.9);
      pc.lineWidth = 1;
      pc.beginPath();
      pc.moveTo(PAD.L, y);
      pc.lineTo(width - PAD.R, y);
      pc.stroke();
      pc.fillStyle = C.axis;
      pc.textAlign = "right";
      pc.fillText(p.toFixed(0), PAD.L - 6, y + 3);
    }

    // Month separators
    let lastLabel = "";
    vis.forEach((bar, i) => {
      const d = new Date(bar.date);
      const label = `${d.toLocaleString("default", { month: "short" })} ${String(d.getFullYear()).slice(2)}`;
      if (label === lastLabel) return;
      lastLabel = label;
      const x = Math.round(toX(i)) + 0.5;
      pc.strokeStyle = alpha(C.grid, 0.7);
      pc.lineWidth = 1;
      pc.beginPath();
      pc.moveTo(x, PAD.T);
      pc.lineTo(x, PRICE_H - PAD.B);
      pc.stroke();
      pc.fillStyle = C.axis;
      pc.textAlign = "center";
      pc.fillText(label, x, PRICE_H - PAD.B + 14);
    });

    // Nested range bands — widest first so the primary sits on top
    const bands = tradingRange
      ? [...tradingRange.levels].sort((a, b) => b.widthPct - a.widthPct)
      : [];
    for (const band of bands) {
      const top = toY(band.top);
      const bottom = toY(band.bottom);
      pc.fillStyle = alpha(C.range, band.isPrimary ? 0.09 : 0.04);
      pc.fillRect(PAD.L, top, width - PAD.L - PAD.R, bottom - top);
      pc.strokeStyle = alpha(C.range, band.isPrimary ? 0.7 : 0.32);
      pc.lineWidth = band.isPrimary ? 1.5 : 1;
      pc.setLineDash(band.isPrimary ? [6, 3] : [3, 5]);
      for (const y of [top, bottom]) {
        pc.beginPath();
        pc.moveTo(PAD.L, Math.round(y) + 0.5);
        pc.lineTo(width - PAD.R, Math.round(y) + 0.5);
        pc.stroke();
      }
      pc.setLineDash([]);
      pc.fillStyle = alpha(C.range, band.isPrimary ? 0.95 : 0.5);
      pc.font = band.isPrimary
        ? "bold 9px 'IBM Plex Mono', monospace"
        : "9px 'IBM Plex Mono', monospace";
      pc.textAlign = band.isPrimary ? "left" : "right";
      const lx = band.isPrimary ? PAD.L + 4 : width - PAD.R - 4;
      pc.fillText(`${band.label} R ${sym}${band.top}`, lx, top - 5);
      pc.fillText(`${band.label} S ${sym}${band.bottom}`, lx, bottom + 12);
    }

    // Prior range — neutral, it's historical context not the live signal
    if (priorRange) {
      const top = toY(priorRange.top);
      const bottom = toY(priorRange.bottom);
      pc.strokeStyle = alpha(C.ink3, 0.6);
      pc.lineWidth = 1;
      pc.setLineDash([8, 3, 2, 3]);
      for (const y of [top, bottom]) {
        pc.beginPath();
        pc.moveTo(PAD.L, Math.round(y) + 0.5);
        pc.lineTo(width - PAD.R, Math.round(y) + 0.5);
        pc.stroke();
      }
      pc.setLineDash([]);
      pc.fillStyle = alpha(C.ink3, 0.9);
      pc.font = "9px 'IBM Plex Mono', monospace";
      pc.textAlign = "left";
      pc.fillText(`Prior R ${sym}${priorRange.top.toFixed(0)}`, PAD.L + 4, top - 5);
      pc.fillText(`Prior S ${sym}${priorRange.bottom.toFixed(0)}`, PAD.L + 4, bottom + 12);
    }

    // SMA20 — neutral chrome, it's an indicator not a verdict
    pc.beginPath();
    pc.strokeStyle = alpha(C.sma, 0.85);
    pc.lineWidth = 1.25;
    pc.setLineDash([5, 3]);
    let started = false;
    vis.forEach((_, i) => {
      const s = chart.sma20[start + i];
      if (s == null) return;
      const x = toX(i);
      const y = toY(s);
      if (started) pc.lineTo(x, y);
      else {
        pc.moveTo(x, y);
        started = true;
      }
    });
    pc.stroke();
    pc.setLineDash([]);

    // Candles
    vis.forEach((bar, i) => {
      const x = PAD.L + i * slot;
      const cx = x + candleW / 2;
      const isUp = bar.close >= bar.open;
      const color = alpha(isUp ? C.up : C.down, 0.85);
      pc.strokeStyle = color;
      pc.fillStyle = color;
      pc.lineWidth = 1;
      pc.beginPath();
      pc.moveTo(Math.round(cx) + 0.5, toY(bar.high));
      pc.lineTo(Math.round(cx) + 0.5, toY(bar.low));
      pc.stroke();
      const bodyTop = toY(Math.max(bar.open, bar.close));
      const bodyH = Math.max(1, toY(Math.min(bar.open, bar.close)) - bodyTop);
      if (candleW >= 3) pc.fillRect(x, bodyTop, candleW, bodyH);
      else pc.fillRect(cx, bodyTop, 1, bodyH);
    });

    // Pivots — every label comes straight off the payload
    if (candleW >= 2) {
      for (const [barIdx, piv] of pivotByBar) {
        const i = barIdx - start;
        if (i < 0 || i >= vis.length) continue;
        const cx = toX(i);
        const py = toY(piv.price);
        const isHigh = piv.type === "high";
        const bullish =
          piv.eventBadge === "SC" ||
          piv.eventBadge === "SPR" ||
          piv.structureLabel === "HH" ||
          piv.structureLabel === "HL";
        const bearish =
          piv.eventBadge === "BC" ||
          piv.eventBadge === "UT" ||
          piv.structureLabel === "LH" ||
          piv.structureLabel === "LL";
        const dot = bullish ? C.up : bearish ? C.down : C.ink3;

        const r = piv.eventBadge ? 4.5 : 3.5;
        pc.beginPath();
        pc.arc(cx, py, r, 0, Math.PI * 2);
        pc.fillStyle = dot;
        pc.fill();
        if (piv.eventBadge) {
          pc.beginPath();
          pc.arc(cx, py, r + 2.5, 0, Math.PI * 2);
          pc.strokeStyle = alpha(dot, 0.5);
          pc.lineWidth = 1;
          pc.stroke();
        }

        if (candleW < 4) continue;
        const dir = isHigh ? -1 : 1;
        pc.textAlign = "center";
        const label = piv.eventBadge ?? piv.structureLabel;
        if (label) {
          pc.fillStyle = dot;
          pc.font = "bold 8px 'IBM Plex Mono', monospace";
          pc.fillText(label, cx, py + dir * 26);
        }
        pc.fillStyle = alpha(dot, 0.9);
        pc.font = "8px 'IBM Plex Mono', monospace";
        pc.fillText(`${sym}${piv.price.toFixed(0)}`, cx, py + dir * 14);
        if (piv.swingPct != null && candleW >= 6) {
          pc.fillStyle = C.axis;
          pc.font = "7px 'IBM Plex Mono', monospace";
          pc.fillText(`${piv.swingPct.toFixed(1)}%`, cx, py + dir * 38);
        }
      }
    }

    // Local breakout marker
    if (localBreakout) {
      const i = bars.findIndex((b) => b.date === localBreakout.breakoutDate) - start;
      if (i >= 0 && i < vis.length) {
        const x = Math.round(toX(i)) + 0.5;
        pc.strokeStyle = alpha(C.up, 0.6);
        pc.lineWidth = 1.5;
        pc.setLineDash([4, 3]);
        pc.beginPath();
        pc.moveTo(x, PAD.T);
        pc.lineTo(x, PRICE_H - PAD.B);
        pc.stroke();
        pc.setLineDash([]);
        pc.fillStyle = C.up;
        pc.font = "bold 8px 'IBM Plex Mono', monospace";
        pc.textAlign = "center";
        pc.fillText("SOS", x, PAD.T - 6);
      }
    }

    // Crosshair
    if (hover) {
      const i = hover.barIndex - start;
      if (i >= 0 && i < vis.length) {
        const x = Math.round(toX(i)) + 0.5;
        pc.strokeStyle = alpha(C.ink, 0.28);
        pc.lineWidth = 1;
        pc.setLineDash([3, 3]);
        pc.beginPath();
        pc.moveTo(x, PAD.T);
        pc.lineTo(x, PRICE_H - PAD.B);
        pc.stroke();
        pc.setLineDash([]);
      }
    }

    // ── Volume pane ─────────────────────────────────────────────────────────
    const vc = volEl.getContext("2d")!;
    vc.setTransform(dpr, 0, 0, dpr, 0, 0);
    vc.clearRect(0, 0, width, VOL_H);
    const volPlotH = VOL_H - 18;
    const maxV = Math.max(1, ...vis.map((b) => b.volume));

    vc.strokeStyle = alpha(C.grid, 0.9);
    vc.lineWidth = 1;
    vc.beginPath();
    vc.moveTo(PAD.L, 4.5);
    vc.lineTo(width - PAD.R, 4.5);
    vc.stroke();
    vc.fillStyle = C.axis;
    vc.font = "9px 'IBM Plex Mono', monospace";
    vc.textAlign = "right";
    vc.fillText(fmtVolume(maxV), PAD.L - 6, 11);

    vis.forEach((bar, i) => {
      const h = Math.max(1, (bar.volume / maxV) * volPlotH);
      vc.fillStyle = alpha(bar.close >= bar.open ? C.up : C.down, 0.5);
      vc.fillRect(PAD.L + i * slot, volPlotH - h + 8, candleW, h);
    });
  }, [
    bars,
    chart.sma20,
    pivotByBar,
    tradingRange,
    priorRange,
    localBreakout,
    width,
    offset,
    hover,
    maxOffset,
    visibleCount,
    slot,
    candleW,
    direction,
    sym,
  ]);

  useLayoutEffect(() => {
    draw();
  }, [draw]);

  // Pan + hover
  useEffect(() => {
    const el = priceRef.current;
    if (!el) return;

    const barAt = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      const i = Math.floor((clientX - rect.left - PAD.L) / slot);
      const start = Math.max(0, Math.min(offset, maxOffset));
      const idx = start + i;
      return i >= 0 && idx < bars.length ? idx : null;
    };

    const onDown = (e: MouseEvent) => {
      dragRef.current = { active: true, startX: e.clientX, startOffset: offset };
      el.style.cursor = "grabbing";
      setHover(null);
    };
    const onUp = () => {
      dragRef.current.active = false;
      el.style.cursor = "crosshair";
    };
    const onMove = (e: MouseEvent) => {
      if (dragRef.current.active) {
        const shift = Math.round(-(e.clientX - dragRef.current.startX) / slot);
        setOffset(Math.max(0, Math.min(dragRef.current.startOffset + shift, maxOffset)));
        return;
      }
      const idx = barAt(e.clientX);
      setHover(idx === null ? null : { barIndex: idx, x: e.clientX - el.getBoundingClientRect().left });
    };
    const onLeave = () => setHover(null);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setOffset((o) => Math.max(0, Math.min(o + Math.sign(e.deltaY) * 5, maxOffset)));
    };

    el.style.cursor = "crosshair";
    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
    };
  }, [offset, maxOffset, slot, bars.length]);

  const hoverBar = hover ? bars[hover.barIndex] : null;

  return (
    <div ref={wrapRef} className="w-full">
      <ChartLegend />
      <div className="relative select-none">
        <canvas ref={priceRef} className="block w-full" />
        <AnimatePresence>
          {hoverBar && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="pointer-events-none absolute top-2 z-10 rounded-lg border border-hair bg-card px-3 py-2 font-mono text-[length:var(--qc-fz-10)] leading-relaxed text-ink"
              style={{
                left: Math.min(Math.max(hover!.x + 14, PAD.L), Math.max(PAD.L, width - 220)),
                boxShadow: "var(--qc-shadow-annot)",
              }}
            >
              <div className="text-ink-3">{hoverBar.date}</div>
              <div className="mt-1 flex gap-2.5">
                <span>
                  O <b className="text-ink">{sym}{hoverBar.open.toFixed(2)}</b>
                </span>
                <span>
                  H <b className="text-up">{sym}{hoverBar.high.toFixed(2)}</b>
                </span>
                <span>
                  L <b className="text-down">{sym}{hoverBar.low.toFixed(2)}</b>
                </span>
                <span>
                  C{" "}
                  <b className={hoverBar.close >= hoverBar.open ? "text-up" : "text-down"}>
                    {sym}{hoverBar.close.toFixed(2)}
                  </b>
                </span>
              </div>
              <div className="mt-0.5 text-ink-2">
                Vol <b className="text-ink">{fmtVolume(hoverBar.volume)}</b>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <canvas ref={volRef} className="mt-1 block w-full" />
    </div>
  );
}

const LEGEND: { className: string; label: string }[] = [
  { className: "bg-up", label: "HH / HL · Spring · SC" },
  { className: "bg-down", label: "LH / LL · Upthrust · BC" },
  { className: "bg-ink-3", label: "EH / EL — inside ±1.5%" },
];

function ChartLegend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[length:var(--qc-fz-10)] text-ink-2">
      {LEGEND.map(({ className, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`inline-block size-[7px] rounded-full ${className}`} />
          {label}
        </span>
      ))}
      <span className="ml-auto text-ink-3">drag to pan · scroll to move</span>
    </div>
  );
}
