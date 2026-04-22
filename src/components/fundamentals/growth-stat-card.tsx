export function GrowthStatCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number | null | undefined }[];
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-white)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          fontWeight: 500,
          color: "var(--qc-text-muted)",
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
              borderTop: i > 0 ? "1px solid var(--qc-border-inner)" : undefined,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--qc-text-body)" }}>{label}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.02em",
                color:
                  value === null || value === undefined
                    ? "var(--qc-text-muted)"
                    : "var(--qc-text-heading)",
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
