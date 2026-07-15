"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { JournalCard } from "./_components/journal-card";
import { CreateJournalModal } from "@/components/journal/create-journal-modal";
import { useJournals } from "@/hooks/useJournals";
import { Display } from "@/components/ds";

export default function DiaryPage() {
  const router = useRouter();
  const { data: journals, loading, error, refetch } = useJournals();
  const [createOpen, setCreateOpen] = useState(false);

  const today = new Date();
  const dateLabel = today
    .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();

  const totalTickers = (journals ?? []).reduce((sum, j) => sum + j.tickerCount, 0);

  return (
    <div className="min-h-screen bg-[var(--qc-bg)] font-sans">
      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        {/* Masthead */}
        <div className="mb-9">
          <div className="text-[12px] font-medium tracking-[0.1em] text-ink-3">{dateLabel}</div>
          <Display as="h1" italic className="mt-3 text-[30px] font-medium leading-[1.15]">
            Your journals
          </Display>
          <p className="mt-4 max-w-[640px] text-[16px] leading-[1.5] text-ink-2">
            {loading
              ? "Loading your journals…"
              : `Track what you own and what you're watching. ${totalTickers} ticker${totalTickers === 1 ? "" : "s"} across ${journals?.length ?? 0} journal${(journals?.length ?? 0) === 1 ? "" : "s"}.`}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-down bg-down-soft px-4 py-3 text-[14px] text-down">{error}</div>
        )}

        {/* Journals grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[180px] rounded-xl border border-hair bg-card opacity-50" />
            ))
          ) : (
            <>
              {(journals ?? []).map((journal) => (
                <JournalCard key={journal.id} journal={journal} onChanged={refetch} />
              ))}

              {/* New journal tile */}
              <button
                onClick={() => setCreateOpen(true)}
                className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hair bg-[var(--qc-bg)] text-ink-3 transition-all hover:border-ink-3 hover:text-ink"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-hair">
                  <Plus className="size-5" />
                </span>
                <span className="text-[14px] font-medium">New journal</span>
              </button>
            </>
          )}
        </div>
      </main>

      {createOpen && (
        <CreateJournalModal
          onClose={() => setCreateOpen(false)}
          onCreated={(journal) => { setCreateOpen(false); refetch(); router.push(`/diary/${journal.id}`); }}
        />
      )}
    </div>
  );
}
