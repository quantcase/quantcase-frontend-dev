export function signalColor(signal: string): string {
  const s = signal.toUpperCase();
  if (s === "STRONG_BUY" || s === "BUY" || s === "WEAK_BUY") return "text-emerald-600";
  if (s === "STRONG_SELL" || s === "SELL" || s === "WEAK_SELL") return "text-red-600";
  return "text-amber-600";
}

export function directionColor(direction: string): string {
  if (direction === "UPTREND") return "text-emerald-600";
  if (direction === "DOWNTREND") return "text-red-600";
  return "text-amber-600";
}

export function rsiZoneColor(zone: string): string {
  if (zone === "OVERSOLD") return "text-emerald-600";
  if (zone === "OVERBOUGHT") return "text-red-600";
  return "text-zinc-500";
}

export function booleanColor(val: boolean, positiveIsTrue = true): string {
  if (positiveIsTrue) return val ? "text-emerald-600" : "text-red-600";
  return val ? "text-red-600" : "text-emerald-600";
}
