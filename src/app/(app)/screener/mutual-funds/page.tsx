"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMfScreener } from "@/hooks/useMfScreener";
import { useMfFilterOptions } from "@/hooks/useMfFilterOptions";
import { useMfBaskets } from "@/hooks/useMfBaskets";
import type { MfScreenerScheme, MfScreenerParams } from "@/types/mutual-fund";

// ── Formatters ────────────────────────────────────────────────────────────────

function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v.toFixed(2)}%`;
}

function cr(v: number | null | undefined): string {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L Cr`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K Cr`;
  return `₹${v.toFixed(0)} Cr`;
}

function retPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

// ── Column definitions ────────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  align: "left" | "right";
  render: (s: MfScreenerScheme) => React.ReactNode;
  sortKey?: string;
}

const COLUMNS: ColDef[] = [
  {
    key: "name",
    label: "Fund Name",
    align: "left",
    sortKey: "name",
    render: (s) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className="truncate max-w-[280px] block"
          style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}
        >
          {s.name}
        </span>
        <span
          className="truncate max-w-[280px] block"
          style={{ fontSize: 10, color: "var(--qc-ink-2)" }}
        >
          {[s.amc_name, s.category].filter(Boolean).join(" · ")}
        </span>
      </div>
    ),
  },
  {
    key: "plan_type",
    label: "Plan",
    align: "left",
    render: (s) => (
      <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{s.plan_type ?? "—"}</span>
    ),
  },
  {
    key: "risk_label",
    label: "Risk",
    align: "left",
    render: (s) => (
      <span style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>{s.risk_label ?? "—"}</span>
    ),
  },
  {
    key: "morningstar",
    label: "★ Rating",
    align: "right",
    sortKey: "morningstar",
    render: (s) => (
      <span style={{ fontSize: 12, color: "var(--qc-ink)", fontWeight: 500 }}>
        {s.morningstar == null ? "—" : `${s.morningstar}/5`}
      </span>
    ),
  },
  {
    key: "returns_1y",
    label: "1Y Return",
    align: "right",
    sortKey: "returns_1y",
    render: (s) => {
      const v = s.returns_1y;
      return (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color:
              v == null ? "var(--qc-ink-2)" : v >= 0 ? "var(--qc-up, #059669)" : "var(--qc-down, #dc2626)",
          }}
        >
          {retPct(v)}
        </span>
      );
    },
  },
  {
    key: "returns_3y",
    label: "3Y Return",
    align: "right",
    sortKey: "returns_3y",
    render: (s) => {
      const v = s.returns_3y;
      return (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color:
              v == null ? "var(--qc-ink-2)" : v >= 0 ? "var(--qc-up, #059669)" : "var(--qc-down, #dc2626)",
          }}
        >
          {retPct(v)}
        </span>
      );
    },
  },
  {
    key: "returns_5y",
    label: "5Y Return",
    align: "right",
    sortKey: "returns_5y",
    render: (s) => {
      const v = s.returns_5y;
      return (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color:
              v == null ? "var(--qc-ink-2)" : v >= 0 ? "var(--qc-up, #059669)" : "var(--qc-down, #dc2626)",
          }}
        >
          {retPct(v)}
        </span>
      );
    },
  },
  {
    key: "aum",
    label: "AUM",
    align: "right",
    sortKey: "aum",
    render: (s) => (
      <span style={{ fontSize: 12, color: "var(--qc-ink)" }}>{cr(s.aum)}</span>
    ),
  },
  {
    key: "expense_ratio",
    label: "Exp. Ratio",
    align: "right",
    sortKey: "expense_ratio",
    render: (s) => (
      <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>{pct(s.expense_ratio)}</span>
    ),
  },
  {
    key: "nav",
    label: "NAV",
    align: "right",
    sortKey: "nav",
    render: (s) => (
      <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
        {s.nav == null ? "—" : `₹${s.nav.toFixed(2)}`}
      </span>
    ),
  },
];

// ── Sort icon ─────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 inline-block ml-1 opacity-25" />;
  if (dir === "asc") return <ArrowUp className="h-3 w-3 inline-block ml-1" />;
  return <ArrowDown className="h-3 w-3 inline-block ml-1" />;
}

// ── Multi-select filter pill ──────────────────────────────────────────────────

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = value.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] transition-all"
        style={{
          border: `1px solid ${active ? "var(--qc-ink)" : "var(--qc-hair)"}`,
          background: active ? "var(--qc-ink)" : "var(--qc-card)",
          color: active ? "var(--qc-card)" : "var(--qc-ink-2)",
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
        {active && (
          <span
            className="rounded-full text-[9px] font-bold px-1"
            style={{ background: "rgba(255,255,255,0.25)" }}
          >
            {value.length}
          </span>
        )}
        {active ? (
          <X
            className="h-2.5 w-2.5 ml-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
              setOpen(false);
            }}
          />
        ) : (
          <ChevronRight className="h-2.5 w-2.5 rotate-90" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-20 rounded-[10px] border shadow-lg overflow-hidden"
            style={{
              background: "var(--qc-card)",
              borderColor: "var(--qc-hair)",
              minWidth: 180,
              maxHeight: 260,
              overflowY: "auto",
            }}
          >
            {options.map((opt) => {
              const checked = value.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(
                      checked ? value.filter((v) => v !== opt) : [...value, opt]
                    );
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--qc-section)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  style={{ color: checked ? "var(--qc-ink)" : "var(--qc-ink-2)" }}
                >
                  <span
                    className="w-3 h-3 rounded-sm border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: checked ? "var(--qc-ink)" : "var(--qc-hair)",
                      background: checked ? "var(--qc-ink)" : "transparent",
                    }}
                  >
                    {checked && (
                      <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                        <path d="M1.5 5L4 7.5 8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Rating filter ─────────────────────────────────────────────────────────────

function RatingFilter({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = value != null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[11px] transition-all"
        style={{
          border: `1px solid ${active ? "var(--qc-ink)" : "var(--qc-hair)"}`,
          background: active ? "var(--qc-ink)" : "var(--qc-card)",
          color: active ? "var(--qc-card)" : "var(--qc-ink-2)",
          fontWeight: active ? 600 : 400,
        }}
      >
        {active ? `★ ${value}+` : "★ Rating"}
        {active ? (
          <X
            className="h-2.5 w-2.5 ml-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
              setOpen(false);
            }}
          />
        ) : (
          <ChevronRight className="h-2.5 w-2.5 rotate-90" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-20 rounded-[10px] border shadow-lg overflow-hidden"
            style={{ background: "var(--qc-card)", borderColor: "var(--qc-hair)", minWidth: 120 }}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                onClick={() => {
                  onChange(value === n ? undefined : n);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--qc-section)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                style={{ color: value === n ? "var(--qc-ink)" : "var(--qc-ink-2)", fontWeight: value === n ? 600 : 400 }}
              >
                {"★".repeat(n)} {n}+
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function MfScreenerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial filters from URL (basket filter_params land here)
  const initFromUrl = useCallback((): Omit<MfScreenerParams, "page" | "size" | "sort" | "order"> & {
    categories: string[];
    risks: string[];
    plan_types: string[];
    rating?: number;
    amc_slug?: string;
  } => {
    const raw = searchParams.toString();
    const p = new URLSearchParams(raw);
    return {
      categories: p.get("category") ? p.get("category")!.split(",") : [],
      risks: p.get("risk") ? p.get("risk")!.split(",") : [],
      plan_types: p.get("plan_type") ? p.get("plan_type")!.split(",") : [],
      rating: p.get("rating") ? Number(p.get("rating")) : undefined,
      amc_slug: p.get("amc_slug") ?? undefined,
      q: p.get("q") ?? undefined,
    };
  }, [searchParams]);

  const init = useMemo(() => initFromUrl(), []); // intentionally run once on mount

  const [q, setQ] = useState(init.q ?? "");
  const [categories, setCategories] = useState<string[]>(init.categories);
  const [risks, setRisks] = useState<string[]>(init.risks);
  const [planTypes, setPlanTypes] = useState<string[]>(init.plan_types);
  const [rating, setRating] = useState<number | undefined>(init.rating);
  const [amcSlug, setAmcSlug] = useState<string | undefined>(init.amc_slug);
  const [sort, setSort] = useState("aum");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const basketTitle = searchParams.get("basket_title");

  const screenerParams: MfScreenerParams = {
    q: q || undefined,
    category: categories.length > 0 ? categories.join(",") : undefined,
    risk: risks.length > 0 ? risks.join(",") : undefined,
    plan_type: planTypes.length > 0 ? planTypes.join(",") : undefined,
    rating,
    amc_slug: amcSlug || undefined,
    sort,
    order,
    page,
    size: 25,
  };

  const { data, loading, error } = useMfScreener(screenerParams);
  const { data: filterOptions } = useMfFilterOptions();
  const { data: mfBasketsData } = useMfBaskets();

  const totalPages = data?.pages ?? 1;

  const handleSort = (col: ColDef) => {
    if (!col.sortKey) return;
    if (sort === col.sortKey) {
      setOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSort(col.sortKey);
      setOrder("desc");
    }
    setPage(1);
  };

  const resetFilters = () => {
    setQ("");
    setCategories([]);
    setRisks([]);
    setPlanTypes([]);
    setRating(undefined);
    setAmcSlug(undefined);
    setPage(1);
  };

  const hasFilters =
    q || categories.length || risks.length || planTypes.length || rating != null || amcSlug;

  const amcOptions = useMemo(
    () => filterOptions?.amcs ?? [],
    [filterOptions]
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-bg)" }}>
      {/* Hero header */}
      <div className="relative" style={{ background: "var(--qc-bg)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 100% at 50% 0%, var(--qc-lime-bg) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-8 pt-8 pb-6">
          <button
            onClick={() => router.push("/screener/home")}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-3 transition-opacity hover:opacity-60"
            style={{ color: "var(--qc-ink-2)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Fund Baskets
          </button>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-[28px] font-medium leading-tight"
                style={{ color: "var(--qc-ink)" }}
              >
                {basketTitle ?? "Mutual Fund Screener"}
              </h1>
              {data && (
                <p className="text-[13px] mt-1" style={{ color: "var(--qc-ink-2)" }}>
                  {data.total.toLocaleString()} fund
                  {data.total !== 1 ? "s" : ""} match your criteria
                </p>
              )}
            </div>

            {/* Basket quick-switch */}
            {mfBasketsData && (
              <div className="flex items-center gap-2 flex-wrap">
                {mfBasketsData.baskets.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      const p = new URLSearchParams(b.filter_params ?? "");
                      setCategories(p.get("category") ? p.get("category")!.split(",") : []);
                      setRisks(p.get("risk") ? p.get("risk")!.split(",") : []);
                      setPlanTypes(p.get("plan_type") ? p.get("plan_type")!.split(",") : []);
                      setRating(p.get("rating") ? Number(p.get("rating")) : undefined);
                      setAmcSlug(p.get("amc_slug") ?? undefined);
                      setQ(p.get("q") ?? "");
                      setPage(1);
                    }}
                    className="rounded-full px-2.5 py-1 text-[10px] font-medium transition-all"
                    style={{
                      border: "1px solid var(--qc-hair)",
                      background: "var(--qc-card)",
                      color: "var(--qc-ink-2)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--qc-section)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--qc-card)")
                    }
                  >
                    {b.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{
          background: "var(--qc-bg)",
          borderColor: "var(--qc-hair)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-8 py-3 flex items-center gap-2 flex-wrap">
          <SlidersHorizontal
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: "var(--qc-ink-2)" }}
          />

          {/* Search */}
          <div
            className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5"
            style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
          >
            <Search className="h-3 w-3 shrink-0" style={{ color: "var(--qc-ink-2)" }} />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search funds…"
              className="w-32 text-[12px] outline-none bg-transparent"
              style={{ color: "var(--qc-ink)" }}
            />
            {q && (
              <button onClick={() => { setQ(""); setPage(1); }}>
                <X className="h-3 w-3" style={{ color: "var(--qc-ink-2)" }} />
              </button>
            )}
          </div>

          {filterOptions && (
            <>
              <FilterSelect
                label="Category"
                options={filterOptions.categories}
                value={categories}
                onChange={(v) => { setCategories(v); setPage(1); }}
              />
              <FilterSelect
                label="Risk"
                options={filterOptions.risks}
                value={risks}
                onChange={(v) => { setRisks(v); setPage(1); }}
              />
              <FilterSelect
                label="Plan Type"
                options={filterOptions.plan_types}
                value={planTypes}
                onChange={(v) => { setPlanTypes(v); setPage(1); }}
              />
              <RatingFilter
                value={rating}
                onChange={(v) => { setRating(v); setPage(1); }}
              />
              {/* AMC filter */}
              <div className="relative">
                <select
                  value={amcSlug ?? ""}
                  onChange={(e) => {
                    setAmcSlug(e.target.value || undefined);
                    setPage(1);
                  }}
                  className="rounded-[8px] px-3 py-1.5 text-[11px] outline-none cursor-pointer pr-6"
                  style={{
                    border: amcSlug ? "1px solid var(--qc-ink)" : "1px solid var(--qc-hair)",
                    background: amcSlug ? "var(--qc-ink)" : "var(--qc-card)",
                    color: amcSlug ? "var(--qc-card)" : "var(--qc-ink-2)",
                    fontWeight: amcSlug ? 600 : 400,
                  }}
                >
                  <option value="">AMC</option>
                  {amcOptions.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] ml-1"
              style={{ color: "var(--qc-ink-2)" }}
            >
              <X className="h-2.5 w-2.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1400px] mx-auto px-8 py-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div
          className="rounded-[10px] border overflow-hidden"
          style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
        >
          {/* Table header */}
          <div
            style={{
              borderBottom: "1px solid var(--qc-hair)",
              background: "var(--qc-section)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    className="px-4 py-2.5 text-left"
                    style={{ width: 40, color: "var(--qc-ink-2)", fontSize: 10 }}
                  >
                    #
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col)}
                      className={`px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap select-none ${
                        col.sortKey ? "cursor-pointer hover:opacity-70" : ""
                      } ${col.align === "right" ? "text-right" : "text-left"}`}
                      style={{ color: "var(--qc-ink-2)" }}
                    >
                      {col.label}
                      {col.sortKey && (
                        <SortIcon active={sort === col.sortKey} dir={order} />
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-2.5" style={{ width: 40 }} />
                </tr>
              </thead>
            </table>
          </div>

          {/* Loading */}
          {loading && (
            <div
              className="flex items-center justify-center py-16 gap-2"
              style={{ color: "var(--qc-ink-2)" }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading funds…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && data?.schemes.length === 0 && (
            <p className="text-sm text-center py-14" style={{ color: "var(--qc-ink-2)" }}>
              No funds matched your criteria.
            </p>
          )}

          {/* Rows */}
          {!loading && !error && data && data.schemes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {data.schemes.map((scheme, i) => (
                    <tr
                      key={scheme.amfi_code}
                      onClick={() =>
                        router.push(
                          `/screener/mutual-fund/${encodeURIComponent(scheme.amfi_code)}`
                        )
                      }
                      className="cursor-pointer transition-colors group"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--qc-section)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      style={{
                        borderBottom:
                          i < data.schemes.length - 1
                            ? "1px solid var(--qc-hair-2)"
                            : undefined,
                      }}
                    >
                      <td className="px-4 py-3" style={{ width: 40 }}>
                        <span
                          className="tabular-nums"
                          style={{ fontSize: 11, color: "var(--qc-ink-2)" }}
                        >
                          {(page - 1) * 25 + i + 1}
                        </span>
                      </td>
                      {COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 whitespace-nowrap ${
                            col.align === "right" ? "text-right" : "text-left"
                          }`}
                        >
                          {col.render(scheme)}
                        </td>
                      ))}
                      <td className="px-4 py-3" style={{ width: 40 }}>
                        <ArrowRight
                          className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--qc-ink)" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && data && data.schemes.length > 0 && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: "1px solid var(--qc-hair)" }}
            >
              <p className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                {data.total.toLocaleString()} total · page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--qc-section)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                </button>
                <span className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-[6px] p-1 disabled:opacity-30 transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--qc-section)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <ChevronRight className="h-4 w-4" style={{ color: "var(--qc-ink)" }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MfScreenerPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center py-32 gap-2"
          style={{ color: "var(--qc-ink-2)" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      }
    >
      <MfScreenerContent />
    </Suspense>
  );
}
