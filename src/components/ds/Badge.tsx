import type { CSSProperties, ReactNode } from "react";
import { Badge as UIBadge } from "@/components/ui/badge";

/**
 * ds/Badge — the mono/uppercase "data chip" flavour of the canonical Badge.
 *
 * Kept as a thin wrapper over ui/Badge so existing consumers
 * (dashboard/opportunities-panel, dashboard/who-to-call-today) keep their
 * exact API (`variant` required, `style` passthrough) while the styling now
 * flows through the single canonical Badge + --qc-* token utilities.
 *
 * Variant names map 1:1 onto the canonical variants (crit is an alias of down).
 */
export type BadgeVariant = "crit" | "warn" | "up" | "info" | "muted";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  style?: CSSProperties;
}

export function Badge({ variant, children, style }: BadgeProps) {
  return (
    <UIBadge
      variant={variant}
      style={style}
      className="font-mono text-[9px] tracking-[0.14em] uppercase px-[7px] py-[2px] h-auto rounded-[4px]"
    >
      {children}
    </UIBadge>
  );
}
