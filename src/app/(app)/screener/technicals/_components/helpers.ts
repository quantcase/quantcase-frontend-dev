export function signalColor(signal: string): string {
  const s = signal.toUpperCase();
  if (s === "STRONG_BUY" || s === "BUY" || s === "WEAK_BUY") return "var(--qc-up)";
  if (s === "STRONG_SELL" || s === "SELL" || s === "WEAK_SELL") return "var(--qc-down)";
  return "var(--qc-warn)";
}

export function directionColor(direction: string): string {
  if (direction === "UPTREND") return "var(--qc-up)";
  if (direction === "DOWNTREND") return "var(--qc-down)";
  return "var(--qc-warn)";
}

export function rsiZoneColor(zone: string): string {
  if (zone === "OVERSOLD") return "var(--qc-up)";
  if (zone === "OVERBOUGHT") return "var(--qc-down)";
  return "var(--qc-ink-2)";
}

export function booleanColor(val: boolean, positiveIsTrue = true): string {
  if (positiveIsTrue) return val ? "var(--qc-up)" : "var(--qc-down)";
  return val ? "var(--qc-down)" : "var(--qc-up)";
}
