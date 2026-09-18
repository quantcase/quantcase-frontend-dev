import React from "react";

// Converts **bold**, *italic*, and [text](url) markdown spans to React elements.
export function renderMd(text: string | null | undefined): React.ReactNode[] {
  if (!text) return [];
  const parts: React.ReactNode[] = [];
  // Order matters: links first, then bold, then italic
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined && match[2] !== undefined) {
      // Markdown link: [text](url)
      parts.push(
        <a
          key={key++}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--qc-blue, #2563eb)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          {match[1]}
        </a>
      );
    } else if (match[3] !== undefined) {
      parts.push(<strong key={key++}>{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      parts.push(<em key={key++} style={{ color: "var(--qc-golden-ink)", fontStyle: "italic" }}>{match[4]}</em>);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
