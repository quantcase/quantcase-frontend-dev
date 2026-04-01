"use client";

import { cn } from "@/lib/utils";

interface TabToggleProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "pill" | "outline";
}

export function TabToggle({ options, value, onChange, className, variant = "pill" }: TabToggleProps) {
  if (variant === "outline") {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: 6,
              border: `1px solid ${value === option ? "#0F172B" : "#E2E2E2"}`,
              background: value === option ? "#0F172B" : "transparent",
              color: value === option ? "#ffffff" : "#888888",
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
