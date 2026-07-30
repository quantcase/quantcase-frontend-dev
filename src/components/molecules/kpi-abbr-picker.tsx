"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";
import { apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

interface KpiAbbrSearchResponse {
  success: boolean;
  data: { abbr: string }[];
}

const DEBOUNCE_MS = 250;

interface KpiAbbrPickerProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Single-select searchable combobox for picking an existing KPI abbr. Same shell as TagMultiPicker.
 * Queries GET /admin/kpis?search=&includeAllSources=true live (debounced) — the same endpoint the
 * KPI Catalogue's own search box uses — rather than filtering a pre-fetched, size-capped snapshot,
 * so results here always match what the Catalogue would show for the same query.
 */
export function KpiAbbrPicker({
  value,
  onChange,
  disabled,
  placeholder = "Search KPI abbr…",
}: KpiAbbrPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = useCallback((q: string) => {
    const params = new URLSearchParams({ includeAllSources: "true" });
    if (q.trim()) params.set("search", q.trim());
    apiAuthGet<KpiAbbrSearchResponse>(`${BACKEND_URL}/admin/kpis?${params}`, {
      onStart: () => setLoading(true),
      onSuccess: (res) => setResults((res.data ?? []).map((k) => k.abbr)),
      onError: () => setResults([]),
      onComplete: () => setLoading(false),
    });
  }, []);

  // Fires on open (empty query = browse) and again on every debounced keystroke while open.
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, open, runSearch]);

  function pick(v: string) {
    onChange(v);
    setQuery("");
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setQuery("");
  }

  const filtered = results.slice(0, 50);

  return (
    <div ref={wrapperRef} className={`relative ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        className="flex items-center gap-1.5 rounded-md border border-hair bg-card px-2 py-1.5 min-h-[38px] cursor-text focus-within:border-hair-strong"
      >
        <Search className="size-3.5 text-ink-3 shrink-0" />
        {value && !open ? (
          <span className="flex-1 flex items-center gap-1.5">
            <span className="rounded-sm bg-secondary text-ink text-[11px] font-mono font-medium px-1.5 py-0.5">
              {value}
            </span>
            <button type="button" onClick={clear} className="text-ink-3 hover:text-down">
              <X className="size-3" />
            </button>
          </span>
        ) : (
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={value || placeholder}
            className="flex-1 min-w-[100px] text-[13px] text-ink outline-none bg-transparent py-0.5"
          />
        )}
        {loading ? (
          <Loader2 className="size-3.5 text-ink-3 shrink-0 animate-spin" />
        ) : (
          <ChevronDown className="size-3.5 text-ink-3 shrink-0" />
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-[100] top-full mt-1 left-0 w-full max-w-[320px] rounded-md border border-hair bg-card shadow-lg overflow-y-auto max-h-[260px]">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => pick(o)}
              className={`w-full flex items-center px-3 py-1.5 text-left text-[12px] font-mono transition-colors hover:bg-secondary ${
                o === value ? "text-ink font-semibold" : "text-ink"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {open && !loading && filtered.length === 0 && (
        <div className="absolute z-[100] top-full mt-1 left-0 w-full max-w-[320px] rounded-md border border-hair bg-card shadow-lg px-3 py-2 text-[12px] text-ink-3">
          No matching KPIs.
        </div>
      )}
    </div>
  );
}
