"use client";

import { useRef, useState } from "react";
import { X, Loader2, AlertCircle, Upload } from "lucide-react";
import { apiCall, apiPost, apiPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import {
  CompanyGroup,
  FilterType,
  DocFilter,
  DocStatus,
  WindowedDocFilter,
  WindowedRule,
  DynamicFilterConfig,
  FilterConfig,
  ResolveResult,
  isManualConfig,
} from "./types";

const BASE = `${BACKEND_URL}/admin/company-groups`;
const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

const EMPTY_DOC_FILTER: DocFilter = { status: "present" };

// Always represented in the UI as {status, rules} — a saved flat {window, minCount} (or no rules
// at all) is normalized into a single-clause rules array on load; we never re-emit the flat shape.
function initWindowedFilter(f?: WindowedDocFilter): WindowedDocFilter {
  if (!f) return { status: "present", rules: [{}] };
  const rules = f.rules && f.rules.length > 0 ? f.rules : [{ window: f.window, minCount: f.minCount }];
  return { status: f.status, rules };
}

interface Props {
  open: boolean;
  group: CompanyGroup | null;
  companies: string[];
  onClose: () => void;
  onSaved: () => void;
}

// Annual report: present/pending/extracted + single "latest N years" field.
function DocFilterBlock({
  label,
  hint,
  periodLabel,
  enabled,
  onEnabledChange,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  periodLabel: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  value: DocFilter;
  onChange: (v: DocFilter) => void;
}) {
  return (
    <div className="rounded-md border border-hair p-3">
      <CheckboxField checked={enabled} onChange={onEnabledChange} label={label} hint={hint} />
      {enabled && (
        <div className="mt-3 pl-5 space-y-3">
          <div>
            <label className="text-[10px] text-ink-3 block mb-1">Status</label>
            <select
              value={value.status}
              onChange={(e) => onChange({ ...value, status: e.target.value as DocStatus })}
              className={`${INPUT_CLS} w-64`}
            >
              <option value="present">Present</option>
              <option value="pending">Not yet extracted</option>
              <option value="extracted">Already extracted</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-ink-3 block mb-1">
              Only look at the N most recent {periodLabel}
            </label>
            <input
              type="number"
              min={1}
              value={value.lastN ?? ""}
              onChange={(e) => onChange({ ...value, lastN: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="All history"
              className={`${INPUT_CLS} w-40`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Transcript / PPT: present/pending/extracted + a repeatable list of {window, minCount} rules,
// ANDed together. Always serialized as `rules` — starts with exactly 1 row so existing groups
// look unchanged.
function WindowedDocFilterBlock({
  label,
  hint,
  enabled,
  onEnabledChange,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  value: WindowedDocFilter;
  onChange: (v: WindowedDocFilter) => void;
}) {
  const rows = value.rules && value.rules.length > 0 ? value.rules : [{}];

  function updateRow(idx: number, patch: Partial<WindowedRule>) {
    onChange({ ...value, rules: rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)) });
  }

  function addRow() {
    onChange({ ...value, rules: [...rows, {}] });
  }

  function removeRow(idx: number) {
    onChange({ ...value, rules: rows.filter((_, i) => i !== idx) });
  }

  return (
    <div className="rounded-md border border-hair p-3">
      <CheckboxField checked={enabled} onChange={onEnabledChange} label={label} hint={hint} />
      {enabled && (
        <div className="mt-3 pl-5 space-y-3">
          <div>
            <label className="text-[10px] text-ink-3 block mb-1">Status</label>
            <select
              value={value.status}
              onChange={(e) => onChange({ ...value, status: e.target.value as DocStatus })}
              className={`${INPUT_CLS} w-64`}
            >
              <option value="present">Present</option>
              <option value="pending">Not yet extracted</option>
              <option value="extracted">Already extracted</option>
            </select>
          </div>

          <div className="space-y-2">
            {rows.map((row, idx) => (
              <div key={idx} className="rounded-md border border-hair bg-secondary p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Rule {idx + 1}</p>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="flex items-center justify-center size-5 rounded text-ink-3 hover:text-ink transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <label className="text-[10px] text-ink-3 block mb-1">
                      Only look at the N most recent quarters
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={row.window ?? ""}
                      onChange={(e) => updateRow(idx, { window: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="All history"
                      className={`${INPUT_CLS} w-40 bg-card`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-3 block mb-1">
                      …of which at least this many must match
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={row.minCount ?? ""}
                      onChange={(e) => updateRow(idx, { minCount: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="All of them"
                      className={`${INPUT_CLS} w-40 bg-card`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-3 block mb-1">
                      …but no more than this many
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={row.maxCount ?? ""}
                      onChange={(e) => updateRow(idx, { maxCount: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="No limit"
                      className={`${INPUT_CLS} w-40 bg-card`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addRow} className="text-[12px] font-medium text-ink hover:underline">
            + Add another rule (AND)
          </button>

          <p className="text-[11px] text-ink-3">
            Each additional rule must ALSO be true (AND). E.g. rule 1 = &ldquo;8 and 4&rdquo; plus rule 2 =
            just &ldquo;6&rdquo; means: at least 4 of the last 8 quarters, AND at least 6 ever. Set
            minCount:0 with a low maxCount to find sparse coverage instead of good coverage (e.g. a
            backlog/gap finder).
          </p>
          <p className="text-[11px] text-ink-3">
            Leave minCount/maxCount blank to require all N, no gaps. Lower minCount to tolerate some gaps.
          </p>
        </div>
      )}
    </div>
  );
}

// Parent must remount this component (e.g. via a `key` that changes on each open) so these
// initial-state values re-derive from `group` fresh every time the dialog opens.
export function GroupFormDialog({ open, group, companies, onClose, onSaved }: Props) {
  const dyn = group && !isManualConfig(group) ? (group.filter_config as DynamicFilterConfig) : null;

  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [filterType, setFilterType] = useState<FilterType>(group?.filter_type ?? "manual");

  const [manualTickers, setManualTickers] = useState<string[]>(
    group && isManualConfig(group) ? group.filter_config.tickers ?? [] : []
  );
  const [csvUnmatched, setCsvUnmatched] = useState<string[] | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [nameRangeEnabled, setNameRangeEnabled] = useState(!!dyn?.nameRange);
  const [nameFrom, setNameFrom] = useState(dyn?.nameRange?.from ?? "");
  const [nameTo, setNameTo] = useState(dyn?.nameRange?.to ?? "");

  const [transcriptEnabled, setTranscriptEnabled] = useState(!!dyn?.transcript);
  const [transcript, setTranscript] = useState<WindowedDocFilter>(initWindowedFilter(dyn?.transcript));

  const [pptEnabled, setPptEnabled] = useState(!!dyn?.ppt);
  const [ppt, setPpt] = useState<WindowedDocFilter>(initWindowedFilter(dyn?.ppt));

  const [annualReportEnabled, setAnnualReportEnabled] = useState(!!dyn?.annualReport);
  const [annualReport, setAnnualReport] = useState<DocFilter>(dyn?.annualReport ?? EMPTY_DOC_FILTER);

  const [marketCapEnabled, setMarketCapEnabled] = useState(!!dyn?.marketCap);
  const [marketCapMin, setMarketCapMin] = useState(dyn?.marketCap?.min != null ? String(dyn.marketCap.min) : "");
  const [marketCapMax, setMarketCapMax] = useState(dyn?.marketCap?.max != null ? String(dyn.marketCap.max) : "");

  const [industriesEnabled, setIndustriesEnabled] = useState(!!dyn?.industries && dyn.industries.length > 0);
  const [industries, setIndustries] = useState<string[]>(dyn?.industries ?? []);

  const [currentSlug, setCurrentSlug] = useState<string | null>(group?.slug ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolveResult, setResolveResult] = useState<ResolveResult | null>(null);
  const [resolving, setResolving] = useState(false);

  if (!open) return null;

  function buildFilterConfig(): FilterConfig {
    if (filterType === "manual") return { tickers: manualTickers };
    const cfg: DynamicFilterConfig = {};
    if (nameRangeEnabled) cfg.nameRange = { from: nameFrom.trim().toUpperCase() || "A", to: nameTo.trim().toUpperCase() || "Z" };
    if (transcriptEnabled) cfg.transcript = transcript;
    if (pptEnabled) cfg.ppt = ppt;
    if (annualReportEnabled) cfg.annualReport = annualReport;
    if (marketCapEnabled) {
      cfg.marketCap = {
        min: marketCapMin.trim() ? Number(marketCapMin) : null,
        max: marketCapMax.trim() ? Number(marketCapMax) : null,
      };
    }
    if (industriesEnabled && industries.length > 0) cfg.industries = industries;
    return cfg;
  }

  const isEmptyDynamic =
    filterType === "dynamic" &&
    !nameRangeEnabled &&
    !transcriptEnabled &&
    !pptEnabled &&
    !annualReportEnabled &&
    !marketCapEnabled &&
    !(industriesEnabled && industries.length > 0);

  // Every non-empty comma/newline-separated token is treated as a candidate ticker (a handful of
  // common header labels are dropped so a "ticker"/"symbol" column header doesn't show up as a
  // false mismatch). Matched against the same `companies` universe TagMultiPicker autocompletes
  // against — there's no separate validation endpoint, this list IS the source of truth.
  function handleCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const HEADER_WORDS = new Set(["TICKER", "SYMBOL", "STOCK", "COMPANY", "NAME"]);
      const tokens = String(reader.result ?? "")
        .split(/[\r\n,]+/)
        .map((t) => t.trim().replace(/^"|"$/g, "").toUpperCase())
        .filter((t) => t.length > 0 && !HEADER_WORDS.has(t));
      const candidates = Array.from(new Set(tokens));

      const known = new Set(companies.map((c) => c.toUpperCase()));
      const matched = candidates.filter((t) => known.has(t));
      const unmatched = candidates.filter((t) => !known.has(t));

      setCsvUnmatched(unmatched.length > 0 ? unmatched : null);
      if (matched.length > 0) {
        setManualTickers((prev) => Array.from(new Set([...prev, ...matched])));
      }
    };
    reader.readAsText(file);
  }

  function handleCsvInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleCsvFile(file);
    e.target.value = "";
  }

  function doResolve(slug: string) {
    apiCall<{ success: boolean; data: ResolveResult }>(`${BASE}/${slug}/resolve`, {
      onStart: () => setResolving(true),
      onSuccess: (res) => setResolveResult(res.data),
      onError: () => {},
      onComplete: () => setResolving(false),
    });
  }

  function handleSave() {
    const payload = {
      name,
      description: description.trim() || undefined,
      filter_type: filterType,
      filter_config: buildFilterConfig(),
    };

    const callbacks = {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: (res: { success: boolean; data: CompanyGroup }) => {
        setCurrentSlug(res.data.slug);
        doResolve(res.data.slug);
        onSaved();
      },
      onError: (err: string) => setError(err),
      onComplete: () => setSaving(false),
    };

    if (currentSlug) {
      apiPut<{ success: boolean; data: CompanyGroup }>(`${BASE}/${currentSlug}`, callbacks, payload);
    } else {
      apiPost<{ success: boolean; data: CompanyGroup }>(BASE, callbacks, payload);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 flex flex-col w-[600px] max-h-[90vh] bg-card rounded-[10px] border border-hair shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hair shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
              {currentSlug ? "Edit Group" : "New Group"}
            </p>
            <p className="text-[15px] font-semibold text-ink mt-0.5">{name || "Untitled group"}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <label className={LABEL_CLS}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Large Cap Banks" className={INPUT_CLS} />
          </div>

          <div>
            <label className={LABEL_CLS}>Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the intent, so other admins understand it later…"
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Type</label>
            <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary">
              {(["manual", "dynamic"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                    filterType === t ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {t === "manual" ? "Manual list" : "Filter-based"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-3 mt-1.5">
              {filterType === "manual"
                ? "A fixed ticker list — static until you edit it."
                : "Recomputed live every time this group is used — never a frozen snapshot. Every filter below is ANDed together; there's no OR — if you need that, make two groups."}
            </p>
          </div>

          {filterType === "manual" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Tickers</label>
                <button
                  type="button"
                  onClick={() => csvInputRef.current?.click()}
                  className="flex items-center gap-1 text-[11px] font-medium text-ink hover:underline"
                >
                  <Upload className="size-3" /> Upload CSV
                </button>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleCsvInputChange}
                />
              </div>
              <TagMultiPicker options={companies} selected={manualTickers} onChange={setManualTickers} placeholder="Add a ticker…" />
              {csvUnmatched && csvUnmatched.length > 0 && (
                <div className="mt-2 flex items-start gap-2 rounded-md border border-hair bg-down-soft px-3 py-2 text-[12px] text-down">
                  <AlertCircle className="size-3.5 shrink-0 mt-px" />
                  <span>
                    {csvUnmatched.length} ticker{csvUnmatched.length === 1 ? "" : "s"} from the CSV didn&apos;t
                    match a known company and {csvUnmatched.length === 1 ? "wasn't" : "weren't"} added:{" "}
                    {csvUnmatched.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {filterType === "dynamic" && (
            <div className="space-y-3">
              <div className="rounded-md border border-hair p-3">
                <CheckboxField
                  checked={nameRangeEnabled}
                  onChange={setNameRangeEnabled}
                  label="Alphabet range"
                  hint="Ticker starts with a letter in this inclusive range."
                />
                {nameRangeEnabled && (
                  <div className="mt-3 pl-5 flex items-center gap-3">
                    <div>
                      <label className="text-[10px] text-ink-3 block mb-1">From</label>
                      <input
                        value={nameFrom}
                        onChange={(e) => setNameFrom(e.target.value.toUpperCase())}
                        placeholder="A"
                        className={`${INPUT_CLS} w-20 uppercase`}
                      />
                    </div>
                    <span className="text-ink-3 mt-4">–</span>
                    <div>
                      <label className="text-[10px] text-ink-3 block mb-1">To</label>
                      <input
                        value={nameTo}
                        onChange={(e) => setNameTo(e.target.value.toUpperCase())}
                        placeholder="Z"
                        className={`${INPUT_CLS} w-20 uppercase`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <WindowedDocFilterBlock
                label="Transcript"
                hint="Filter by transcript document status."
                enabled={transcriptEnabled}
                onEnabledChange={setTranscriptEnabled}
                value={transcript}
                onChange={setTranscript}
              />

              <WindowedDocFilterBlock
                label="PPT"
                hint="Filter by earnings-call PPT document status."
                enabled={pptEnabled}
                onEnabledChange={setPptEnabled}
                value={ppt}
                onChange={setPpt}
              />

              <DocFilterBlock
                label="Annual report"
                hint="Filter by annual report document status."
                periodLabel="years"
                enabled={annualReportEnabled}
                onEnabledChange={setAnnualReportEnabled}
                value={annualReport}
                onChange={setAnnualReport}
              />

              <div className="rounded-md border border-hair p-3">
                <CheckboxField
                  checked={marketCapEnabled}
                  onChange={setMarketCapEnabled}
                  label="Market cap range"
                  hint="In ₹ crore, using each company's latest known price."
                />
                {marketCapEnabled && (
                  <div className="mt-3 pl-5 flex items-center gap-3">
                    <div>
                      <label className="text-[10px] text-ink-3 block mb-1">Min (Cr)</label>
                      <input
                        type="number"
                        value={marketCapMin}
                        onChange={(e) => setMarketCapMin(e.target.value)}
                        placeholder="0"
                        className={`${INPUT_CLS} w-28`}
                      />
                    </div>
                    <span className="text-ink-3 mt-4">–</span>
                    <div>
                      <label className="text-[10px] text-ink-3 block mb-1">Max (Cr)</label>
                      <input
                        type="number"
                        value={marketCapMax}
                        onChange={(e) => setMarketCapMax(e.target.value)}
                        placeholder="no cap"
                        className={`${INPUT_CLS} w-28`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-hair p-3">
                <CheckboxField
                  checked={industriesEnabled}
                  onChange={setIndustriesEnabled}
                  label="Industry"
                  hint="Sector / basic-industry match."
                />
                {industriesEnabled && (
                  <div className="mt-3 pl-5">
                    <TagMultiPicker options={[]} selected={industries} onChange={setIndustries} uppercase={false} placeholder="e.g. Banks, NBFC…" />
                  </div>
                )}
              </div>

              {isEmptyDynamic && (
                <div className="flex items-center gap-2 rounded-md border border-hair bg-warn-soft px-3 py-2 text-[12px] text-warn">
                  <AlertCircle className="size-3.5 shrink-0" />
                  No filters selected — this group will always be empty.
                </div>
              )}
            </div>
          )}

          {resolveResult && (
            <div className="rounded-md border border-hair bg-up-soft px-3 py-2 text-[12px] text-up">
              This group currently matches <span className="font-semibold">{resolveResult.count}</span> companies.
            </div>
          )}
          {resolving && (
            <div className="flex items-center gap-2 text-[12px] text-ink-3">
              <Loader2 className="size-3.5 animate-spin" /> Resolving live count…
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
              {currentSlug ? "Done" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {currentSlug ? "Save changes" : "Create group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
