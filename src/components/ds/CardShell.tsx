import type { CSSProperties, ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  style?: CSSProperties;
  radius?: number;
  className?: string;
}

export function CardShell({ children, style, radius = 14, className }: CardShellProps) {
  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--qc-hair)",
        borderRadius: radius,
        background: "#fff",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
