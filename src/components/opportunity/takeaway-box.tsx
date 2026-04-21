import { BoldText } from "@/components/opportunity/bold-text";

interface TakeawayBoxProps {
  title: string;
  text: string | null | undefined;
  color?: string;
  inline?: boolean;
  noBleed?: boolean;
}

export function TakeawayBox({ title, text, inline = false, noBleed = false }: TakeawayBoxProps) {
  return (
    <div
      className={noBleed ? "rounded-lg" : "-mx-4 rounded-b-lg"}
      style={{ background: "var(--qc-text-heading)", padding: 20 }}
    >
      {inline ? (
        <p style={{ fontSize: 12, fontWeight: 300, color: "var(--qc-accent-lime)", lineHeight: 1.5 }}>
          <span
            style={{
              display: "inline-block",
              marginRight: 6,
              fontSize: 9,
              fontWeight: 600,
              color: "var(--qc-text-heading)",
              background: "var(--qc-accent-lime)",
              borderRadius: 4,
              padding: "2px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {title}
          </span>
          <span style={{ color: "var(--qc-accent-primary-fg)" }}><BoldText text={text ?? "N/A"} /></span>
        </p>
      ) : (
        <>
          <span
            style={{
              display: "inline-block",
              fontSize: 9,
              fontWeight: 600,
              color: "var(--qc-text-heading)",
              background: "var(--qc-accent-lime)",
              borderRadius: 4,
              padding: "2px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {title}
          </span>
          <p style={{ color: "var(--qc-accent-primary-fg)", paddingTop: 16, fontSize: 13, lineHeight: 1.5 }}>
            <BoldText text={text ?? "N/A"} />
          </p>
        </>
      )}
    </div>
  );
}
