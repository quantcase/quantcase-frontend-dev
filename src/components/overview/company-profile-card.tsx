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
          <strong key={i} style={{ color: "var(--qc-ink)", fontWeight: "var(--qc-w-semi)" }}>
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/**
 * Split prose into sentences at a full stop followed by the start of the next
 * one. The lookahead keeps decimals ("17.16") and mid-word dots intact, and
 * lets a sentence open on a markdown bold token or a bracket.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z*("'])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const BODY: React.CSSProperties = {
  fontSize: "var(--qc-fz-13)",
  fontFamily: "var(--qc-font-sans)",
  lineHeight: 1.7,
  color: "var(--qc-ink)",
  margin: 0,
};

interface Props {
  data: ScreenerData;
  overviewData?: OverviewAnalysis | null;
}

export function CompanyProfileCard({ data, overviewData }: Props) {
  const co = data.company;
  const description = overviewData?.snapshot ?? co.description;

  if (!description) return null;

  // The API contract is 5 sentences: an opening statement, three supporting
  // points, then a closing statement. Anything shorter isn't structured enough
  // to bullet, so it falls back to a single block of prose.
  const sentences = splitSentences(description);
  const structured = sentences.length >= 4;
  const middle = structured ? sentences.slice(1, -1) : [];
  const closing = structured ? sentences[sentences.length - 1] : null;

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
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-10)",
            letterSpacing: "0.16em",
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
          }}
        >
          About
        </span>

        {structured ? (
          <>
            <p style={BODY}>
              <InlineMarkdown text={sentences[0]} />
            </p>

            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {middle.map((sentence, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--qc-ink-3)",
                      flexShrink: 0,
                      // Centres the dot on the first line of 13px/1.7 text.
                      marginTop: 9,
                    }}
                  />
                  <p style={BODY}>
                    <InlineMarkdown text={sentence} />
                  </p>
                </li>
              ))}
            </ul>

            {closing && (
              <>
                <div style={{ height: 1, background: "var(--qc-hair)" }} />
                <p style={{ ...BODY, color: "var(--qc-ink-2)" }}>
                  <InlineMarkdown text={closing} />
                </p>
              </>
            )}
          </>
        ) : (
          <p style={BODY}>
            <InlineMarkdown text={description} />
          </p>
        )}
      </section>
    </div>
  );
}
