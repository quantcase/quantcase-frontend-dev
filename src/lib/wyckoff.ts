// Wyckoff Phase Analysis Engine
// Ported from docs/wyckoff-analyzer.html — pure TS, no DOM dependencies.

export interface WyckoffBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WyckoffPivot {
  type: "high" | "low";
  index: number;
  price: number;
  date: string;
  bar: WyckoffBar;
}

export interface TradingRange {
  top: number;
  bottom: number;
  mid: number;
  width: string;
  startBarIdx: number;
  barCount: number;
  pivots?: WyckoffPivot[];
  failedBreakout: boolean | string;
  expanded: boolean;
  allRanges?: RangeLevel[];
  // zone-based fields
  resCount?: number;
  supCount?: number;
  lookback?: number;
  density?: number;
  totalMembers?: number;
  windowStart?: number;
}

export interface RangeLevel {
  lb: number;
  bottom: number;
  top: number;
  mid: number;
  width: string;
  density: number;
  members: number;
  label: string;
  isPrimary: boolean;
}

export interface PriorTR {
  top: number;
  bottom: number;
  mid: number;
  width: string;
  brokeUp: boolean;
  brokeDown: boolean;
  peakAfter: number;
  troughAfter: number;
  returnPct: number;
  startBarIdx: number;
  barCount: number;
  posInRange: number;
}

export interface LocalBreakout {
  top: number;
  bottom: number;
  mid: number;
  width: number;
  barCount: number;
  startBarIdx: number;
  breakoutDate: string;
  breakoutClose: number;
  volRatio: number;
  priorRally: number;
  rangeAvgVol: number;
  breakoutVol: number;
}

export interface DetectionResult {
  detected: boolean;
  idx?: number;
  bar?: WyckoffBar;
  arHigh?: number;
  arLow?: number;
}

export interface WyckoffEvent {
  tag: string;
  label: string;
  ok: boolean;
  desc: string;
}

export interface WyckoffResult {
  phaseType: string;
  subPhase: string;
  conf: number;
  desc: string;
  signal: { e: string; t: string; b: string };
  events: WyckoffEvent[];
  tr: TradingRange | null;
  ptr: PriorTR | null;
  localBO: LocalBreakout | null;
  spring: boolean;
  upthrust: boolean;
  zz: WyckoffPivot[];
  structure: string;
  priorStructure: string;
  priorPctChg: number;
  sc: DetectionResult;
  bc: DetectionResult;
  ps: DetectionResult;
  psy: DetectionResult;
  st: DetectionResult;
  sow: DetectionResult;
  volBias: string;
  volDrying: boolean;
  lastClose: number;
  maxHigh: number;
  minLow: number;
  pricePos: number;
  priceChg: number;
  volRatio: number;
  sma20: number;
  posIn2yrRange: number;
  nearSwingHigh2yr: boolean;
  nearSwingLow2yr: boolean;
  priorWasUp: boolean;
  priorWasDown: boolean;
  correctionInUptrend: boolean;
  failedBreakout: boolean;
  expandedRange: boolean;
}

// ── Zigzag pivot engine ───────────────────────────────────────────────────────

function detectPivots(bars: WyckoffBar[], k = 3): WyckoffPivot[] {
  const pivots: WyckoffPivot[] = [];
  const n = bars.length;
  for (let i = k; i < n - k; i++) {
    let isH = true, isL = true;
    for (let j = 1; j <= k; j++) {
      if (bars[i].high <= bars[i - j].high || bars[i].high <= bars[i + j].high) isH = false;
      if (bars[i].low >= bars[i - j].low || bars[i].low >= bars[i + j].low) isL = false;
    }
    if (isH) pivots.push({ type: "high", index: i, price: bars[i].high, date: bars[i].date, bar: bars[i] });
    if (isL) pivots.push({ type: "low", index: i, price: bars[i].low, date: bars[i].date, bar: bars[i] });
  }
  return pivots.sort((a, b) => a.index - b.index);
}

function alternateFilter(pivots: WyckoffPivot[]): WyckoffPivot[] {
  if (!pivots.length) return [];
  const zz: WyckoffPivot[] = [pivots[0]];
  for (let i = 1; i < pivots.length; i++) {
    const last = zz[zz.length - 1], curr = pivots[i];
    if (curr.index === last.index) {
      if (curr.type === last.type) {
        if (curr.type === "high" && curr.price > last.price) zz[zz.length - 1] = curr;
        else if (curr.type === "low" && curr.price < last.price) zz[zz.length - 1] = curr;
      }
      continue;
    }
    if (curr.type === last.type) {
      if (curr.type === "high" && curr.price > last.price) zz[zz.length - 1] = curr;
      else if (curr.type === "low" && curr.price < last.price) zz[zz.length - 1] = curr;
    } else {
      zz.push(curr);
    }
  }
  return zz;
}

function significanceFilter(zz: WyckoffPivot[], minPct = 2.0): WyckoffPivot[] {
  if (zz.length < 2) return zz;
  let changed = true;
  let arr = zz.slice();
  while (changed) {
    changed = false;
    const out: WyckoffPivot[] = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
      const last = out[out.length - 1];
      const curr = arr[i];
      const pct = Math.abs(curr.price - last.price) / last.price * 100;
      if (pct >= minPct) {
        out.push(curr);
      } else {
        if (curr.type === last.type) {
          if (curr.type === "high" && curr.price > last.price) out[out.length - 1] = curr;
          else if (curr.type === "low" && curr.price < last.price) out[out.length - 1] = curr;
        } else {
          if (out.length >= 2) {
            const prev = out[out.length - 2];
            const keepLast = Math.abs(last.price - prev.price) >= Math.abs(curr.price - prev.price);
            if (!keepLast) out[out.length - 1] = curr;
          } else {
            if (curr.type === "high" && curr.price > last.price) out[out.length - 1] = curr;
            else if (curr.type === "low" && curr.price < last.price) out[out.length - 1] = curr;
          }
        }
        changed = true;
      }
    }
    arr = out;
  }
  return alternateFilter(arr);
}

const _dynMinPctCache = new Map<string, number>();

function dynamicMinPct(bars: WyckoffBar[]): number {
  if (bars.length < 20) return 3.0;
  const key = bars.length + "|" + bars[bars.length - 1].close.toFixed(2);
  if (_dynMinPctCache.has(key)) return _dynMinPctCache.get(key)!;
  const rawAlt = alternateFilter(detectPivots(bars, 3));
  if (rawAlt.length < 4) { _dynMinPctCache.set(key, 3.0); return 3.0; }
  const swings = rawAlt.slice(1).map((p, i) =>
    Math.abs(p.price - rawAlt[i].price) / rawAlt[i].price * 100
  ).sort((a, b) => a - b);
  const TARGET = 6;
  let chosen = 3.0;
  for (let i = swings.length - 1; i >= 0; i--) {
    const cand = swings[i];
    if (cand < 3.0) break;
    const filtered = significanceFilter(rawAlt.slice(), cand);
    if (filtered.length >= TARGET) { chosen = cand; break; }
  }
  const result = Math.min(15, Math.max(3, chosen));
  _dynMinPctCache.set(key, result);
  if (_dynMinPctCache.size > 500) _dynMinPctCache.clear();
  return result;
}

