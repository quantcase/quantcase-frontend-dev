"use client";

import { cn } from "@/lib/utils";

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
      <div
        className={cn("flex items-center overflow-x-auto scrollbar-none", className)}
        style={{ borderBottom: "1px solid var(--qc-border-default)" }}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className="relative px-4 py-3 text-[12px] font-medium whitespace-nowrap shrink-0 transition-colors"
            style={{ color: value === option ? "var(--qc-text-heading)" : "var(--qc-text-muted)" }}
          >
            {option}
            {value === option && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--qc-accent-primary)" }}
              />
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
            style={{
              fontSize: "var(--qc-fz-12)",
              fontWeight: "var(--qc-w-medium)",
              fontFamily: "var(--qc-font-sans)",
              padding: "4px 12px",
              borderRadius: 6,
              border: `1px solid ${value === option ? "var(--qc-ink)" : "var(--qc-hair)"}`,
              background: value === option ? "var(--qc-ink)" : "transparent",
              color: value === option ? "#ffffff" : "var(--qc-ink-2)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex rounded-lg p-1 bg-gray-100 dark:bg-gray-800", className)}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "px-6 py-2 text-sm font-medium rounded-md transition-all",
            value === option
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
