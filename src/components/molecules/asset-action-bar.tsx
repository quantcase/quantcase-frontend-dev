"use client";

import { useState, useEffect, useRef } from "react";
import { BookmarkPlus, StickyNote, Check, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { useShadowPortfolio } from "@/hooks/useShadowPortfolio";
import type { HoldingNote } from "@/types/investor-portfolio";

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
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginBottom: 2 }}>
              Shadow Portfolio
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--qc-ink)", margin: 0 }}>
              Add {ticker}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--qc-ink-3)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, color: "var(--qc-ink-3)", margin: 0 }}>
            Add <strong style={{ color: "var(--qc-ink)" }}>{ticker}</strong> to your Shadow Portfolio to track it alongside your research.
          </p>

          {err && <p style={{ fontSize: 12, color: "var(--qc-down, #dc2626)", margin: 0 }}>{err}</p>}

          <button
            type="submit"
            disabled={mutating}
            style={{
              background: "var(--qc-ink, #0F172B)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: mutating ? "not-allowed" : "pointer",
              opacity: mutating ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {mutating ? <Loader2 size={14} className="animate-spin" /> : null}
            {mutating ? "Adding..." : "Add to Shadow Portfolio"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Notes panel (slide-up from bar) ──────────────────────────────────────────

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
            fontSize: 13,
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
            style={{ fontSize: 11, fontWeight: 600, color: "var(--qc-ink)", background: "none", border: "none", cursor: "pointer" }}
          >
            Save
          </button>
          <button
            onClick={() => { setDraft(note.note_text); setEditing(false); }}
            style={{ fontSize: 11, color: "var(--qc-ink-3)", background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <p style={{ fontSize: 13, color: "var(--qc-ink)", margin: 0, lineHeight: 1.5, flex: 1 }}>{note.note_text}</p>
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

function NotesPanel({
  ticker,
  onClose,
}: {
  ticker: string;
  onClose: () => void;
}) {
  const { getHolding, isInShadowPortfolio, addHolding, addNote, editNote, deleteNote, mutating } = useShadowPortfolio();
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
      // Auto-add to shadow portfolio first, then attach the note
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
        background: "rgba(0,0,0,0.35)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--qc-card, #fff)",
          borderRadius: "12px 12px 0 0",
          padding: "24px 24px 36px",
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--qc-ink-3)", marginBottom: 2 }}>
              Research Notes
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "var(--qc-ink)", margin: 0 }}>
              {ticker}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--qc-ink-3)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* existing notes */}
        {notes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--qc-hair, #E2E2E2)",
                  background: "var(--qc-bg, #F5F5F5)",
                }}
              >
                <NoteItem
                  note={note}
                  holdingId={holding!.id}
                  onEdit={(noteId, hId, text) => editNote(noteId, hId, text)}
                  onDelete={(noteId, hId) => deleteNote(noteId, hId)}
                />
                <p style={{ fontSize: 10, color: "var(--qc-ink-3)", margin: "6px 0 0", letterSpacing: "0.03em" }}>
                  {new Date(note.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--qc-ink-3)", marginBottom: 16 }}>
            {inPortfolio ? "No notes yet. Add your first observation below." : "Write a note — the stock will be added to your Shadow Portfolio automatically."}
          </p>
        )}

        {/* new note form — always shown */}
        <form onSubmit={submitNote} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a research note…"
            rows={3}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid var(--qc-hair, #E2E2E2)",
              fontSize: 13,
              color: "var(--qc-ink)",
              resize: "none",
              background: "var(--qc-bg, #F5F5F5)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {noteErr && <p style={{ fontSize: 12, color: "var(--qc-down, #dc2626)", margin: 0 }}>{noteErr}</p>}
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
              fontSize: 12,
              fontWeight: 600,
              cursor: mutating || !draft.trim() ? "not-allowed" : "pointer",
              opacity: mutating || !draft.trim() ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {mutating ? <Loader2 size={12} className="animate-spin" /> : null}
            Save note
          </button>
        </form>
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
 * Shows "Add to Shadow Portfolio" + "Notes" with live state from the API.
 */
export function AssetActionBar({ ticker, extra }: AssetActionBarProps) {
  const { isInShadowPortfolio, getHolding, loading } = useShadowPortfolio();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inPortfolio = !loading && isInShadowPortfolio(ticker);
  const holding = getHolding(ticker);
  const noteCount = holding?.notes.length ?? 0;

  // Flash "Added!" feedback
  function handleAdded() {
    setJustAdded(true);
    if (justAddedTimer.current) clearTimeout(justAddedTimer.current);
    justAddedTimer.current = setTimeout(() => setJustAdded(false), 2500);
  }

  useEffect(() => () => { if (justAddedTimer.current) clearTimeout(justAddedTimer.current); }, []);

  return (
    <>
      {/* Sticky footer bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid var(--qc-hair, #E2E2E2)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Shadow Portfolio button */}
        {inPortfolio ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--qc-up-soft, #bbf7d0)",
              background: "var(--qc-up-bg, #f0fdf4)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--qc-up, #16a34a)",
            }}
          >
            <Check size={14} />
            In Shadow Portfolio
          </div>
        ) : (
          <button
            onClick={() => setShowAddDialog(true)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--qc-hair, #E2E2E2)",
              background: justAdded ? "var(--qc-up-bg, #f0fdf4)" : "var(--qc-card, #fff)",
              fontSize: 12,
              fontWeight: 500,
              color: justAdded ? "var(--qc-up, #16a34a)" : "var(--qc-ink, #0F172B)",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {justAdded ? <Check size={14} /> : <BookmarkPlus size={14} />}
            {justAdded ? "Added!" : "Add to Shadow Portfolio"}
          </button>
        )}

        {/* Notes button */}
        <button
          onClick={() => setShowNotes(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            border: "1px solid var(--qc-hair, #E2E2E2)",
            background: "var(--qc-card, #fff)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--qc-ink, #0F172B)",
            cursor: "pointer",
          }}
        >
          <StickyNote size={14} />
          Notes{noteCount > 0 && ` (${noteCount})`}
        </button>

        {/* Extra actions slot */}
        {extra}
      </div>

      {/* Dialogs */}
      {showAddDialog && (
        <AddShadowDialog
          ticker={ticker}
          onClose={() => setShowAddDialog(false)}
          onAdded={handleAdded}
        />
      )}
      {showNotes && (
        <NotesPanel
          ticker={ticker}
          onClose={() => setShowNotes(false)}
        />
      )}
    </>
  );
}
