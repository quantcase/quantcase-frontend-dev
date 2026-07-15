import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * @deprecated Use `ui/Button` (primary = default, secondary = variant="pill")
 * or `ds/CtaLink` (tertiary text+arrow) instead. Kept as a token-driven shim
 * for its remaining dashboard/brief consumers until they migrate in Phase 3.
 */
interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
  style?: CSSProperties;
  noWrap?: boolean;
}

const SIZE: Record<"sm" | "md", string> = {
  sm: "text-xs px-3 py-[5px] rounded-full",
  md: "text-xs px-3.5 py-[7px] rounded-lg",
};

export function ActionButton({
  children,
  onClick,
  variant = "ghost",
  size = "md",
  style,
  noWrap = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        "cursor-pointer border font-sans transition-colors",
        SIZE[size],
        variant === "primary"
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
          : "bg-background text-ink border-hair hover:bg-secondary",
        noWrap && "whitespace-nowrap"
      )}
    >
      {children}
    </button>
  );
}
