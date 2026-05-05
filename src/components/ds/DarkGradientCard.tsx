import type { CSSProperties, ReactNode } from "react";

interface DarkGradientCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  radius?: number;
}

export function DarkGradientCard({ children, style, className = "", radius = 18 }: DarkGradientCardProps) {
  return (
    <div
      className={`qc-dark-gradient-card ${className}`}
      style={{ borderRadius: radius, ...style }}
    >
      {children}
    </div>
  );
}