function getZigzag(bars: WyckoffBar[], k = 3, minPct: number | null = null): WyckoffPivot[] {
  const threshold = minPct !== null ? minPct : dynamicMinPct(bars);
  return significanceFilter(alternateFilter(detectPivots(bars, k)), threshold);
}

// ── Volume helpers ────────────────────────────────────────────────────────────

function swingVolume(bars: WyckoffBar[], zz: WyckoffPivot[]) {
  if (zz.length < 2) return { upSwingVol: 0, dnSwingVol: 0, volBias: "neutral" };
  const last4 = zz.slice(-4);
  let upIntensity = 0, dnIntensity = 0, upSwings = 0, dnSwings = 0;
  for (let i = 1; i < last4.length; i++) {
    const a = last4[i - 1], b = last4[i];
    const swingBars = bars.slice(a.index, b.index + 1);
    const swingLen = Math.max(1, swingBars.length);
    const intensity = swingBars.reduce((s, x) => s + x.volume, 0) / swingLen;
    if (b.type === "high") { upIntensity += intensity; upSwings++; }
    else { dnIntensity += intensity; dnSwings++; }
  }
  const avgUp = upSwings ? upIntensity / upSwings : 0;
  const avgDn = dnSwings ? dnIntensity / dnSwings : 0;
  const bias = avgUp > avgDn * 1.2 ? "bullish" : avgDn > avgUp * 1.2 ? "bearish" : "neutral";
  return { upSwingVol: avgUp, dnSwingVol: avgDn, volBias: bias };
}

function isVolDrying(bars: WyckoffBar[]): boolean {
  const fullAvg = bars.reduce((s, b) => s + b.volume, 0) / bars.length;
  const rec = bars.slice(-20);
  const recAvg = rec.reduce((s, b) => s + b.volume, 0) / rec.length;
  return recAvg < fullAvg * 0.72;
}

// ── Event detectors ───────────────────────────────────────────────────────────

function detectPS(bars: WyckoffBar[]): DetectionResult {
  const n = bars.length;
  for (let i = Math.max(5, n - 180); i < n - 2; i++) {
    const b = bars[i];
    const prior = bars.slice(Math.max(0, i - 60), i);
    if (prior.length < 5) continue;
    const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
    const avgSpread = prior.reduce((s, x) => s + (x.high - x.low), 0) / prior.length;
    const priorLow = Math.min(...prior.map(x => x.low));
    const spread = b.high - b.low;
    const closePos = spread > 0 ? (b.close - b.low) / spread : 0.5;
    if (b.close >= b.open) continue;
    if (spread <= avgSpread * 1.3) continue;
    if (b.volume <= avgVol * 1.3) continue;
    if (b.low > priorLow * 1.02) continue;
    if (closePos < 0.45) continue;
    if (spread > avgSpread * 1.8 && b.volume > avgVol * 2.0) continue;
    return { detected: true, idx: i, bar: b };
  }
  return { detected: false };
}

function detectPSY(bars: WyckoffBar[]): DetectionResult {
  const n = bars.length;
  for (let i = Math.max(5, n - 180); i < n - 2; i++) {
    const b = bars[i];
    const prior = bars.slice(Math.max(0, i - 60), i);
    if (prior.length < 5) continue;
    const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
    const avgSpread = prior.reduce((s, x) => s + (x.high - x.low), 0) / prior.length;
    const priorHigh = Math.max(...prior.map(x => x.high));
    const spread = b.high - b.low;
    const closePos = spread > 0 ? (b.close - b.low) / spread : 0.5;
    if (b.close <= b.open) continue;
    if (spread <= avgSpread * 1.3) continue;
    if (b.volume <= avgVol * 1.3) continue;
    if (b.high < priorHigh * 0.99) continue;
    if (closePos > 0.55) continue;
    if (spread > avgSpread * 1.8 && b.volume > avgVol * 2.0) continue;
    return { detected: true, idx: i, bar: b };
  }
  return { detected: false };
}

function detectST(bars: WyckoffBar[], scResult: DetectionResult): DetectionResult {
  if (!scResult.detected || scResult.idx == null || !scResult.bar) return { detected: false };
  const n = bars.length;
  const scIdx = scResult.idx;
  const scBar = scResult.bar;
  for (let i = scIdx + 3; i < Math.min(scIdx + 80, n); i++) {
    const b = bars[i];
    const prior = bars.slice(Math.max(0, i - 20), i);
    if (prior.length < 3) continue;
    const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
    const avgSpread = prior.reduce((s, x) => s + (x.high - x.low), 0) / prior.length;
    const spread = b.high - b.low;
    if (b.low > scBar.low * 1.08) continue;
    if (b.volume >= scBar.volume * 0.8) continue;
    if (spread >= (scBar.high - scBar.low) * 0.8) continue;
    return { detected: true, idx: i, bar: b };
  }
  return { detected: false };
}

function detectSOW(bars: WyckoffBar[], trBottom: number, trTop: number): DetectionResult {
  const n = bars.length;
  const trRange = trTop - trBottom;
  for (let i = Math.max(5, n - 120); i < n; i++) {
    const b = bars[i];
    const prior = bars.slice(Math.max(0, i - 30), i);
    if (prior.length < 5) continue;
    const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
    const avgSpread = prior.reduce((s, x) => s + (x.high - x.low), 0) / prior.length;
    const spread = b.high - b.low;
    const closePos = spread > 0 ? (b.close - b.low) / spread : 0.5;
    const posInTR = (b.close - trBottom) / trRange;
    if (b.close >= b.open) continue;
    if (spread <= avgSpread * 1.3) continue;
    if (b.volume <= avgVol * 1.4) continue;
    if (posInTR > 0.30) continue;
    if (closePos > 0.35) continue;
    return { detected: true, idx: i, bar: b };
  }
  return { detected: false };
}

function detectSC(bars: WyckoffBar[]): DetectionResult {
  const n = bars.length;
  for (let i = 5; i < n - 3; i++) {
    const b = bars[i];
    const prior = bars.slice(Math.max(0, i - 60), i);
    if (prior.length < 5) continue;
    const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
    const avgSpread = prior.reduce((s, x) => s + (x.high - x.low), 0) / prior.length;
    const priorLow = Math.min(...prior.map(x => x.low));
    const spread = b.high - b.low;
    const closePos = spread > 0 ? (b.close - b.low) / spread : 0.5;
    if (b.close >= b.open) continue;
    if (spread <= avgSpread * 1.8) continue;
    if (b.volume <= avgVol * 2.0) continue;
    if (b.low > priorLow * 1.015) continue;
    if (closePos < 0.4) continue;
    const lookAhead = Math.min(10, n - 1 - i);
    const nextBars = Array.from({ length: lookAhead }, (_, j) => bars[i + 1 + j]);
    const hasClose = nextBars.some(x => x.close > b.close);
    const maxClose = Math.max(...nextBars.map(x => x.close));
    const hasRally = maxClose > b.close * 1.02;
    if (!hasClose || !hasRally) continue;
    return { detected: true, idx: i, bar: b, arHigh: maxClose };
  }
  return { detected: false };
}

