import type { CSSProperties, ReactNode } from "react";

interface MonoLabelProps {
  children: ReactNode;
  size?: number;
  tracking?: string;
  color?: string;
  uppercase?: boolean;
  style?: CSSProperties;
}

export function MonoLabel({
  children,
  size = 11,
  tracking = "0.16em",
  color = "var(--qc-ink-2)",
  uppercase = true,
  style,
}: MonoLabelProps) {
  return (
    <span
      style={{
        fontFamily: "var(--qc-font-mono)",
        fontSize: size,
        letterSpacing: tracking,
        textTransform: uppercase ? "uppercase" : undefined,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
