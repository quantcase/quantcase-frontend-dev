import type { CSSProperties, ReactNode } from "react";

export type BadgeVariant = "crit" | "warn" | "up" | "info" | "muted";

const VARIANT_STYLES: Record<BadgeVariant, CSSProperties> = {
  crit:  { color: "var(--qc-down)", background: "var(--qc-down-soft)", border: "1px solid #E8C4BE" },
  warn:  { color: "var(--qc-warn)", background: "var(--qc-warn-soft)", border: "1px solid #EFD6A0" },
  up:    { color: "var(--qc-up)",   background: "var(--qc-up-soft)",   border: "1px solid #BBD9C6" },
  info:  { color: "var(--qc-blue)", background: "var(--qc-blue-soft)", border: "1px solid #B8CDF9" },
  muted: { color: "var(--qc-ink-3)", background: "transparent",        border: "none"              },
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  style?: CSSProperties;
}

export function Badge({ variant, children, style }: BadgeProps) {
  return (
    <span
      style={{
        fontFamily: "var(--qc-font-mono)",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: 4,
        display: "inline-block",
        whiteSpace: "nowrap",
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
