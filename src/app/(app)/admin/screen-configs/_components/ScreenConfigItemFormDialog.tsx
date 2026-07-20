"use client";

import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { apiAuthPost, apiAuthPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import { KpiAbbrPicker } from "@/components/molecules/kpi-abbr-picker";
import {
  CompanyGroupOption,
  ScreenConfigItem,
  ScreenConfigItemResponse,
  SERIES_TYPE_OPTIONS,
  SeriesType,
} from "./types";

const BASE = `${BACKEND_URL}/admin/screen-configs`;
const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

interface Props {
  open: boolean;
  sectionKey: string;
  item: ScreenConfigItem | null;
  sectionDecimalPlaces?: number | null;
  abbrOptions: string[];
  companyGroups: CompanyGroupOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function ScreenConfigItemFormDialog({
  open,
  sectionKey,
  item,
  sectionDecimalPlaces,
  abbrOptions,
  companyGroups,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!item;

  const [kpiAbbr, setKpiAbbr] = useState(item?.kpi_abbr ?? "");
  const [label, setLabel] = useState(item?.label ?? "");
  const [displayOrder, setDisplayOrder] = useState(item?.display_order != null ? String(item.display_order) : "0");
  const [highlight, setHighlight] = useState(!!item?.highlight);
  const [expandable, setExpandable] = useState(!!item?.expandable);
  const [decimalPlaces, setDecimalPlaces] = useState(item?.decimal_places != null ? String(item.decimal_places) : "");
  const [companyGroupSlug, setCompanyGroupSlug] = useState(item?.company_group_slug ?? "");
  const [seriesType, setSeriesType] = useState<SeriesType | "">(item?.series_type ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSave() {
    const payload = {
      kpi_abbr: kpiAbbr.trim(),
      label: label.trim() || null,
      display_order: displayOrder.trim() ? Number(displayOrder) : 0,
      highlight,
      expandable,
      decimal_places: decimalPlaces.trim() ? Number(decimalPlaces) : null,
      company_group_slug: companyGroupSlug.trim() || null,
      series_type: seriesType || null,
    };

    const callbacks = {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: () => { onSaved(); onClose(); },
      onError: (err: string) => setError(err),
      onComplete: () => setSaving(false),
    };

    if (isEdit) {
      apiAuthPut<ScreenConfigItemResponse>(`${BASE}/${sectionKey}/items/${item!.id}`, callbacks, payload);
    } else {
      apiAuthPost<ScreenConfigItemResponse>(`${BASE}/${sectionKey}/items`, callbacks, payload);
    }
  }

  const canSave = kpiAbbr.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[480px] max-h-[85vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <p className="text-[14px] font-medium text-ink">{isEdit ? "Edit Item" : "Attach Metric"}</p>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className={LABEL_CLS}>KPI Abbr</label>
            <KpiAbbrPicker options={abbrOptions} value={kpiAbbr} onChange={setKpiAbbr} disabled={isEdit} />
            {isEdit && <p className="text-[11px] text-ink-3 mt-1">Detach and re-attach to point this row at a different KPI.</p>}
          </div>

          <div>
            <label className={LABEL_CLS}>Label override</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Use the KPI's own name"
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Display Order</label>
              <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL_CLS}>Decimal places override</label>
              <input
                type="number"
                min={0}
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(e.target.value)}
                placeholder={sectionDecimalPlaces != null ? `Section default (${sectionDecimalPlaces})` : "Section default"}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Company Group scope</label>
              <select value={companyGroupSlug} onChange={(e) => setCompanyGroupSlug(e.target.value)} className={INPUT_CLS}>
                <option value="">Show for everyone</option>
                {companyGroups.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Series type (charts only)</label>
              <select value={seriesType} onChange={(e) => setSeriesType(e.target.value as SeriesType | "")} className={INPUT_CLS}>
                <option value="">N/A</option>
                {SERIES_TYPE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            <CheckboxField checked={highlight} onChange={setHighlight} label="Highlight" hint="Bold/emphasized styling for this row." />
            <CheckboxField
              checked={expandable}
              onChange={setExpandable}
              label="Expandable"
              hint="Marks this row as having a drill-down (used on quarterly Revenue/Expenses today)."
            />
          </div>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
          {error ? (
            <div className="flex items-start gap-1.5 text-[12px] text-down max-w-[240px]">
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
              {isEdit ? "Save changes" : "Attach"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
