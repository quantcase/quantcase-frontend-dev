"use client";

import { SectionPanel } from "@/components/molecules/section-panel";
import type { InvestmentThesis } from "@/types/management";

interface NextConcallWatchlistSectionProps {
  watchlist: InvestmentThesis["next_concall_watchlist"];
  period?: string;
}

function WatchlistCard({ item }: { item: InvestmentThesis["next_concall_watchlist"][0] }) {
  return (
    <div
      style={{
        background: "var(--qc-card)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Number + question */}
      <div style={{ padding: "16px 18px 14px" }}>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--qc-ink-3)",
            letterSpacing: "0.1em",
          }}
        >
          {String(item.number).padStart(2, "0")}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--qc-ink)",
            lineHeight: 1.5,
          }}
        >
          {item.what_to_listen_for}
        </p>
      </div>

      {/* Green signal */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          padding: "8px 18px",
          background: "var(--qc-up-soft)",
          borderTop: "1px solid var(--qc-hair)",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--qc-up)", flexShrink: 0, marginTop: 1 }}>✓</span>
        <p style={{ margin: 0, fontSize: 12, color: "var(--qc-up)", lineHeight: 1.55 }}>
          {item.green_signal}
        </p>
      </div>

      {/* Red signal */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          padding: "8px 18px",
          background: "var(--qc-down-soft)",
          borderTop: "1px solid var(--qc-hair)",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--qc-down)", flexShrink: 0, marginTop: 1 }}>●</span>
        <p style={{ margin: 0, fontSize: 12, color: "var(--qc-down)", lineHeight: 1.55 }}>
          {item.red_signal}
        </p>
      </div>
    </div>
  );
}

export function NextConcallWatchlistSection({ watchlist, period }: NextConcallWatchlistSectionProps) {
  if (watchlist.length === 0) return null;

  const titleText = period ? `Next Concall Watchlist · ${period}` : "Next Concall Watchlist";

  const headerAction = (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--qc-ink-2)",
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        borderRadius: 4,
        padding: "3px 10px",
        letterSpacing: "0.05em",
      }}
    >
      {String(watchlist.length).padStart(2, "0")} items
    </div>
  );

  return (
    <SectionPanel
      title={titleText}
      subtitle="Each item is specific and falsifiable"
      headerAction={headerAction}
      contentClassName="!p-0 !border-0 !bg-transparent !rounded-none"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {watchlist.map((item) => (
          <WatchlistCard key={item.number} item={item} />
        ))}
      </div>
    </SectionPanel>
  );
}