function detectBC(bars: WyckoffBar[]): DetectionResult {
  const n = bars.length;
  for (let i = 5; i < n - 3; i++) {
    const b = bars[i];
    const prior = bars.slice(Math.max(0, i - 60), i);
    if (prior.length < 5) continue;
    const avgVol = prior.reduce((s, x) => s + x.volume, 0) / prior.length;
    const avgSpread = prior.reduce((s, x) => s + (x.high - x.low), 0) / prior.length;
    const priorHigh = Math.max(...prior.map(x => x.high));
    const spread = b.high - b.low;
    const closePos = spread > 0 ? (b.close - b.low) / spread : 0.5;
    if (b.close <= b.open) continue;
    if (spread <= avgSpread * 1.8) continue;
    if (b.volume <= avgVol * 2.0) continue;
    if (b.high < priorHigh * 0.985) continue;
    if (closePos > 0.6) continue;
    const lookAhead = Math.min(10, n - 1 - i);
    const nextBars = Array.from({ length: lookAhead }, (_, j) => bars[i + 1 + j]);
    const hasClose = nextBars.some(x => x.close < b.close);
    const minClose = Math.min(...nextBars.map(x => x.close));
    const hasReact = minClose < b.close * 0.98;
    if (!hasClose || !hasReact) continue;
    return { detected: true, idx: i, bar: b, arLow: minClose };
  }
  return { detected: false };
}

function detectSpring(bars: WyckoffBar[], tr: TradingRange | null, zz: WyckoffPivot[]): boolean {
  if (!tr || !zz || zz.length < 2) return false;
  const n = bars.length;
  const lastClose = bars[n - 1].close;
  if (lastClose < tr.bottom) return false;
  const trStart = tr.startBarIdx ?? 0;
  const zzLows = zz
    .filter(p => p.type === "low" && p.index >= trStart)
    .sort((a, b) => b.index - a.index);
  for (const low of zzLows) {
    const pivotBar = bars[low.index];
    if (!pivotBar) continue;
    const brokeBelow = pivotBar.close < tr.bottom * 0.999;
    if (!brokeBelow) continue;
    const recovered = lastClose > tr.bottom;
    const netUp = lastClose > low.price;
    if (recovered && netUp) return true;
  }
  return false;
}

function detectUpthrust(bars: WyckoffBar[], tr: TradingRange | null, zz: WyckoffPivot[]): boolean {
  if (!tr || !zz || zz.length < 2) return false;
  const n = bars.length;
  const lastClose = bars[n - 1].close;
  if (lastClose > tr.top) return false;
  const trStart = tr.startBarIdx ?? 0;
  const zzHighs = zz
    .filter(p => p.type === "high" && p.index >= trStart)
    .sort((a, b) => b.index - a.index);
  for (const high of zzHighs) {
    const pivotBar = bars[high.index];
    if (!pivotBar) continue;
    const closedAbove = pivotBar.close > tr.top * 1.001;
    const wickAbove = high.price > tr.top * 1.001 && pivotBar.close <= tr.top;
    if (!closedAbove && !wickAbove) continue;
    const rejected = lastClose < tr.top;
    const netDown = lastClose < high.price;
    if (rejected && netDown) return true;
  }
  return false;
}

// ── Prior TR finder ───────────────────────────────────────────────────────────

function findPriorTR(bars: WyckoffBar[], fixedMinPct: number | null): PriorTR | null {
  const n = bars.length;
  if (n < 120) return null;
  const lastClose = bars[n - 1].close;
  const minPct = fixedMinPct != null ? fixedMinPct : dynamicMinPct(bars);
  const fullZZ = getZigzag(bars, 3, minPct);
  if (fullZZ.length < 4) return null;
  const pivotIndices = fullZZ.map(p => p.index).filter(idx => idx >= 80 && idx <= n - 30);
  const seen = new Set<number>();
  const candidates: number[] = [];
  for (const idx of pivotIndices) {
    for (const offset of [0, -20, -40, -60]) {
      const e = idx + offset;
      if (e >= 80 && e <= n - 30 && !seen.has(e)) { seen.add(e); candidates.push(e); }
    }
  }
  candidates.sort((a, b) => b - a);

  const allTimeHigh = Math.max(...bars.map(b => b.high));
  for (const endBar of candidates) {
    const slice = bars.slice(0, endBar);
    const zzSlice = significanceFilter(alternateFilter(detectPivots(slice, 3)), minPct);
    const tr = findTradingRangeLegacy(slice, zzSlice);
    if (!tr) continue;
    if (parseFloat(tr.width) > 40) continue;
    const afterBars = bars.slice(endBar);
    const peakAfter = Math.max(...afterBars.map(b => b.high));
    const troughAfter = Math.min(...afterBars.map(b => b.low));
    const peakIsATH = peakAfter >= allTimeHigh * 0.98;
    const peakExceedsTop = peakAfter > tr.top * 1.08;
    const troughUnderBottom = troughAfter < tr.bottom * 0.92;
    const sliceLastClose = bars[endBar - 1].close;
    const topIsSpike = tr.top > tr.bottom * 1.10 && sliceLastClose < tr.top * 0.94;
    const brokeUp = peakExceedsTop || (topIsSpike && peakAfter >= tr.top * 0.95);
    const brokeDown = troughUnderBottom;
    const backInside = lastClose <= tr.top * 1.10 && lastClose >= tr.bottom * 0.90;
    const posInPriorTR = tr.top > tr.bottom ? (lastClose - tr.bottom) / (tr.top - tr.bottom) : 0.5;
    const brokeUpEffective = brokeUp && backInside;
    const brokeDownEffective = brokeDown && backInside;
    let effectiveBrokeUp = brokeUpEffective && !brokeDownEffective;
    let effectiveBrokeDown = brokeDownEffective && !brokeUpEffective;
    if (brokeUpEffective && brokeDownEffective) {
      effectiveBrokeUp = posInPriorTR > 0.5;
      effectiveBrokeDown = !effectiveBrokeUp;
    }
    if (effectiveBrokeUp || effectiveBrokeDown) {
      const returnFromPeak = effectiveBrokeUp ? (peakAfter - lastClose) / peakAfter * 100 : 0;
      const returnFromTrough = effectiveBrokeDown ? (lastClose - troughAfter) / troughAfter * 100 : 0;
      return {
        top: tr.top, bottom: tr.bottom, mid: tr.mid, width: tr.width,
        brokeUp: effectiveBrokeUp, brokeDown: effectiveBrokeDown,
        peakAfter, troughAfter,
        returnPct: effectiveBrokeUp ? returnFromPeak : returnFromTrough,
        startBarIdx: tr.startBarIdx, barCount: tr.barCount,
        posInRange: posInPriorTR,
      };
    }
  }
  return null;
}

