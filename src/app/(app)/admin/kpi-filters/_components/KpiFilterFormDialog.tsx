"use client";

import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { apiAuthPost, apiAuthPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiAbbrPicker } from "@/components/molecules/kpi-abbr-picker";
import { KpiFilter, KpiFilterResponse, OPERATORS, Operator } from "./types";

const BASE = `${BACKEND_URL}/admin/kpi-filters`;
const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

interface Props {
  open: boolean;
  filter: KpiFilter | null;
  onClose: () => void;
  onSaved: () => void;
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function KpiFilterFormDialog({ open, filter, onClose, onSaved }: Props) {
  const isEdit = !!filter;

  const [label, setLabel] = useState(filter?.label ?? "");
  const [slug, setSlug] = useState(filter?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [kpiAbbr, setKpiAbbr] = useState(filter?.kpi_abbr ?? "");
  const [operator, setOperator] = useState<Operator>(filter?.operator ?? ">");
  const [value, setValue] = useState(filter?.value != null ? String(filter.value) : "");
  const [valueMax, setValueMax] = useState(filter?.value_max != null ? String(filter.value_max) : "");
  const [frequency, setFrequency] = useState(filter?.frequency ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSave() {
    const payload = {
      slug: slug.trim() || slugify(label),
      label: label.trim(),
      kpi_abbr: kpiAbbr.trim(),
      operator,
      value: Number(value),
      value_max: operator === "between" ? Number(valueMax) : null,
      frequency: frequency || null,
    };

    const callbacks = {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: () => { onSaved(); onClose(); },
      onError: (err: string) => setError(err),
      onComplete: () => setSaving(false),
    };

    if (isEdit) {
      apiAuthPut<KpiFilterResponse>(`${BASE}/${filter!.slug}`, callbacks, payload);
    } else {
      apiAuthPost<KpiFilterResponse>(BASE, callbacks, payload);
    }
  }

  const canSave =
    label.trim() &&
    kpiAbbr.trim() &&
    value.trim() &&
    (operator !== "between" || valueMax.trim()) &&
    (isEdit || !!frequency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[520px] max-h-[85vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <p className="text-[14px] font-medium text-ink">{isEdit ? "Edit KPI Filter" : "New KPI Filter"}</p>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className={LABEL_CLS}>Label</label>
            <input
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="High EBITDA"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Slug</label>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              disabled={isEdit}
              placeholder="high-ebitda"
              className={`${INPUT_CLS} font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>KPI Abbr</label>
            <KpiAbbrPicker value={kpiAbbr} onChange={setKpiAbbr} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Operator</label>
              <select value={operator} onChange={(e) => setOperator(e.target.value as Operator)} className={INPUT_CLS}>
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>{o.value} ({o.label})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Frequency{isEdit ? " (optional)" : ""}</label>
              <select value={frequency ?? ""} onChange={(e) => setFrequency((e.target.value || null) as typeof frequency)} className={INPUT_CLS}>
                {/* "Any" only makes sense once a filter already exists — creating one now requires
                    an explicit frequency (backend 422s a create without it); PUT stays optional/partial. */}
                {!isEdit && <option value="" disabled>Select…</option>}
                {isEdit && <option value="">Any</option>}
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="daily">Daily</option>
              </select>
              {!isEdit && !frequency && (
                <p className="text-[11px] text-warn mt-1">Required when creating a filter.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Value</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="500" className={INPUT_CLS} />
            </div>
            {operator === "between" && (
              <div>
                <label className={LABEL_CLS}>Value Max</label>
                <input type="number" value={valueMax} onChange={(e) => setValueMax(e.target.value)} placeholder="1000" className={INPUT_CLS} />
              </div>
            )}
          </div>
          <p className="text-[11px] text-ink-3">
            Compared against the KPI&apos;s raw stored value (e.g. ₹ Crore for financial-statement KPIs)
            — not the display-scaled numbers the screener sometimes shows.
          </p>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
          {error ? (
            <div className="flex items-start gap-1.5 text-[12px] text-down max-w-[260px]">
              <AlertCircle className="size-3.5 shrink-0 mt-px" /> {error}
            </div>
          ) : <span />}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink-3 hover:text-ink hover:border-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
