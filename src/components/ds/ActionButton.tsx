import type { CSSProperties, ReactNode } from "react";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
  style?: CSSProperties;
  noWrap?: boolean;
}

const SIZE: Record<"sm" | "md", CSSProperties> = {
  sm: { fontSize: 11.5, padding: "5px 12px", borderRadius: 999 },
  md: { fontSize: 12,   padding: "7px 14px",  borderRadius: 8   },
};

export function ActionButton({
  children,
  onClick,
  variant = "ghost",
  size = "md",
  style,
  noWrap = false,
}: ActionButtonProps) {
  const base: CSSProperties =
    variant === "primary"
      ? { background: "var(--qc-ink)", color: "#fff", border: "1px solid var(--qc-ink)" }
      : { background: "#fff", color: "var(--qc-ink)", border: "1px solid var(--qc-hair)" };

  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
        fontFamily: "var(--qc-font-sans)",
        whiteSpace: noWrap ? "nowrap" : undefined,
        ...SIZE[size],
        ...base,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
