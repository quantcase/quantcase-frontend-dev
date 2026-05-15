export function GrowthStatCard({
  title,
  rows,
  divider,
}: {
  title: string;
  rows: { label: string; value: number | null | undefined }[];
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderLeft: divider ? "1px solid var(--qc-hair)" : undefined,
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          fontWeight: 500,
          color: "var(--qc-ink-2)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div>
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderTop: i > 0 ? "1px solid var(--qc-hair-2)" : undefined,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--qc-ink)" }}>{label}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.02em",
                color:
                  value === null || value === undefined
                    ? "var(--qc-ink-2)"
                    : "var(--qc-ink)",
              }}
            >
              {value === null || value === undefined ? "—" : `${parseFloat(value.toFixed(1))}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
