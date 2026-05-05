import type { CSSProperties, ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  style?: CSSProperties;
  radius?: number;
}

export function CardShell({ children, style, radius = 14 }: CardShellProps) {
  return (
    <div
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
