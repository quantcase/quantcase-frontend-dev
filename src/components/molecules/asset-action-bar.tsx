"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, StickyNote, PenLine, Check, Trash2, Pencil, X, Loader2, Search, ShoppingCart } from "lucide-react";
import { useShadowPortfolio } from "@/hooks/useShadowPortfolio";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ConnectPortfolioModal } from "@/components/investor/connect-portfolio-modal";
import { UploadPortfolioModal } from "@/components/investor/upload-portfolio-modal";
import { PlaceOrderModal } from "@/components/investor/place-order-modal";
import { useSmallcaseHoldings } from "@/hooks/useSmallcaseHoldings";
import type { HoldingNote } from "@/types/investor-portfolio";
import type { StocksApiResponse } from "@/types/screener";

// ─── Add-to-Shadow dialog ──────────────────────────────────────────────────────

function AddShadowDialog({
  ticker,
  onClose,
  onAdded,
}: {
  ticker: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { addHolding, mutating } = useShadowPortfolio();
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    addHolding(
      { ticker },
      () => { onAdded(); onClose(); },
      (e) => setErr(e)
    );
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--qc-card, #fff)",
          borderRadius: "12px 12px 0 0",
          padding: "28px 28px 36px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginBottom: 2 }}>
              Trackers
            </p>
            <h3 style={{ fontSize: "var(--qc-fz-18)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", margin: 0 }}>
              Add {ticker}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--qc-ink-3)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", margin: 0 }}>
            Add <strong style={{ color: "var(--qc-ink)" }}>{ticker}</strong> to your Trackers to track it alongside your research.
          </p>

          {err && <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down, #dc2626)", margin: 0 }}>{err}</p>}

          <button
            type="submit"
            disabled={mutating}
            style={{
              background: "var(--qc-ink, #0F172B)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 0",
              fontSize: "var(--qc-fz-13)",
              fontWeight: "var(--qc-w-semi)",
              fontFamily: "var(--qc-font-sans)",
              cursor: mutating ? "not-allowed" : "pointer",
              opacity: mutating ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {mutating ? <Loader2 size={14} className="animate-spin" /> : null}
            {mutating ? "Adding..." : "Add to Trackers"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Journal panel (slide-up from bar) ────────────────────────────────────────

function NoteItem({
  note,
  holdingId,
  onEdit,
  onDelete,
}: {
  note: HoldingNote;
  holdingId: string;
  onEdit: (noteId: string, holdingId: string, text: string) => void;
  onDelete: (noteId: string, holdingId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.note_text);

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 7,
            border: "1px solid var(--qc-hair, #E2E2E2)",
            fontSize: "var(--qc-fz-13)",
            fontFamily: "var(--qc-font-sans)",
            color: "var(--qc-ink)",
            resize: "none",
            background: "var(--qc-bg, #F5F5F5)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { onEdit(note.id, holdingId, draft); setEditing(false); }}
            style={{ fontSize: "var(--qc-fz-11)", fontWeight: "var(--qc-w-semi)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", background: "none", border: "none", cursor: "pointer" }}
          >
            Save
          </button>
          <button
            onClick={() => { setDraft(note.note_text); setEditing(false); }}
            style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3)", background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink)", margin: 0, lineHeight: 1.5, flex: 1 }}>{note.note_text}</p>
      <div style={{ display: "flex", gap: 4, flexShrink: 0, marginTop: 2 }}>
        <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--qc-ink-3)", padding: 2 }}>
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(note.id, holdingId)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--qc-down, #dc2626)", padding: 2 }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function JournalPanel({
  ticker,
  onClose,
}: {
  ticker: string;
  onClose: () => void;
}) {
  const { getHolding, isInShadowPortfolio, addHolding, addNote, editNote, deleteNote, mutating, loading } = useShadowPortfolio();
  const [draft, setDraft] = useState("");
  const [noteErr, setNoteErr] = useState<string | null>(null);
  const inPortfolio = isInShadowPortfolio(ticker);
  const holding = getHolding(ticker);

  function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setNoteErr(null);

    const noteText = draft.trim();

    if (!holding) {
      addHolding(
        { ticker },
        (newHolding) => {
          addNote(newHolding.id, noteText, () => setDraft(""), (err) => setNoteErr(err));
        },
        (err) => setNoteErr(err)
      );
      return;
    }

    addNote(holding.id, noteText, () => setDraft(""), (err) => setNoteErr(err));
  }

  const notes = holding?.notes ?? [];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        paddingBottom: 64,
        paddingLeft: 16,
        paddingRight: 16,
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Outer panel — matches InsightSignalMap section shell */}
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 10,
          border: "1px solid var(--qc-hair, #E2E2E2)",
          background: "var(--qc-section, #F5F5F5)",
          padding: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          maxHeight: "calc(100vh - 128px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Card header — matches InsightSignalMap header style */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StickyNote size={14} style={{ color: "var(--qc-ink-2, #888)" }} />
            <span
              style={{
                fontFamily: "var(--qc-font-mono)",
                fontSize: "var(--qc-fz-11)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--qc-ink, #0F172B)",
                fontWeight: "var(--qc-w-medium)",
              }}
            >
              Research Journal
            </span>
            {notes.length > 0 && (
              <span
                style={{
                  fontSize: "var(--qc-fz-10)",
                  fontWeight: "var(--qc-w-bold)",
                  fontFamily: "var(--qc-font-mono)",
                  color: "#84cc16",
                  background: "rgba(132,204,22,0.12)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  letterSpacing: "var(--qc-track-pill)",
                }}
              >
                {notes.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--qc-ink-3, #888)",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Inner white card */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid rgba(226,226,226,0.10)",
            background: "var(--qc-card, #fff)",
            padding: 16,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Ticker label */}
          <p style={{ fontSize: "var(--qc-fz-16)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink, #0F172B)", margin: 0 }}>
            {ticker}
          </p>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[80, 60, 90].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 56,
                    borderRadius: 8,
                    background: "linear-gradient(90deg, var(--qc-section,#F5F5F5) 25%, #ebebeb 50%, var(--qc-section,#F5F5F5) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "qc-shimmer 1.4s ease-in-out infinite",
                    opacity: 1 - i * 0.15,
                  }}
                />
              ))}
              <style>{`@keyframes qc-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            </div>
          )}

          {/* Existing notes */}
          {!loading && notes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--qc-hair, #E2E2E2)",
                    background: "var(--qc-section, #F5F5F5)",
                  }}
                >
                  <NoteItem
                    note={note}
                    holdingId={holding!.id}
                    onEdit={(noteId, hId, text) => editNote(noteId, hId, text)}
                    onDelete={(noteId, hId) => deleteNote(noteId, hId)}
                  />
                  <p style={{ fontSize: "var(--qc-fz-10)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-3, #888)", margin: "6px 0 0", letterSpacing: "0.03em" }}>
                    {new Date(note.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!loading && notes.length === 0 && (
            <p style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-ink-3, #888)", margin: 0 }}>
              {inPortfolio ? "No journal entries yet. Add your first observation below." : "Add a journal entry — the stock will be added to your Trackers automatically."}
            </p>
          )}

          {/* New note form */}
          {!loading && <form onSubmit={submitNote} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a journal entry…"
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid var(--qc-hair, #E2E2E2)",
                fontSize: "var(--qc-fz-13)",
                fontFamily: "var(--qc-font-sans)",
                color: "var(--qc-ink, #0F172B)",
                resize: "none",
                background: "var(--qc-section, #F5F5F5)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {noteErr && <p style={{ fontSize: "var(--qc-fz-12)", fontFamily: "var(--qc-font-sans)", color: "var(--qc-down, #dc2626)", margin: 0 }}>{noteErr}</p>}
            <button
              type="submit"
              disabled={mutating || !draft.trim()}
              style={{
                alignSelf: "flex-end",
                background: "var(--qc-ink, #0F172B)",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "8px 16px",
                fontSize: "var(--qc-fz-12)",
                fontWeight: "var(--qc-w-semi)",
                fontFamily: "var(--qc-font-sans)",
                cursor: mutating || !draft.trim() ? "not-allowed" : "pointer",
                opacity: mutating || !draft.trim() ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {mutating ? <Loader2 size={12} className="animate-spin" /> : null}
              Save entry
            </button>
          </form>}
        </div>
      </div>
    </div>
  );
}

// ─── Main AssetActionBar ───────────────────────────────────────────────────────

interface AssetActionBarProps {
  /** The ticker / symbol for the current screener asset page */
  ticker: string;
  /** Extra action slots — pass additional buttons/links */
  extra?: React.ReactNode;
}

/**
 * Sticky footer bar shown on all screener asset pages.
 * Shows stock search + "Add to Trackers" + "Buy" + "Journal" with live state from the API.
 */
export function AssetActionBar({ ticker, extra }: AssetActionBarProps) {
  const router = useRouter();
  const { isInShadowPortfolio, getHolding, loading } = useShadowPortfolio();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  // Broker connection state drives whether "Buy" places an order or connects first.
  const { data: smallcaseData, notConnected: brokerNotConnected, refetch: refetchSmallcase } = useSmallcaseHoldings();
  const brokerConnected = !brokerNotConnected && !!smallcaseData?.portfolio;

  function handleBuyClick() {
    if (brokerConnected) setShowOrderModal(true);
    else setShowBuyModal(true);
  }
  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Inline stock search ──────────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(-1);
  const [stockOptions, setStockOptions] = useState<{ value: string; label: string; subtitle?: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const inPortfolio = !loading && isInShadowPortfolio(ticker);
  const holding = getHolding(ticker);
  const noteCount = holding?.notes.length ?? 0;

  // Fetch the stock list once (same source as the screener home hero)
  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (response) =>
        setStockOptions(
          response.data.map((s) => ({ value: s.company, label: s.company_name, subtitle: s.basic_industry }))
        ),
      onError: (err) => console.error("Failed to fetch stocks:", err),
    });
  }, []);

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inSearch = searchRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inSearch && !inDropdown) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [searchOpen]);

  const searchResults = searchQuery.trim()
    ? stockOptions
        .filter((o) => {
          const t = searchQuery.toLowerCase();
          return (
            o.label?.toLowerCase().includes(t) ||
            o.value?.toLowerCase().includes(t) ||
            o.subtitle?.toLowerCase().includes(t)
          );
        })
        .slice(0, 6)
    : [];

  useEffect(() => { setSearchIndex(-1); }, [searchResults.length]);

  function goToStock(symbol: string) {
    if (!symbol) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/screener/overview?symbol=${encodeURIComponent(symbol)}`);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSearchIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSearchIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        setSearchOpen(false);
        break;
      case "Enter":
        e.preventDefault();
        goToStock(searchIndex >= 0 ? searchResults[searchIndex].value : searchQuery);
        break;
    }
  }

  // Flash "Added!" feedback
  function handleAdded() {
    setJustAdded(true);
    if (justAddedTimer.current) clearTimeout(justAddedTimer.current);
    justAddedTimer.current = setTimeout(() => setJustAdded(false), 2500);
  }

  useEffect(() => () => { if (justAddedTimer.current) clearTimeout(justAddedTimer.current); }, []);

  return (
    <>
      {/* Floating pill action bar */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px",
          borderRadius: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.18)",
        }}
        className="qc-dark-gradient-card bottom-[calc(60px+env(safe-area-inset-bottom)+12px)] md:bottom-6"
      >
        {/* Inline stock search */}
        <div ref={searchRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {searchOpen ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={13} style={{ position: "absolute", left: 12, color: "rgba(255,255,255,0.55)", pointerEvents: "none" }} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search a stock…"
                autoComplete="off"
                style={{
                  width: 180,
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.10)",
                  color: "#fff",
                  fontSize: "var(--qc-fz-12)",
                  fontFamily: "var(--qc-font-sans)",
                  padding: "7px 12px 7px 30px",
                  outline: "none",
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                style={{ position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", padding: 2 }}
                aria-label="Close search"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 0); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                fontSize: "var(--qc-fz-12)",
                fontWeight: "var(--qc-w-medium)",
                fontFamily: "var(--qc-font-sans)",
                color: "rgba(255,255,255,0.90)",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              className="px-3 py-2 sm:px-4 sm:py-[7px]"
              aria-label="Search stocks"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />

        {/* Trackers button */}
        {inPortfolio ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 9999,
              fontSize: "var(--qc-fz-12)",
              fontWeight: "var(--qc-w-medium)",
              fontFamily: "var(--qc-font-sans)",
              color: "#86efac",
              background: "rgba(134,239,172,0.12)",
              border: "1px solid rgba(134,239,172,0.25)",
            }}
            className="px-3 py-2 sm:px-4 sm:py-[7px]"
          >
            <Check size={13} />
            <span className="hidden sm:inline">Tracking</span>
          </div>
        ) : (
          <button
            onClick={() => setShowAddDialog(true)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: justAdded ? "rgba(134,239,172,0.12)" : "rgba(255,255,255,0.08)",
              fontSize: "var(--qc-fz-12)",
              fontWeight: "var(--qc-w-medium)",
              fontFamily: "var(--qc-font-sans)",
              color: justAdded ? "#86efac" : "rgba(255,255,255,0.90)",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
            className="px-3 py-2 sm:px-4 sm:py-[7px]"
          >
            {justAdded ? <Check size={13} /> : <BookmarkPlus size={13} />}
            <span className="hidden sm:inline">{justAdded ? "Added!" : "Track"}</span>
          </button>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", flexShrink: 0 }} />

        {/* Buy button — places an order if a broker is connected, else connects first */}
        <button
          onClick={handleBuyClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 9999,
            border: "1px solid rgba(134,239,172,0.25)",
            background: "rgba(134,239,172,0.14)",
            fontSize: "var(--qc-fz-12)",
            fontWeight: "var(--qc-w-semi)",
            fontFamily: "var(--qc-font-sans)",
            color: "#86efac",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          className="px-3 py-2 sm:px-4 sm:py-[7px]"
        >
          <ShoppingCart size={13} />
          <span className="hidden sm:inline">Buy</span>
        </button>

        {/* Journal button */}
        <button
          onClick={() => setShowJournal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.08)",
            fontSize: "var(--qc-fz-12)",
            fontWeight: "var(--qc-w-medium)",
            fontFamily: "var(--qc-font-sans)",
            color: "rgba(255,255,255,0.90)",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          className="px-3 py-2 sm:px-4 sm:py-[7px]"
        >
          <PenLine size={13} />
          <span className="hidden sm:inline">Journal</span>
          {noteCount > 0 && (
            <span
              style={{
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-bold)",
                fontFamily: "var(--qc-font-mono)",
                color: "#86efac",
                background: "rgba(134,239,172,0.15)",
                borderRadius: 999,
                padding: "1px 6px",
                marginLeft: 2,
              }}
            >
              {noteCount}
            </span>
          )}
        </button>

        {/* Extra actions slot */}
        {extra}
      </div>

      {/* Search results dropdown — rendered as a sibling of the bar so it is
          not clipped by the bar's `overflow:hidden` / `isolation:isolate`.
          Sits above the bar and re-uses the bar's fixed/centered positioning. */}
      {searchOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 51,
            width: 300,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: 10,
            background: "var(--qc-card, #fff)",
            border: "1px solid var(--qc-hair, #E2E2E2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            overflow: "hidden",
            maxHeight: 300,
            overflowY: "auto",
          }}
          className="bottom-[calc(60px+env(safe-area-inset-bottom)+12px+56px)] md:bottom-[calc(1.5rem+56px)]"
        >
          {searchResults.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => goToStock(option.value)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                border: "none",
                borderBottom: "1px solid var(--qc-hair-2, #eee)",
                cursor: "pointer",
                background: searchIndex === index ? "var(--qc-section, #F5F5F5)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-section, #F5F5F5)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = searchIndex === index ? "var(--qc-section, #F5F5F5)" : "transparent")}
            >
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: "var(--qc-fz-13)", fontWeight: "var(--qc-w-medium)", color: "var(--qc-ink, #0F172B)", fontFamily: "var(--qc-font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {option.label}
                </span>
                {option.subtitle && (
                  <span style={{ display: "block", fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-3, #888)", fontFamily: "var(--qc-font-sans)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                    {option.subtitle}
                  </span>
                )}
              </span>
              <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-3, #888)", fontFamily: "var(--qc-font-mono)", flexShrink: 0 }}>
                {option.value}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showAddDialog && (
        <AddShadowDialog
          ticker={ticker}
          onClose={() => setShowAddDialog(false)}
          onAdded={handleAdded}
        />
      )}
      {showJournal && (
        <JournalPanel
          ticker={ticker}
          onClose={() => setShowJournal(false)}
        />
      )}

      {/* Buy → smallcase / broker connect flow (shown when no broker is connected) */}
      <ConnectPortfolioModal
        open={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onOpenCsvUpload={() => setShowCsvUpload(true)}
        onConnected={() => { setShowBuyModal(false); refetchSmallcase(); setShowOrderModal(true); }}
      />
      {/* Buy → place order (shown when a broker is connected) */}
      <PlaceOrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        ticker={ticker}
      />
      <UploadPortfolioModal
        open={showCsvUpload}
        onClose={() => setShowCsvUpload(false)}
        onSuccess={() => setShowCsvUpload(false)}
      />
    </>
  );
}
