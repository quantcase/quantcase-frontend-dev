"use client";

import { StatusBadge, Badge } from "@/components/ds";
import { thesisHealthSentiment, thesisHealthLabel } from "@/lib/journal-format";
import type { ThesisHealth } from "@/types/journal";

/**
 * The one thesis-health chip. Maps the four ThesisHealth values onto the
 * canonical StatusBadge sentiments; renders a muted "No thesis" tag when the
 * ticker has no thesis entries yet (`null`).
 */
export function ThesisHealthBadge({ health }: { health: ThesisHealth | null }) {
  if (health == null) {
    return <Badge variant="muted">No thesis</Badge>;
  }
  return <StatusBadge label={thesisHealthLabel(health)} sentiment={thesisHealthSentiment(health)} />;
}
