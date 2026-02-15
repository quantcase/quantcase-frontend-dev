"use client";

import { cn } from "@/lib/utils";

interface ResearchCardProps {
  title: string;
  onClick?: () => void;
  className?: string;
}

export function ResearchCard({ title, onClick, className }: ResearchCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all",
        className
      )}
    >
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {title}
      </p>
    </button>
  );
}
