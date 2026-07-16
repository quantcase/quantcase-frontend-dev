"use client";

import { CtaLink } from "@/components/ds";
import type { WhatsMovingItem } from "@/types/investor-dashboard";

interface ChangedSinceCardProps {
  items: WhatsMovingItem[];
  loading: boolean;
  onReRead: (symbol: string) => void;
}

// What moved on the stocks in this journal.
//
// Heading is "What's changed", not the mockup's "Since your last entry":
// /api/portfolio/whats-moving carries no timestamp on its items (G4), so we
// cannot honestly claim a time filter. Once `occurred_at` ships, this can filter
// against the last entry date and take the original heading.
export function ChangedSinceCard({ items, loading, onReRead }: ChangedSinceCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-hair bg-card">
        <div className="border-b border-hair px-5 py-4">
          <div className="skeleton-shimmer h-3 w-52 rounded" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-b border-hair px-5 py-4 last:border-0">
            <div className="skeleton-shimmer mb-2 h-3 w-24 rounded" />
            <div className="skeleton-shimmer h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-hair bg-card">
      <div className="border-b border-hair px-5 py-4">
        <span className="eyebrow">
          What&rsquo;s changed · {items.length} {items.length === 1 ? "update" : "updates"}
        </span>
      </div>

      {items.map((item) => (
        <div key={item.id} className="border-b border-hair px-5 py-4 last:border-0">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full" style={{ background: kindColor(item.kind) }} />
              <span className="mono text-[12px] font-semibold text-ink">{item.symbol}</span>
            </span>
            <CtaLink onClick={() => onReRead(item.symbol)}>Re-read</CtaLink>
          </div>
          <p className="text-[13px] leading-[1.5] text-ink-2">{item.headline_detail || item.body}</p>
        </div>
      ))}
    </div>
  );
}

// The dot encodes direction, which is the only sentiment these items carry —
// `kind` is the signal; earnings is genuinely neutral.
function kindColor(kind: WhatsMovingItem["kind"]): string {
  if (kind === "score_upgrade") return "var(--qc-up)";
  if (kind === "score_downgrade") return "var(--qc-down)";
  return "var(--qc-blue)";
}
