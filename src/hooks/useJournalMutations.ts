"use client";

import { useState } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthPost, apiAuthPatch, apiAuthDelete } from "@/lib/api";
import type {
  Journal,
  JournalEntry,
  EntryBody,
  AddTickersResponse,
  EvaluateResponse,
  SyncHoldingsResponse,
} from "@/types/journal";

type Done<T> = (data: T) => void;
type Err = (error: string) => void;

// Imperative journal mutations. No internal cache — callers refetch the
// relevant read hook in `onDone` so the discriminated entry union never gets
// stale-merged. Every call carries the JWT via apiAuth* (no user_id anywhere).
export function useJournalMutations() {
  const [mutating, setMutating] = useState(false);

  function run<T>(fn: (cb: { onSuccess: (r: { data: T }) => void; onError: Err; onComplete: () => void }) => void, onDone?: Done<T>, onErr?: Err) {
    setMutating(true);
    fn({
      onSuccess: (r) => onDone?.(r.data),
      onError: (e) => onErr?.(e),
      onComplete: () => setMutating(false),
    });
  }

  // ── Journals ───────────────────────────────────────────────────────────────

  function createJournal(name: string, onDone?: Done<Journal>, onErr?: Err) {
    run<Journal>(cb => apiAuthPost(`${BACKEND_URL}/api/journal/journals`, cb, { name }), onDone, onErr);
  }

  function renameJournal(journalId: string, name: string, onDone?: Done<Journal>, onErr?: Err) {
    run<Journal>(cb => apiAuthPatch(`${BACKEND_URL}/api/journal/journals/${journalId}`, cb, { name }), onDone, onErr);
  }

  function deleteJournal(journalId: string, onDone?: Done<{ deleted: boolean }>, onErr?: Err) {
    run<{ deleted: boolean }>(cb => apiAuthDelete(`${BACKEND_URL}/api/journal/journals/${journalId}`, cb), onDone, onErr);
  }

  // ── Tickers ─────────────────────────────────────────────────────────────────

  function addTickers(journalId: string, tickers: string[], onDone?: Done<AddTickersResponse>, onErr?: Err) {
    run<AddTickersResponse>(cb => apiAuthPost(`${BACKEND_URL}/api/journal/journals/${journalId}/tickers`, cb, { tickers }), onDone, onErr);
  }

  function removeTicker(journalId: string, ticker: string, onDone?: Done<{ deleted: boolean }>, onErr?: Err) {
    run<{ deleted: boolean }>(cb => apiAuthDelete(`${BACKEND_URL}/api/journal/journals/${journalId}/tickers/${encodeURIComponent(ticker)}`, cb), onDone, onErr);
  }

  // ── Entries ─────────────────────────────────────────────────────────────────

  // Add a note or thesis. If the ticker isn't in the journal yet it's auto-added
  // (source: "manual"), so this is a single call for "note a ticker".
  function addEntry(journalId: string, ticker: string, body: EntryBody, onDone?: Done<JournalEntry>, onErr?: Err) {
    run<JournalEntry>(cb => apiAuthPost(`${BACKEND_URL}/api/journal/journals/${journalId}/tickers/${encodeURIComponent(ticker)}/entries`, cb, body), onDone, onErr);
  }

  function editEntry(entryId: string, body: Partial<EntryBody>, onDone?: Done<JournalEntry>, onErr?: Err) {
    run<JournalEntry>(cb => apiAuthPatch(`${BACKEND_URL}/api/journal/entries/${entryId}`, cb, body), onDone, onErr);
  }

  function deleteEntry(entryId: string, onDone?: Done<{ deleted: boolean }>, onErr?: Err) {
    run<{ deleted: boolean }>(cb => apiAuthDelete(`${BACKEND_URL}/api/journal/entries/${entryId}`, cb), onDone, onErr);
  }

  function evaluateEntry(entryId: string, onDone?: Done<EvaluateResponse>, onErr?: Err) {
    run<EvaluateResponse>(cb => apiAuthPost(`${BACKEND_URL}/api/journal/entries/${entryId}/evaluate`, cb), onDone, onErr);
  }

  // ── Holdings sync ─────────────────────────────────────────────────────────────

  function syncHoldings(onDone?: Done<SyncHoldingsResponse>, onErr?: Err) {
    run<SyncHoldingsResponse>(cb => apiAuthPost(`${BACKEND_URL}/api/journal/sync-holdings`, cb), onDone, onErr);
  }

  return {
    mutating,
    createJournal,
    renameJournal,
    deleteJournal,
    addTickers,
    removeTicker,
    addEntry,
    editEntry,
    deleteEntry,
    evaluateEntry,
    syncHoldings,
  };
}
