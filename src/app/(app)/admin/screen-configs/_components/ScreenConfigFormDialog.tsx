"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { apiAuthGet, apiAuthPost, apiAuthPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ScreenConfigItemsPanel } from "./ScreenConfigItemsPanel";
import { ScreenConfigKpiGroupRowsPanel } from "./ScreenConfigKpiGroupRowsPanel";
import { CompanyGroupOption, KNOWN_SECTION_KEYS, ScreenConfig, ScreenConfigFrequency, ScreenConfigResponse } from "./types";
import { KpiGroupNode, KpiGroupTreeResponse, flattenTree } from "../../kpi-groups/_components/types";

const BASE = `${BACKEND_URL}/admin/screen-configs`;
const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

interface Props {
  open: boolean;
  section: ScreenConfig | null;
  abbrOptions: string[];
  companyGroups: CompanyGroupOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function ScreenConfigFormDialog({ open, section, abbrOptions, companyGroups, onClose, onSaved }: Props) {
  const isEdit = !!section;

  const [key, setKey] = useState(section?.key ?? "");
  const [label, setLabel] = useState(section?.label ?? "");
  const [endpoint, setEndpoint] = useState(section?.endpoint ?? "");
  const [periodsShown, setPeriodsShown] = useState(section?.periods_shown != null ? String(section.periods_shown) : "");
  const [decimalPlaces, setDecimalPlaces] = useState(section?.decimal_places != null ? String(section.decimal_places) : "2");
  const [frequency, setFrequency] = useState<ScreenConfigFrequency | "">(section?.frequency ?? "");
  const [kpiGroupSlug, setKpiGroupSlug] = useState(section?.kpi_group_slug ?? "");

  const [currentKey, setCurrentKey] = useState<string | null>(section?.key ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kpiGroupTree, setKpiGroupTree] = useState<KpiGroupNode[]>([]);
  useEffect(() => {
    apiAuthGet<KpiGroupTreeResponse>(`${BACKEND_URL}/admin/kpi-groups/tree`, {
      onSuccess: (res) => setKpiGroupTree(res.data ?? []),
      onError: () => {},
    });
  }, []);
  const branchOptions = flattenTree(kpiGroupTree).filter((n) => !n.kpi_abbr);

  if (!open) return null;

  function handleSave() {
    const payload = {
      key: key.trim(),
      label: label.trim(),
      endpoint: endpoint.trim() || null,
      periods_shown: periodsShown.trim() ? Number(periodsShown) : null,
      decimal_places: decimalPlaces.trim() ? Number(decimalPlaces) : null,
      frequency: frequency || null,
      kpi_group_slug: kpiGroupSlug.trim() || null,
    };

    const callbacks = {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: (res: ScreenConfigResponse) => {
        setCurrentKey(res.data.key);
        onSaved();
      },
      onError: (err: string) => setError(err),
      onComplete: () => setSaving(false),
    };

    if (currentKey) {
      apiAuthPut<ScreenConfigResponse>(`${BASE}/${currentKey}`, callbacks, payload);
    } else {
      apiAuthPost<ScreenConfigResponse>(BASE, callbacks, payload);
    }
  }

  const canSave = key.trim().length > 0 && label.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[600px] max-h-[90vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
              {currentKey ? "Edit Section" : "New Section"}
            </p>
            <p className="text-[15px] font-semibold text-ink mt-0.5">{label || "Untitled section"}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className={LABEL_CLS}>Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={isEdit}
              list="screen-config-known-keys"
              placeholder="financials.pnl.annual"
              className={`${INPUT_CLS} font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <datalist id="screen-config-known-keys">
              {KNOWN_SECTION_KEYS.map((k) => <option key={k} value={k} />)}
            </datalist>
            <p className="text-[11px] text-ink-3 mt-1">
              Stable ID the backend looks up directly — not renameable once created.
            </p>
          </div>

          <div>
            <label className={LABEL_CLS}>Label</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Admin-facing name"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Endpoint note</label>
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="e.g. GET /api/screener/:symbol/financials — documentation only"
              className={`${INPUT_CLS} font-mono`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Periods shown</label>
              <input
                type="number"
                min={1}
                value={periodsShown}
                onChange={(e) => setPeriodsShown(e.target.value)}
                placeholder="All available"
                className={INPUT_CLS}
              />
              <p className="text-[11px] text-ink-3 mt-1">Trailing count. Blank = show everything available.</p>
            </div>
            <div>
              <label className={LABEL_CLS}>Decimal places (default)</label>
              <input
                type="number"
                min={0}
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(e.target.value)}
                className={INPUT_CLS}
              />
              <p className="text-[11px] text-ink-3 mt-1">Applies to every metric here unless overridden per item.</p>
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ScreenConfigFrequency | "")}
              className={INPUT_CLS}
            >
              <option value="">Backend default</option>
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="daily">Daily</option>
            </select>
            <p className="text-[11px] text-ink-3 mt-1">Which cadence this section resolves at.</p>
          </div>

          <div>
            <label className={LABEL_CLS}>KPI Group branch (rows source)</label>
            <select value={kpiGroupSlug} onChange={(e) => setKpiGroupSlug(e.target.value)} className={INPUT_CLS}>
              <option value="">— Use manually attached metrics below —</option>
              {branchOptions.map((n) => (
                <option key={n.id} value={n.slug}>{n.label} ({n.slug})</option>
              ))}
            </select>
            <p className="text-[11px] text-ink-3 mt-1">
              When set, this section&rsquo;s rows come from that KPI Group branch&rsquo;s children (managed via
              /admin/kpi-groups) instead of the manually attached metrics below.
            </p>
          </div>

          {currentKey ? (
            kpiGroupSlug.trim() ? (
              <ScreenConfigKpiGroupRowsPanel
                branchSlug={kpiGroupSlug.trim()}
                abbrOptions={abbrOptions}
                companyGroups={companyGroups}
              />
            ) : (
              <ScreenConfigItemsPanel
                sectionKey={currentKey}
                sectionDecimalPlaces={decimalPlaces.trim() ? Number(decimalPlaces) : null}
                abbrOptions={abbrOptions}
                companyGroups={companyGroups}
              />
            )
          ) : (
            <div className="rounded-md border border-hair bg-secondary px-3 py-2 text-[12px] text-ink-3">
              Save the section first, then attach metrics.
            </div>
          )}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
          {error ? <p className="text-xs text-down max-w-[280px]">{error}</p> : <span />}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink-3 hover:text-ink hover:border-ink transition-colors"
            >
              {currentKey ? "Done" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {currentKey ? "Save changes" : "Create section"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
