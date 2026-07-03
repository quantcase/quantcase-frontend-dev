"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface TagMultiPickerProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Uppercase free-typed entries (useful for ticker symbols, not for e.g. industry names). Default true. */
  uppercase?: boolean;
}

export function TagMultiPicker({
  options,
  selected,
  onChange,
  disabled,
  placeholder = "Type to add…",
  uppercase = true,
}: TagMultiPickerProps) {
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

  const selectedSet = new Set(selected);
  const filtered = options
    .filter((o) => !selectedSet.has(o))
    .filter((o) => !query.trim() || o.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 50);

  function add(value: string) {
    const v = uppercase ? value.toUpperCase() : value;
    if (!selectedSet.has(v)) onChange([...selected, v]);
    setQuery("");
    inputRef.current?.focus();
  }

  function remove(value: string) {
    onChange(selected.filter((t) => t !== value));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      const exact = options.find((o) => o.toLowerCase() === query.trim().toLowerCase());
      add(exact ?? query.trim());
    } else if (e.key === "Backspace" && !query && selected.length > 0) {
      remove(selected[selected.length - 1]);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#E2E2E2] bg-white px-2 py-1.5 min-h-[38px] cursor-text focus-within:ring-1 focus-within:ring-[#0F172B]"
      >
        <Search className="size-3.5 text-[#888888] shrink-0" />
        {selected.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-sm bg-[#F5F5F5] text-[#0F172B] text-[11px] font-mono font-medium px-1.5 py-0.5"
          >
            {t}
            <button type="button" onClick={() => remove(t)} className="text-[#888888] hover:text-red-600">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] text-[13px] text-[#0F172B] outline-none bg-transparent py-0.5"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-[100] top-full mt-1 left-0 w-full max-w-[320px] rounded-md border border-[#E2E2E2] bg-white shadow-lg overflow-y-auto max-h-[260px]">
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => add(o)}
              className="w-full flex items-center px-3 py-1.5 text-left text-[12px] font-mono text-[#0F172B] hover:bg-[#F5F5F5] transition-colors"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
