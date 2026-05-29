interface LimeCountPipProps {
  count: number | string;
}

export function LimeCountPip({ count }: LimeCountPipProps) {
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: 26,
        height: 26,
        padding: "0 8px",
        borderRadius: 999,
        background: "var(--qc-lime)",
        color: "var(--qc-ink)",
        fontFamily: "var(--qc-font-mono)",
        fontSize: "var(--qc-fz-13)",
        fontWeight: "var(--qc-w-semi)",
      }}
    >
      {count}
    </span>
  );
}
