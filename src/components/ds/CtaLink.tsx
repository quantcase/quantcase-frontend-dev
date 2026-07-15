"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CtaLink — the tertiary CTA tier: text + trailing arrow.
 *
 * Consolidates the ~90 bespoke inline "Write your reason →" / "Review All →" /
 * ArrowRight / ArrowUpRight links into one component, so the CTA hierarchy is
 * unambiguous: primary = <Button> (filled navy), secondary = <Button
 * variant="outline"> (pill), tertiary = CtaLink. The same action must always
 * use the same tier (fixes "Write your reason" being both a link AND a button).
 *
 * Renders an <a> (next/link) when `href` is set, else a <button>.
 */
interface CtaLinkProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** "right" = →  ·  "up-right" = ↗ (for external / new-surface actions) */
  arrow?: "right" | "up-right" | "none";
  className?: string;
}

export function CtaLink({
  children,
  href,
  onClick,
  arrow = "right",
  className,
}: CtaLinkProps) {
  const classes = cn(
    "group inline-flex items-center gap-1 text-[13px] font-medium text-ink",
    "transition-colors hover:text-ink-2",
    className
  );

  const Arrow = arrow === "up-right" ? ArrowUpRight : ArrowRight;
  const inner = (
    <>
      {children}
      {arrow !== "none" && (
        <Arrow className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, "cursor-pointer")}>
      {inner}
    </button>
  );
}
