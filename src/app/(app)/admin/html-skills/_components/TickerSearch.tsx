"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Star } from "lucide-react";

export interface TickerOption {
  symbol: string;
  name: string;
}

interface TickerSearchProps {
  value: string;
  onChange: (ticker: string) => void;
  options: TickerOption[];
  favorites: string[];
}

export function TickerSearch({ value, onChange, options, favorites }: TickerSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const favoriteOptions = favorites
    .map((sym) => options.find((o) => o.symbol === sym) ?? { symbol: sym, name: sym })
    .filter(Boolean) as TickerOption[];

  const otherOptions = options.filter((o) => !favorites.includes(o.symbol));

  const filterFn = (o: TickerOption) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return o.symbol.toLowerCase().includes(q) || o.name.toLowerCase().includes(q);
  };

  const filteredFavorites = favoriteOptions.filter(filterFn);
  const filteredOthers = otherOptions.filter(filterFn);

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setOpen(false);
    setQuery("");
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md border border-[var(--qc-border-default)] bg-white pl-2.5 pr-2 py-1.5 text-[12px] font-medium text-[var(--qc-ink)] hover:border-[var(--qc-ink)] transition-colors min-w-[120px]"
      >
        <Search className="size-3 text-[#888888] shrink-0" />
        <span className="flex-1 text-left">{value || "Select ticker"}</span>
        <ChevronDown className="size-3 text-[#888888] shrink-0" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-[200] top-full mt-1 left-0 w-[260px] rounded-xl shadow-lg overflow-hidden flex flex-col"
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            maxHeight: "360px",
          }}
        >
          {/* Search input */}
          <div className="px-3 py-2 border-b" style={{ borderColor: "var(--qc-hair)" }}>
            <div className="flex items-center gap-2">
              <Search className="size-3.5 shrink-0" style={{ color: "var(--qc-ink-2)" }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ticker or name…"
                className="flex-1 text-[12px] bg-transparent outline-none"
                style={{ color: "var(--qc-ink)" }}
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {filteredFavorites.length > 0 && (
              <>
                <div
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--qc-ink-2)" }}
                >
                  Favorites
                </div>
                {filteredFavorites.map((opt) => (
                  <TickerRow
                    key={opt.symbol}
                    opt={opt}
                    active={opt.symbol === value}
                    isFavorite
                    onSelect={handleSelect}
                  />
                ))}
              </>
            )}

            {filteredOthers.length > 0 && (
              <>
                {filteredFavorites.length > 0 && (
                  <div
                    className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border-t"
                    style={{ color: "var(--qc-ink-2)", borderColor: "var(--qc-hair)" }}
                  >
                    All Stocks
                  </div>
                )}
                {filteredOthers.map((opt) => (
                  <TickerRow
                    key={opt.symbol}
                    opt={opt}
                    active={opt.symbol === value}
                    isFavorite={false}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            )}

            {filteredFavorites.length === 0 && filteredOthers.length === 0 && (
              <div className="px-4 py-6 text-center text-[12px]" style={{ color: "var(--qc-ink-2)" }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TickerRow({
  opt,
  active,
  isFavorite,
  onSelect,
}: {
  opt: TickerOption;
  active: boolean;
  isFavorite: boolean;
  onSelect: (s: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(opt.symbol)}
      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors border-b last:border-b-0"
      style={{
        borderColor: "var(--qc-hair-2)",
        background: active ? "var(--qc-section)" : undefined,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--qc-section)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = ""; }}
    >
      {isFavorite ? (
        <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
      ) : (
        <span className="size-3 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate" style={{ color: "var(--qc-ink)" }}>
          {opt.symbol}
        </div>
        {opt.name !== opt.symbol && (
          <div className="text-[10px] truncate" style={{ color: "var(--qc-ink-2)" }}>
            {opt.name}
          </div>
        )}
      </div>
      {active && (
        <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--qc-ink-2)" }}>
          ✓
        </span>
      )}
    </button>
  );
}
