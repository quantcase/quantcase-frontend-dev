import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Display — serif display type for H1 / hero moments ONLY.
 *
 * Encodes the typography rule (audit #1): serif is reserved for the largest
 * page-title / hero line; everything else is sans. Using this instead of
 * ad-hoc `.serif` on random headings keeps "Good evening, Atul" and "What
 * would you like to research today?" consistent with the diary / management
 * page titles.
 */
interface DisplayProps {
  children: ReactNode;
  as?: "h1" | "h2" | "p" | "span";
  /** italic serif (the app's distinctive hero flavour) */
  italic?: boolean;
  className?: string;
}

export function Display({ children, as: Tag = "h1", italic = false, className }: DisplayProps) {
  return (
    <Tag className={cn("serif text-ink", italic && "italic", className)}>
      {children}
    </Tag>
  );
}
