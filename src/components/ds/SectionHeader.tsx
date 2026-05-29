import { LimeCountPip } from "./LimeCountPip";

interface SectionHeaderProps {
  label: string;
  count?: number | string;
  linkLabel?: string;
  onLinkClick?: () => void;
  style?: React.CSSProperties;
}

export function SectionHeader({ label, count, linkLabel, onLinkClick, style }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 14,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        <span
          style={{
            fontFamily: "var(--font-instrument-serif, 'Instrument Serif', Georgia, serif)",
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--qc-ink)",
            whiteSpace: "nowrap",
            lineHeight: 1.1,
          }}
        >
          {label}
        </span>
        {count !== undefined && (
          <span style={{ position: "relative", bottom: 3 }}>
            <LimeCountPip count={count} />
          </span>
        )}
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
