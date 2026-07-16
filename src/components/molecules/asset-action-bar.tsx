"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, PenLine, Check, Loader2, Search, X } from "lucide-react";
import { useJournalTree } from "@/hooks/useJournalTree";
import { useJournalMutations } from "@/hooks/useJournalMutations";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ConnectPortfolioModal } from "@/components/investor/connect-portfolio-modal";
import { UploadPortfolioModal } from "@/components/investor/upload-portfolio-modal";
import { PlaceOrderModal } from "@/components/investor/place-order-modal";
import { TickerEntriesPanel } from "@/components/journal/ticker-entries-panel";
import { useUser } from "@/components/providers/UserContext";
import type { StocksApiResponse } from "@/types/screener";

// ─── Main AssetActionBar ───────────────────────────────────────────────────────

interface AssetActionBarProps {
  /** The ticker / symbol for the current screener asset page */
  ticker: string;
  /** Extra action slots — pass additional buttons/links */
  extra?: React.ReactNode;
}

/**
 * Sticky footer bar shown on all screener asset pages.
 * Shows stock search + "Track" + "Buy" + "Journal" with live state from the
 * unified Journal API — Track adds the ticker to the Tracking journal, and the
 * Journal panel writes notes/theses (shared with the /diary detail panel).
 */
export function AssetActionBar({ ticker, extra }: AssetActionBarProps) {
  const router = useRouter();

  // Resolve the Tracking journal (defaults are created lazily on first GET).
  // One read carries the journals, their tickers and every entry, so tracking
  // state and the drawer's timeline come from the same fetch.
  const { data: journalTree, loading: journalLoading, refetch: refetchTracking } = useJournalTree();
  // The tree is fetched here, so the drawer can mount before entries exist and
  // must be told the difference between "none" and "not yet". Sticky rather than
  // `!journalLoading`: refetch flips loading back on after every write, and the
  // entries we already hold don't stop being real while it's in flight.
  const journalSettled = useRef(false);
  if (!journalLoading) journalSettled.current = true;
  const tracking = useMemo(
    () => journalTree?.find((j) => j.kind === "tracking") ?? null,
    [journalTree],
  );
  const trackingId = tracking?.id ?? null;
  const { addTickers, mutating } = useJournalMutations();

  const trackedTicker = useMemo(
    () => tracking?.tickers.find((t) => t.ticker.toUpperCase() === ticker.toUpperCase()) ?? null,
    [tracking, ticker],
  );
  const inTracking = trackedTicker != null;
  const entryCount = trackedTicker?.entryCount ?? 0;

  // This bar is the Tracking journal's view of a stock, so the drawer shows
  // Tracking's entries only — not the cross-journal story the diary tells.
  const trackedEntries = useMemo(
    () =>
      trackingId && tracking
        ? (trackedTicker?.entries ?? [])
            .map((entry) => ({ entry, journalId: trackingId, journalName: tracking.name }))
            .sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime())
        : [],
    [trackedTicker, trackingId, tracking],
  );

  const [showJournal, setShowJournal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  // Broker connection state from /auth/me drives whether "Buy" places an order or connects first.
  const { smallcase } = useUser();
  const brokerConnected = smallcase?.is_connected ?? false;

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
  function flashAdded() {
    setJustAdded(true);
    if (justAddedTimer.current) clearTimeout(justAddedTimer.current);
    justAddedTimer.current = setTimeout(() => setJustAdded(false), 2500);
  }

  useEffect(() => () => { if (justAddedTimer.current) clearTimeout(justAddedTimer.current); }, []);

  // Add to Tracking journal (idempotent — added:0 just means already tracked).
  function handleTrack() {
    if (!trackingId) return;
    addTickers(trackingId, [ticker], () => { flashAdded(); refetchTracking(); });
  }

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
                  color: "var(--qc-on-dark)",
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

        {/* Track button */}
        {inTracking ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 9999,
              fontSize: "var(--qc-fz-12)",
              fontWeight: "var(--qc-w-medium)",
              fontFamily: "var(--qc-font-sans)",
              color: "var(--qc-up)",
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
            onClick={handleTrack}
            disabled={mutating || !trackingId}
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
              color: justAdded ? "var(--qc-up)" : "rgba(255,255,255,0.90)",
              cursor: mutating || !trackingId ? "default" : "pointer",
              opacity: mutating || !trackingId ? 0.5 : 1,
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
            className="px-3 py-2 sm:px-4 sm:py-[7px]"
          >
            {mutating ? <Loader2 size={13} className="animate-spin" /> : justAdded ? <Check size={13} /> : <BookmarkPlus size={13} />}
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
            color: "var(--qc-up)",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          className="px-3 py-2 sm:px-4 sm:py-[7px]"
        >
          <span style={{ fontSize: 13, lineHeight: 1, fontWeight: "var(--qc-w-semi)" }}>₹</span>
          <span className="hidden sm:inline">Buy</span>
        </button>

        {/* Journal button */}
        <button
          onClick={() => setShowJournal(true)}
          disabled={!trackingId}
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
            cursor: trackingId ? "pointer" : "default",
            opacity: trackingId ? 1 : 0.5,
            transition: "background 0.15s",
          }}
          className="px-3 py-2 sm:px-4 sm:py-[7px]"
        >
          <PenLine size={13} />
          <span className="hidden sm:inline">Journal</span>
          {entryCount > 0 && (
            <span
              style={{
                fontSize: "var(--qc-fz-10)",
                fontWeight: "var(--qc-w-bold)",
                fontFamily: "var(--qc-font-mono)",
                color: "var(--qc-up)",
                background: "rgba(134,239,172,0.15)",
                borderRadius: 999,
                padding: "1px 6px",
                marginLeft: 2,
              }}
            >
              {entryCount}
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

      {/* Journal — notes + thesis for this ticker in the Tracking journal.
          POSTing an entry auto-adds the ticker, matching the old behaviour. */}
      {showJournal && trackingId && (
        <TickerEntriesPanel
          journalId={trackingId}
          entries={trackedEntries}
          entriesReady={journalSettled.current}
          ticker={ticker}
          market={trackedTicker?.market ?? null}
          onClose={() => setShowJournal(false)}
          onChanged={refetchTracking}
        />
      )}

      {/* Buy → smallcase / broker connect flow (shown when no broker is connected) */}
      <ConnectPortfolioModal
        open={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onOpenCsvUpload={() => setShowCsvUpload(true)}
        onConnected={() => { setShowBuyModal(false); setShowOrderModal(true); }}
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
