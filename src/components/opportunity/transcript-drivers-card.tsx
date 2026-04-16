"use client";

import type { IndustryDriverItem } from "@/types/opportunity";

interface DriverRowProps {
  item: IndustryDriverItem;
  sentiment: "positive" | "negative";
}

function DriverRow({ item, sentiment }: DriverRowProps) {
  const text = item.driver ?? item.concern ?? item.indicator ?? "";
  if (!text) return null;

  const mentionLabel = `${item.mentioned_by}/${item.total_companies}`;
  const borderColor = sentiment === "positive" ? "#22c55e" : "#ef4444";
  const mentionColor = sentiment === "positive" ? "#059669" : "#dc2626";

  return (
    <div
      className="flex items-start gap-3 py-2.5 border-b border-[#F0F0F0] last:border-0"
    >
      {/* Mention badge */}
      <div
        className="shrink-0 mt-0.5 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
        style={{ color: mentionColor, backgroundColor: `${mentionColor}12`, border: `1px solid ${mentionColor}30` }}
      >
        {mentionLabel}
      </div>
      {/* Driver text */}
      <p style={{ fontSize: 13, color: "#121212", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

interface DriverColumnProps {
  title: string;
  subtitle?: string;
  items: IndustryDriverItem[];
  sentiment: "positive" | "negative";
}

function DriverColumn({ title, subtitle, items, sentiment }: DriverColumnProps) {
  const accentColor = sentiment === "positive" ? "#22c55e" : "#ef4444";
  const labelColor = sentiment === "positive" ? "#059669" : "#dc2626";
  const bgColor = sentiment === "positive" ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)";

  return (
    <div
      className="flex-1 min-w-0 rounded-lg border bg-white p-4"
      style={{ borderColor: accentColor, borderTopWidth: 3 }}
    >
      {/* Column header */}
      <div className="mb-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: labelColor }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-[#888888] mt-0.5">{subtitle}</p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-[12px] text-[#888888] italic">No data available</p>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
          {items.map((item, i) => (
            <DriverRow key={i} item={item} sentiment={sentiment} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TranscriptDriversSectionProps {
  title: string;
  positiveItems: IndustryDriverItem[];
  negativeItems: IndustryDriverItem[];
  positiveLabel?: string;
  negativeLabel?: string;
}

function TranscriptDriversSection({
  title,
  positiveItems,
  negativeItems,
  positiveLabel = "Positive Drivers",
  negativeLabel = "Concerns",
}: TranscriptDriversSectionProps) {
  return (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <p style={{ fontSize: 11, fontWeight: 600, color: "#888888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {title}
        </p>
        <div className="flex-1 h-px bg-[#E2E2E2]" />
        <p className="text-[10px] text-[#AAAAAA]">x/y = mentions / total companies</p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4">
        <DriverColumn
          title={positiveLabel}
          items={positiveItems}
          sentiment="positive"
        />
        <DriverColumn
          title={negativeLabel}
          items={negativeItems}
          sentiment="negative"
        />
      </div>
    </div>
  );
}

interface TranscriptDriversCardProps {
  demandPositive?: IndustryDriverItem[];
  demandNegative?: IndustryDriverItem[];
  supplyPositive?: IndustryDriverItem[];
  supplyNegative?: IndustryDriverItem[];
}

export function TranscriptDriversCard({
  demandPositive = [],
  demandNegative = [],
  supplyPositive = [],
  supplyNegative = [],
}: TranscriptDriversCardProps) {
  const hasAny =
    demandPositive.length > 0 ||
    demandNegative.length > 0 ||
    supplyPositive.length > 0 ||
    supplyNegative.length > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-6">
      <TranscriptDriversSection
        title="Demand Drivers from Transcripts"
        positiveItems={demandPositive}
        negativeItems={demandNegative}
        positiveLabel="Positive Drivers"
        negativeLabel="Concerns"
      />
      <TranscriptDriversSection
        title="Supply Drivers from Transcripts"
        positiveItems={supplyPositive}
        negativeItems={supplyNegative}
        positiveLabel="Positive Drivers"
        negativeLabel="Concerns"
      />
    </div>
  );
}
