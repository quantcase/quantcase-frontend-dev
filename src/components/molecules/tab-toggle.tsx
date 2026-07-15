"use client";

import { cn } from "@/lib/utils";

/**
 * TabToggle — the canonical tab primitive.
 *
 * Variants: `pill` (segmented control), `outline` (button group), `underline`
 * (sub-nav). All tokens resolve from --qc-* (previously the underline/pill
 * variants referenced nonexistent vars like --qc-border-default and off-palette
 * bg-gray-* — fixed here). Route TopBar / InPageNav / the diary M·O·D control
 * through this instead of re-implementing tabs.
 */
interface TabToggleProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "pill" | "outline" | "underline";
}

export function TabToggle({ options, value, onChange, className, variant = "pill" }: TabToggleProps) {
  if (variant === "underline") {
    return (
      <div className={cn("flex items-center overflow-x-auto scrollbar-none border-b border-hair", className)}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "relative px-4 py-3 text-[12px] font-medium whitespace-nowrap shrink-0 transition-colors",
              value === option ? "text-ink" : "text-ink-2 hover:text-ink"
            )}
          >
            {option}
            {value === option && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink" />
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "outline") {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-md border px-3 py-1 text-xs font-medium transition-colors",
              value === option
                ? "border-ink bg-ink text-[var(--qc-on-dark)]"
                : "border-hair bg-transparent text-ink-2 hover:bg-secondary"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex rounded-lg bg-secondary p-1", className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md px-6 py-2 text-sm font-medium transition-all",
            value === option
              ? "bg-primary text-primary-foreground"
              : "text-ink-2 hover:text-ink"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
