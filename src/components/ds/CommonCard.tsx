import type { CSSProperties, ReactNode } from "react";
import { CardShell } from "./CardShell";
import { MonoLabel } from "./MonoLabel";

interface CommonCardProps {
  title: string;
  titleIcon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  radius?: number;
}

export function CommonCard({
  title,
  titleIcon,
  action,
  children,
  style,
  className,
  radius,
}: CommonCardProps) {
  return (
    <CardShell style={{ padding: "14px 16px", ...style }} radius={radius} className={className}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <MonoLabel style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {titleIcon}
          {title}
        </MonoLabel>
        {action}
      </div>
      {children}
    </CardShell>
  );
}
