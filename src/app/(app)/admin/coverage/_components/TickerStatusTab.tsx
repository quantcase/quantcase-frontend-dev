"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Search, Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { rawPost, authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { TickerStatusPreviewResponse, TickerStatusOptionsResponse } from "./types";

const BASE_URL = `${BACKEND_URL}/admin/ticker-status`;

export function TickerStatusTab() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("All");
  const [l2Status, setL2Status] = useState("All");
  const [l3Status, setL3Status] = useState("All");
  const [l4Status, setL4Status] = useState("All");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TickerStatusPreviewResponse | null>(null);

  const [allCompanies, setAllCompanies] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authFetch(`${BASE_URL}/options`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((json: TickerStatusOptionsResponse) => {
        if (json?.companies) {
          setAllCompanies(json.companies);
        }
      })
      .catch((err) => console.error("Error loading ticker options:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = search.trim()
    ? allCompanies
        .filter((c) => c.toLowerCase().includes(search.trim().toLowerCase()))
        .slice(0, 50)
    : [];

  const handleSelectSuggestion = (tickerSymbol: string) => {
    setSearch(tickerSymbol);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setPage(1);
    rawPost<TickerStatusPreviewResponse>(
      `${BASE_URL}/preview`,
      {
        onStart: () => {
          setLoading(true);
          setError(null);
        },
        onSuccess: (json) => setData(json),
        onError: (err) => setError(err || "Error fetching ticker status"),
        onComplete: () => setLoading(false),
      },
      {
        search: tickerSymbol,
        tier: tier !== "All" ? tier : undefined,
        l2Status: l2Status !== "All" ? l2Status : undefined,
        l3Status: l3Status !== "All" ? l3Status : undefined,
        l4Status: l4Status !== "All" ? l4Status : undefined,
        page: 1,
        pageSize,
      }
    );
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const fetchData = () => {
    rawPost<TickerStatusPreviewResponse>(
      `${BASE_URL}/preview`,
      {
        onStart: () => {
          setLoading(true);
          setError(null);
        },
        onSuccess: (json) => {
          setData(json);
        },
        onError: (err) => {
          setError(err || "Error fetching ticker status");
        },
        onComplete: () => {
          setLoading(false);
        },
      },
      {
        search: search.trim() || undefined,
        tier: tier !== "All" ? tier : undefined,
        l2Status: l2Status !== "All" ? l2Status : undefined,
        l3Status: l3Status !== "All" ? l3Status : undefined,
        l4Status: l4Status !== "All" ? l4Status : undefined,
        page,
        pageSize,
      }
    );
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, tier, l2Status, l3Status, l4Status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleClearFilters = () => {
    setSearch("");
    setTier("All");
    setL2Status("All");
    setL3Status("All");
    setL4Status("All");
    setPage(1);
  };

  const handleExportCsv = () => {
    if (!data || !data.tickers || data.tickers.length === 0) return;
    setIsExporting(true);

    try {
      const allExportTickers = data.tickers;
      const exportYears = data.years || [];

      // Construct headers
      const headers = [
        "Ticker",
        "Tier",
        "L2 Period",
        "L2 Status",
        "L3 Period",
        "L3 Status",
        "L4 Period",
        "L4 Status",
      ];

      exportYears.forEach((year) => {
        ["Q1", "Q2", "Q3", "Q4"].forEach((q) => {
          headers.push(`${year} TR ${q} Doc`);
          headers.push(`${year} TR ${q} Sig`);
        });
        ["Q1", "Q2", "Q3", "Q4"].forEach((q) => {
          headers.push(`${year} PPT ${q} Doc`);
          headers.push(`${year} PPT ${q} Sig`);
        });
        headers.push(`${year} AR Doc`);
        headers.push(`${year} AR Sig`);
      });

      const escapeCsvCell = (val: string | number | undefined | null) => {
        const str = String(val ?? "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = allExportTickers.map((t) => {
        const row: (string | number)[] = [
          t.symbol,
          t.tier || "",
          t.latestL2Period || "",
          t.latestL2 ?? 0,
          t.latestL3Period || "",
          t.latestL3 ?? 0,
          t.latestL4Period || "",
          t.latestL4 ?? 0,
        ];

        exportYears.forEach((year) => {
          const period = t.periods[year];
          const q1 = period?.quarters?.Q1 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };
          const q2 = period?.quarters?.Q2 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };
          const q3 = period?.quarters?.Q3 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };
          const q4 = period?.quarters?.Q4 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };

          row.push(q1.trDoc, q1.trSig, q2.trDoc, q2.trSig, q3.trDoc, q3.trSig, q4.trDoc, q4.trSig);
          row.push(q1.pptDoc, q1.pptSig, q2.pptDoc, q2.pptSig, q3.pptDoc, q3.pptSig, q4.pptDoc, q4.pptSig);
          row.push(period?.arDoc || 0, period?.arSig || 0);
        });

        return row;
      });

      const csvString = [
        headers.map(escapeCsvCell).join(","),
        ...rows.map((r) => r.map(escapeCsvCell).join(",")),
      ].join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const dateStr = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `Ticker_Processing_Status_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Export CSV error:", err);
      setError("Failed to export CSV file");
    } finally {
      setIsExporting(false);
    }
  };

  const years = data?.years || [];
  const tickers = data?.tickers || [];
  const pagination = data?.pagination;

  // Render cell badge for 0/1 / H / I
  const renderValueCell = (val: number | string) => {
    if (val === 1 || val === "1") {
      return <span className="inline-block w-4 text-center font-bold text-emerald-600 bg-emerald-500/10 rounded">1</span>;
    }
    if (val === "H") {
      return <span className="inline-block w-4 text-center font-bold text-purple-600 bg-purple-500/10 rounded">H</span>;
    }
    if (val === "I") {
      return <span className="inline-block w-4 text-center font-bold text-cyan-600 bg-cyan-500/10 rounded">I</span>;
    }
    return <span className="inline-block w-4 text-center text-rose-500/80 bg-rose-500/5 rounded">0</span>;
  };

  return (
    <div className="space-y-4">
      {/* ── Top Header & Filters Bar ────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-lg border border-hair bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Ticker Processing Status</h2>
            <p className="text-xs text-ink-3">
              Period-wise document availability and signal status for TR, PPT, and AR across all fiscal years
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={isExporting || loading || !data}
              className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#EFE8D8] disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export CSV
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#EFE8D8] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Search box with autocomplete suggestions */}
          <div ref={searchRef} className="relative min-w-[220px] flex-1 max-w-xs">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-3" />
              <input
                type="text"
                placeholder="Search ticker (e.g. GROWW)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-md border border-hair bg-card pl-8 pr-7 py-1.5 text-xs text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                    setPage(1);
                    rawPost<TickerStatusPreviewResponse>(
                      `${BASE_URL}/preview`,
                      {
                        onStart: () => {
                          setLoading(true);
                          setError(null);
                        },
                        onSuccess: (json) => setData(json),
                        onError: (err) => setError(err || "Error fetching ticker status"),
                        onComplete: () => setLoading(false),
                      },
                      {
                        search: undefined,
                        tier: tier !== "All" ? tier : undefined,
                        l2Status: l2Status !== "All" ? l2Status : undefined,
                        l3Status: l3Status !== "All" ? l3Status : undefined,
                        l4Status: l4Status !== "All" ? l4Status : undefined,
                        page: 1,
                        pageSize,
                      }
                    );
                  }}
                  className="absolute right-2 top-2.5 text-ink-4 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Autocomplete Suggestions Popup */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-hair bg-card shadow-lg py-1 text-xs">
                {suggestions.map((tickerSymbol, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={tickerSymbol}
                      type="button"
                      onClick={() => handleSelectSuggestion(tickerSymbol)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-3 py-1.5 text-left font-mono font-medium flex items-center justify-between transition-colors ${
                        isSelected ? "bg-accent/10 text-accent font-semibold" : "text-ink hover:bg-[#EFE8D8]"
                      }`}
                    >
                      <span>{tickerSymbol}</span>
                      <span className="text-[10px] text-ink-4 font-sans font-normal">Select</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tier Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-ink-3 font-medium">Tier:</label>
            <select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-hair bg-card px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Tier 1">Tier 1</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 3">Tier 3</option>
              <option value="Tier 0.5">Tier 0.5</option>
              <option value="Tier 0">Tier 0</option>
            </select>
          </div>

          {/* L2 Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-ink-3 font-medium">L2 Status:</label>
            <select
              value={l2Status}
              onChange={(e) => {
                setL2Status(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-hair bg-card px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="All">All</option>
              <option value="H">H (Historical)</option>
              <option value="I">I (Incremental)</option>
              <option value="0">0 (Not done)</option>
            </select>
          </div>

          {/* L3 Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-ink-3 font-medium">L3 Status:</label>
            <select
              value={l3Status}
              onChange={(e) => {
                setL3Status(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-hair bg-card px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="All">All</option>
              <option value="1">1 (Done)</option>
              <option value="0">0 (Not done)</option>
            </select>
          </div>

          {/* L4 Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-ink-3 font-medium">L4 Status:</label>
            <select
              value={l4Status}
              onChange={(e) => {
                setL4Status(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-hair bg-card px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
            >
              <option value="All">All</option>
              <option value="1">1 (Done)</option>
              <option value="0">0 (Not done)</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(search || tier !== "All" || l2Status !== "All" || l3Status !== "All" || l4Status !== "All") && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 rounded-md border border-hair px-2.5 py-1.5 text-xs font-medium text-ink-3 hover:bg-[#EFE8D8] hover:text-ink"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Main Data Table Container ───────────────────────────────────────── */}
      <div className="relative rounded-lg border border-hair bg-card shadow-sm overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-card/70 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-md border border-hair bg-card px-4 py-2 text-xs font-medium text-ink shadow-md">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Loading ticker completeness data...
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-30 bg-[#EFE8D8]">
              {/* Header Line 1: Sticky Columns (rowSpan=4 for Ticker/Tier, rowSpan=2 for L2/L3/L4 group) + Fiscal Years */}
              <tr className="border-b border-hair bg-[#EFE8D8] text-[11px] font-semibold text-ink-2">
                <th rowSpan={4} className="sticky left-0 top-0 z-40 bg-[#EFE8D8] px-3 py-2 border-r border-hair min-w-[100px] w-[100px] align-middle font-semibold text-ink-2">
                  Ticker
                </th>
                <th rowSpan={4} className="sticky left-[100px] top-0 z-40 bg-[#EFE8D8] px-2 py-2 border-r border-hair min-w-[75px] w-[75px] align-middle font-semibold text-ink-2">
                  Tier
                </th>
                <th colSpan={2} rowSpan={2} className="sticky left-[175px] top-0 z-40 bg-[#EFE8D8] px-1 py-1 text-center border-r border-hair font-bold text-purple-600 align-middle">
                  L2
                </th>
                <th colSpan={2} rowSpan={2} className="sticky left-[300px] top-0 z-40 bg-[#EFE8D8] px-1 py-1 text-center border-r border-hair font-bold text-cyan-600 align-middle">
                  L3
                </th>
                <th colSpan={2} rowSpan={2} className="sticky left-[425px] top-0 z-40 bg-[#EFE8D8] px-1 py-1 text-center border-r-2 border-hair-strong font-bold text-amber-600 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)] align-middle">
                  L4
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    colSpan={10}
                    className="bg-[#EFE8D8] px-2 py-1.5 text-center border-r border-hair font-semibold text-ink-2"
                  >
                    {year}
                  </th>
                ))}
              </tr>

              {/* Header Line 2: Document Section Groups */}
              <tr className="border-b border-hair bg-[#EFE8D8] text-[10px] font-medium text-ink-3">
                {years.map((year) => (
                  <Fragment key={`subhead-${year}`}>
                    <th colSpan={4} className="px-1 py-1 text-center border-r border-hair/50 bg-blue-100/80 text-blue-900 font-semibold">
                      TR
                    </th>
                    <th colSpan={4} className="px-1 py-1 text-center border-r border-hair/50 bg-amber-100/80 text-amber-900 font-semibold">
                      PPT
                    </th>
                    <th colSpan={2} className="px-1 py-1 text-center border-r border-hair bg-emerald-100/80 text-emerald-900 font-semibold">
                      AR
                    </th>
                  </Fragment>
                ))}
              </tr>

              {/* Header Line 3: Quarters Q1-Q4 & L2/L3/L4 Period/Status Subheaders */}
              <tr className="border-b border-hair bg-[#EFE8D8] text-[10px] font-mono text-ink-3">
                {/* Sticky Subheaders for L2 */}
                <th rowSpan={2} className="sticky left-[175px] top-0 z-40 bg-[#EFE8D8] px-1 py-0.5 text-center border-r border-hair font-mono text-[9.5px] font-semibold text-purple-700 min-w-[85px] w-[85px] align-middle">
                  Period
                </th>
                <th rowSpan={2} className="sticky left-[260px] top-0 z-40 bg-[#EFE8D8] px-1 py-0.5 text-center border-r border-hair font-mono text-[9.5px] font-bold text-purple-700 min-w-[40px] w-[40px] align-middle">
                  Status
                </th>

                {/* Sticky Subheaders for L3 */}
                <th rowSpan={2} className="sticky left-[300px] top-0 z-40 bg-[#EFE8D8] px-1 py-0.5 text-center border-r border-hair font-mono text-[9.5px] font-semibold text-cyan-700 min-w-[85px] w-[85px] align-middle">
                  Period
                </th>
                <th rowSpan={2} className="sticky left-[385px] top-0 z-40 bg-[#EFE8D8] px-1 py-0.5 text-center border-r border-hair font-mono text-[9.5px] font-bold text-cyan-700 min-w-[40px] w-[40px] align-middle">
                  Status
                </th>

                {/* Sticky Subheaders for L4 */}
                <th rowSpan={2} className="sticky left-[425px] top-0 z-40 bg-[#EFE8D8] px-1 py-0.5 text-center border-r border-hair font-mono text-[9.5px] font-semibold text-amber-700 min-w-[85px] w-[85px] align-middle">
                  Period
                </th>
                <th rowSpan={2} className="sticky left-[510px] top-0 z-40 bg-[#EFE8D8] px-1 py-0.5 text-center border-r-2 border-hair-strong font-mono text-[9.5px] font-bold text-amber-700 min-w-[40px] w-[40px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)] align-middle">
                  Status
                </th>

                {years.map((year) => (
                  <Fragment key={`qhead-${year}`}>
                    <th colSpan={4} className="px-1 py-0.5 text-center border-r border-hair/50 bg-[#EFE8D8]">
                      Q1 Q2 Q3 Q4
                    </th>
                    <th colSpan={4} className="px-1 py-0.5 text-center border-r border-hair/50 bg-[#EFE8D8]">
                      Q1 Q2 Q3 Q4
                    </th>
                    <th colSpan={2} className="px-1 py-0.5 text-center border-r border-hair bg-[#EFE8D8]">
                      DOC SIG
                    </th>
                  </Fragment>
                ))}
              </tr>

              {/* Header Line 4: D S subheaders */}
              <tr className="border-b border-hair bg-[#EFE8D8] text-[9px] font-mono text-ink-4">
                {years.map((year) => (
                  <Fragment key={`dshead-${year}`}>
                    <th colSpan={4} className="px-1 py-0.5 text-center border-r border-hair/50 bg-[#EFE8D8]">
                      D S D S D S D S
                    </th>
                    <th colSpan={4} className="px-1 py-0.5 text-center border-r border-hair/50 bg-[#EFE8D8]">
                      D S D S D S D S
                    </th>
                    <th colSpan={2} className="px-1 py-0.5 text-center border-r border-hair bg-[#EFE8D8]">
                      D S
                    </th>
                  </Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-hair font-mono text-[11px] bg-card">
              {tickers.length === 0 ? (
                <tr>
                  <td colSpan={8 + years.length * 10} className="px-4 py-8 text-center text-ink-3">
                    {loading ? "Loading tickers..." : "No matching tickers found."}
                  </td>
                </tr>
              ) : (
                tickers.map((t) => (
                  <tr key={t.symbol} className="group hover:bg-[#EFE8D8]/50 transition-colors">
                    {/* Sticky Ticker Symbol */}
                    <td className="sticky left-0 z-20 bg-card group-hover:bg-[#EFE8D8] px-3 py-2 font-semibold text-ink border-r border-hair whitespace-nowrap min-w-[100px] w-[100px]">
                      {t.symbol}
                    </td>

                    {/* Sticky Tier Badge */}
                    <td className="sticky left-[100px] z-20 bg-card group-hover:bg-[#EFE8D8] px-2 py-2 border-r border-hair whitespace-nowrap min-w-[75px] w-[75px]">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                        t.tier === "Tier 1"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : t.tier === "Tier 2"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-ink-4/10 text-ink-3"
                      }`}>
                        {t.tier}
                      </span>
                    </td>

                    {/* Sticky L2 Period & Status */}
                    <td className="sticky left-[175px] z-20 bg-card group-hover:bg-[#EFE8D8] px-1 py-2 text-center border-r border-hair font-mono text-[10px] text-purple-700 min-w-[85px] w-[85px] whitespace-nowrap">
                      {t.latestL2Period || "-"}
                    </td>
                    <td className="sticky left-[260px] z-20 bg-card group-hover:bg-[#EFE8D8] px-1 py-2 text-center border-r border-hair font-bold min-w-[40px] w-[40px]">
                      {renderValueCell(t.latestL2)}
                    </td>

                    {/* Sticky L3 Period & Status */}
                    <td className="sticky left-[300px] z-20 bg-card group-hover:bg-[#EFE8D8] px-1 py-2 text-center border-r border-hair font-mono text-[10px] text-cyan-700 min-w-[85px] w-[85px] whitespace-nowrap">
                      {t.latestL3Period || "-"}
                    </td>
                    <td className="sticky left-[385px] z-20 bg-card group-hover:bg-[#EFE8D8] px-1 py-2 text-center border-r border-hair font-bold min-w-[40px] w-[40px]">
                      {renderValueCell(t.latestL3)}
                    </td>

                    {/* Sticky L4 Period & Status */}
                    <td className="sticky left-[425px] z-20 bg-card group-hover:bg-[#EFE8D8] px-1 py-2 text-center border-r border-hair font-mono text-[10px] text-amber-700 min-w-[85px] w-[85px] whitespace-nowrap">
                      {t.latestL4Period || "-"}
                    </td>
                    <td className="sticky left-[510px] z-20 bg-card group-hover:bg-[#EFE8D8] px-1 py-2 text-center border-r-2 border-hair-strong font-bold min-w-[40px] w-[40px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">
                      {renderValueCell(t.latestL4)}
                    </td>

                    {/* Period Cells for each FY */}
                    {years.map((year) => {
                      const period = t.periods[year];
                      const q1 = period?.quarters?.Q1 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };
                      const q2 = period?.quarters?.Q2 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };
                      const q3 = period?.quarters?.Q3 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };
                      const q4 = period?.quarters?.Q4 || { trDoc: 0, trSig: 0, pptDoc: 0, pptSig: 0 };

                      return (
                        <Fragment key={`${t.symbol}-${year}`}>
                          {/* TR (4 quarters D S) */}
                          <td colSpan={4} className="px-1 py-1 text-center border-r border-hair/50 whitespace-nowrap space-x-1">
                            {renderValueCell(q1.trDoc)}
                            {renderValueCell(q1.trSig)}
                            {renderValueCell(q2.trDoc)}
                            {renderValueCell(q2.trSig)}
                            {renderValueCell(q3.trDoc)}
                            {renderValueCell(q3.trSig)}
                            {renderValueCell(q4.trDoc)}
                            {renderValueCell(q4.trSig)}
                          </td>

                          {/* PPT (4 quarters D S) */}
                          <td colSpan={4} className="px-1 py-1 text-center border-r border-hair/50 whitespace-nowrap space-x-1">
                            {renderValueCell(q1.pptDoc)}
                            {renderValueCell(q1.pptSig)}
                            {renderValueCell(q2.pptDoc)}
                            {renderValueCell(q2.pptSig)}
                            {renderValueCell(q3.pptDoc)}
                            {renderValueCell(q3.pptSig)}
                            {renderValueCell(q4.pptDoc)}
                            {renderValueCell(q4.pptSig)}
                          </td>

                          {/* AR (DOC SIG) */}
                          <td colSpan={2} className="px-1 py-1 text-center border-r border-hair whitespace-nowrap space-x-1">
                            {renderValueCell(period?.arDoc || 0)}
                            {renderValueCell(period?.arSig || 0)}
                          </td>
                        </Fragment>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ───────────────────────────────────────────────── */}
        {pagination && pagination.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hair bg-[#EFE8D8]/50 px-4 py-2.5 text-xs text-ink-3">
            <div>
              Showing <span className="font-semibold text-ink">{(page - 1) * pageSize + 1}</span>–
              <span className="font-semibold text-ink">{Math.min(page * pageSize, pagination.total)}</span> of{" "}
              <span className="font-semibold text-ink">{pagination.total.toLocaleString()}</span> tickers
            </div>

            <div className="flex items-center gap-4">
              {/* Rows Per Page */}
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded border border-hair bg-card px-2 py-1 text-xs text-ink focus:outline-none"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="flex h-7 w-7 items-center justify-center rounded border border-hair hover:bg-[#EFE8D8] disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 font-mono text-ink">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages || loading}
                  className="flex h-7 w-7 items-center justify-center rounded border border-hair hover:bg-[#EFE8D8] disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
