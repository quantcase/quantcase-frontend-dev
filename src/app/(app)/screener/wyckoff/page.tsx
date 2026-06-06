"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenerPageShell } from "@/components/molecules/screener-page-shell";
import { SectionPanel } from "@/components/molecules/section-panel";
import { usePrices } from "@/hooks/usePrices";
import { useScreenerInfo } from "@/hooks/useScreenerInfo";
import {
  analyzeWyckoff,
  calcSMA,
  WYCKOFF_CYCLE,
  type WyckoffBar,
  type WyckoffResult,
} from "@/lib/wyckoff";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtVol(v: number): string {
  if (v >= 1e7) return (v / 1e7).toFixed(1) + "Cr";
  if (v >= 1e5) return (v / 1e5).toFixed(1) + "L";
  return v.toLocaleString();
}

function filterLast3Years(bars: WyckoffBar[]): WyckoffBar[] {
  if (!bars.length) return [];
  const cutoff = new Date(bars[bars.length - 1].date);
  cutoff.setFullYear(cutoff.getFullYear() - 3);
  return bars.filter((b) => new Date(b.date) >= cutoff);
}

// Maps phase → semantic color pair [ink-color, soft-bg] using design system vars
function phaseTokens(pt: string): { color: string; soft: string; border: string } {
  const map: Record<string, { color: string; soft: string; border: string }> = {
    Markup:            { color: "var(--qc-up)",   soft: "var(--qc-up-soft)",   border: "rgba(31,122,74,0.25)" },
    "Re-Accumulation": { color: "var(--qc-up)",   soft: "var(--qc-up-soft)",   border: "rgba(31,122,74,0.20)" },
    Accumulation:      { color: "var(--qc-blue)", soft: "var(--qc-blue-soft)", border: "rgba(58,107,239,0.22)" },
    Distribution:      { color: "var(--qc-down)", soft: "var(--qc-down-soft)", border: "rgba(178,58,47,0.22)" },
    "Re-Distribution": { color: "var(--qc-warn)", soft: "var(--qc-warn-soft)", border: "rgba(180,115,26,0.22)" },
    Markdown:          { color: "var(--qc-down)", soft: "var(--qc-down-soft)", border: "rgba(178,58,47,0.25)" },
  };
  return map[pt] ?? { color: "var(--qc-blue)", soft: "var(--qc-blue-soft)", border: "rgba(58,107,239,0.22)" };
}

// Canvas colors — adapted for light bg
const C = {
  grid:       "rgba(0,0,0,0.06)",
  axis:       "#9A9A92",
  sma:        "#B4731A",   // amber — warm accent visible on white
  trAccum:    "rgba(31,122,74,0.08)",
  trDist:     "rgba(178,58,47,0.08)",
  trLineAccum:"rgba(31,122,74,0.6)",
  trLineDist: "rgba(178,58,47,0.6)",
  ptr:        "rgba(58,107,239,0.55)",
  ptrFill:    "rgba(58,107,239,0.06)",
  candleUp:   "rgba(31,122,74,0.85)",
  candleDn:   "rgba(178,58,47,0.85)",
  dotHH:      "#1F7A4A",
  dotLL:      "#B23A2F",
  dotEq:      "#9A9A92",
  dotSC:      "#3A6BEF",
  dotBC:      "#B4731A",
  dotSpring:  "#7C3AED",
  dotUT:      "#B4731A",
  volUp:      "rgba(31,122,74,0.55)",
  volDn:      "rgba(178,58,47,0.55)",
  tip:        "#FFFFFF",
  tipBorder:  "#E9E7E1",
  tipText:    "#210B2C",
  tipMuted:   "#5A5A54",
};

// ── Canvas chart ───────────────────────────────────────────────────────────────

const PAD = { L: 72, R: 16, T: 24, B: 36 };

interface ChartState {
  bars: WyckoffBar[];
  sma: (number | null)[];
  result: WyckoffResult | null;
  offset: number;
  cw: number;
  gap: number;
  dragging: boolean;
  dragX: number;
  dragOff: number;
}

