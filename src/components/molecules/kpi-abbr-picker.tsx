"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";

interface KpiAbbrPickerProps {
  options: string[];
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Single-select searchable combobox for picking an existing KPI abbr. Same shell as TagMultiPicker. */
export function KpiAbbrPicker({
  options,
  value,
  onChange,
  disabled,
  placeholder = "Search KPI abbr…",
}: KpiAbbrPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
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

  const filtered = options
    .filter((o) => !query.trim() || o.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 50);

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
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={value || placeholder}
            className="flex-1 min-w-[100px] text-[13px] text-ink outline-none bg-transparent py-0.5"
          />
        )}
        <ChevronDown className="size-3.5 text-ink-3 shrink-0" />
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
    </div>
  );
}
