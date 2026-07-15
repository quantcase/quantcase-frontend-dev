"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface AutocompleteInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  options: AutocompleteOption[];
  className?: string;
  maxSuggestions?: number;
}

export function AutocompleteInput({
  placeholder = "Search...",
  value,
  onChange,
  onSubmit,
  options,
  className,
  maxSuggestions = 5,
}: AutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = value.trim()
    ? options
        .filter((option) => {
          const searchTerm = value.toLowerCase();
          return (
            option.label?.toLowerCase().includes(searchTerm) ||
            option.value?.toLowerCase().includes(searchTerm) ||
            option.subtitle?.toLowerCase().includes(searchTerm)
          );
        })
    : options.slice(0, maxSuggestions);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredSuggestions.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitValue = selectedIndex >= 0
      ? filteredSuggestions[selectedIndex].value
      : value;
    onSubmit?.(submitValue);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          const selected = filteredSuggestions[selectedIndex];
          onChange(selected.label);
          setShowSuggestions(false);
        }
        break;
    }
  };

  const handleSuggestionClick = (option: AutocompleteOption) => {
    onChange(option.label);
    onSubmit?.(option.value);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 size-5 text-ink-3" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full pl-12 pr-14 py-4 text-base rounded-xl border border-hair bg-card text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-3 p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
          >
            <ArrowRight className="size-5 text-ink-2" />
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-[100] w-full mt-1 rounded-xl shadow-lg overflow-y-auto"
          style={{
            background: "var(--qc-card)",
            border: "1px solid var(--qc-hair)",
            maxHeight: "360px",
          }}
        >
          {filteredSuggestions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSuggestionClick(option)}
              className={cn(
                "w-full px-4 py-3 text-left transition-colors border-b last:border-b-0",
                selectedIndex === index ? "opacity-100" : ""
              )}
              style={{
                borderColor: "var(--qc-hair-2)",
                background: selectedIndex === index ? "var(--qc-section)" : undefined,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-section)")}
              onMouseLeave={e => (e.currentTarget.style.background = selectedIndex === index ? "var(--qc-section)" : "")}
            >
              <div className="flex items-center justify-between">
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
                <div className="ml-3 text-xs font-medium mono" style={{ color: "var(--qc-ink-2)" }}>
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