function WyckoffChart({ bars, result }: { bars: WyckoffBar[]; result: WyckoffResult }) {
  const pcRef = useRef<HTMLCanvasElement>(null);
  const vcRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<ChartState>({
    bars: [], sma: [], result: null,
    offset: 0, cw: 8, gap: 1, dragging: false, dragX: 0, dragOff: 0,
  });

  const draw = useCallback(() => {
    const pcEl = pcRef.current, vcEl = vcRef.current;
    if (!pcEl || !vcEl) return;
    const cs = stateRef.current;
    const { bars: b, sma, cw, gap, offset, result: res } = cs;
    if (!b.length) return;

    const W = pcEl.width;
    const slot = cw + gap;
    const n = b.length;
    const drawW = W - PAD.L - PAD.R;
    const visCount = Math.max(1, Math.floor(drawW / slot));
    const startIdx = Math.max(0, Math.min(offset, n - visCount));
    const endIdx = Math.min(n, startIdx + visCount + 1);
    const vis = b.slice(startIdx, endIdx);

    // ── Price canvas ─────────────────────────────────────────────────────────
    const pH = pcEl.height - PAD.T - PAD.B;
    const pc = pcEl.getContext("2d")!;
    pc.clearRect(0, 0, W, pcEl.height);

    let lo = Infinity, hi = -Infinity;
    vis.forEach((bar) => { lo = Math.min(lo, bar.low); hi = Math.max(hi, bar.high); });
    vis.forEach((_, i) => { const sv = sma[startIdx + i]; if (sv) { lo = Math.min(lo, sv); hi = Math.max(hi, sv); } });
    const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    const toY = (p: number) => PAD.T + (hi - p) / (hi - lo) * pH;

    // Grid lines
    for (let i = 0; i <= 6; i++) {
      const p = lo + (hi - lo) * (i / 6);
      const y = toY(p);
      pc.strokeStyle = C.grid; pc.lineWidth = 1;
      pc.beginPath(); pc.moveTo(PAD.L, y); pc.lineTo(W - PAD.R, y); pc.stroke();
      pc.fillStyle = C.axis; pc.font = "9px 'IBM Plex Mono',monospace"; pc.textAlign = "right";
      pc.fillText(p.toFixed(1), PAD.L - 4, y + 3);
    }

    // Month labels
    let lastLbl = "";
    vis.forEach((bar, i) => {
      const cx = PAD.L + i * slot + cw / 2;
      const d = new Date(bar.date);
      const lbl = d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear().toString().slice(2);
      if (lbl !== lastLbl) {
        lastLbl = lbl;
        pc.strokeStyle = C.grid; pc.lineWidth = 1;
        pc.beginPath(); pc.moveTo(cx, PAD.T); pc.lineTo(cx, pcEl.height - PAD.B); pc.stroke();
        pc.fillStyle = C.axis; pc.font = "9px 'IBM Plex Mono',monospace"; pc.textAlign = "center";
        pc.fillText(lbl, cx, pcEl.height - PAD.B + 14);
      }
    });

    // SMA20
    pc.beginPath(); pc.strokeStyle = C.sma; pc.lineWidth = 1.5; pc.setLineDash([5, 3]);
    let smaStarted = false;
    vis.forEach((_, i) => {
      const sv = sma[startIdx + i]; if (sv === null) return;
      const x = PAD.L + i * slot + cw / 2, y = toY(sv);
      smaStarted ? pc.lineTo(x, y) : (pc.moveTo(x, y), smaStarted = true);
    });
    pc.stroke(); pc.setLineDash([]);

    // Trading range shading + lines
    if (res?.tr) {
      const isAccum = res.phaseType === "Accumulation" || res.phaseType === "Re-Accumulation";
      const fillColor = isAccum ? C.trAccum : C.trDist;
      const lineColor = isAccum ? C.trLineAccum : C.trLineDist;
      const allR = res.tr.allRanges ?? [{ top: res.tr.top, bottom: res.tr.bottom, mid: res.tr.mid, width: res.tr.width, label: "", isPrimary: true, lb: 0, density: 0, members: 0 }];
      const macroR = [...allR].sort((a, b) => parseFloat(b.width) - parseFloat(a.width))[0];
      const macroTop = toY(macroR.top), macroBot = toY(macroR.bottom);
      pc.fillStyle = fillColor;
      pc.fillRect(PAD.L, macroTop, W - PAD.L - PAD.R, macroBot - macroTop);

      const drawnY: number[] = [];
      const isFresh = (y: number) => drawnY.every((dy) => Math.abs(dy - y) > 8);
      [...allR].sort((a, b) => parseFloat(b.width) - parseFloat(a.width)).forEach((r, i) => {
        const isPrimary = r.isPrimary;
        const alpha = isPrimary ? 0.85 : (parseFloat(r.width) > 10 ? 0.45 : 0.30);
        const baseColor = isAccum ? "rgba(31,122,74," : "rgba(178,58,47,";
        const color = baseColor + alpha + ")";
        const lw = isPrimary ? 1.5 : 1;
        const dash = isPrimary ? [6, 3] : parseFloat(r.width) > 10 ? [8, 4] : [3, 5];
        const rTop = toY(r.top), rBot = toY(r.bottom);
        pc.setLineDash(dash); pc.lineWidth = lw; pc.strokeStyle = color;
        if (isFresh(rTop)) { pc.beginPath(); pc.moveTo(PAD.L, rTop); pc.lineTo(W - PAD.R, rTop); pc.stroke(); drawnY.push(rTop); }
        if (isFresh(rBot)) { pc.beginPath(); pc.moveTo(PAD.L, rBot); pc.lineTo(W - PAD.R, rBot); pc.stroke(); drawnY.push(rBot); }
        pc.setLineDash([]);
        pc.font = isPrimary ? "bold 9px 'IBM Plex Mono',monospace" : "8px 'IBM Plex Mono',monospace"; pc.fillStyle = color;
        const prefix = r.label ? r.label + " " : "";
        if (isPrimary) {
          pc.textAlign = "left";
          if (isFresh(rTop - 10) || i === 0) pc.fillText(prefix + "R ₹" + r.top, PAD.L + 2, rTop - 4);
          if (isFresh(rBot + 14) || i === 0) pc.fillText(prefix + "S ₹" + r.bottom, PAD.L + 2, rBot + 12);
        } else {
          pc.textAlign = "right";
          if (isFresh(rTop - 10)) pc.fillText(prefix + "R ₹" + r.top, W - PAD.R - 2, rTop - 4);
          if (isFresh(rBot + 14)) pc.fillText(prefix + "S ₹" + r.bottom, W - PAD.R - 2, rBot + 12);
        }
      });
    }

    // Prior TR
    if (res?.ptr) {
      const ptrTop = toY(res.ptr.top), ptrBot = toY(res.ptr.bottom);
      pc.fillStyle = C.ptrFill; pc.fillRect(PAD.L, ptrTop, W - PAD.L - PAD.R, ptrBot - ptrTop);
      pc.setLineDash([8, 3, 2, 3]); pc.lineWidth = 1.5; pc.strokeStyle = C.ptr;
      pc.beginPath(); pc.moveTo(PAD.L, ptrTop); pc.lineTo(W - PAD.R, ptrTop); pc.stroke();
      pc.beginPath(); pc.moveTo(PAD.L, ptrBot); pc.lineTo(W - PAD.R, ptrBot); pc.stroke();
      pc.setLineDash([]);
      pc.fillStyle = C.ptr; pc.font = "bold 9px 'IBM Plex Mono',monospace"; pc.textAlign = "left";
      pc.fillText("pR ₹" + res.ptr.top.toFixed(0), PAD.L + 2, ptrTop - 4);
      pc.fillText("pS ₹" + res.ptr.bottom.toFixed(0), PAD.L + 2, ptrBot + 12);
    }

    // Candles
    vis.forEach((bar, i) => {
      const x = PAD.L + i * slot, cx = x + cw / 2;
      const isUp = bar.close >= bar.open;
      const col = isUp ? C.candleUp : C.candleDn;
      const bodyT = toY(Math.max(bar.open, bar.close)), bodyB = toY(Math.min(bar.open, bar.close));
      const bodyH = Math.max(1, bodyB - bodyT);
      pc.strokeStyle = col; pc.lineWidth = 1;
      pc.beginPath(); pc.moveTo(cx, toY(bar.high)); pc.lineTo(cx, toY(bar.low)); pc.stroke();
      if (cw >= 3) {
        pc.fillStyle = col; pc.fillRect(x, bodyT, cw, bodyH);
      } else {
        pc.fillStyle = col; pc.fillRect(cx, bodyT, 1, bodyH);
      }
    });

    // Zigzag pivot dots
    if (res?.zz?.length) {
      const zz = res.zz;
      let lastH: number | null = null, lastL: number | null = null;
      const structLabel: Record<number, string> = {};
      zz.forEach((p, i) => {
        if (p.type === "high") {
          if (lastH !== null) { const c = (p.price - lastH) / lastH * 100; structLabel[i] = c > 1.5 ? "HH" : c < -1.5 ? "LH" : "EH"; }
          lastH = p.price;
        } else {
          if (lastL !== null) { const c = (p.price - lastL) / lastL * 100; structLabel[i] = c > 1.5 ? "HL" : c < -1.5 ? "LL" : "EL"; }
          lastL = p.price;
        }
      });
      const eventLabel: Record<number, string> = {};
      const scIdx = res.sc?.detected ? res.sc.idx ?? -1 : -1;
      const bcIdx = res.bc?.detected ? res.bc.idx ?? -1 : -1;
      if (res.spring && res.tr) {
        const sp = [...zz].reverse().find(p => p.type === "low" && p.price < res.tr!.bottom * 1.01);
        if (sp) eventLabel[zz.indexOf(sp)] = "SPR";
      }
      if (res.upthrust && res.tr) {
        const ut = [...zz].reverse().find(p => p.type === "high" && p.price > res.tr!.top * 0.99);
        if (ut) eventLabel[zz.indexOf(ut)] = "UT";
      }
      if (scIdx >= 0) { let best = -1, bd = Infinity; zz.forEach((p, i) => { const d = Math.abs(p.index - scIdx); if (p.type === "low" && d < bd) { bd = d; best = i; } }); if (best >= 0) eventLabel[best] = "SC"; }
      if (bcIdx >= 0) { let best = -1, bd = Infinity; zz.forEach((p, i) => { const d = Math.abs(p.index - bcIdx); if (p.type === "high" && d < bd) { bd = d; best = i; } }); if (best >= 0) eventLabel[best] = "BC"; }

      zz.forEach((piv, i) => {
        const vi = piv.index - startIdx;
        if (vi < 0 || vi >= vis.length) return;
        const cx = PAD.L + vi * slot + cw / 2;
        const dotBar = vis[vi];
        const py = dotBar ? toY(dotBar.close) : toY(piv.price);
        const isH = piv.type === "high";
        const sLbl = structLabel[i] ?? "";
        const eLbl = eventLabel[i] ?? "";
        const prev = zz[i - 1];
        const swingPct = prev ? Math.abs((piv.price - prev.price) / prev.price * 100).toFixed(1) : null;

        let dotColor: string;
        if (eLbl === "SC") dotColor = C.dotSC;
        else if (eLbl === "BC") dotColor = C.dotBC;
        else if (eLbl === "SPR") dotColor = C.dotSpring;
        else if (eLbl === "UT") dotColor = C.dotUT;
        else if (isH) dotColor = sLbl === "HH" ? C.dotHH : sLbl === "LH" ? C.dotLL : C.dotEq;
        else dotColor = sLbl === "HL" ? C.dotHH : sLbl === "LL" ? C.dotLL : C.dotEq;

        const r = eLbl ? 5 : 4;
        pc.beginPath(); pc.arc(cx, py, r, 0, Math.PI * 2); pc.fillStyle = dotColor; pc.fill();
        if (eLbl) { pc.beginPath(); pc.arc(cx, py, r + 2, 0, Math.PI * 2); pc.strokeStyle = dotColor; pc.lineWidth = 1; pc.stroke(); }
        if (cw >= 4) {
          const off = isH ? -10 : 10;
          pc.textAlign = "center";
          if (sLbl || eLbl) {
            const lbl = eLbl || sLbl;
            pc.fillStyle = eLbl ? dotColor : (sLbl === "HH" || sLbl === "HL") ? C.dotHH : (sLbl === "LH" || sLbl === "LL") ? C.dotLL : C.dotEq;
            pc.font = "bold 8px 'IBM Plex Mono',monospace";
            pc.fillText(lbl, cx, py + (isH ? off - 8 : off + 8));
          }
          pc.fillStyle = dotColor; pc.font = "8px 'IBM Plex Mono',monospace";
          pc.fillText("₹" + piv.price.toFixed(0), cx, py + off);
          if (swingPct && cw >= 6) {
            pc.fillStyle = C.axis; pc.font = "7px 'IBM Plex Mono',monospace";
            pc.fillText(swingPct + "%", cx, py + (isH ? off - 17 : off + 17));
          }
        }
      });
    }

    // Volume canvas
    const vc = vcEl.getContext("2d")!;
    vc.clearRect(0, 0, W, vcEl.height);
    const vH = vcEl.height - PAD.B;
    let maxV = 0; vis.forEach((bar) => { if (bar.volume > maxV) maxV = bar.volume; });
    if (maxV === 0) maxV = 1;
    vc.strokeStyle = C.grid; vc.lineWidth = 1;
    vc.beginPath(); vc.moveTo(PAD.L, 4); vc.lineTo(W - PAD.R, 4); vc.stroke();
    vc.fillStyle = C.axis; vc.font = "9px 'IBM Plex Mono',monospace"; vc.textAlign = "right";
    vc.fillText(fmtVol(maxV), PAD.L - 4, 10);
    vis.forEach((bar, i) => {
      const x = PAD.L + i * slot;
      const barH = Math.max(1, (bar.volume / maxV) * vH);
      vc.fillStyle = bar.close >= bar.open ? C.volUp : C.volDn;
      vc.fillRect(x, vcEl.height - PAD.B - barH, cw, barH);
    });

    // Store for tooltip
    (stateRef.current as ChartState & { _vis?: WyckoffBar[]; _startIdx?: number; _toY?: (p: number) => number })._vis = vis;
    (stateRef.current as ChartState & { _startIdx?: number })._startIdx = startIdx;
    (stateRef.current as ChartState & { _toY?: (p: number) => number })._toY = toY;
  }, []);

  useEffect(() => {
    const filtered = filterLast3Years(bars);
    const sma = calcSMA(filtered, 20);
    const n = filtered.length;
    const pcEl = pcRef.current, vcEl = vcRef.current;
    if (!pcEl || !vcEl || !n) return;

    const W = pcEl.parentElement?.clientWidth ?? 900;
    pcEl.width = W; pcEl.height = 400;
    vcEl.width = W; vcEl.height = 120;

    const drawW = W - PAD.L - PAD.R;
    const slotF = drawW / Math.max(n, 1);
    let cw: number, gap: number;
    if (slotF < 2) { cw = 1; gap = 0; }
    else { gap = 1; cw = Math.min(12, Math.max(1, Math.floor(slotF) - gap)); }

    stateRef.current = { ...stateRef.current, bars: filtered, sma, result, offset: 0, cw, gap };
    draw();

    const handleResize = () => {
      const NW = pcEl.parentElement?.clientWidth ?? 900;
      pcEl.width = NW; vcEl.width = NW;
      draw();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bars, result, draw]);

  // Drag
  useEffect(() => {
    const pcEl = pcRef.current;
    if (!pcEl) return;
    const onDown = (e: MouseEvent) => { stateRef.current.dragging = true; stateRef.current.dragX = e.clientX; stateRef.current.dragOff = stateRef.current.offset; pcEl.style.cursor = "grabbing"; };
    const onUp = () => { stateRef.current.dragging = false; pcEl.style.cursor = "crosshair"; };
    const onMove = (e: MouseEvent) => {
      if (!stateRef.current.dragging) return;
      const dx = e.clientX - stateRef.current.dragX;
      const cs = stateRef.current;
      const shift = Math.round(-dx / (cs.cw + cs.gap));
      const visC = Math.floor((pcEl.width - PAD.L - PAD.R) / (cs.cw + cs.gap));
      stateRef.current.offset = Math.max(0, Math.min(cs.dragOff + shift, cs.bars.length - visC));
      draw();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cs = stateRef.current;
      const visC = Math.floor((pcEl.width - PAD.L - PAD.R) / (cs.cw + cs.gap));
      stateRef.current.offset = Math.max(0, Math.min(cs.offset + Math.sign(e.deltaY) * 5, cs.bars.length - visC));
      draw();
    };
    pcEl.style.cursor = "crosshair";
    pcEl.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    pcEl.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      pcEl.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      pcEl.removeEventListener("wheel", onWheel);
    };
  }, [draw]);

  // Tooltip
  useEffect(() => {
    const pcEl = pcRef.current;
    const tipEl = tipRef.current;
    if (!pcEl || !tipEl) return;
    const onMove = (e: MouseEvent) => {
      const cs = stateRef.current as ChartState & { _vis?: WyckoffBar[] };
      if (cs.dragging || !cs._vis) { tipEl.style.display = "none"; return; }
      const rect = pcEl.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const i = Math.floor((mx - PAD.L) / (cs.cw + cs.gap));
      if (i < 0 || i >= cs._vis.length) { tipEl.style.display = "none"; return; }
      const bar = cs._vis[i];
      const isUp = bar.close >= bar.open;
      tipEl.style.display = "block";
      tipEl.innerHTML = `<span style="color:var(--qc-ink-3)">${bar.date}</span><br>O <b>₹${bar.open.toFixed(2)}</b> H <b style="color:var(--qc-up)">₹${bar.high.toFixed(2)}</b> L <b style="color:var(--qc-down)">₹${bar.low.toFixed(2)}</b> C <b style="color:${isUp ? "var(--qc-up)" : "var(--qc-down)"}">₹${bar.close.toFixed(2)}</b><br>Vol <b>${fmtVol(bar.volume)}</b>`;
    };
    const onLeave = () => { tipEl.style.display = "none"; };
    pcEl.addEventListener("mousemove", onMove);
    pcEl.addEventListener("mouseleave", onLeave);
    return () => { pcEl.removeEventListener("mousemove", onMove); pcEl.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <div>
      {/* Legend */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "6px 14px", marginBottom: 10,
        fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)",
      }}>
        {[
          { dot: C.dotHH, label: "HH/HL" },
          { dot: C.dotLL, label: "LH/LL" },
          { dot: C.dotEq, label: "EH/EL" },
          { dot: C.dotSC, label: "SC" },
          { dot: C.dotBC, label: "BC" },
          { dot: C.dotSpring, label: "Spring" },
          { dot: C.dotUT, label: "UT" },
        ].map(({ dot, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block" }} />
            {label}
          </span>
        ))}
        <span style={{ color: "var(--qc-ink-3)", marginLeft: 4 }}>drag to pan · scroll to move</span>
      </div>
      <div style={{ position: "relative" }}>
        <canvas ref={pcRef} style={{ display: "block", width: "100%" }} />
        <div
          ref={tipRef}
          style={{
            position: "absolute", top: 10, left: 80, display: "none",
            fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)",
            background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
            borderRadius: 8, boxShadow: "var(--qc-shadow-annot)",
            padding: "8px 12px", color: "var(--qc-ink)", lineHeight: 1.8, zIndex: 10,
          }}
        />
      </div>
      <div style={{ marginTop: 2 }}>
        <canvas ref={vcRef} style={{ display: "block", width: "100%" }} />
      </div>
    </div>
  );
}

