interface LimeCountPipProps {
  count: number | string;
}

export function LimeCountPip({ count }: LimeCountPipProps) {
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 999,
        background: "var(--qc-lime)",
        color: "var(--qc-ink)",
        fontFamily: "var(--qc-font-mono)",
        fontSize: "var(--qc-fz-10)",
        fontWeight: "var(--qc-w-medium)",
      }}
    >
      {count}
    </span>
  );
}
