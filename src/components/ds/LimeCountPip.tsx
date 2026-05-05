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
        fontSize: 10,
        fontWeight: 500,
      }}
    >
      {count}
    </span>
  );
}
