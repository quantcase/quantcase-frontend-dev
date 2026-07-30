"use client";

interface Props {
  items: string[] | null | undefined;
}

/** The AI's "what would flip this read" bullets. */
export function WhatCanChangeCard({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: 0, fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        What Can Change
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              padding: "5px 0",
              borderBottom: i < items.length - 1 ? "1px solid var(--qc-hair)" : "none",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--qc-ink-2)", flexShrink: 0, marginTop: 5 }} />
            <p style={{ margin: 0, fontSize: "var(--qc-fz-12)", color: "var(--qc-ink)", lineHeight: 1.55, fontFamily: "var(--qc-font-sans)" }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
