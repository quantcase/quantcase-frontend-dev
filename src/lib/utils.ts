import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TrustLevel, StatusType, ConfidenceLevel } from "@/types/management"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting for Indian Rupee (Cr/L Cr scale)
// Values are expected in raw units (e.g. 1e7 = 1 Cr, 1e12 = 1 L Cr)
export function formatINR(value: number | null | undefined): string {
  if (value == null) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) {
    const lCr = abs / 1e12;
    return `${sign}₹${lCr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}L Cr`;
  }
  const cr = abs / 1e7;
  if (cr >= 1000) {
    // e.g. ₹10,601 Cr
    return `${sign}₹${Math.round(cr).toLocaleString("en-IN")} Cr`;
  }
  if (cr >= 1) {
    return `${sign}₹${cr.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Cr`;
  }
  // Below 1 Cr — show as lakhs
  const lakh = abs / 1e5;
  return `${sign}₹${lakh.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}L`;
}

// Format a price (plain number) in INR with commas
export function formatPrice(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Safari is strict about invalid dates - validate before formatting
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

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
export function getVarianceColor(variance: string | undefined | null): string {
  if (!variance) return "text-muted-foreground";
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
