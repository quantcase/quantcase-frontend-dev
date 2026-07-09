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
export function formatPrice(value: number | null | undefined, decimals = 0): string {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// Re-format a numeric string from the deal API with Indian locale formatting.
// Percent values → 1 decimal place. All other numbers → rounded to nearest integer.
export function fmtDealNum(raw?: string): string {
  if (!raw) return "—";
  const isPercent = raw.includes("%");
  return raw.replace(/(\d[\d,]*\.?\d*)/g, (match) => {
    const num = parseFloat(match.replace(/,/g, ""));
    if (isNaN(num)) return match;
    if (isPercent) {
      return parseFloat(num.toFixed(1)).toLocaleString("en-IN", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    }
    return Math.round(num).toLocaleString("en-IN");
  });
}

// Minimal inline-markdown → HTML for short labels (signals, prompts).
// Escapes HTML first, then renders **bold**, *italic*, and `code`.
// Safe to feed into dangerouslySetInnerHTML — no raw HTML survives escaping.
export function inlineMarkdownToHtml(input: string | null | undefined): string {
  if (!input) return "";
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
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

// Relative "time ago" for diary entry timestamps — e.g. "3 months ago", "6 weeks ago".
export function timeAgo(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const then = new Date(dateString).getTime();
  if (isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));

  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let value = secs;
  let unit = "second";
  for (const [size, name] of units) {
    if (value < size) { unit = name; break; }
    value = Math.floor(value / size);
    unit = name;
  }
  if (unit === "second" && value < 45) return "just now";
  const rounded = Math.max(1, Math.round(value));
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
}

// Label formatting
function formatLabel(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Variance color helper
function getVarianceColor(variance: string | undefined | null): string {
  if (!variance) return "text-muted-foreground";
  if (variance.startsWith("+")) {
    return "text-green-600 dark:text-green-400";
  } else if (variance.startsWith("-")) {
    return "text-red-600 dark:text-red-400";
  }
  return "text-muted-foreground";
}

// Badge variant helpers
function getRatingVariant(rating: TrustLevel): "default" | "secondary" | "destructive" {
  switch (rating) {
    case "HIGH":
      return "default";
    case "MODERATE":
      return "secondary";
    case "LOW":
      return "destructive";
  }
}

function getStatusVariant(status: StatusType): "default" | "secondary" | "destructive" {
  switch (status) {
    case "ACHIEVED":
      return "default";
    case "MISSED":
      return "destructive";
    case "PENDING":
      return "secondary";
  }
}

function getConfidenceVariant(level: ConfidenceLevel): "default" | "secondary" | "destructive" {
  switch (level) {
    case "HIGH":
      return "default";
    case "MEDIUM":
      return "secondary";
    case "LOW":
      return "destructive";
  }
}
