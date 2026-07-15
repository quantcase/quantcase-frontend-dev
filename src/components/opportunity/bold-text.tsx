/** Renders **bold** markdown segments inline. */
export function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/**
 * For insight boxes: regular text at text-xs, **marked** segments at text-sm (no bold).
 * Wrap in a <p className="text-xs ..."> — marked segments override up to text-sm inline.
 */
export function InsightText({ text }: { text: string }) {
  const parts = (text ?? "").split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-sm font-normal text-ink-2">
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