// ── Phase card ─────────────────────────────────────────────────────────────────

function PhaseCard({ result }: { result: WyckoffResult }) {
  const tok = phaseTokens(result.phaseType);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {/* Phase panel */}
      <div style={{
        background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
        borderTop: `3px solid ${tok.color}`,
        borderRadius: 10, padding: "20px 22px",
      }}>
        <p style={{
          fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", letterSpacing: "var(--qc-track-eyebrow)",
          color: "var(--qc-ink-3)", textTransform: "uppercase", marginBottom: 8,
        }}>
          Wyckoff Phase
        </p>
        <p style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-26)", fontWeight: "var(--qc-w-semi)", color: tok.color, marginBottom: 4, lineHeight: 1, letterSpacing: "var(--qc-track-display)" }}>
          {result.phaseType}
        </p>
        {result.subPhase && (
          <p style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: tok.color, opacity: 0.75, marginBottom: 10, letterSpacing: "var(--qc-track-pill)" }}>
            {result.subPhase === "SOS Pullback" ? "Last Point of Support detected"
              : result.subPhase === "SOS Breakout" ? "Sign of Strength breakout"
              : result.subPhase === "Spring" ? "Spring (Phase C shakeout) detected"
              : result.subPhase === "UTAD" ? "Upthrust After Distribution detected"
              : result.subPhase === "LPSY" ? "Last Point of Supply detected"
              : result.subPhase}
          </p>
        )}
        <p style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-2)", lineHeight: 1.65, marginBottom: 16 }}>{result.desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-3)", whiteSpace: "nowrap" }}>Confidence</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: "var(--qc-hair)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${result.conf}%`, background: tok.color, borderRadius: 999, transition: "width 1.2s ease" }} />
          </div>
          <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", color: "var(--qc-ink-2)", fontWeight: "var(--qc-w-semi)" }}>{result.conf}%</span>
        </div>
      </div>

      {/* Signal panel */}
      <div style={{
        background: tok.soft, border: `1px solid ${tok.border}`,
        borderRadius: 10, padding: "20px 22px",
      }}>
        <p style={{
          fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", letterSpacing: "var(--qc-track-eyebrow)",
          color: "var(--qc-ink-3)", textTransform: "uppercase", marginBottom: 10,
        }}>
          Trading Signal
        </p>
        <p style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }}>{result.signal.e}</p>
        <p style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-semi)", marginBottom: 10, color: "var(--qc-ink)", lineHeight: 1.3 }}>{result.signal.t}</p>
        <p style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-2)", lineHeight: 1.65 }}>{result.signal.b}</p>
      </div>
    </div>
  );
}

