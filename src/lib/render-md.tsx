import React from "react";

// Converts **bold** and *italic* markdown spans to React elements.
export function renderMd(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else {
      parts.push(<em key={key++} style={{ color: "var(--qc-golden-ink)", fontStyle: "italic" }}>{match[2]}</em>);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
