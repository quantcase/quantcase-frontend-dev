import type { CSSProperties } from "react";

interface AvatarProps {
  initials: string;
  size?: number;
  style?: CSSProperties;
}

export function Avatar({ initials, size = 32, style }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--qc-ink)",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.36,
        fontWeight: 500,
        flexShrink: 0,
        fontFamily: "var(--qc-font-mono)",
        letterSpacing: "0.02em",
        ...style,
      }}
    >
      {initials}
    </div>
  );
}
