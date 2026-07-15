"use client";

import { useMemo, useState } from "react";

import { EntryCard, PendingEntryCard } from "./_components/entry-card";
import { ChangeFeed, type ChangeItem } from "./_components/change-feed";
import { DimensionCard } from "./_components/dimension-card";
import { HoldingsList, type DiaryHolding } from "./_components/holdings-list";
import { StreakDots } from "./_components/streak-dots";

import { CompleteJournalModal } from "@/components/investor/complete-journal-modal";
import { ConnectPortfolioModal } from "@/components/investor/connect-portfolio-modal";
import { UploadPortfolioModal } from "@/components/investor/upload-portfolio-modal";

import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useJournalPending } from "@/hooks/useJournalPending";
import { useUserPortfolio } from "@/hooks/useUserPortfolio";
import { useSmallcaseHoldings } from "@/hooks/useSmallcaseHoldings";
import { useUser } from "@/components/providers/UserContext";
import { brokerLabel } from "@/lib/portfolio-format";
import { Display } from "@/components/ds";

// ── Page ────────────────────────────────────────────────────────────────────

export default function DiaryPage() {
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [journalTargetSymbol, setJournalTargetSymbol] = useState<string | undefined>();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: journalData, loading: journalLoading, refetch: refetchJournal } = useJournalEntries();
  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } = useJournalPending();
  const { data: userPortfolio, loading: portfolioLoading, refetch: refetchUserPortfolio } = useUserPortfolio();
  const { data: smallcaseData, syncing: smallcaseSyncing, refetch: refetchSmallcase, sync: syncSmallcase } = useSmallcaseHoldings();
  const { smallcase } = useUser();

  const entries = useMemo(() => journalData?.entries ?? [], [journalData]);
  const summary = journalData?.summary ?? { intact: 0, partial: 0, broken: 0, none: 0, total: 0, entryCount: 0, streakDays: 0 };

  // ── Masthead progress copy ──
  const written = summary.intact + summary.partial + summary.broken;
  const underPressure = summary.partial + summary.broken;
  const waiting = summary.none;

  const today = new Date();
  const dateLabel = today
    .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
  const entryNumber = summary.entryCount;

  // ── Entry cards — holdings that already have a thesis, most-recently-updated first ──
  const writtenEntries = useMemo(
    () =>
      entries
        .filter(e => e.journal)
        .sort((a, b) => {
          const ta = a.journal?.updatedAt ? new Date(a.journal.updatedAt).getTime() : 0;
          const tb = b.journal?.updatedAt ? new Date(b.journal.updatedAt).getTime() : 0;
          return tb - ta;
        }),
    [entries],
  );

  // ── Change feed — real "since your last entry" changes from the backend ──
  const changes: ChangeItem[] = useMemo(
    () =>
      (journalData?.changes ?? []).map(c => ({
        symbol: c.symbol,
        health: c.thesisHealth,
        description: c.description,
      })),
    [journalData],
  );

  // ── Dimension card — first pending holding still missing a thesis ──
  const pendingHoldings = pendingData?.holdings ?? [];
  const featured = pendingHoldings[0] ?? null;
  const toGo = pendingData?.pending ?? waiting;

  // ── Everything you own ──
  // Connection is authoritative from /auth/me — a broker can be linked with zero
  // synced holdings (holdings_count: 0), so we must not infer it from holdings.
  const brokerConnected = smallcase?.is_connected ?? false;
  const connectedBrokerLabel = brokerLabel(smallcase?.broker);

  // Prefer live broker holdings when the smallcase feed has them; otherwise fall
  // back to the uploaded CSV portfolio.
  const hasSmallcaseHoldings = (smallcaseData?.holdings?.length ?? 0) > 0;
  const ownedHoldings: DiaryHolding[] = useMemo(() => {
    if (hasSmallcaseHoldings) {
      return (smallcaseData?.holdings ?? []).map(h => ({
        ticker: h.ticker,
        name: null,
        amount: h.current_value,
        qty: h.quantity,
        broker: h.broker,
      }));
    }
    return (userPortfolio?.holdings ?? []).map(h => ({
      ticker: h.ticker,
      name: null,
      amount: h.current_value ?? h.amount_invested,
      qty: h.quantity ?? null,
      broker: h.broker,
    }));
  }, [hasSmallcaseHoldings, smallcaseData, userPortfolio]);

  const ownedLoading = hasSmallcaseHoldings ? false : portfolioLoading;

  // ── Handlers ──
  function openJournalModal(symbol?: string) {
    setJournalTargetSymbol(symbol);
    setJournalModalOpen(true);
  }
  function handleJournalComplete() {
    refetchJournal();
    refetchPending();
  }

  return (
    <div className="min-h-screen bg-[var(--qc-bg)] font-sans">
      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">

        {/* ── Masthead ─────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="text-[12px] font-medium tracking-[0.1em] text-ink-3">
            {dateLabel}{entryNumber > 0 ? ` · ENTRY ${entryNumber}` : ""}
          </div>
          <Display as="h1" italic className="mt-3 text-[30px] font-medium leading-[1.15]">
            Your investment diary
          </Display>
          <p className="mt-5 max-w-[640px] text-[17px] leading-[1.5] text-ink-2">
            {journalLoading ? (
              "Loading your entries…"
            ) : (
              <>
                You&apos;ve written {written} of {summary.total} reasons.
                {underPressure > 0 && (
                  <> {underPressure === 1 ? "One of them is" : `${underPressure} of them are`} under pressure this week</>
                )}
                {waiting > 0 && (
                  <>{underPressure > 0 ? " — and " : " "}{waiting} holding{waiting === 1 ? " is" : "s are"} still waiting for a first entry.</>
                )}
              </>
            )}
          </p>
        </div>

        {/* ── YOUR ENTRIES ─────────────────────────────────────────── */}
        <section className="mb-11">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Your entries
          </div>
          {journalLoading ? (
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[250px] flex-[0_0_320px] rounded-xl border border-hair bg-card opacity-50" />
              ))}
            </div>
          ) : writtenEntries.length === 0 && pendingHoldings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hair px-5 py-10 text-center text-[14px] text-ink-3">
              No entries yet. Write your first investment reason below.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {writtenEntries.map(item => (
                <EntryCard key={item.symbol} item={item} onClick={openJournalModal} />
              ))}
              {pendingHoldings.map(h => (
                <PendingEntryCard key={h.symbol} item={h} onClick={openJournalModal} />
              ))}
            </div>
          )}
        </section>

        {/* ── SINCE YOUR LAST ENTRY + EVERYTHING YOU OWN · KEEP WRITING ─ */}
        <section className="mb-11 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_minmax(440px,42%)]">
          {/* Left — change feed, then everything you own */}
          <div className="flex flex-col gap-11">
            <ChangeFeed items={changes} onReRead={openJournalModal} />

            <HoldingsList
              holdings={ownedHoldings}
              loading={ownedLoading}
              brokerConnected={brokerConnected}
              brokerLabel={connectedBrokerLabel}
              syncing={smallcaseSyncing}
              onConnectBroker={() => setConnectModalOpen(true)}
              onUploadCsv={() => setUploadModalOpen(true)}
              onSync={syncSmallcase}
            />
          </div>

          {/* Right — keep writing + dimension card */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Keep writing{toGo > 0 ? ` · ${toGo} to go` : ""}
              </div>
              <StreakDots filled={summary.streakDays} />
            </div>

            {pendingLoading ? (
              <div className="h-[360px] rounded-2xl border border-hair bg-card opacity-50" />
            ) : featured ? (
              <DimensionCard holding={featured} onWrite={openJournalModal} />
            ) : (
              <div className="rounded-2xl border border-hair bg-card px-6 py-12 text-center">
                <div className="mb-1.5 text-[15px] font-medium text-ink">All caught up ✓</div>
                <div className="text-[13px] text-ink-3">Every holding has a thesis entry.</div>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ── Modals (carried over from the old portfolio page) ─────── */}
      <CompleteJournalModal
        open={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        onComplete={handleJournalComplete}
        onConnect={() => setConnectModalOpen(true)}
        holdings={pendingData?.holdings ?? []}
        totalHoldings={pendingData?.totalHoldings}
        loadingHoldings={pendingLoading}
        targetSymbol={journalTargetSymbol}
      />

      <ConnectPortfolioModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onOpenCsvUpload={() => setUploadModalOpen(true)}
        onConnected={() => { setConnectModalOpen(false); refetchUserPortfolio(); refetchSmallcase(); }}
      />

      <UploadPortfolioModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => { setUploadModalOpen(false); window.location.reload(); }}
      />
    </div>
  );
}
