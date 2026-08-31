"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";
import { cn } from "@/lib/utils";

interface StockOption {
  value: string;
  label: string;
  subtitle?: string;
}

/**
 * Compact stock search for page headers. Fetches the same stock list as the
 * screener home hero and navigates to the overview screener on select — lets
 * users jump straight to a company without leaving the dashboard.
 */
export function HeaderStockSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<StockOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (response) =>
        setOptions(
          response.data.map((s) => ({ value: s.company, label: s.company_name, subtitle: s.basic_industry }))
        ),
      onError: (err) => console.error("Failed to fetch stocks:", err),
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? options.filter((o) => {
        const t = query.toLowerCase();
        return (
          o.label?.toLowerCase().includes(t) ||
          o.value?.toLowerCase().includes(t) ||
          o.subtitle?.toLowerCase().includes(t)
        );
      }).slice(0, 8)
    : [];

  useEffect(() => {
    setSelectedIndex(-1);
  }, [filtered.length]);

  const goTo = (symbol: string) => {
    if (!symbol) return;
    router.push(`/screener/management?symbol=${encodeURIComponent(symbol)}`);
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
        goTo(selectedIndex >= 0 ? filtered[selectedIndex].value : query);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full sm:w-72", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4" style={{ color: "var(--qc-ink-3)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search a stock…"
          autoComplete="off"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-full focus:outline-none focus:ring-2"
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            color: "var(--qc-ink)",
            fontFamily: "var(--qc-font-sans)",
          }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute right-0 z-[100] w-full min-w-[18rem] mt-1.5 rounded-xl shadow-lg overflow-y-auto"
          style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", maxHeight: "340px" }}
        >
          {filtered.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => goTo(option.value)}
              className="w-full px-4 py-2.5 text-left transition-colors border-b last:border-b-0"
              style={{
                borderColor: "var(--qc-hair-2)",
                background: selectedIndex === index ? "var(--qc-section)" : undefined,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-section)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = selectedIndex === index ? "var(--qc-section)" : "")
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--qc-ink)" }}>
                    {option.label}
                  </div>
                  {option.subtitle && (
                    <div className="text-xs truncate mt-0.5" style={{ color: "var(--qc-ink-2)" }}>
                      {option.subtitle}
                    </div>
                  )}
                </div>
                <div className="text-xs font-medium mono shrink-0" style={{ color: "var(--qc-ink-2)" }}>
                  {option.value}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
