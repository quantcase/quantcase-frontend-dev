import { DataValue } from "@/components/molecules/data-value";
import type { NotablePattern } from "@/types/management";
import { Lightbulb } from "lucide-react";

interface NotablePatternsProps {
  patterns: NotablePattern[];
}

function getBorderColor(category: NotablePattern["category"]): string {
  if (category === "positive") return "#22c55e";
  if (category === "negative") return "#ef4444";
  return "#f59e0b";
}

function getCategoryLabel(category: NotablePattern["category"]): { text: string; color: string } {
  if (category === "positive") return { text: "POSITIVE", color: "#22c55e" };
  if (category === "negative") return { text: "NEGATIVE", color: "#ef4444" };
  return { text: "NEUTRAL", color: "#f59e0b" };
}

export function NotablePatterns({ patterns }: NotablePatternsProps) {
  return (
    <div className="h-full flex flex-col" style={{ borderRadius: 10, border: "1px solid #E2E2E2", background: "#F5F5F5", padding: 8 }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 pt-1 pb-3">
        <Lightbulb className="h-4 w-4 text-zinc-500" />
        <h5 className="uppercase tracking-wide" style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", letterSpacing: "0.01em" }}>
          Notable Patterns
        </h5>
      </div>

      {/* Content box */}
      <div style={{ borderRadius: 10, border: "1px solid rgba(226,226,226,0.10)", background: "#FFF", padding: 16 }} className="flex-1 space-y-3">
        {patterns.length === 0 ? (
          <div style={{ borderLeft: "4px solid #f59e0b", paddingLeft: 12, paddingTop: 8, paddingBottom: 8 }}>
            <p style={{ fontSize: 12, color: "#888888" }}>No patterns available</p>
          </div>
        ) : (
          patterns.map((pattern) => {
            const borderColor = getBorderColor(pattern.category);
            const label = getCategoryLabel(pattern.category);
            return (
              <div
                key={pattern.id}
                style={{
                  borderLeft: `4px solid ${borderColor}`,
                  paddingLeft: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  background: "#F9F9F9",
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <p style={{ fontSize: 12, color: "#121212", lineHeight: 1.5 }}>
                  <DataValue value={pattern.title} />
                </p>
                <p style={{ fontSize: 10, fontWeight: 600, color: label.color, marginTop: 6, letterSpacing: "0.05em" }}>
                  {label.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