// Legacy zigzag-based TR finder used by findPriorTR
function findTradingRangeLegacy(bars: WyckoffBar[], zz: WyckoffPivot[]): TradingRange | null {
  const n = bars.length;
  if (zz.length < 3) return null;
  const lastClose = bars[n - 1].close;

  function tryWindow(lookback: number, strict: boolean): TradingRange | null {
    const windowStart = Math.max(0, n - lookback);
    const inWindow = zz.filter(p => p.index >= windowStart);
    const inWinHighs = inWindow.filter(p => p.type === "high");
    const inWinLows = inWindow.filter(p => p.type === "low");
    if (inWinHighs.length < 1 || inWinLows.length < 1) return null;
    if (strict && inWinHighs.length < 2 && inWinLows.length < 2) return null;
    if (!strict && lookback <= 60 && inWinHighs.length < 2 && inWinLows.length < 2) return null;

    const netH_full = inWinHighs.length >= 2
      ? (inWinHighs[inWinHighs.length - 1].price - inWinHighs[0].price) / inWinHighs[0].price * 100 : 0;
    const netL_full = inWinLows.length >= 2
      ? (inWinLows[inWinLows.length - 1].price - inWinLows[0].price) / inWinLows[0].price * 100 : 0;
    const lastH3 = inWinHighs.slice(-3), lastL3 = inWinLows.slice(-3);
    const netH_tail = lastH3.length >= 2 ? (lastH3[lastH3.length - 1].price - lastH3[0].price) / lastH3[0].price * 100 : netH_full;
    const netL_tail = lastL3.length >= 2 ? (lastL3[lastL3.length - 1].price - lastL3[0].price) / lastL3[0].price * 100 : netL_full;
    const netH = Math.abs(netH_tail) < Math.abs(netH_full) ? netH_tail : netH_full;
    const netL = Math.abs(netL_tail) < Math.abs(netL_full) ? netL_tail : netL_full;

    const netFlat = Math.abs(netH) <= 5 && Math.abs(netL) <= 5;
    if (netFlat) {
      const top = inWinHighs.length ? Math.max(...inWinHighs.map(p => p.price)) : -Infinity;
      const bottom = inWinLows.length ? Math.min(...inWinLows.map(p => p.price)) : Infinity;
      if (top <= bottom || top === -Infinity || bottom === Infinity) return null;
      const widthPct = ((top - bottom) / bottom * 100).toFixed(1);
      if (parseFloat(widthPct) < 1.5) return null;
      if (lastClose > top * 1.01 || lastClose < bottom * 0.99) return null;
      return { top, bottom, mid: (top + bottom) / 2, width: widthPct, startBarIdx: windowStart, barCount: n - windowStart, pivots: inWindow, failedBreakout: false, expanded: false };
    }
    return null;
  }

  let best: TradingRange | null = null;
  for (const lb of [60, 120, 180]) {
    const candidate = tryWindow(lb, true);
    if (!candidate) continue;
    if (!best) { best = candidate; continue; }
    const sameRange = candidate.top <= best.top * 1.05 && candidate.bottom >= best.bottom * 0.95;
    if (sameRange) best = candidate;
  }
  return best;
}

// ── Local breakout detector ───────────────────────────────────────────────────

function detectLocalBreakout(bars: WyckoffBar[]): LocalBreakout | null {
  const n = bars.length;
  if (n < 90) return null;
  const last90 = bars.slice(-90);
  const localMin = dynamicMinPct(last90);
  const localZZ = getZigzag(last90, 3, localMin);
  const WINDOW = 60;
  const ws = Math.max(0, last90.length - WINDOW);
  const inW = localZZ.filter(p => p.index >= ws);
  const winH = inW.filter(p => p.type === "high");
  const winL = inW.filter(p => p.type === "low");
  if (winH.length < 2 || winL.length < 2) return null;
  const trTop = Math.max(...winH.map(p => p.price));
  const trBot = Math.min(...winL.map(p => p.price));
  const netH = Math.abs((winH[winH.length - 1].price - winH[0].price) / winH[0].price * 100);
  const netL = Math.abs((winL[winL.length - 1].price - winL[0].price) / winL[0].price * 100);
  if (netH >= 8 || netL >= 8) return null;
  const lastClose = bars[n - 1].close;
  if (lastClose <= trTop * 1.005) return null;
  let boIdx = -1;
  for (let i = n - 10; i < n; i++) {
    if (bars[i].close > trTop * 1.005) { boIdx = i; break; }
  }
  if (boIdx < 0) return null;
  const globalWs = n - 90 + ws;
  const rangeVolBars = bars.slice(globalWs, boIdx);
  if (rangeVolBars.length < 5) return null;
  const rangeAvgVol = rangeVolBars.reduce((s, b) => s + b.volume, 0) / rangeVolBars.length;
  const boVol = bars[boIdx].volume;
  const volRatio = boVol / rangeAvgVol;
  if (volRatio < 1.5) return null;
  const preStart = Math.max(0, globalWs - 60);
  const preRangeLow = Math.min(...bars.slice(preStart, globalWs).map(b => b.low));
  const priorRally = (trBot - preRangeLow) / preRangeLow * 100;
  if (priorRally < 15) return null;
  return {
    top: trTop, bottom: trBot, mid: (trTop + trBot) / 2,
    width: parseFloat(((trTop - trBot) / trBot * 100).toFixed(1)),
    barCount: boIdx - globalWs, startBarIdx: globalWs,
    breakoutDate: bars[boIdx].date, breakoutClose: bars[boIdx].close,
    volRatio: parseFloat(volRatio.toFixed(1)), priorRally: parseFloat(priorRally.toFixed(1)),
    rangeAvgVol: Math.round(rangeAvgVol), breakoutVol: boVol,
  };
}

// ── Range classifier ──────────────────────────────────────────────────────────

interface ClassifySignals {
  pp: number; ath: number;
  sc: boolean; bc: boolean;
  spring: boolean; upthrust: boolean;
  vb: string; vd: boolean;
  posInTR: number;
  rMacro: number;
}

function classifyRange(priorDir: string, s: ClassifySignals): string {
  if (priorDir === "down") {
    let score = 0;
    if (s.sc) score += 2; else score -= 2;
    if (s.spring) score += 2;
    if (s.bc) score -= 1;
    if (s.pp < 0.20) score += 2;
    else if (s.pp < 0.35) score += 1;
    else if (s.pp > 0.70) score -= 2;
    else if (s.pp > 0.55) score -= 1;
    if (s.ath < -60) score += 1;
    if (s.ath > -25) score -= 1;
    if (s.vb === "bullish") score += 1;
    if (s.vb === "bearish") score -= 1;
    if (s.vd) score += 1;
    if (!s.sc && !s.spring && s.pp >= 0.20) score = Math.min(score, 0);
    return score > 0 ? "Accumulation" : "Re-Distribution";
  } else {
    let score = 0;
    if (s.bc) score += 3; else score -= 2;
    if (s.upthrust) {
      if ((s.posInTR ?? 0.5) >= 0.6) score -= 1;
      else score += 2;
    }
    if (s.pp > 0.85) score += 2;
    else if (s.pp > 0.70) score += 1;
    else if (s.pp < 0.40) score -= 2;
    else if (s.pp < 0.55) score -= 1;
    if (s.ath > -10) score += 2;
    else if (s.ath > -20) score += 1;
    if (s.ath < -40) score -= 1;
    if (s.vd) score -= 1;
    if (s.vb === "bearish") score += 1;
    if (s.vb === "bullish") score -= 1;
    const strongBull = (s.rMacro ?? 0) > 50;
    const genuineUTAD = s.upthrust && (s.posInTR ?? 0.5) < 0.5 && !strongBull;
    if (!s.bc && !genuineUTAD) score = Math.min(score, 0);
    return score > 0 ? "Distribution" : "Re-Accumulation";
  }
}

// ── Main analysis entry point ─────────────────────────────────────────────────

