"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";
import { useBaskets } from "@/hooks/useBaskets";
import { useMfBaskets } from "@/hooks/useMfBaskets";
import { useMfFilterOptions } from "@/hooks/useMfFilterOptions";
import { useMfScreener } from "@/hooks/useMfScreener";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";
import type { Basket } from "@/types/screener";
import type { MfScreenerScheme, MfScreenerParams } from "@/types/mutual-fund";
import Link from "next/link";

const ASSET_TABS = ["Indian Stocks", "Mutual Funds", "US Stocks", "PE / Pre-IPO"] as const;
type AssetTab = typeof ASSET_TABS[number];

// ── Formatters ────────────────────────────────────────────────────────────────

function pct(v: number | null | undefined) {
  if (v == null) return "—";
  return `${v.toFixed(2)}%`;
}

function cr(v: number | null | undefined) {
  if (v == null) return "—";
  if (Math.abs(v) >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L Cr`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K Cr`;
  return `₹${v.toFixed(0)} Cr`;
}

//── MF screener column definitions ───────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  align: "left" | "right";
  sortKey?: string;
  render: (s: MfScreenerScheme) => React.ReactNode;
}

const MF_COLUMNS: ColDef[] = [
  {
    key: "name",
    label: "Fund Name",
    align: "left",
    sortKey: "name",
    render: (s) => (
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate max-w-[300px] block" style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-text-heading)" }}>
          {s.name}
        </span>
        <span className="truncate max-w-[300px] block" style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>
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
      <span
        className="inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
        style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-muted)" }}
      >
        {s.plan_type ?? "—"}
      </span>
    ),
  },
  {
    key: "risk_label",
    label: "Risk",
    align: "left",
    render: (s) => <span style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>{s.risk_label ?? "—"}</span>,
  },
  {
    key: "morningstar",
    label: "★ Rating",
    align: "right",
    sortKey: "morningstar",
    render: (s) => (
      s.morningstar == null
        ? <span style={{ fontSize: 12, color: "var(--qc-text-dimmed)" }}>—</span>
        : (
          <span className="flex items-center justify-end gap-0.5">
            <span style={{ color: "var(--qc-warn)", fontSize: 11, letterSpacing: 1 }}>{"★".repeat(s.morningstar)}</span>
          </span>
        )
    ),
  },
  {
    key: "aum",
    label: "AUM",
    align: "right",
    sortKey: "aum",
    render: (s) => <span style={{ fontSize: 12, fontWeight: 500, color: "var(--qc-text-heading)" }}>{cr(s.aum)}</span>,
  },
  {
    key: "expense_ratio",
    label: "Exp. Ratio",
    align: "right",
    sortKey: "expense_ratio",
    render: (s) => <span style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>{pct(s.expense_ratio)}</span>,
  },
  {
    key: "nav",
    label: "NAV",
    align: "right",
    sortKey: "nav",
    render: (s) => (
      <span style={{ fontSize: 12, color: "var(--qc-text-body)", fontWeight: 500 }}>
        {s.nav == null ? <span style={{ color: "var(--qc-text-dimmed)" }}>—</span> : `₹${s.nav.toFixed(2)}`}
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
        className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
        style={
          active
            ? { border: "1px solid var(--qc-border-active)", background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }
            : { border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-base)", color: "var(--qc-text-muted)" }
        }
      >
        {label}
        {active && (
          <span className="rounded-full text-[9px] font-bold px-1.5 py-0.5" style={{ background: "rgba(255,255,255,0.2)", lineHeight: 1 }}>
            {value.length}
          </span>
        )}
        {active ? (
          <X
            className="h-2.5 w-2.5 ml-0.5 hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); onChange([]); setOpen(false); }}
          />
        ) : (
          <ChevronRight className="h-2.5 w-2.5 rotate-90" style={{ color: "var(--qc-text-muted)" }} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 rounded-[10px] shadow-lg py-1"
            style={{ background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)", minWidth: 200, maxHeight: 280, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
          >
            {options.map((opt) => {
              const checked = value.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => onChange(checked ? value.filter((v) => v !== opt) : [...value, opt])}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[12px] transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-surface-panel)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  style={{ color: checked ? "var(--qc-accent-primary)" : "var(--qc-text-body)", fontWeight: checked ? 500 : 400 }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-[3px] flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      border: `1.5px solid ${checked ? "var(--qc-accent-primary)" : "var(--qc-text-dimmed)"}`,
                      background: checked ? "var(--qc-accent-primary)" : "transparent",
                    }}
                  >
                    {checked && (
                      <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                        <path d="M1.5 5L4 7.5 8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function RatingFilter({ value, onChange }: { value: number | undefined; onChange: (v: number | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const active = value != null;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
        style={
          active
            ? { border: "1px solid var(--qc-border-active)", background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }
            : { border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-base)", color: "var(--qc-text-muted)" }
        }
      >
        {active ? `★ ${value}+` : "★ Rating"}
        {active ? (
          <X
            className="h-2.5 w-2.5 ml-0.5 hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); onChange(undefined); setOpen(false); }}
          />
        ) : (
          <ChevronRight className="h-2.5 w-2.5 rotate-90" style={{ color: "var(--qc-text-muted)" }} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 rounded-[10px] overflow-hidden py-1"
            style={{ background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)", minWidth: 140, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                onClick={() => { onChange(value === n ? undefined : n); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[12px] transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-surface-panel)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                style={{ color: value === n ? "var(--qc-accent-primary)" : "var(--qc-text-body)", fontWeight: value === n ? 600 : 400 }}
              >
                <span style={{ color: "var(--qc-warn)", letterSpacing: 1 }}>{"★".repeat(n)}</span>
                <span style={{ color: "var(--qc-text-muted)", fontSize: 11 }}>{n}+</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── MF Screener section (replaces basket grid) ────────────────────────────────

const PAGE_SIZE = 25;

function MfScreenerSection() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [planTypes, setPlanTypes] = useState<string[]>([]);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [amcSlug, setAmcSlug] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState("aum");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data: filterOptions } = useMfFilterOptions();
  const { data: mfBasketsData, loading: mfBasketsLoading } = useMfBaskets();

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
    size: PAGE_SIZE,
  };

  const { data, loading, error } = useMfScreener(screenerParams);

  // Derive total pages client-side — backend sometimes returns pages: 1 incorrectly
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const amcOptions = useMemo(() => filterOptions?.amcs ?? [], [filterOptions]);

  const hasFilters = q || categories.length || risks.length || planTypes.length || rating != null || amcSlug;

  const applyBasket = (filterParams: string | undefined) => {
    const p = new URLSearchParams(filterParams ?? "");
    setCategories(p.get("category") ? p.get("category")!.split(",") : []);
    setRisks(p.get("risk") ? p.get("risk")!.split(",") : []);
    setPlanTypes(p.get("plan_type") ? p.get("plan_type")!.split(",") : []);
    setRating(p.get("rating") ? Number(p.get("rating")) : undefined);
    setAmcSlug(p.get("amc_slug") ?? undefined);
    setQ(p.get("q") ?? "");
    setPage(1);
  };

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
    setQ(""); setCategories([]); setRisks([]); setPlanTypes([]);
    setRating(undefined); setAmcSlug(undefined); setPage(1);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-12">
      {/* Basket quick-picks */}
      {!mfBasketsLoading && mfBasketsData && mfBasketsData.baskets.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--qc-text-muted)" }}>
            Fund Baskets
          </p>
          <div className="flex flex-wrap gap-2">
            {mfBasketsData.baskets.map((b) => (
              <button
                key={b.id}
                onClick={() => applyBasket(b.filter_params)}
                className="rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all border"
                style={{ borderColor: "var(--qc-text-dimmed)", background: "var(--qc-surface-white)", color: "var(--qc-text-body)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--qc-accent-primary)";
                  e.currentTarget.style.color = "var(--qc-surface-white)";
                  e.currentTarget.style.borderColor = "var(--qc-accent-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--qc-surface-white)";
                  e.currentTarget.style.color = "var(--qc-text-body)";
                  e.currentTarget.style.borderColor = "var(--qc-text-dimmed)";
                }}
              >
                {b.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div
        className="flex items-center gap-2 flex-wrap mb-3 px-3 py-2.5 rounded-[10px]"
        style={{ background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--qc-text-muted)" }} />

        {/* Search */}
        <div
          className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5"
          style={{ background: "var(--qc-surface-base)", border: "1px solid var(--qc-border-default)" }}
        >
          <Search className="h-3 w-3 shrink-0" style={{ color: "var(--qc-text-muted)" }} />
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search funds…"
            className="w-36 text-[12px] outline-none bg-transparent placeholder:text-[var(--qc-text-muted)]"
            style={{ color: "var(--qc-text-heading)" }}
          />
          {q && (
            <button onClick={() => { setQ(""); setPage(1); }}>
              <X className="h-3 w-3 hover:opacity-70" style={{ color: "var(--qc-text-muted)" }} />
            </button>
          )}
        </div>

        {filterOptions && (
          <>
            <FilterSelect label="Category" options={filterOptions.categories} value={categories} onChange={(v) => { setCategories(v); setPage(1); }} />
            <FilterSelect label="Risk" options={filterOptions.risks} value={risks} onChange={(v) => { setRisks(v); setPage(1); }} />
            <FilterSelect label="Plan Type" options={filterOptions.plan_types} value={planTypes} onChange={(v) => { setPlanTypes(v); setPage(1); }} />
            <RatingFilter value={rating} onChange={(v) => { setRating(v); setPage(1); }} />
            {/* AMC select */}
            <div className="relative">
              <select
                value={amcSlug ?? ""}
                onChange={(e) => { setAmcSlug(e.target.value || undefined); setPage(1); }}
                className="appearance-none rounded-[8px] px-3 pr-7 py-1.5 text-[12px] outline-none cursor-pointer font-medium"
                style={
                  amcSlug
                    ? { border: "1px solid var(--qc-border-active)", background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)" }
                    : { border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-base)", color: "var(--qc-text-muted)" }
                }
              >
                <option value="">AMC</option>
                {amcOptions.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.name}</option>
                ))}
              </select>
              <ChevronRight
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90"
                style={{ color: amcSlug ? "var(--qc-surface-white)" : "var(--qc-text-muted)" }}
              />
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-medium rounded-[6px] px-2 py-1 transition-colors"
              style={{ color: "var(--qc-text-muted)", background: "var(--qc-surface-panel)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-border-default)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--qc-surface-panel)")}
            >
              <X className="h-2.5 w-2.5" /> Clear all
            </button>
          )}
          {data && (
            <span className="text-[12px] font-medium tabular-nums" style={{ color: "var(--qc-text-body)" }}>
              {data.total.toLocaleString()} funds
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        {/* Table header — always visible */}
        <div style={{ overflowX: "auto" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--qc-surface-base)", borderBottom: "2px solid var(--qc-border-default)" }}>
                <th className="px-4 py-3 text-left" style={{ width: 48, color: "var(--qc-text-muted)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>#</th>
                {MF_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap select-none ${col.sortKey ? "cursor-pointer" : ""} ${col.align === "right" ? "text-right" : "text-left"}`}
                    style={{ color: sort === col.sortKey ? "var(--qc-accent-primary)" : "var(--qc-text-muted)" }}
                    onMouseEnter={(e) => { if (col.sortKey) e.currentTarget.style.color = "var(--qc-accent-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = sort === col.sortKey ? "var(--qc-accent-primary)" : "var(--qc-text-muted)"; }}
                  >
                    {col.label}
                    {col.sortKey && <SortIcon active={sort === col.sortKey} dir={order} />}
                  </th>
                ))}
                <th className="px-4 py-3" style={{ width: 40 }} />
              </tr>
            </thead>

            {/* Loading skeleton rows */}
            {loading && (
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--qc-border-inner)" }}>
                    <td className="px-4 py-3.5" style={{ width: 48 }}>
                      <div className="h-3 w-5 rounded bg-zinc-100 animate-pulse" />
                    </td>
                    {MF_COLUMNS.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 ${col.align === "right" ? "text-right" : ""}`}>
                        <div className={`h-3 rounded bg-zinc-100 animate-pulse ${col.key === "name" ? "w-48" : "w-12 ml-auto"}`} style={col.align !== "right" ? { marginLeft: 0 } : {}} />
                        {col.key === "name" && <div className="h-2.5 w-28 rounded bg-zinc-50 animate-pulse mt-1.5" />}
                      </td>
                    ))}
                    <td className="px-4 py-3.5" style={{ width: 40 }} />
                  </tr>
                ))}
              </tbody>
            )}

            {/* Empty state */}
            {!loading && !error && data?.schemes.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={MF_COLUMNS.length + 2} className="px-4 py-16 text-center">
                    <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>No funds matched your criteria.</p>
                  </td>
                </tr>
              </tbody>
            )}

            {/* Data rows */}
            {!loading && !error && data && data.schemes.length > 0 && (
              <tbody>
                {data.schemes.map((scheme, i) => (
                  <tr
                    key={scheme.amfi_code}
                    onClick={() => router.push(`/screener/mutual-fund/${encodeURIComponent(scheme.amfi_code)}`)}
                    className="cursor-pointer group"
                    style={{ borderBottom: i < data.schemes.length - 1 ? "1px solid var(--qc-border-inner)" : undefined }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-surface-base)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td className="px-4 py-3.5" style={{ width: 48 }}>
                      <span className="tabular-nums" style={{ fontSize: 11, color: "var(--qc-text-muted)" }}>
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </span>
                    </td>
                    {MF_COLUMNS.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"}`}>
                        {col.render(scheme)}
                      </td>
                    ))}
                    <td className="px-4 py-3.5" style={{ width: 40 }}>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "var(--qc-accent-primary)" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loading && data && data.total > 0 && (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid var(--qc-border-default)", background: "var(--qc-surface-base)" }}
          >
            <p className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>
              {data.total.toLocaleString()} total
              <span className="mx-1.5" style={{ color: "var(--qc-text-dimmed)" }}>·</span>
              showing {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(page * PAGE_SIZE, data.total).toLocaleString()}
              <span className="mx-1.5" style={{ color: "var(--qc-text-dimmed)" }}>·</span>
              page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-[6px] px-2 py-1 text-[11px] font-medium disabled:opacity-30 transition-colors"
                style={{ color: "var(--qc-text-body)", background: page === 1 ? "transparent" : "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)" }}
                onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-surface-panel)"; }}
                onMouseLeave={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-surface-white)"; }}
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-[6px] p-1.5 disabled:opacity-30 transition-colors"
                style={{ color: "var(--qc-text-body)", background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)" }}
                onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-surface-panel)"; }}
                onMouseLeave={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-surface-white)"; }}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* Page number buttons */}
              {(() => {
                const delta = 2;
                const pages: (number | "...")[] = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                    pages.push(i);
                  } else if (pages[pages.length - 1] !== "...") {
                    pages.push("...");
                  }
                }
                return pages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-[11px]" style={{ color: "var(--qc-text-muted)" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className="rounded-[6px] min-w-[28px] h-7 text-[11px] font-medium transition-colors"
                      style={
                        page === p
                          ? { background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)", border: "1px solid var(--qc-border-active)" }
                          : { background: "var(--qc-surface-white)", color: "var(--qc-text-body)", border: "1px solid var(--qc-border-default)" }
                      }
                      onMouseEnter={(e) => { if (page !== p) e.currentTarget.style.background = "var(--qc-surface-panel)"; }}
                      onMouseLeave={(e) => { if (page !== p) e.currentTarget.style.background = "var(--qc-surface-white)"; }}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-[6px] p-1.5 disabled:opacity-30 transition-colors"
                style={{ color: "var(--qc-text-body)", background: "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)" }}
                onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-surface-panel)"; }}
                onMouseLeave={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-surface-white)"; }}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="rounded-[6px] px-2 py-1 text-[11px] font-medium disabled:opacity-30 transition-colors"
                style={{ color: "var(--qc-text-body)", background: page >= totalPages ? "transparent" : "var(--qc-surface-white)", border: "1px solid var(--qc-border-default)" }}
                onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-surface-panel)"; }}
                onMouseLeave={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-surface-white)"; }}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stock basket row ──────────────────────────────────────────────────────────

function BasketRow({ basket }: { basket: Basket }) {
  return (
    <Link
      href={`/screener/basket?id=${encodeURIComponent(basket.id)}`}
      className="group flex items-start justify-between gap-3 px-4 py-3 transition-colors"
      onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-surface-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "")}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug truncate" style={{ color: "var(--qc-text-heading)" }}>
          {basket.title}
        </p>
        <p className="text-[11px] mt-0.5 line-clamp-1 leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>
          {basket.description}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
        <span
          className="text-[10px] font-medium rounded-sm px-1.5 py-0.5 tabular-nums"
          style={{ background: "var(--qc-accent-lime-bg)", color: "var(--qc-text-heading)" }}
        >
          {basket.conditions.length}
        </span>
        <ArrowRight className="size-3 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: "var(--qc-text-heading)" }} />
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScreenerHomePage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [mfQuery, setMfQuery] = useState("");
  const [stockOptions, setStockOptions] = useState<AutocompleteOption[]>([]);
  const [activeTab, setActiveTab] = useState<AssetTab>("Indian Stocks");

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (response) => {
        setStockOptions(
          response.data.map((s) => ({
            value: s.company,
            label: s.company_name,
            subtitle: s.basic_industry,
          }))
        );
      },
      onError: (err) => console.error("Failed to fetch stocks:", err),
    });
  }, []);

  const handleSearch = (symbol: string) => {
    if (symbol) router.push(`/screener/overview?symbol=${encodeURIComponent(symbol)}`);
  };

  const handleMfSelect = (amfiCode: string) => {
    if (amfiCode) router.push(`/screener/mutual-fund/${encodeURIComponent(amfiCode)}`);
  };

  const { data: basketsData, loading: basketsLoading, error: basketsError } = useBaskets();

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-surface-base)" }}>
      {/* Hero search section */}
      <div className="relative" style={{ background: "var(--qc-surface-base)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--qc-accent-lime-bg) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-14 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h2 className="text-[32px] font-medium leading-tight" style={{ color: "var(--qc-text-heading)" }}>
              What would you like to research today?
            </h2>
            <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>
              Search a company to open its screener, or pick a research basket below.
            </p>
          </div>

          {/* Asset class tab selector */}
          <div className="flex items-center gap-1 rounded-full border p-1" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
            {ASSET_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={
                  activeTab === tab
                    ? { background: "var(--qc-accent-lime)", color: "#ffffff" }
                    : { color: "var(--qc-text-muted)" }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search input */}
          {activeTab === "Mutual Funds" ? (
            <div className="w-full">
              <AutocompleteInput
                placeholder="Search by fund name or AMC…"
                value={mfQuery}
                onChange={setMfQuery}
                onSubmit={handleMfSelect}
                options={[]}
                maxSuggestions={8}
              />
            </div>
          ) : activeTab === "PE / Pre-IPO" ? (
            <div className="w-full grid grid-cols-3 gap-4">
              {[
                { key: "vc", label: "VC Deals", description: "Analyse venture capital deal memos, term sheets, and cap tables.", icon: "💼", comingSoon: true },
                { key: "aif", label: "AIFs", description: "Evaluate Alternative Investment Fund documents and PPMs.", icon: "📊", comingSoon: true },
                { key: "pre-ipo", label: "Pre-IPO", description: "Deep-dive DRHP analysis — business quality, red flags & verdict.", icon: "🏦", comingSoon: false },
              ].map((item) => (
                <button
                  key={item.key}
                  disabled={item.comingSoon}
                  onClick={() => { if (!item.comingSoon) router.push("/private-equity/pre-ipo"); }}
                  className="group relative flex flex-col items-start gap-3 rounded-[10px] border px-5 py-5 text-left transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
                >
                  {item.comingSoon && (
                    <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5" style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-muted)" }}>
                      Soon
                    </span>
                  )}
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{item.label}</p>
                    <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{item.description}</p>
                  </div>
                  {!item.comingSoon && (
                    <ArrowRight className="size-4 mt-auto self-end opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-text-heading)" }} />
                  )}
                </button>
              ))}
            </div>
          ) : activeTab === "US Stocks" ? (
            <div className="w-full flex flex-col items-center gap-3 py-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}>
                <span className="text-2xl">🇺🇸</span>
              </div>
              <p className="text-[15px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>US Stocks — Coming Soon</p>
              <p className="text-[13px] text-center max-w-sm" style={{ color: "var(--qc-text-muted)" }}>
                Earnings call analysis and management quality scoring for US-listed companies is on the way.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <AutocompleteInput
                placeholder="Search by company name or ticker…"
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearch}
                options={stockOptions}
                maxSuggestions={8}
              />
            </div>
          )}
        </div>
      </div>

      {/* MF Screener — replaces the old basket grid */}
      {activeTab === "Mutual Funds" && (
        <>
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex-1 h-px" style={{ background: "var(--qc-border-default)" }} />
            <div className="flex flex-col items-center gap-0.5 px-1">
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Fund Screener
              </span>
              <span style={{ fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: "0.02em" }}>
                Filter and sort across all mutual funds
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: "var(--qc-border-default)" }} />
          </div>
          <MfScreenerSection />
        </>
      )}

      {/* Research Baskets — Indian Stocks / US Stocks */}
      {activeTab !== "PE / Pre-IPO" && activeTab !== "Mutual Funds" && activeTab !== "US Stocks" && (
        <>
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex-1 h-px" style={{ background: "var(--qc-border-default)" }} />
            <div className="flex flex-col items-center gap-0.5 px-1">
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--qc-text-heading)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Research Baskets
              </span>
              <span style={{ fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: "0.02em" }}>
                Pre-built screening strategies
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: "var(--qc-border-default)" }} />
          </div>

          <div className="max-w-[1400px] mx-auto px-6 pb-12">
            {basketsError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{basketsError}</p>
              </div>
            )}

            {basketsLoading && (
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-[10px] border h-[320px] animate-pulse" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }} />
                ))}
              </div>
            )}

            {!basketsLoading && !basketsError && basketsData && (
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Object.keys(basketsData.grouped).length}, 1fr)` }}>
                {Object.entries(basketsData.grouped).map(([category, baskets]) => (
                  <div key={category} className="relative rounded-[10px] border overflow-hidden" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}>
                    <div className="px-4 py-4 border-b" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.10em] leading-tight" style={{ color: "var(--qc-text-heading)" }}>{category}</p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--qc-text-muted)" }}>{baskets.length} basket{baskets.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="divide-y divide-[var(--qc-border-inner)]">
                      {baskets.map((basket) => <BasketRow key={basket.id} basket={basket} />)}
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10" style={{ background: "linear-gradient(180deg, transparent 0%, var(--qc-surface-panel) 100%)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
