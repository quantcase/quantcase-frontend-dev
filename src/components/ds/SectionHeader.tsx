import type { ReactNode } from "react";
import { LimeCountPip } from "./LimeCountPip";

interface SectionHeaderProps {
  label: string;
  count?: number | string;
  linkLabel?: string;
  onLinkClick?: () => void;
  style?: React.CSSProperties;
}

function SectionHeader({ label, count, linkLabel, onLinkClick, style }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            letterSpacing: "var(--qc-track-eyebrow-l)",
            textTransform: "uppercase",
            color: "var(--qc-ink-2)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        {count !== undefined && <LimeCountPip count={count} />}
      </div>

      {linkLabel && (
        <span
          onClick={onLinkClick}
          style={{
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            letterSpacing: "var(--qc-track-pill)",
            color: "var(--qc-ink-3)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {linkLabel}
        </span>
      )}
    </div>
  );
}
