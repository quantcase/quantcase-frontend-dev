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
        .slice(0, maxSuggestions)
    : [];

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
          <Search className="absolute left-4 size-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => value.trim() && setShowSuggestions(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full pl-12 pr-14 py-4 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="size-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {filteredSuggestions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSuggestionClick(option)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0",
                selectedIndex === index && "bg-gray-50 dark:bg-gray-800"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {option.label}
                  </div>
                  {option.subtitle && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {option.subtitle}
                    </div>
                  )}
                </div>
                <div className="ml-3 text-xs font-medium text-gray-600 dark:text-gray-400">
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
