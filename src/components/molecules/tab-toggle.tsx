"use client";

import { cn } from "@/lib/utils";

interface TabToggleProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TabToggle({ options, value, onChange, className }: TabToggleProps) {
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
