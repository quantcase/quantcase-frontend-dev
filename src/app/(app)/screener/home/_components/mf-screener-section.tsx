"use client";

import { useState, useMemo } from "react";
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
import { useMfBaskets } from "@/hooks/useMfBaskets";
import { useMfFilterOptions } from "@/hooks/useMfFilterOptions";
import { useMfScreener } from "@/hooks/useMfScreener";
import type { MfScreenerParams } from "@/types/mutual-fund";
import { MF_COLUMNS, type ColDef } from "./mf-columns";

const PAGE_SIZE = 25;

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
            ? { border: "1px solid var(--qc-ink)", background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
            : { border: "1px solid var(--qc-hair)", background: "var(--qc-bg)", color: "var(--qc-ink-2)" }
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
          <ChevronRight className="h-2.5 w-2.5 rotate-90" style={{ color: "var(--qc-ink-2)" }} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 rounded-[10px] shadow-lg py-1"
            style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", minWidth: 200, maxHeight: 280, overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
          >
            {options.map((opt) => {
              const checked = value.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => onChange(checked ? value.filter((v) => v !== opt) : [...value, opt])}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[12px] transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-section)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  style={{ color: "var(--qc-ink)", fontWeight: checked ? 500 : 400 }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-[3px] flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      border: `1.5px solid ${checked ? "var(--qc-ink)" : "var(--qc-ink-3)"}`,
                      background: checked ? "var(--qc-ink)" : "transparent",
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
            ? { border: "1px solid var(--qc-ink)", background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
            : { border: "1px solid var(--qc-hair)", background: "var(--qc-bg)", color: "var(--qc-ink-2)" }
        }
      >
        {active ? `★ ${value}+` : "★ Rating"}
        {active ? (
          <X
            className="h-2.5 w-2.5 ml-0.5 hover:opacity-70"
            onClick={(e) => { e.stopPropagation(); onChange(undefined); setOpen(false); }}
          />
        ) : (
          <ChevronRight className="h-2.5 w-2.5 rotate-90" style={{ color: "var(--qc-ink-2)" }} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 rounded-[10px] overflow-hidden py-1"
            style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", minWidth: 140, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <button
                key={n}
                onClick={() => { onChange(value === n ? undefined : n); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[12px] transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-section)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                style={{ color: "var(--qc-ink)", fontWeight: value === n ? 600 : 400 }}
              >
                <span style={{ color: "var(--qc-warn)", letterSpacing: 1 }}>{"★".repeat(n)}</span>
                <span style={{ color: "var(--qc-ink-2)", fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-sans)" }}>{n}+</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const delta = 2;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const btnBase = "rounded-[6px] transition-colors";
  const navStyle = { color: "var(--qc-ink)", background: "var(--qc-card)", border: "1px solid var(--qc-hair)" };

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5 py-3"
      style={{ borderTop: "1px solid var(--qc-hair)", background: "var(--qc-bg)" }}
    >
      <p className="text-[12px]" style={{ color: "var(--qc-ink-2)" }}>
        {total.toLocaleString()} total
        <span className="mx-1.5" style={{ color: "var(--qc-ink-3)" }}>·</span>
        showing {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(page * PAGE_SIZE, total).toLocaleString()}
        <span className="mx-1.5" style={{ color: "var(--qc-ink-3)" }}>·</span>
        page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={`${btnBase} px-2 py-1 text-[11px] font-medium disabled:opacity-30`}
          style={page === 1 ? { color: "var(--qc-ink)", border: "1px solid var(--qc-hair)" } : navStyle}
          onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-section)"; }}
          onMouseLeave={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-card)"; }}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`${btnBase} p-1.5 disabled:opacity-30`}
          style={navStyle}
          onMouseEnter={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-section)"; }}
          onMouseLeave={(e) => { if (page !== 1) e.currentTarget.style.background = "var(--qc-card)"; }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-[11px]" style={{ color: "var(--qc-ink-2)" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} min-w-[28px] h-7 text-[11px] font-medium`}
              style={
                page === p
                  ? { background: "var(--qc-ink)", color: "var(--qc-on-dark)", border: "1px solid var(--qc-ink)" }
                  : navStyle
              }
              onMouseEnter={(e) => { if (page !== p) e.currentTarget.style.background = "var(--qc-section)"; }}
              onMouseLeave={(e) => { if (page !== p) e.currentTarget.style.background = "var(--qc-card)"; }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={`${btnBase} p-1.5 disabled:opacity-30`}
          style={navStyle}
          onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-section)"; }}
          onMouseLeave={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-card)"; }}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className={`${btnBase} px-2 py-1 text-[11px] font-medium disabled:opacity-30`}
          style={page >= totalPages ? { color: "var(--qc-ink)", border: "1px solid var(--qc-hair)" } : navStyle}
          onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-section)"; }}
          onMouseLeave={(e) => { if (page < totalPages) e.currentTarget.style.background = "var(--qc-card)"; }}
        >
          »
        </button>
      </div>
    </div>
  );
}

// ── MF Table ──────────────────────────────────────────────────────────────────

function MfTable({
  data,
  loading,
  error,
  sort,
  order,
  page,
  onSort,
  onRowClick,
}: {
  data: { schemes: Parameters<ColDef["render"]>[0][]; total: number } | null;
  loading: boolean;
  error: string | null;
  sort: string;
  order: "asc" | "desc";
  page: number;
  onSort: (col: ColDef) => void;
  onRowClick: (amfiCode: string) => void;
}) {
  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-card)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <div style={{ overflowX: "auto" }}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--qc-bg)", borderBottom: "2px solid var(--qc-hair)" }}>
              <th className="px-4 py-3 text-left" style={{ width: 48, color: "var(--qc-ink-2)", fontSize: "var(--qc-fz-10)", fontWeight: "var(--qc-w-medium)", fontFamily: "var(--qc-font-sans)", textTransform: "uppercase", letterSpacing: "0.08em" }}>#</th>
              {MF_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort(col)}
                  className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap select-none ${col.sortKey ? "cursor-pointer" : ""} ${col.align === "right" ? "text-right" : "text-left"}`}
                  style={{ color: sort === col.sortKey ? "var(--qc-ink)" : "var(--qc-ink-2)" }}
                  onMouseEnter={(e) => { if (col.sortKey) e.currentTarget.style.color = "var(--qc-ink)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = sort === col.sortKey ? "var(--qc-ink)" : "var(--qc-ink-2)"; }}
                >
                  {col.label}
                  {col.sortKey && <SortIcon active={sort === col.sortKey} dir={order} />}
                </th>
              ))}
              <th className="px-4 py-3" style={{ width: 40 }} />
            </tr>
          </thead>

          {loading && (
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--qc-hair-2)" }}>
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

          {!loading && !error && data?.schemes.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={MF_COLUMNS.length + 2} className="px-4 py-16 text-center">
                  <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>No funds matched your criteria.</p>
                </td>
              </tr>
            </tbody>
          )}

          {!loading && !error && data && data.schemes.length > 0 && (
            <tbody>
              {data.schemes.map((scheme, i) => (
                <tr
                  key={scheme.amfi_code}
                  onClick={() => onRowClick(scheme.amfi_code)}
                  className="cursor-pointer group"
                  style={{ borderBottom: i < data.schemes.length - 1 ? "1px solid var(--qc-hair-2)" : undefined }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="px-4 py-3.5" style={{ width: 48 }}>
                    <span className="tabular-nums" style={{ fontSize: "var(--qc-fz-11)", fontFamily: "var(--qc-font-mono)", color: "var(--qc-ink-2)" }}>
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </span>
                  </td>
                  {MF_COLUMNS.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"}`}>
                      {col.render(scheme)}
                    </td>
                  ))}
                  <td className="px-4 py-3.5" style={{ width: 40 }}>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: "var(--qc-ink)" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

