"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet, apiAuthPost, apiAuthPatch, apiAuthDelete } from "@/lib/api";
import type {
  ShadowPortfolioData,
  Holding,
  HoldingNote,
  AddShadowHoldingPayload,
  UpdateHoldingPayload,
} from "@/types/investor-portfolio";

interface State {
  data: ShadowPortfolioData | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useShadowPortfolio() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, notFound: false });
  const [mutating, setMutating] = useState(false);

  const refetch = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null, notFound: false }));
    apiAuthGet<{ success: boolean; data: ShadowPortfolioData }>(
      `${BACKEND_URL}/api/portfolio/shadow`,
      {
        onSuccess: (res) => setState({ data: res.data, loading: false, error: null, notFound: false }),
        onError: (err) => {
          const notFound = err.includes("404") || err.toLowerCase().includes("no shadow");
          setState({ data: null, loading: false, error: notFound ? null : err, notFound });
        },
        onComplete: () => setState(s => ({ ...s, loading: false })),
      }
    );
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // ── Derived helpers ────────────────────────────────────────────────────────

  const holdings = state.data?.holdings ?? [];

  function isInShadowPortfolio(ticker: string): boolean {
    return holdings.some(h => h.ticker.toUpperCase() === ticker.toUpperCase());
  }

  function getHolding(ticker: string): Holding | undefined {
    return holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase());
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  function addHolding(
    payload: AddShadowHoldingPayload,
    onDone?: (holding: Holding) => void,
    onErr?: (err: string) => void
  ) {
    setMutating(true);
    apiAuthPost<{ success: boolean; data: Holding }>(
      `${BACKEND_URL}/api/portfolio/shadow/add`,
      {
        onSuccess: (res) => {
          // Optimistic update: append to holdings
          setState(s => {
            if (!s.data) {
              return {
                ...s,
                data: {
                  id: "",
                  user_id: "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  holdings: [{ ...res.data, notes: [] }],
                },
                notFound: false,
              };
            }
            return { ...s, data: { ...s.data, holdings: [...s.data.holdings, { ...res.data, notes: [] }] } };
          });
          onDone?.(res.data);
        },
        onError: (err) => onErr?.(err),
        onComplete: () => setMutating(false),
      },
      payload
    );
  }

  function updateHolding(
    holdingId: string,
    payload: UpdateHoldingPayload,
    onDone?: (holding: Holding) => void,
    onErr?: (err: string) => void
  ) {
    setMutating(true);
    apiAuthPatch<{ success: boolean; data: Holding }>(
      `${BACKEND_URL}/api/portfolio/holdings/${holdingId}`,
      {
        onSuccess: (res) => {
          setState(s => {
            if (!s.data) return s;
            return {
              ...s,
              data: {
                ...s.data,
                holdings: s.data.holdings.map(h => h.id === holdingId ? { ...res.data, notes: h.notes } : h),
              },
            };
          });
          onDone?.(res.data);
        },
        onError: (err) => onErr?.(err),
        onComplete: () => setMutating(false),
      },
      payload
    );
  }

  function deleteHolding(
    holdingId: string,
    onDone?: () => void,
    onErr?: (err: string) => void
  ) {
    setMutating(true);
    apiAuthDelete<{ success: boolean }>(
      `${BACKEND_URL}/api/portfolio/holdings/${holdingId}`,
      {
        onSuccess: () => {
          setState(s => {
            if (!s.data) return s;
            return { ...s, data: { ...s.data, holdings: s.data.holdings.filter(h => h.id !== holdingId) } };
          });
          onDone?.();
        },
        onError: (err) => onErr?.(err),
        onComplete: () => setMutating(false),
      }
    );
  }

  function addNote(
    holdingId: string,
    noteText: string,
    onDone?: (note: HoldingNote) => void,
    onErr?: (err: string) => void
  ) {
    setMutating(true);
    apiAuthPost<{ success: boolean; data: HoldingNote }>(
      `${BACKEND_URL}/api/portfolio/holdings/${holdingId}/notes`,
      {
        onSuccess: (res) => {
          setState(s => {
            if (!s.data) return s;
            return {
              ...s,
              data: {
                ...s.data,
                holdings: s.data.holdings.map(h =>
                  h.id === holdingId ? { ...h, notes: [res.data, ...h.notes] } : h
                ),
              },
            };
          });
          onDone?.(res.data);
        },
        onError: (err) => onErr?.(err),
        onComplete: () => setMutating(false),
      },
      { note_text: noteText }
    );
  }

  function editNote(
    noteId: string,
    holdingId: string,
    noteText: string,
    onDone?: (note: HoldingNote) => void,
    onErr?: (err: string) => void
  ) {
    setMutating(true);
    apiAuthPatch<{ success: boolean; data: HoldingNote }>(
      `${BACKEND_URL}/api/portfolio/notes/${noteId}`,
      {
        onSuccess: (res) => {
          setState(s => {
            if (!s.data) return s;
            return {
              ...s,
              data: {
                ...s.data,
                holdings: s.data.holdings.map(h =>
                  h.id === holdingId
                    ? { ...h, notes: h.notes.map(n => n.id === noteId ? res.data : n) }
                    : h
                ),
              },
            };
          });
          onDone?.(res.data);
        },
        onError: (err) => onErr?.(err),
        onComplete: () => setMutating(false),
      },
      { note_text: noteText }
    );
  }

  function deleteNote(
    noteId: string,
    holdingId: string,
    onDone?: () => void,
    onErr?: (err: string) => void
  ) {
    setMutating(true);
    apiAuthDelete<{ success: boolean }>(
      `${BACKEND_URL}/api/portfolio/notes/${noteId}`,
      {
        onSuccess: () => {
          setState(s => {
            if (!s.data) return s;
            return {
              ...s,
              data: {
                ...s.data,
                holdings: s.data.holdings.map(h =>
                  h.id === holdingId ? { ...h, notes: h.notes.filter(n => n.id !== noteId) } : h
                ),
              },
            };
          });
          onDone?.();
        },
        onError: (err) => onErr?.(err),
        onComplete: () => setMutating(false),
      }
    );
  }

  return {
    ...state,
    holdings,
    mutating,
    refetch,
    isInShadowPortfolio,
    getHolding,
    addHolding,
    updateHolding,
    deleteHolding,
    addNote,
    editNote,
    deleteNote,
  };
}
