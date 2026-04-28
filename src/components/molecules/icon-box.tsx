import type { LucideIcon } from "lucide-react";

interface IconBoxProps {
  icon: LucideIcon;
}

export function IconBox({ icon: Icon }: IconBoxProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "fit-content",
        height: "fit-content",
        padding: "4px",
        flexDirection: "column",
        alignItems: "flex-start",
        aspectRatio: "1/1",
        borderRadius: 6,
        border: "1px solid rgba(18, 18, 18, 0.10)",
        background: "rgba(18, 18, 18, 0.03)",
        flexShrink: 0,
      }}
    >
      <Icon style={{ height: 16, width: 16, flexShrink: 0, alignSelf: "stretch", color: "var(--qc-text-muted)" }} />
    </div>
  );
}
