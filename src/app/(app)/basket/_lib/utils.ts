import type { SampleBasket, BasketListState, SortKey } from "./types";
import { BASKET_CATEGORIES } from "../_data/categories";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeBaskets(list: SampleBasket[]): SampleBasket[] {
  return list.map((b) => ({ ...b, slug: b.slug || slugify(b.name) }));
}

export function fmtInr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function matchesFilters(b: SampleBasket, state: BasketListState): boolean {
  if (state.group) {
    const cat = BASKET_CATEGORIES.find((c) => c.key === b.category);
    if (!cat || cat.group !== state.group) return false;
  }
  if (state.category !== "All" && b.category !== state.category) return false;
  if (state.risk !== "All" && b.risk !== state.risk) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    if (!b.name.toLowerCase().includes(q) && !b.rationale.toLowerCase().includes(q)) return false;
  }
  return true;
}

export function sortBaskets(list: SampleBasket[], sort: SortKey): SampleBasket[] {
  const l = [...list];
  if (sort === "return") l.sort((a, b) => b.returnVal - a.returnVal);
  else if (sort === "name") l.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "newest") l.reverse();
  return l;
}

export function seededRandom(seed: string): () => number {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return (s >>> 0) / 4294967295;
  };
}

export function syntheticSeries(slug: string, end: number, points = 12): number[] {
  const rnd = seededRandom(slug);
  const start = end - (end >= 0 ? 8 + rnd() * 10 : -(8 + rnd() * 10));
  const vals = [start];
  for (let i = 1; i < points - 1; i++) {
    const t = i / (points - 1);
    const base = start + (end - start) * t;
    const noise = (rnd() - 0.5) * Math.abs(end - start) * 0.35;
    vals.push(base + noise);
  }
  vals.push(end);
  return vals;
}

export function scoreFields(b: SampleBasket) {
  const rnd = seededRandom((b.slug ?? b.name) + "-scores");
  const base = (b.history && b.history[0]?.avgQc) || Math.round(45 + rnd() * 45);
  const clamp = (v: number) => Math.max(20, Math.min(95, Math.round(v)));
  const mgmt = clamp(base + (rnd() - 0.5) * 24);
  const opp = clamp(base + (rnd() - 0.5) * 24);
  const deal = clamp(base + (rnd() - 0.5) * 24);
  const combined = Math.round((mgmt + opp + deal) / 3);
  const techBreadth = Math.round(30 + rnd() * 60);
  return { combined, mgmt, opp, deal, techBreadth };
}

export function fundamentalFields(b: SampleBasket) {
  const rnd = seededRandom((b.slug ?? b.name) + "-fund");
  return {
    pe: Math.round((14 + rnd() * 22) * 10) / 10,
    niftyPe: 22.4,
    pb: Math.round((1.8 + rnd() * 5) * 10) / 10,
    niftyPb: 3.6,
    divYield: Math.round((0.3 + rnd() * 2.2) * 10) / 10,
    niftyDivYield: 1.3,
    roe: Math.round(8 + rnd() * 22),
    niftyRoe: 15,
    de: Math.round((0.1 + rnd() * 1.1) * 100) / 100,
    niftyDe: 0.55,
    epsGrowth: Math.round((-5 + rnd() * 35) * 10) / 10,
  };
}

export function concentrationFields(b: SampleBasket) {
  const rnd = seededRandom((b.slug ?? b.name) + "-conc");
  const n = b.stocks;
  const weights: number[] = [];
  let remaining = 100;
  for (let i = 0; i < n; i++) {
    const w =
      i === n - 1
        ? remaining
        : Math.max(4, Math.round((remaining / (n - i)) * (0.6 + rnd() * 0.8)));
    weights.push(Math.min(w, remaining));
    remaining -= weights[i];
  }
  weights.sort((a, b2) => b2 - a);
  const top3 = weights.slice(0, 3).reduce((a, c) => a + c, 0);
  const adv = Math.round(8 + rnd() * 180);
  return { top3, adv, n };
}
