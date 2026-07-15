import type { CSSProperties, ReactNode } from "react";

interface LimeGradientCardProps {
  children: ReactNode;
  style?: CSSProperties;
  radius?: number;
  className?: string;
}

export function LimeGradientCard({ children, style, radius = 18, className }: LimeGradientCardProps) {
  return (
    <div
      className={`qc-lime-gradient-card${className ? ` ${className}` : ""}`}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </div>
  );
}
