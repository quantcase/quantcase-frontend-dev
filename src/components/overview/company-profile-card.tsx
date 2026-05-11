"use client";

import type { ScreenerData } from "@/types/screener";

interface Props {
  data: ScreenerData;
}

export function CompanyProfileCard({ data }: Props) {
  const co = data.company;

  if (!co.description) return null;

  return (
    <div>
      <section
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 16,
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
          }}
        >
          About
        </span>

        <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--qc-ink)", margin: 0 }}>
          {co.description}
        </p>
      </section>
    </div>
  );
}
