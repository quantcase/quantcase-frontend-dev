"use client";

import type { ScreenerData } from "@/types/screener";
import type { OverviewAnalysis } from "@/types/overview";

// Render **bold** markdown tokens inline
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--qc-ink)", fontWeight: 600 }}>
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

interface Props {
  data: ScreenerData;
  overviewData?: OverviewAnalysis | null;
}

export function CompanyProfileCard({ data, overviewData }: Props) {
  const co = data.company;
  const description = overviewData?.snapshot ?? co.description;

  if (!description) return null;

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
          {overviewData?.snapshot ? <InlineMarkdown text={overviewData.snapshot} /> : description}
        </p>
      </section>
    </div>
  );
}