// ── Metrics strip ──────────────────────────────────────────────────────────────

function MetricsStrip({ result }: { result: WyckoffResult }) {
  const pClr = result.priceChg >= 0 ? "var(--qc-up)" : "var(--qc-down)";
  const vClr = result.volBias === "bullish" ? "var(--qc-up)" : result.volBias === "bearish" ? "var(--qc-down)" : "var(--qc-warn)";
  const strClr = result.structure === "uptrend" ? "var(--qc-up)" : result.structure === "downtrend" ? "var(--qc-down)" : "var(--qc-warn)";

  let trStr = "None active";
  if (result.tr) {
    const primary = result.tr.allRanges?.find((x) => x.isPrimary) ?? { label: "", bottom: result.tr.bottom, top: result.tr.top, width: result.tr.width };
    trStr = `${primary.label ? primary.label + " " : ""}₹${result.tr.bottom}–₹${result.tr.top} (${result.tr.width}%)`;
  }

  const tiles = [
    { label: "Last Close", value: `₹${result.lastClose.toFixed(2)}`, sub: `${result.priceChg >= 0 ? "+" : ""}${result.priceChg.toFixed(1)}% overall`, subClr: pClr },
    { label: "Swing Structure", value: { uptrend: "↗ Uptrend", downtrend: "↘ Downtrend", transitional: "↔ Mixed", insufficient: "—" }[result.structure] ?? "—", sub: `${result.zz.length} pivots`, subClr: strClr },
    { label: "Trading Range", value: trStr, sub: result.tr ? result.tr.width + "% width" : "no active range", subClr: "var(--qc-warn)" },
    { label: "Volume Bias", value: result.volBias === "bullish" ? "↑ Bullish" : result.volBias === "bearish" ? "↓ Bearish" : "→ Neutral", sub: `ratio ${result.volRatio.toFixed(2)}x`, subClr: vClr },
    { label: "Key Events", value: `${result.sc.detected ? "SC ✓" : result.bc.detected ? "BC ✓" : "—"}${result.spring ? " · Spring ✓" : ""}${result.upthrust ? " · UT ✓" : ""}`, sub: "detected events", subClr: "var(--qc-ink-2)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      {tiles.map((t) => (
        <div key={t.label} style={{
          background: "var(--qc-card)", border: "1px solid var(--qc-hair)",
          borderRadius: 10, padding: "14px 16px",
        }}>
          <p style={{
            fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)",
            color: "var(--qc-ink-3)", letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: 6,
          }}>{t.label}</p>
          <p style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-semi)", color: t.subClr, lineHeight: 1.2, marginBottom: 4 }}>{t.value}</p>
          <p style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-3)" }}>{t.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Cycle schematic ────────────────────────────────────────────────────────────