export function analyzeWyckoff(bars: WyckoffBar[]): WyckoffResult {
  const n = bars.length;
  if (n < 20) return _emptyResult(bars);

  // ── 1. Zone-based range detection ────────────────────────────────────────────
  function try3CandleWindow(lookback: number): TradingRange | null {
    const sliceStart = Math.max(0, n - lookback);
    const slice = bars.slice(sliceStart);
    const highs: { index: number; price: number; date: string }[] = [];
    const lows: { index: number; price: number; date: string }[] = [];
    for (let i = 1; i < slice.length - 1; i++) {
      if (slice[i].high > slice[i - 1].high && slice[i].high > slice[i + 1].high)
        highs.push({ index: i, price: slice[i].high, date: slice[i].date });
      if (slice[i].low < slice[i - 1].low && slice[i].low < slice[i + 1].low)
        lows.push({ index: i, price: slice[i].low, date: slice[i].date });
    }
    const minZoneMembers = lookback <= 30 ? 2 : lookback <= 60 ? 3 : lookback <= 120 ? 5 : 6;
    function densestZone(pivots: typeof highs) {
      if (pivots.length < minZoneMembers) return null;
      let best: typeof pivots | null = null, bestN = 0;
      for (let i = 0; i < pivots.length; i++) {
        const a = pivots[i].price;
        const members = pivots.filter(p => p.price >= a * 0.985 && p.price <= a * 1.015);
        if (members.length > bestN) { bestN = members.length; best = members; }
      }
      return bestN >= minZoneMembers ? best : null;
    }
    const resM = densestZone(highs), supM = densestZone(lows);
    if (!resM || !supM) return null;
    const top = Math.max(...resM.map(p => p.price));
    const bottom = Math.min(...supM.map(p => p.price));
    if (top <= bottom) return null;
    const widthPct = (top - bottom) / bottom * 100;
    if (widthPct < 3 || widthPct > 15) return null;
    const density = (resM.length + supM.length) / lookback;
    if (density < 0.10) return null;
    const rIdx = resM.map(p => p.index), sIdx = supM.map(p => p.index);
    if (Math.max(...rIdx) - Math.min(...rIdx) < 10 && Math.max(...sIdx) - Math.min(...sIdx) < 10) return null;
    function priceStep(p: number) { return p < 10 ? 0.1 : p < 100 ? 1 : p < 1000 ? 5 : p < 10000 ? 10 : 50; }
    function floorTo(p: number) { const s = priceStep(p); return Math.floor(p / s) * s; }
    function ceilTo(p: number) { const s = priceStep(p); return Math.ceil(p / s) * s; }
    function roundTo(p: number) { const s = priceStep(p); return Math.round(p / s) * s; }
    const rBottom = floorTo(bottom), rTop = ceilTo(top), rMid = roundTo((top + bottom) / 2);
    const lastClose = bars[n - 1].close;
    if (lastClose > rTop || lastClose < rBottom) return null;
    return {
      top: rTop, bottom: rBottom, width: widthPct.toFixed(1),
      lookback, density, totalMembers: resM.length + supM.length,
      windowStart: sliceStart, barCount: n - sliceStart, startBarIdx: sliceStart,
      resCount: resM.length, supCount: supM.length,
      failedBreakout: false, expanded: false, mid: rMid,
    };
  }

  const candidates: TradingRange[] = [];
  for (const lb of [30, 60, 120, 180]) {
    const r = try3CandleWindow(lb);
    if (r) candidates.push(r);
  }
  candidates.sort((a, b) => (b.density ?? 0) - (a.density ?? 0));
  const tr = candidates.length > 0 ? candidates[0] : null;

  if (tr && candidates.length > 1) {
    (candidates as (TradingRange & { _isPrimary?: boolean })[]).forEach((r, i) => { r._isPrimary = (i === 0); });
    const included: TradingRange[] = [];
    tr.allRanges = (candidates as (TradingRange & { _isPrimary?: boolean })[])
      .slice()
      .filter(r => {
        if (r._isPrimary) { included.push(r); return true; }
        if (!(r.bottom < tr.top && r.top > tr.bottom)) return false;
        const isDuplicate = included.some(ex => {
          const tClose = Math.abs(r.top - ex.top) / (ex.top || 1) < 0.03;
          const bClose = Math.abs(r.bottom - ex.bottom) / (ex.bottom || 1) < 0.03;
          const tDiff = Math.abs(r.top - ex.top) / (ex.top || 1);
          const bDiff = Math.abs(r.bottom - ex.bottom) / (ex.bottom || 1);
          if (tClose && bClose) return true;
          if (tClose && bDiff < 0.05) return true;
          if (bClose && tDiff < 0.05) return true;
          return false;
        });
        if (isDuplicate) return false;
        included.push(r);
        return true;
      })
      .sort((a, b) => (a.lookback ?? 0) - (b.lookback ?? 0))
      .map(r => {
        const w = parseFloat(r.width);
        const label = w <= 6 ? "Micro" : w <= 12 ? "Inner" : "Macro";
        return { lb: r.lookback ?? 0, bottom: r.bottom, top: r.top, mid: r.mid, width: r.width, density: r.density ?? 0, members: r.totalMembers ?? 0, label, isPrimary: !!(r as TradingRange & { _isPrimary?: boolean })._isPrimary };
      });
    (candidates as (TradingRange & { _isPrimary?: boolean })[]).forEach(r => { delete r._isPrimary; });
  } else if (tr) {
    const w = parseFloat(tr.width);
    const label = w <= 6 ? "Micro" : w <= 12 ? "Inner" : "Macro";
    tr.allRanges = [{ lb: tr.lookback ?? 0, bottom: tr.bottom, top: tr.top, mid: tr.mid, width: tr.width, density: tr.density ?? 0, members: tr.totalMembers ?? 0, label, isPrimary: true }];
  }

  // ── 2. Prior trend ────────────────────────────────────────────────────────────
  const allTimeHigh = Math.max(...bars.map(b => b.high));
  const allTimeLow = Math.min(...bars.map(b => b.low));
  const pricePos = (bars[n - 1].close - allTimeLow) / (allTimeHigh - allTimeLow || 1);
  const pctFromATH = (bars[n - 1].close - allTimeHigh) / allTimeHigh * 100;

  function getChg(ws: number, lb: number): number | null {
    const from = Math.max(0, ws - lb);
    const to = Math.max(from + 2, Math.min(ws, n - 1));
    if (to - from < 10) return null;
    return (bars[to].close - bars[from].close) / bars[from].close * 100;
  }

  function calcPriorTrend(windowStart: number) {
    const ws = Math.min(windowStart, n - 2);
    const r126 = getChg(ws, 126) ?? 0;
    const r365 = getChg(ws, 365) ?? getChg(ws, 252) ?? r126;
    const r504 = getChg(ws, 504) ?? r365;
    const r756 = getChg(ws, 756) ?? r504;
    const rMacro = [r365, r504, r756].reduce((best, v) => Math.abs(v) > Math.abs(best) ? v : best, r365);
    let dir: string;
    if (r126 <= -10 && pricePos > 0.65) dir = "down";
    else if (r126 <= -10 && rMacro > 20 && r126 > -22 && pctFromATH > -30) dir = "up";
    else if (r126 > 10 && rMacro > -20) dir = "up";
    else if (rMacro < -12) dir = "down";
    else if (rMacro > 15 && pctFromATH < -35) dir = "down";
    else if (rMacro > 15 && pctFromATH >= -35) dir = "up";
    else if (r126 < -5 && pctFromATH < -25) dir = "down";
    else if (pricePos >= 0.50) dir = "up";
    else dir = "down";
    return { dir, r126, r365: rMacro };
  }

  const priorAnchor = tr ? (tr.windowStart ?? n) : n;
  const priorInfo = calcPriorTrend(priorAnchor);
  const priorDir = priorInfo.dir;

  // ── 3. Phase classification ───────────────────────────────────────────────────
  const trBarsEarly = tr ? bars.slice(tr.startBarIdx) : bars;
  const scEarly = detectSC(trBarsEarly);
  const bcEarly = detectBC(trBarsEarly);
  const minPctEarly = dynamicMinPct(bars);
  const zzEarly = getZigzag(bars, 3, minPctEarly);
  const springEarly = tr ? detectSpring(bars, tr, zzEarly) : false;
  const utEarly = tr ? detectUpthrust(bars, tr, zzEarly) : false;
  const { volBias: vbEarly } = swingVolume(bars, zzEarly);
  const vdEarly = isVolDrying(bars);

  let phaseType: string, subPhase = "", inRange = !!tr;

  if (tr) {
    const posInTRnow = (bars[n - 1].close - tr.bottom) / (tr.top - tr.bottom || 1);
    phaseType = classifyRange(priorDir, {
      pp: pricePos, ath: pctFromATH,
      sc: scEarly.detected, bc: bcEarly.detected,
      spring: springEarly, upthrust: utEarly,
      vb: vbEarly, vd: vdEarly, posInTR: posInTRnow, rMacro: priorInfo.r365,
    });
  } else {
    phaseType = priorDir === "up" ? "Markup" : "Markdown";
    inRange = false;
  }

  // ── 4. Prior TR layer ──────────────────────────────────────────────────────
  const ptr = !tr ? findPriorTR(bars, minPctEarly) : null;

  const trBars = tr ? bars.slice(tr.startBarIdx) : bars;
  const sc = scEarly, bc = bcEarly, zz = zzEarly;
  const ps = detectPS(trBars), psy = detectPSY(trBars);
  const st = detectST(trBars, sc);
  const sow = tr ? detectSOW(bars, tr.bottom, tr.top) : { detected: false };
  const spring = springEarly, upthrust = utEarly;
  const volBias = vbEarly, volDrying = vdEarly;
  const localBO = !tr && !ptr ? detectLocalBreakout(bars) : null;

  // ── 5. PTR phase override ──────────────────────────────────────────────────
  if (ptr && !tr) {
    const posInPtr = (bars[n - 1].close - ptr.bottom) / (ptr.top - ptr.bottom);
    if (ptr.brokeUp) {
      if (posInPtr < 0) {
        phaseType = priorDir === "down" ? "Markdown" : "Re-Distribution";
        subPhase = "";
      } else {
        const brokeUpIsSOS = priorDir === "up" || (priorDir !== "down" && posInPtr >= 0.5);
        if (brokeUpIsSOS) { phaseType = "Re-Accumulation"; subPhase = "SOS Pullback"; }
        else { phaseType = "Re-Distribution"; subPhase = "UTAD"; }
      }
    } else {
      const notDeeplyBroken = pricePos > 0.30 && pctFromATH > -50;
      const brokeDownIsSpring = posInPtr >= 0 && !(priorDir === "down" && posInPtr < 0.4) && volBias !== "bearish" && notDeeplyBroken;
      if (brokeDownIsSpring) { phaseType = "Re-Accumulation"; subPhase = "Spring"; }
      else { phaseType = "Re-Distribution"; subPhase = "LPSY"; }
    }
  }
  if (localBO) { phaseType = "Re-Accumulation"; subPhase = "SOS Breakout"; }

  // ── 6. Sub-phase ─────────────────────────────────────────────────────────────
  if (inRange && !subPhase) {
    if (phaseType === "Accumulation" || phaseType === "Re-Accumulation") {
      if (spring) subPhase = "Phase C";
      else if (sc.detected) subPhase = "Phase B";
      else subPhase = "Phase A";
      if (spring && tr) {
        const posInTR = (bars[n - 1].close - tr.bottom) / (tr.top - tr.bottom);
        if (posInTR > 0.6 && volBias !== "bearish") subPhase = "Phase D";
      }
    }
    if (phaseType === "Distribution" || phaseType === "Re-Distribution") {
      if (upthrust) subPhase = "Phase C";
      else if (bc.detected) subPhase = "Phase B";
      else subPhase = "Phase A";
      if (upthrust && tr) {
        const posInTR = (bars[n - 1].close - tr.bottom) / (tr.top - tr.bottom);
        if (posInTR < 0.4 && volBias !== "bullish") subPhase = "Phase D";
      }
    }
  }

  // ── 7. Confidence ──────────────────────────────────────────────────────────
  let conf = 50;
  if (tr) {
    conf = 55;
    if ((tr.totalMembers ?? 0) >= 10) conf += 10;
    if ((tr.totalMembers ?? 0) >= 16) conf += 5;
    if ((tr.lookback ?? 0) >= 120) conf += 5;
    if (volBias === "bullish" && (phaseType === "Accumulation" || phaseType === "Re-Accumulation")) conf += 8;
    if (volBias === "bearish" && (phaseType === "Distribution" || phaseType === "Re-Distribution")) conf += 8;
    if (sc.detected && (phaseType === "Accumulation" || phaseType === "Re-Accumulation")) conf += 8;
    if (bc.detected && (phaseType === "Distribution" || phaseType === "Re-Distribution")) conf += 8;
    if (spring) conf += 7;
    if (upthrust) conf += 7;
    if (volDrying) conf += 5;
  } else if (ptr) {
    conf = 65;
    if (ptr.returnPct > 10) conf += 7;
    if (volBias === "bullish" && phaseType === "Re-Accumulation") conf += 8;
    if (volBias === "bearish" && phaseType === "Re-Distribution") conf += 8;
  } else if (localBO) {
    conf = localBO.volRatio >= 2.0 ? 78 : 72;
  } else {
    conf = Math.abs(priorInfo.r126) > 20 ? 75 : Math.abs(priorInfo.r126) > 10 ? 65 : 55;
  }
  conf = Math.min(95, Math.max(0, conf));

  // ── 8. Descriptions ────────────────────────────────────────────────────────
  const lastClose = bars[n - 1].close;
  const trDesc = tr ? `₹${tr.bottom.toFixed(0)}–₹${tr.top.toFixed(0)} (${tr.width}% wide, ${tr.barCount} bars)` : "";
  const posInTR = tr ? ((lastClose - tr.bottom) / (tr.top - tr.bottom)) : 0;
  const posInTRpct = tr ? (posInTR * 100).toFixed(0) + "%" : "—";

  let desc = "", signal = { e: "⚖️", t: "", b: "" }, events: WyckoffEvent[] = [];

  if (phaseType === "Accumulation") {
    desc = `Price is consolidating in a ${trDesc} range after a ${Math.abs(priorInfo.r365).toFixed(0)}% decline. Institutional buying is absorbing remaining supply at depressed prices. ${sc.detected ? "A Selling Climax has been detected, confirming institutional absorption." : ""} Volume is ${volDrying ? "contracting (supply exhausted)" : "being monitored"}.`;
    signal = { e: "⏳", t: "ACCUMULATION — Building a Base", b: `Watch for a Spring below ₹${tr?.bottom.toFixed(0)} that quickly recovers. That confirms Phase C and is the optimal long entry.` };
  } else if (phaseType === "Distribution") {
    desc = `Price is consolidating in a ${trDesc} range at elevated levels after a ${priorInfo.r365.toFixed(0)}% advance. Large interests are offloading inventory. ${bc.detected ? "A Buying Climax has been detected." : ""}`;
    signal = { e: "⏳", t: "DISTRIBUTION — Supply Building", b: `Reduce or exit longs. Watch for an Upthrust above ₹${tr?.top.toFixed(0)} that fails — Phase C short entry. Target: ₹${tr?.bottom.toFixed(0)}.` };
  } else if (phaseType === "Re-Accumulation") {
    if (subPhase === "SOS Breakout" && localBO) {
      desc = `Price broke above a ${localBO.width}% micro-range (₹${localBO.bottom.toFixed(0)}–₹${localBO.top.toFixed(0)}) on ${localBO.volRatio.toFixed(1)}× avg volume — a Sign of Strength confirming Re-Accumulation.`;
      signal = { e: "🟢", t: "RE-ACCUMULATION — SOS Breakout", b: `Buy pullbacks that hold above ₹${localBO.bottom.toFixed(0)}. Stop below ₹${localBO.bottom.toFixed(0)}.` };
    } else if (subPhase === "Spring" || subPhase === "SOS Pullback") {
      const ptrRef = ptr ? `₹${ptr.bottom.toFixed(0)}–₹${ptr.top.toFixed(0)}` : "prior range";
      desc = `Price tested below the ${ptrRef} and recovered — a ${subPhase === "Spring" ? "Spring shakeout (bear trap)" : "Sign of Strength pullback (Last Point of Support)"}. The macro trend is UP.`;
      signal = { e: "🟢", t: "RE-ACCUMULATION", b: `Enter long on the recovery. Stop below the ${subPhase === "Spring" ? "Spring" : "pullback"} low.` };
    } else {
      desc = `Price is pausing in a ${trDesc} range mid-uptrend (+${priorInfo.r365.toFixed(0)}%). Re-Accumulation — institutions building additional positions before the next markup leg. ${spring ? "A Spring has confirmed Phase C." : ""}`;
      signal = { e: "⏸️", t: "RE-ACCUMULATION — Next Leg Up Loading", b: `Hold longs. Buy dips to range support ₹${tr?.bottom.toFixed(0)} on drying volume${spring ? " — Spring confirmed, highest-conviction entry" : ""}. Breakout above ₹${tr?.top.toFixed(0)} confirms next markup.` };
    }
  } else if (phaseType === "Re-Distribution") {
    if (subPhase === "UTAD" || subPhase === "LPSY") {
      const ptrRef = ptr ? `₹${ptr.bottom.toFixed(0)}–₹${ptr.top.toFixed(0)}` : "prior range";
      desc = `Price ${subPhase === "UTAD" ? "broke above then returned inside" : "broke below then failed to recover into"} the ${ptrRef}. Re-Distribution: the ${subPhase === "UTAD" ? "breakout was a bull trap (UTAD)" : "bounce is a Last Point of Supply (LPSY)"}.`;
      signal = { e: "🔴", t: "RE-DISTRIBUTION", b: `Short the ${subPhase === "UTAD" ? "reversal from the UTAD spike" : "weak LPSY bounce"}.` };
    } else {
      desc = `Price is pausing in a ${trDesc} range mid-downtrend (${priorInfo.r365.toFixed(0)}%). Re-Distribution — demand exhausting before next markdown. ${upthrust ? "Upthrust confirmed Phase C." : ""}`;
      signal = { e: "⏸️", t: "RE-DISTRIBUTION — Next Leg Down Loading", b: `Short rallies to range resistance ₹${tr?.top.toFixed(0)}${upthrust ? " — Upthrust confirmed, highest-conviction short" : ""}. Breakdown below ₹${tr?.bottom.toFixed(0)} confirms next markdown.` };
    }
  } else if (phaseType === "Markup") {
    desc = `Price is in a confirmed uptrend (+${priorInfo.r365.toFixed(0)}% over past year). No active trading range — demand is dominant. ${volBias === "bullish" ? "Volume confirms: more intensity on up-swings." : ""}`;
    signal = { e: "🚀", t: "MARKUP — Uptrend in Progress", b: "Stay long. Trail stops below swing lows. Watch for Re-Accumulation ranges as add-to-long opportunities." };
  } else if (phaseType === "Markdown") {
    desc = `Price is in a confirmed downtrend (${priorInfo.r365.toFixed(0)}% over past year). No active trading range — supply is dominant. ${volBias === "bearish" ? "Volume confirms: more intensity on down-swings." : ""}`;
    signal = { e: "📉", t: "MARKDOWN — Downtrend in Progress", b: "Avoid longs. Short rallies that fail at lower highs. Watch for a Selling Climax at lows." };
  } else {
    desc = "Insufficient trend clarity. Wait for a clear TR or decisive breakout structure.";
    signal = { e: "⚖️", t: "TRANSITIONAL — Wait for Clarity", b: "Reduce size. Watch for a clear SC or BC to define the next phase." };
  }

  // ── 9. Events panel ───────────────────────────────────────────────────────
  if (inRange) {
    const isAccum = phaseType === "Accumulation" || phaseType === "Re-Accumulation";
    const isDist = phaseType === "Distribution" || phaseType === "Re-Distribution";
    events = [
      { tag: "RANGE", label: "Trading Range", ok: true, desc: `${trDesc} | Price at ${posInTRpct} of range` },
      { tag: "PRIOR", label: "Prior Trend", ok: true, desc: `r126=${priorInfo.r126.toFixed(0)}% r365=${priorInfo.r365.toFixed(0)}% → ${priorDir}` },
      ...(isAccum ? [
        { tag: "PS", label: "Preliminary Support", ok: ps.detected, desc: ps.detected ? `PS bar: ${ps.bar?.date}` : "Watching for first demand bar after decline" },
        { tag: "SC", label: "Selling Climax", ok: sc.detected, desc: sc.detected ? `SC: ${sc.bar?.date} — panic selling absorbed` : "Watching for high-vol wide-spread down bar closing upper half" },
        { tag: "ST", label: "Secondary Test", ok: st.detected, desc: st.detected ? `ST: ${st.bar?.date} — lower vol re-test` : "Lower-vol retest of SC area needed" },
        { tag: "SPRING", label: "Spring / Shakeout", ok: spring, desc: spring ? "Spring confirmed — bear trap, Phase C" : "Watch for dip below range bottom that quickly recovers" },
        { tag: "SOS", label: "Sign of Strength", ok: spring && volBias === "bullish", desc: spring ? `Vol bias: ${volBias}` : "Wide advance on high vol after Spring" },
        { tag: "VOL", label: "Volume Drying", ok: volDrying, desc: volDrying ? "Volume contracting — absorption in progress" : "Monitor for volume contraction on downswings" },
      ] : []),
      ...(isDist ? [
        { tag: "PSY", label: "Preliminary Supply", ok: psy.detected, desc: psy.detected ? `PSY bar: ${psy.bar?.date}` : "Watching for first supply bar after advance" },
        { tag: "BC", label: "Buying Climax", ok: bc.detected, desc: bc.detected ? `BC: ${bc.bar?.date} — public buying absorbed` : "Watching for high-vol wide-spread up bar closing lower half" },
        { tag: "SOW", label: "Sign of Weakness", ok: sow.detected, desc: sow.detected ? `SOW: ${(sow as DetectionResult & { bar?: WyckoffBar }).bar?.date} — supply dominant` : "Wide-spread high-vol down bar closing near low" },
        { tag: "UT", label: "Upthrust / UTAD", ok: upthrust, desc: upthrust ? "Upthrust confirmed — bull trap, Phase C" : "Watch for spike above range top that reverses" },
        { tag: "LPSY", label: "Last Point of Supply", ok: subPhase === "Phase D", desc: "Feeble low-volume rally — ideal short entry" },
        { tag: "VOL", label: "Vol on Down-Moves", ok: volBias === "bearish", desc: `Swing vol bias: ${volBias}` },
      ] : []),
    ];
  } else if (ptr) {
    events = [
      { tag: "PTR", label: "Prior Range", ok: true, desc: `₹${ptr.bottom.toFixed(0)}–₹${ptr.top.toFixed(0)}` },
      { tag: "BREAK", label: ptr.brokeUp ? "Breakout (UTAD/SOS)" : "Breakdown (Spring/LPSY)", ok: true, desc: `${ptr.brokeUp ? "Above" : "Below"} ₹${ptr.brokeUp ? ptr.top.toFixed(0) : ptr.bottom.toFixed(0)}, returned ${ptr.returnPct?.toFixed(1)}%` },
      { tag: "POS", label: "Position in Range", ok: ptr ? ((bars[n - 1].close - ptr.bottom) / (ptr.top - ptr.bottom)) > 0 : false, desc: `posInRange=${((bars[n - 1].close - ptr.bottom) / (ptr.top - ptr.bottom)).toFixed(2)}` },
      { tag: "VOL", label: "Volume Bias", ok: volBias !== "neutral", desc: volBias },
      { tag: "PRIOR", label: "Prior Trend", ok: true, desc: `r126=${priorInfo.r126.toFixed(0)}% r365=${priorInfo.r365.toFixed(0)}% → ${priorDir}` },
    ];
  } else if (localBO) {
    events = [
      { tag: "RANGE", label: "Micro Range", ok: true, desc: `₹${localBO.bottom.toFixed(0)}–₹${localBO.top.toFixed(0)} (${localBO.width}% wide)` },
      { tag: "SOS", label: "SOS Breakout", ok: true, desc: `${localBO.volRatio.toFixed(1)}× avg volume on breakout` },
      { tag: "PRIOR", label: "Prior Trend", ok: true, desc: `r365=${priorInfo.r365.toFixed(0)}% — uptrend` },
      { tag: "VOL", label: "Volume Bias", ok: volBias === "bullish", desc: volBias },
    ];
  } else {
    events = [
      { tag: "STR", label: "Structure", ok: phaseType !== "Transitional", desc: `${phaseType} (r126=${priorInfo.r126.toFixed(0)}% r365=${priorInfo.r365.toFixed(0)}%)` },
      { tag: "VOL", label: "Volume Bias", ok: volBias !== "neutral", desc: volBias },
      { tag: "PRIOR", label: "Prior Trend", ok: priorDir !== "sideways", desc: `${priorDir} | r126=${priorInfo.r126.toFixed(0)}% r365=${priorInfo.r365.toFixed(0)}%` },
    ];
  }

  // ── 10. Return ────────────────────────────────────────────────────────────────
  const priceChg = ((lastClose - bars[0].close) / bars[0].close) * 100;
  const avgVol10 = bars.slice(-10).reduce((s, b) => s + b.volume, 0) / 10;
  const avgVolAll = bars.reduce((s, b) => s + b.volume, 0) / n;
  const volRatio = avgVolAll > 0 ? avgVol10 / avgVolAll : 1;
  const bars2yr = bars.slice(Math.max(0, n - 504));
  const high2yr = Math.max(...bars2yr.map(b => b.high));
  const low2yr = Math.min(...bars2yr.map(b => b.low));
  const range2yr = high2yr - low2yr || 1;
  const posIn2yrRange = (lastClose - low2yr) / range2yr;
  const nearSwingHigh2yr = lastClose >= high2yr * 0.97;
  const nearSwingLow2yr = lastClose <= low2yr * 1.03;
  const sma20 = bars.length >= 20 ? bars.slice(-20).reduce((s, b) => s + b.close, 0) / 20 : bars.reduce((s, b) => s + b.close, 0) / bars.length;

  return {
    phaseType, subPhase, conf, desc, signal, events,
    tr, ptr, localBO, spring, upthrust, zz,
    structure: priorDir === "up" ? "uptrend" : priorDir === "down" ? "downtrend" : "transitional",
    priorStructure: priorDir, priorPctChg: priorInfo.r126,
    sc, bc, ps, psy, st, sow, volBias, volDrying,
    lastClose, maxHigh: allTimeHigh, minLow: allTimeLow,
    pricePos, priceChg, volRatio, sma20,
    posIn2yrRange, nearSwingHigh2yr, nearSwingLow2yr,
    priorWasUp: priorDir === "up", priorWasDown: priorDir === "down",
    correctionInUptrend: priorDir === "up" && priorInfo.r126 < -8,
    failedBreakout: false, expandedRange: false,
  };
}

