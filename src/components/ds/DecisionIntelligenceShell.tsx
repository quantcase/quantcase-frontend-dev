"use client";

import type { CSSProperties, ReactNode } from "react";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The canonical Decision Intelligence container, shared by the overview and
 * fundamentals sidebars. Owns the outer section surface, the branded header,
 * and the inner card/eyebrow scaffolding so both pages read as one component
 * at one width. Page-specific content composes in as children.
 */

// ─── Shell ────────────────────────────────────────────────────────────────────

interface DecisionIntelligenceShellProps {
  children: ReactNode;
  /** Rendered at the right of the header row (e.g. a grade pill). */
  headerAction?: ReactNode;
  className?: string;
}

export function DecisionIntelligenceShell({
  children,
  headerAction,
  className,
}: DecisionIntelligenceShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[18px] border border-hair bg-[var(--qc-section)] p-2",
        className
      )}
    >
      <div className="flex items-center gap-2 px-1.5 pt-1 pb-0.5">
        <div className="grid place-items-center rounded-md border border-hair bg-[var(--qc-chip)] p-1.5">
          <Brain className="size-3.5 text-ink" />
        </div>
        <span className="text-[13px] font-semibold tracking-[0.01em] text-ink">
          Decision Intelligence
        </span>
        {headerAction && <div className="ml-auto">{headerAction}</div>}
      </div>

      {children}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface DecisionSectionProps {
  children: ReactNode;
  /** Adds the lime wash used by the lead/verdict card. */
  accent?: boolean;
  className?: string;
  /** Escape hatch for dynamic values only, e.g. a sentiment-driven border color. */
  style?: CSSProperties;
}

/** One white card inside the shell. */
export function DecisionSection({ children, accent, className, style }: DecisionSectionProps) {
  if (accent) {
    return (
      <div
        className="relative overflow-hidden rounded-[14px] border border-hair bg-[var(--qc-card)]"
        style={style}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-auto h-1/2 bg-[linear-gradient(180deg,transparent_0%,var(--qc-lime)_100%)]"
        />
        <div className={cn("relative flex flex-col gap-3 px-4 py-3.5", className)}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-[14px] border border-hair bg-[var(--qc-card)] px-4 py-3.5",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────

interface DecisionEyebrowProps {
  children: ReactNode;
  /** Optional leading icon, e.g. <Zap /> or <AlertTriangle />. */
  icon?: ReactNode;
  className?: string;
}

/** Uppercase mono label above a block inside a DecisionSection. */
export function DecisionEyebrow({ children, icon, className }: DecisionEyebrowProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {icon}
      <span className="font-mono text-[10px] uppercase tracking-[.16em] text-ink-2">
        {children}
      </span>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

/** Hairline rule between blocks inside a DecisionSection. */
export function DecisionDivider() {
  return <div className="h-px bg-[var(--qc-hair)]" />;
}
