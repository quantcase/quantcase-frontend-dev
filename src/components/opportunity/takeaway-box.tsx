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
      style={{ background: "var(--qc-ink)", padding: 20 }}
    >
      {inline ? (
        <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", fontWeight: 300, color: "var(--qc-lime)", lineHeight: 1.5 }}>
          <span
            style={{
              display: "inline-block",
              marginRight: 6,
              fontSize: "var(--qc-fz-9)",
              fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              color: "var(--qc-ink)",
              background: "var(--qc-lime)",
              borderRadius: 4,
              padding: "2px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {title}
          </span>
          <span style={{ color: "var(--qc-on-dark)" }}><BoldText text={text ?? "N/A"} /></span>
        </p>
      ) : (
        <>
          <span
            style={{
              display: "inline-block",
              fontSize: "var(--qc-fz-9)",
              fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              color: "var(--qc-ink)",
              background: "var(--qc-lime)",
              borderRadius: 4,
              padding: "2px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {title}
          </span>
          <p style={{ color: "var(--qc-on-dark)", paddingTop: 16, fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", lineHeight: 1.5 }}>
            <BoldText text={text ?? "N/A"} />
          </p>
        </>
      )}
    </div>
  );
}