function _emptyResult(bars: WyckoffBar[]): WyckoffResult {
  return {
    phaseType: "Accumulation", subPhase: "Insufficient Data", conf: 0,
    desc: "Not enough data.", signal: { e: "⚖️", t: "INSUFFICIENT DATA", b: "Need at least 10 bars." },
    events: [], tr: null, ptr: null, localBO: null, spring: false, upthrust: false,
    zz: [], structure: "insufficient", priorStructure: "insufficient", priorPctChg: 0,
    sc: { detected: false }, bc: { detected: false }, ps: { detected: false },
    psy: { detected: false }, st: { detected: false }, sow: { detected: false },
    volBias: "neutral", volDrying: false,
    lastClose: bars[bars.length - 1]?.close ?? 0, maxHigh: 0, minLow: 0,
    pricePos: 0.5, priceChg: 0, volRatio: 1, sma20: 0,
    posIn2yrRange: 0.5, nearSwingHigh2yr: false, nearSwingLow2yr: false,
    priorWasUp: false, priorWasDown: false, correctionInUptrend: false,
    failedBreakout: false, expandedRange: false,
  };
}

export const WYCKOFF_CYCLE = [
  "Accumulation", "Markup", "Re-Accumulation",
  "Distribution", "Markdown", "Re-Distribution",
] as const;

export function phaseColor(pt: string): string {
  // Decorative Wyckoff-phase palette (bright, phase-distinguishing) — intentionally
  // NOT part of the --qc-* semantic system; these six phases need their own
  // recognizable colors that don't map onto up/down/warn/blue.
  const map: Record<string, string> = {
    Markup: "#00e396", "Re-Accumulation": "#00d4ff", Accumulation: "#a78bfa",
    Distribution: "#ff6b35", "Re-Distribution": "#ffd166", Markdown: "#ff4560",
  };
  return map[pt] ?? "#00d4ff";
}

export function calcSMA(bars: WyckoffBar[], period: number): (number | null)[] {
  return bars.map((_, i) =>
    i < period - 1 ? null : bars.slice(i - period + 1, i + 1).reduce((s, b) => s + b.close, 0) / period
  );
}
