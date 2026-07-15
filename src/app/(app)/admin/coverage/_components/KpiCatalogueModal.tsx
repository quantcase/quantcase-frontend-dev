"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Search, X } from "lucide-react";
import { apiAuthGet, apiAuthPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Kpi, KpiCreateResponse, KpisResponse } from "./types";

const BASE = `${BACKEND_URL}/admin/kpis`;

const INPUT_CLS =
  "rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-[var(--qc-ink)]";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

const EMPTY_FORM = { abbr: "", full_form: "", denomination: "", kpi_type: "", industry: "", prowess_name: "" };

interface Props {
  onClose: () => void;
}

export function KpiCatalogueModal({ onClose }: Props) {
  const [search, setSearch] = useState("");
  const [kpis, setKpis] = useState<Kpi[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<Kpi | null>(null);

  function load(q: string) {
    const params = new URLSearchParams({ limit: "50" });
    if (q.trim()) params.set("search", q.trim());
    apiAuthGet<KpisResponse>(`${BASE}?${params}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setKpis(res.data),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }

  useEffect(() => {
    load("");
  }, []);

  function createKpi() {
    const abbr = form.abbr.trim();
    if (!abbr || !form.full_form.trim()) return;
    apiAuthPost<KpiCreateResponse>(
      BASE,
      {
        onStart: () => { setCreating(true); setCreateError(null); },
        onSuccess: (res) => {
          setCreated(res.data);
          load(search);
        },
        onError: setCreateError,
        onComplete: () => setCreating(false),
      },
      {
        abbr,
        full_form: form.full_form.trim(),
        denomination: form.denomination.trim(),
        kpi_type: form.kpi_type.trim(),
        industry: form.industry
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        prowess_name: form.prowess_name.trim(),
      }
    );
  }

  function startAnother() {
    setForm(EMPTY_FORM);
    setCreated(null);
    setCreateError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[760px] max-h-[85vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-ink">KPI Catalogue</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <p className="text-[12px] text-ink-3">
            Every column in a Prowess CSV export must map to a KPI here (FK-enforced). Create the
            missing indicator before re-running the preview.
          </p>

          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <label className={LABEL_CLS}>Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") load(search); }}
                  placeholder="abbr or full form"
                  className={`${INPUT_CLS} w-56`}
                />
              </div>
              <button
                onClick={() => load(search)}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-sm font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                Search
              </button>
            </div>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity"
            >
              <Plus className="size-3.5" /> New KPI
            </button>
          </div>

          {showCreate && (
            <div className="rounded-[10px] border border-hair bg-secondary p-3 space-y-3">
              {createError && (
                <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
                  <AlertCircle className="size-3.5 shrink-0" /> {createError}
                </div>
              )}
              {created ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-md border border-up bg-up-soft px-3 py-2 text-[12px] text-up">
                    <CheckCircle2 className="size-3.5 shrink-0" /> Created {created.abbr}.
                  </div>
                  <button onClick={startAnother} className="text-[12px] text-ink-3 hover:text-ink">
                    Add another
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_CLS}>Abbr</label>
                      <input
                        value={form.abbr}
                        onChange={(e) => setForm({ ...form, abbr: e.target.value })}
                        placeholder="NET_DEBT_EQ"
                        className={`${INPUT_CLS} w-full font-mono uppercase`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Full Form</label>
                      <input
                        value={form.full_form}
                        onChange={(e) => setForm({ ...form, full_form: e.target.value })}
                        placeholder="Net Debt to Equity"
                        className={`${INPUT_CLS} w-full`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Denomination</label>
                      <input
                        value={form.denomination}
                        onChange={(e) => setForm({ ...form, denomination: e.target.value })}
                        placeholder="ratio"
                        className={`${INPUT_CLS} w-full`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>KPI Type</label>
                      <input
                        value={form.kpi_type}
                        onChange={(e) => setForm({ ...form, kpi_type: e.target.value })}
                        placeholder="profit_lines"
                        className={`${INPUT_CLS} w-full`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Industry (comma-separated)</label>
                      <input
                        value={form.industry}
                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        placeholder="Banking"
                        className={`${INPUT_CLS} w-full`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Prowess Name (CSV column)</label>
                      <input
                        value={form.prowess_name}
                        onChange={(e) => setForm({ ...form, prowess_name: e.target.value })}
                        placeholder="Net Debt/Equity"
                        className={`${INPUT_CLS} w-full`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={createKpi}
                    disabled={creating || !form.abbr.trim() || !form.full_form.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {creating && <Loader2 className="size-3.5 animate-spin" />}
                    Create
                  </button>
                </>
              )}
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down">
              <AlertCircle className="size-4 shrink-0" /> {error}
            </div>
          )}
          {loading && !kpis && (
            <div className="flex items-center gap-2 text-sm text-ink-3">
              <Loader2 className="size-4 animate-spin" /> Loading KPIs…
            </div>
          )}

          {kpis && !loading && (
            kpis.length === 0 ? (
              <p className="text-[12px] text-ink-3">No KPIs match this search.</p>
            ) : (
              <div className="rounded-[10px] border border-hair bg-card overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary border-b border-hair">
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Abbr</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Full Form</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Denom.</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Type</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Industry</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-ink-3">Prowess Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((k) => (
                      <tr key={k.id ?? k.abbr} className="border-b border-hair last:border-0">
                        <td className="px-3 py-2 text-ink font-medium font-mono whitespace-nowrap">{k.abbr}</td>
                        <td className="px-3 py-2 text-ink">{k.full_form}</td>
                        <td className="px-3 py-2 text-ink-3 whitespace-nowrap">{k.denomination}</td>
                        <td className="px-3 py-2 text-ink-3 whitespace-nowrap">{k.kpi_type}</td>
                        <td className="px-3 py-2 text-ink-3">{k.industry.join(", ")}</td>
                        <td className="px-3 py-2 text-ink-3 font-mono">{k.prowess_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