const CYCLE_DESC = [
  "Institutions absorbing supply after a downtrend — or a pause before another leg down.",
  "Higher highs and higher lows. Demand in control.",
  "Uptrend stalled sideways. Healthy pause or early distribution.",
  "Price stalling at highs. Smart money quietly offloading.",
  "Supply in control. Price trending lower.",
  "Downtrend paused sideways. Brief rest before next leg down.",
];

function CycleSchematic({ phaseType }: { phaseType: string }) {
  return (
    <div>
      <div style={{ display: "flex" }}>
        {WYCKOFF_CYCLE.map((p, i) => {
          const isOn = p === phaseType;
          const tok = phaseTokens(p);
          return (
            <div key={p} style={{
              flex: 1, padding: "12px 10px", textAlign: "center",
              background: isOn ? tok.soft : "var(--qc-card)",
              border: `1px solid ${isOn ? tok.border : "var(--qc-hair)"}`,
              borderRight: i < WYCKOFF_CYCLE.length - 1 ? "none" : `1px solid ${isOn ? tok.border : "var(--qc-hair)"}`,
              borderRadius: i === 0 ? "8px 0 0 8px" : i === WYCKOFF_CYCLE.length - 1 ? "0 8px 8px 0" : 0,
              transition: "all .25s",
            }}>
              <p style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", fontWeight: "var(--qc-w-bold)",
                marginBottom: 6, color: isOn ? tok.color : "var(--qc-ink-3)",
                whiteSpace: "nowrap",
              }}>
                {p}
              </p>
              <p style={{
                fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-9)", lineHeight: 1.45,
                color: isOn ? "var(--qc-ink-2)" : "var(--qc-ink-3)",
              }}>
                {CYCLE_DESC[i]}
              </p>
            </div>
          );
        })}
      </div>
      <p style={{
        fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-3)",
        marginTop: 10, letterSpacing: "var(--qc-track-pill)",
      }}>
        Accum → Markup → Re-Acc → (back to Markup) → Distribution → Markdown → Re-Dist → (back to Markdown) → next Accum
      </p>
    </div>
  );
}