// ── MF Screener section ────────────────────────────────────────────────────────

export function MfScreenerSection() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [planTypes, setPlanTypes] = useState<string[]>([]);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [amcSlug, setAmcSlug] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState("morningstar");
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
      {/* Basket quick-picks */}
      {!mfBasketsLoading && mfBasketsData && mfBasketsData.baskets.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {mfBasketsData.baskets.map((b) => (
              <button
                key={b.id}
                onClick={() => applyBasket(b.filter_params)}
                className="rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all border"
                style={{ borderColor: "var(--qc-ink-3)", background: "var(--qc-card)", color: "var(--qc-ink)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--qc-ink)";
                  e.currentTarget.style.color = "var(--qc-card)";
                  e.currentTarget.style.borderColor = "var(--qc-ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--qc-card)";
                  e.currentTarget.style.color = "var(--qc-ink)";
                  e.currentTarget.style.borderColor = "var(--qc-ink-3)";
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
        className="flex items-center gap-2 overflow-x-auto mb-3 px-3 py-2.5 rounded-[10px]"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--qc-ink-2)" }} />

        <div
          className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 shrink-0"
          style={{ background: "var(--qc-bg)", border: "1px solid var(--qc-hair)" }}
        >
          <Search className="h-3 w-3 shrink-0" style={{ color: "var(--qc-ink-2)" }} />
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search funds…"
            className="w-36 text-[12px] outline-none bg-transparent placeholder:text-[var(--qc-ink-2)]"
            style={{ color: "var(--qc-ink)" }}
          />
          {q && (
            <button onClick={() => { setQ(""); setPage(1); }}>
              <X className="h-3 w-3 hover:opacity-70" style={{ color: "var(--qc-ink-2)" }} />
            </button>
          )}
        </div>

        {filterOptions && (
          <>
            <FilterSelect label="Category" options={filterOptions.categories} value={categories} onChange={(v) => { setCategories(v); setPage(1); }} />
            <FilterSelect label="Risk" options={filterOptions.risks} value={risks} onChange={(v) => { setRisks(v); setPage(1); }} />
            <FilterSelect label="Plan Type" options={filterOptions.plan_types} value={planTypes} onChange={(v) => { setPlanTypes(v); setPage(1); }} />
            <RatingFilter value={rating} onChange={(v) => { setRating(v); setPage(1); }} />
            <div className="relative">
              <select
                value={amcSlug ?? ""}
                onChange={(e) => { setAmcSlug(e.target.value || undefined); setPage(1); }}
                className="appearance-none rounded-[8px] px-3 pr-7 py-1.5 text-[12px] outline-none cursor-pointer font-medium"
                style={
                  amcSlug
                    ? { border: "1px solid var(--qc-ink)", background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
                    : { border: "1px solid var(--qc-hair)", background: "var(--qc-bg)", color: "var(--qc-ink-2)" }
                }
              >
                <option value="">AMC</option>
                {amcOptions.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.name}</option>
                ))}
              </select>
              <ChevronRight
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-90"
                style={{ color: amcSlug ? "var(--qc-card)" : "var(--qc-ink-2)" }}
              />
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-3 shrink-0">
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] font-medium rounded-[6px] px-2 py-1 transition-colors"
              style={{ color: "var(--qc-ink-2)", background: "var(--qc-section)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--qc-hair)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--qc-section)")}
            >
              <X className="h-2.5 w-2.5" /> Clear all
            </button>
          )}
          {data && (
            <span className="text-[12px] font-medium tabular-nums" style={{ color: "var(--qc-ink)" }}>
              {data.total.toLocaleString()} funds
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <MfTable
        data={data}
        loading={loading}
        error={error}
        sort={sort}
        order={order}
        page={page}
        onSort={handleSort}
        onRowClick={(amfiCode) => router.push(`/screener/mutual-fund/${encodeURIComponent(amfiCode)}`)}
      />

      {!loading && data && data.total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
