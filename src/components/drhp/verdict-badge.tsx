import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";

type VerdictBadgeSize = "sm" | "md" | "lg";

interface VerdictBadgeProps {
  verdict: string;
  size?: VerdictBadgeSize;
}

function classify(verdict: string): "positive" | "negative" | "neutral" | "cautious" {
  const v = verdict.toUpperCase();
  if (["BUY", "STRONG BUY", "SUBSCRIBE"].some((k) => v.startsWith(k))) return "positive";
  if (["AVOID", "SELL", "STRONG AVOID"].some((k) => v.startsWith(k))) return "negative";
  if (["SUBSCRIBE ON DIPS", "CONSIDER"].some((k) => v.startsWith(k))) return "cautious";
  return "neutral";
}

// Solid verdict fill from design-system tokens (semantic up/down/warn/ink).
const CONFIG = {
  positive:  { bg: "bg-up",   text: "text-white", Icon: CheckCircle2 },
  negative:  { bg: "bg-down", text: "text-white", Icon: XCircle },
  cautious:  { bg: "bg-warn", text: "text-white", Icon: TrendingUp },
  neutral:   { bg: "bg-ink",  text: "text-[var(--qc-on-dark)]", Icon: AlertCircle },
};

const SIZE = {
  sm: { badge: "px-2 py-0.5 text-[10px] gap-1", icon: 12 },
  md: { badge: "px-3 py-1 text-[12px] gap-1.5", icon: 14 },
  lg: { badge: "px-4 py-2 text-[14px] gap-2",   icon: 16 },
};

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
  const kind = classify(verdict);
  const { bg, text, Icon } = CONFIG[kind];
  const { badge, icon } = SIZE[size];

  return (
    <span className={`inline-flex items-center font-bold uppercase tracking-wider rounded-sm ${bg} ${text} ${badge}`}>
      <Icon size={icon} />
      {verdict}
    </span>
  );
}
