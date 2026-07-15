"use client";

// "5-day streak" dots row. `filled` days render solid, the rest hollow.
// Streak length is a backend note — until provided, pass filled=0 to hide.
export function StreakDots({ filled, total = 6 }: { filled: number; total?: number }) {
  if (filled <= 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 12, height: 12, borderRadius: "50%",
              background: i < filled ? "var(--qc-brand-accent)" : "transparent",
              border: `1.5px solid ${i < filled ? "var(--qc-brand-accent)" : "var(--qc-hair)"}`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 13, color: "var(--qc-ink-3)" }}>{filled}-day streak</span>
    </div>
  );
}
