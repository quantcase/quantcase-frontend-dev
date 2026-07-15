"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { StatusBadge, Badge, ScoreValue } from "@/components/ds";
import { ThesisHealthBadge } from "@/components/journal/thesis-health-badge";
import { renderMd } from "@/lib/render-md";
import { timeAgo } from "@/lib/utils";
import { fmtSignedPct } from "@/lib/portfolio-format";
import { fmtPrice, marketConvictionSentiment } from "@/lib/journal-format";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import type { JournalTicker } from "@/types/journal";

interface Props {
  journalId: string;
  ticker: JournalTicker;
  /** Holdings journal is add-only — hide the remove control. */
  removable: boolean;
  onOpen: () => void;
  onChanged: () => void;
}

export function TickerRow({ journalId, ticker, removable, onOpen, onChanged }: Props) {
  const { removeTicker, mutating } = useJournalMutations();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const m = ticker.market;
  const changePositive = (m.change ?? 0) >= 0;

  const latest = ticker.latestEntry;
  const latestText = latest
    ? latest.type === "note"
      ? latest.noteText
      : latest.thesis
    : null;

  return (
    <TableRow className="cursor-pointer hover:bg-secondary/60" onClick={onOpen}>
      {/* Ticker + name + latest entry excerpt */}
      <TableCell className="align-top">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold tracking-[0.02em] text-ink">{ticker.ticker}</span>
          {ticker.source === "holdings_sync" && <Badge variant="muted">Held</Badge>}
        </div>
        {latestText && (
          <div className="mt-1 line-clamp-1 max-w-[280px] text-[12px] text-ink-3">
            {latest?.type === "thesis" ? <span className="serif italic">“{renderMd(latestText)}”</span> : renderMd(latestText)}
            <span className="ml-1.5 whitespace-nowrap font-mono text-[10px] text-ink-3">· {timeAgo(latest!.createdAt)}</span>
          </div>
        )}
      </TableCell>

      {/* Price + day change */}
      <TableCell className="align-top text-right font-mono text-[13px] text-ink">
        {fmtPrice(m.ltp)}
        {m.changePercent != null && (
          <div className="text-[11px]" style={{ color: changePositive ? "var(--qc-up)" : "var(--qc-down)" }}>
            {fmtSignedPct(m.changePercent)}
          </div>
        )}
      </TableCell>

      {/* QC score */}
      <TableCell className="align-top text-right">
        {m.qcScore != null ? <ScoreValue value={m.qcScore} max={100} size="sm" /> : <span className="text-ink-3">—</span>}
      </TableCell>

      {/* Market conviction + thesis tags */}
      <TableCell className="align-top">
        <div className="flex flex-wrap items-center gap-1.5">
          {m.conviction && <StatusBadge label={m.conviction} sentiment={marketConvictionSentiment(m.conviction)} />}
          {m.thesisTags.slice(0, 2).map((t) => (
            <Badge key={t} variant="muted">{t}</Badge>
          ))}
        </div>
      </TableCell>

      {/* Thesis health */}
      <TableCell className="align-top">
        <ThesisHealthBadge health={ticker.latestThesisHealth} />
      </TableCell>

      {/* Remove */}
      <TableCell className="align-top text-right" onClick={(e) => e.stopPropagation()}>
        {removable ? (
          confirmRemove ? (
            <span className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => removeTicker(journalId, ticker.ticker, () => { setConfirmRemove(false); onChanged(); }, () => setConfirmRemove(false))}
                disabled={mutating}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-down hover:bg-down-soft disabled:opacity-50"
              >
                {mutating ? <Loader2 className="size-3 animate-spin" /> : null} Remove
              </button>
              <button onClick={() => setConfirmRemove(false)} className="rounded-md px-2 py-1 text-[11px] text-ink-2 hover:bg-secondary">Cancel</button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-down-soft hover:text-down"
              aria-label="Remove ticker"
            >
              <Trash2 className="size-3.5" />
            </button>
          )
        ) : null}
      </TableCell>
    </TableRow>
  );
}
