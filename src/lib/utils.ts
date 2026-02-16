import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TrustLevel, StatusType, ConfidenceLevel } from "@/types/management"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

// Label formatting
export function formatLabel(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Variance color helper
export function getVarianceColor(variance: string): string {
  if (variance.startsWith("+")) {
    return "text-green-600 dark:text-green-400";
  } else if (variance.startsWith("-")) {
    return "text-red-600 dark:text-red-400";
  }
  return "text-muted-foreground";
}

// Badge variant helpers
export function getRatingVariant(rating: TrustLevel): "default" | "secondary" | "destructive" {
  switch (rating) {
    case "HIGH":
      return "default";
    case "MODERATE":
      return "secondary";
    case "LOW":
      return "destructive";
  }
}

export function getStatusVariant(status: StatusType): "default" | "secondary" | "destructive" {
  switch (status) {
    case "ACHIEVED":
      return "default";
    case "MISSED":
      return "destructive";
    case "PENDING":
      return "secondary";
  }
}

export function getConfidenceVariant(level: ConfidenceLevel): "default" | "secondary" | "destructive" {
  switch (level) {
    case "HIGH":
      return "default";
    case "MEDIUM":
      return "secondary";
    case "LOW":
      return "destructive";
  }
}