// ── Events grid ────────────────────────────────────────────────────────────────

function EventsGrid({ result }: { result: WyckoffResult }) {
  const strLabel = { uptrend: "↗ Uptrend", downtrend: "↘ Downtrend", transitional: "↔ Mixed", insufficient: "—" }[result.structure] ?? "—";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {/* Event detection */}
      <SectionPanel title="Wyckoff Event Detection">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {result.events.map((ev, i) => (
            <li key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "9px 0",
              borderBottom: i < result.events.length - 1 ? "1px solid var(--qc-hair)" : "none",
            }}>
              <span style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", padding: "3px 6px",
                whiteSpace: "nowrap", flexShrink: 0, borderRadius: 4,
                border: `1px solid ${ev.ok ? "rgba(31,122,74,0.25)" : "rgba(178,58,47,0.2)"}`,
                background: ev.ok ? "var(--qc-up-soft)" : "var(--qc-down-soft)",
                color: ev.ok ? "var(--qc-up)" : "var(--qc-down)",
              }}>
                {ev.tag}
              </span>
              <div>
                <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-12)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)" }}>{ev.label}</span>
                <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", marginLeft: 4 }}>{ev.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </SectionPanel>

      {/* Zigzag evidence */}
      <SectionPanel title="Zigzag Engine Evidence">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {[
            { tag: "ZZ",   content: <>Pivots: <strong style={{ color: "var(--qc-ink)" }}>{result.zz.length}</strong> detected (ATR-based dynamic threshold)</> },
            { tag: "STR",  content: <>Structure: <strong style={{ color: "var(--qc-ink)" }}>{strLabel}</strong> · Prior 6M: <strong style={{ color: "var(--qc-ink)" }}>{result.priorStructure} ({result.priorPctChg >= 0 ? "+" : ""}{result.priorPctChg.toFixed(1)}%)</strong></> },
            { tag: "TR",   content: <>Active range: <strong style={{ color: "var(--qc-ink)" }}>{result.tr ? `₹${result.tr.bottom.toFixed(1)}–₹${result.tr.top.toFixed(1)} (${result.tr.width}% wide)` : "No active range"}</strong></> },
            { tag: "LOC",  content: <>2yr position: <strong style={{ color: result.nearSwingHigh2yr ? "var(--qc-up)" : result.nearSwingLow2yr ? "var(--qc-down)" : "var(--qc-warn)" }}>{(result.posIn2yrRange * 100).toFixed(0)}% — {result.nearSwingHigh2yr ? "Near highs" : result.nearSwingLow2yr ? "Near lows" : "Mid-range"}</strong></> },
            { tag: "VOL",  content: <>Swing volume bias: <strong style={{ color: "var(--qc-ink)" }}>{result.volBias}</strong> · {result.volDrying ? "Volume drying up" : "Volume normal"}</> },
            { tag: "SC/BC",content: <>SC: <strong style={{ color: result.sc.detected ? "var(--qc-up)" : "var(--qc-ink-3)" }}>{result.sc.detected ? "✓ Detected" : "✗ None"}</strong> &nbsp; BC: <strong style={{ color: result.bc.detected ? "var(--qc-down)" : "var(--qc-ink-3)" }}>{result.bc.detected ? "✓ Detected" : "✗ None"}</strong></> },
            { tag: "EVTS", content: <>Spring: <strong style={{ color: result.spring ? "var(--qc-up)" : "var(--qc-ink-3)" }}>{result.spring ? "✓" : "✗"}</strong> &nbsp; Upthrust: <strong style={{ color: result.upthrust ? "var(--qc-down)" : "var(--qc-ink-3)" }}>{result.upthrust ? "✓" : "✗"}</strong> &nbsp; Vol Drying: <strong style={{ color: result.volDrying ? "var(--qc-warn)" : "var(--qc-ink-3)" }}>{result.volDrying ? "✓" : "✗"}</strong></> },
          ].map((row, i, arr) => (
            <li key={row.tag} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "9px 0",
              borderBottom: i < arr.length - 1 ? "1px solid var(--qc-hair)" : "none",
            }}>
              <span style={{
                fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", padding: "3px 6px",
                whiteSpace: "nowrap", flexShrink: 0, borderRadius: 4,
                border: "1px solid var(--qc-hair)", background: "var(--qc-section)",
                color: "var(--qc-ink-2)",
              }}>
                {row.tag}
              </span>
              <div style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-12)", color: "var(--qc-ink-2)", lineHeight: 1.55 }}>{row.content}</div>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </div>
  );
}

