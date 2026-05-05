import type { CSSProperties, ReactNode } from "react";

interface LimeGradientCardProps {
  children: ReactNode;
  style?: CSSProperties;
  radius?: number;
}

export function LimeGradientCard({ children, style, radius = 18 }: LimeGradientCardProps) {
  return (
    <div
      style={{
        background: "linear-gradient(175deg, #E8F3BD 0%, #D6E996 100%)",
        border: "1px solid var(--qc-lime-edge)",
        borderRadius: radius,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
