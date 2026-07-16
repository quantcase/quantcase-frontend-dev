"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useStocks } from "@/hooks/useStocks";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS = 8;

/**
 * Compact stock search for the diary masthead. Mirrors the dashboard research
 * hero's flow — filter the pre-loaded universe client-side, navigate to the
 * overview screener on select — but rendered light-on-light for the diary.
 */
export function StockSearch() {
  const router = useRouter();
  const { stocks } = useStocks();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? stocks
        .filter((s) => {
          const t = query.toLowerCase();
          return (
            s.name.toLowerCase().includes(t) ||
            s.ticker.toLowerCase().includes(t) ||
            s.industry?.toLowerCase().includes(t)
          );
        })
        .slice(0, MAX_SUGGESTIONS)
    : [];

  const goTo = (symbol: string) => {
    if (!symbol) return;
    router.push(`/screener/overview?symbol=${encodeURIComponent(symbol)}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        setOpen(false);
        setSelectedIndex(-1);
        break;
      case "Enter":
        e.preventDefault();
        goTo(selectedIndex >= 0 ? filtered[selectedIndex].ticker : query);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-[300px]">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder="Search any stock"
        aria-label="Search any stock"
        autoComplete="off"
        className="h-10 w-full rounded-full border border-hair bg-card pl-9 pr-4 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-hair-strong"
      />

      {open && filtered.length > 0 && (
        <div className="absolute right-0 z-50 mt-1.5 max-h-[340px] w-full overflow-y-auto rounded-xl border border-hair bg-card text-left shadow-lg">
          {filtered.map((stock, index) => (
            <button
              key={stock.ticker}
              type="button"
              onClick={() => goTo(stock.ticker)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full border-b border-hair px-3.5 py-2.5 text-left transition-colors last:border-b-0",
                selectedIndex === index && "bg-secondary",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{stock.name}</div>
                  {stock.industry && (
                    <div className="mt-0.5 truncate text-[11px] text-ink-2">{stock.industry}</div>
                  )}
                </div>
                <div className="mono shrink-0 text-[11px] font-medium text-ink-2">{stock.ticker}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
