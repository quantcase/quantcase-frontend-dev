import type { CSSProperties, ReactNode } from "react";

interface GoldenCardProps {
  /** Narrow left rail — typically a time/countdown block */
  rail?: ReactNode;
  /** Entity slot — avatar + name/details */
  entity?: ReactNode;
  /** Section label shown above the middle content list */
  sectionLabel?: string;
  /** Middle content — bullet list, notes, etc. */
  content?: ReactNode;
  /** Right-aligned action buttons */
  actions?: ReactNode;
  /** Column widths for [rail, entity, content, actions]. Defaults match the meeting strip layout. */
  columns?: string;
  style?: CSSProperties;
  className?: string;
  radius?: number;
}

export function GoldenCard({
  rail,
  entity,
  sectionLabel,
  content,
  actions,
  columns = "180px 240px minmax(0,1fr) 130px",
  style,
  className,
  radius,
}: GoldenCardProps) {
  return (
    <div
      className={`qc-golden-card${className ? ` ${className}` : ""}`}
      style={{
        borderRadius: radius ?? 18,
        padding: "18px 22px",
        display: "grid",
        gridTemplateColumns: columns,
        gap: 24,
        alignItems: "center",
        ...style,
      }}
    >
      {rail && <div>{rail}</div>}
      {entity && <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{entity}</div>}
      {content && (
        <div>
          {sectionLabel && (
            <div
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--qc-lime-ink-2)",
                marginBottom: 8,
                whiteSpace: "nowrap",
              }}
            >
              {sectionLabel}
            </div>
          )}
          {content}
        </div>
      )}
      {actions && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "stretch" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
