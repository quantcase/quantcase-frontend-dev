"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { DarkGradientCard } from "@/components/ds";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";

interface StockOption {
  value: string;
  label: string;
  subtitle?: string;
}

/**
 * Full-width dark-gradient hero for the investor dashboard. Prompts the user to
 * research a company and provides a large search that navigates to the overview
 * screener on select — the primary entry point below the portfolio summary.
 */
export function ResearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<StockOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (response) =>
        setOptions(
          response.data.map((s) => ({ value: s.company, label: s.company_name, subtitle: s.basic_industry }))
        ),
      onError: (err) => console.error("Failed to fetch stocks:", err),
    });
  }, []);

  // Position the portal menu directly under the input, tracking scroll/resize.
  const updateMenuRect = useCallback(() => {
    const el = inputWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({ left: r.left, top: r.bottom + 8, width: r.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuRect();
    window.addEventListener("scroll", updateMenuRect, true);
    window.addEventListener("resize", updateMenuRect);
    return () => {
      window.removeEventListener("scroll", updateMenuRect, true);
      window.removeEventListener("resize", updateMenuRect);
    };
  }, [open, updateMenuRect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inWrapper = wrapperRef.current?.contains(target);
      const inMenu = menuRef.current?.contains(target);
      if (!inWrapper && !inMenu) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? options
        .filter((o) => {
          const t = query.toLowerCase();
          return (
            o.label?.toLowerCase().includes(t) ||
            o.value?.toLowerCase().includes(t) ||
            o.subtitle?.toLowerCase().includes(t)
          );
        })
        .slice(0, 8)
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
        goTo(selectedIndex >= 0 ? filtered[selectedIndex].value : query);
        break;
    }
  };

  return (
    <DarkGradientCard
      radius={14}
      style={{ padding: "56px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
    >
      <h2
        style={{
          fontSize: "var(--qc-fz-44)",
          fontWeight: "var(--qc-w-medium)",
          letterSpacing: "var(--qc-track-display)",
          color: "var(--qc-on-dark)",
          fontFamily: "var(--qc-font-sans)",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        What would you like to research today?
      </h2>
      <p
        style={{
          fontSize: "var(--qc-fz-14)",
          color: "rgba(255,255,255,0.6)",
          fontFamily: "var(--qc-font-sans)",
          margin: "14px 0 28px",
        }}
      >
        Search a company to open its screener, or pick a research basket below.
      </p>

      <div ref={wrapperRef} style={{ position: "relative", width: "100%", maxWidth: 620 }}>
        <div ref={inputWrapRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search
            style={{ position: "absolute", left: 20, width: 18, height: 18, color: "rgba(255,255,255,0.5)" }}
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
            placeholder="Search by company name or ticker…"
            autoComplete="off"
            style={{
              width: "100%",
              padding: "16px 64px 16px 52px",
              fontSize: "var(--qc-fz-14)",
              borderRadius: 999,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "var(--qc-on-dark)",
              fontFamily: "var(--qc-font-sans)",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => goTo(selectedIndex >= 0 ? filtered[selectedIndex]?.value : query)}
            aria-label="Search"
            style={{
              position: "absolute",
              right: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#7C3AED",
              border: "none",
              cursor: "pointer",
            }}
          >
            <ArrowRight style={{ width: 18, height: 18, color: "#fff" }} />
          </button>
        </div>

      </div>

      {/* Dropdown is portalled to <body> so the card's overflow:hidden (needed to
          clip its gradient glow) can't clip the results list. */}
      {open && filtered.length > 0 && menuRect && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="rounded-xl shadow-lg overflow-y-auto"
            style={{
              position: "fixed",
              left: menuRect.left,
              top: menuRect.top,
              width: menuRect.width,
              zIndex: 1000,
              background: "var(--qc-card)",
              border: "1px solid var(--qc-hair)",
              maxHeight: "340px",
              textAlign: "left",
            }}
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
          </div>,
          document.body
        )}
    </DarkGradientCard>
  );
}