// ── Page header ────────────────────────────────────────────────────────────────

function PageHeader({ symbol }: { symbol: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: "var(--qc-ink)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-14)", fontWeight: "var(--qc-w-bold)", color: "#fff" }}>W</span>
        </div>
        <div>
          <div style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-16)", fontWeight: "var(--qc-w-semi)", color: "var(--qc-ink)", letterSpacing: "var(--qc-track-display)" }}>
            Wyckoff Analyzer
            <span style={{ fontFamily: "var(--qc-font-sans)", marginLeft: 8, fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-regular)", color: "var(--qc-ink-2)" }}>{symbol}</span>
          </div>
          <div style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
            Market Phase Detection Engine
          </div>
        </div>
      </div>
      <span style={{
        fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-3)",
        border: "1px solid var(--qc-hair)", borderRadius: 6,
        padding: "5px 10px", letterSpacing: "0.08em",
      }}>
        DAILY OHLCV · ZIGZAG ENGINE
      </span>
    </div>
  );
}

// ── Loading / error states ─────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: 280, flexDirection: "column", gap: 14,
    }}>
      <div style={{
        width: 32, height: 32,
        border: "2px solid var(--qc-hair)", borderTopColor: "var(--qc-ink)",
        borderRadius: "50%", animation: "qc-spin .75s linear infinite",
      }} />
      <style>{`@keyframes qc-spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{
        fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)",
        color: "var(--qc-ink-3)", letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        {message}
      </p>
    </div>
  );
}

// ── Main page content ──────────────────────────────────────────────────────────

function WyckoffContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") ?? "";

  const { prices, loading, error } = usePrices(symbol);
  const { data: screenerInfo } = useScreenerInfo(symbol);
  const companyInfo = screenerInfo?.company
    ? { name: screenerInfo.company.name, exchange: screenerInfo.company.exchange, sector: screenerInfo.company.sector, industry: screenerInfo.company.industry }
    : null;
  const [result, setResult] = useState<WyckoffResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const wyckoffBars: WyckoffBar[] = prices.map((p) => ({
    date: p.date, open: p.open, high: p.high, low: p.low, close: p.close, volume: p.volume,
  }));

  useEffect(() => {
    if (!wyckoffBars.length) return;
    setAnalyzing(true);
    // Use MessageChannel to yield to the browser before running the heavy analysis
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      setResult(analyzeWyckoff(wyckoffBars));
      setAnalyzing(false);
    };
    ch.port2.postMessage(null);
    return () => { ch.port1.onmessage = null; };
  // wyckoffBars is derived from prices — depend on prices identity
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  if (!symbol) {
    return (
      <ScreenerPageShell navItems={[]} companyInfo={companyInfo}>
        <div style={{ padding: "24px 16px", fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-down)" }}>No symbol provided</div>
      </ScreenerPageShell>
    );
  }

  return (
    <ScreenerPageShell navItems={[]} companyInfo={companyInfo}>
      <div style={{
        padding: "20px 20px 48px",
        minHeight: "100vh",
        background: "var(--qc-bg)",
        fontFamily: "var(--qc-font-sans)",
      }}>
        <PageHeader symbol={symbol} />

        {(loading || analyzing) && (
          <LoadingState message={loading ? "Fetching price data…" : "Resampling & analysing…"} />
        )}

        {error && (
          <div style={{
            color: "var(--qc-down)", padding: "16px 0",
            fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-12)",
          }}>
            Error fetching prices: {error}
          </div>
        )}

        {!loading && !analyzing && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PhaseCard result={result} />
            <MetricsStrip result={result} />
            <SectionPanel title="Wyckoff Market Cycle — Current Position">
              <CycleSchematic phaseType={result.phaseType} />
            </SectionPanel>
            <SectionPanel title="Daily Candlestick Chart — Last 3 Years">
              <WyckoffChart bars={wyckoffBars} result={result} />
            </SectionPanel>
            <EventsGrid result={result} />
          </div>
        )}

        {!loading && !analyzing && !result && !error && prices.length === 0 && (
          <div style={{
            color: "var(--qc-ink-3)", padding: "40px 0",
            textAlign: "center", fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-12)",
          }}>
            No price data available for {symbol}
          </div>
        )}
      </div>
    </ScreenerPageShell>
  );
}

export default function WyckoffPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--qc-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--qc-font-sans)", fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-3)" }}>Loading…</span>
      </div>
    }>
      <WyckoffContent />
    </Suspense>
  );
}
