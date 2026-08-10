"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { apiAuthGet, apiAuthPost, apiAuthPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiAbbrPicker } from "@/components/molecules/kpi-abbr-picker";
import {
  Kpi,
  KpiFrequency,
  KpiResponse,
  KpisResponse,
  PreviewResponse,
  PreviewResult,
  ValidateFormulaResponse,
  ValidateFormulaResult,
} from "./types";

const BASE = `${BACKEND_URL}/admin/kpis`;
const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

const FUNCTIONS = ["CAGR(", "AVG(", "SUM(", "DELTA(", "MAX(", "MIN(", "COALESCE("];

interface Props {
  open: boolean;
  kpi: Kpi | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Bare identifier token ([A-Z][A-Z0-9_]*) touching the given cursor position, if any. */
function tokenAtCursor(text: string, pos: number): { token: string; start: number; end: number } | null {
  let start = pos;
  let end = pos;
  while (start > 0 && /[A-Za-z0-9_]/.test(text[start - 1])) start--;
  while (end < text.length && /[A-Za-z0-9_]/.test(text[end])) end++;
  const token = text.slice(start, end);
  if (!token || !/^[A-Za-z][A-Za-z0-9_]*$/.test(token)) return null;
  return { token, start, end };
}

export function KpiFormDialog({ open, kpi, onClose, onSaved }: Props) {
  const isEdit = !!kpi;

  const [abbr, setAbbr] = useState(kpi?.abbr ?? "");
  const [fullForm, setFullForm] = useState(kpi?.full_form ?? "");
  const denomination = kpi?.denomination ?? "";
  const kpiType = kpi?.kpi_type ?? "";
  const unitLabel = kpi?.unit_label ?? "";
  const [description, setDescription] = useState(kpi?.description ?? "");

  const [mode, setMode] = useState<"raw" | "computed">(kpi?.formula_expression ? "computed" : "raw");
  const [prowessName, setProwessName] = useState(kpi?.prowess_name ?? "");
  const [quarterlyProwessName, setQuarterlyProwessName] = useState(kpi?.quarterly_prowess_name ?? "");
  const [formula, setFormula] = useState(kpi?.formula_expression ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live validate-formula (debounced on every change while composing a formula)
  const [validation, setValidation] = useState<ValidateFormulaResult | null>(null);
  const [validating, setValidating] = useState(false);
  const validateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live abbr-autocomplete for the token under the cursor
  const [tokenMatches, setTokenMatches] = useState<{ abbr: string; full_form: string }[]>([]);
  const [tokenRange, setTokenRange] = useState<{ start: number; end: number } | null>(null);
  const tokenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fallbackAbbrs, setFallbackAbbrs] = useState<string[]>(kpi?.fallback_abbrs ?? []);
  const [addFallback, setAddFallback] = useState("");

  // Preview against real data (edit mode only — the endpoint resolves a persisted KPI)
  const [previewSymbol, setPreviewSymbol] = useState("");
  // Required by the backend now (no more silent default to "annual") — always has a value.
  const [previewFrequency, setPreviewFrequency] = useState<KpiFrequency>("annual");
  const [resampleMode, setResampleMode] = useState<"" | "average" | "latest">("");
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function scheduleValidate(text: string) {
    if (validateTimer.current) clearTimeout(validateTimer.current);
    if (!text.trim()) { setValidation(null); return; }
    validateTimer.current = setTimeout(() => {
      apiAuthPost<ValidateFormulaResponse>(
        `${BASE}/validate-formula`,
        {
          onStart: () => setValidating(true),
          onSuccess: (res) => setValidation(res.data),
          onError: () => setValidation(null),
          onComplete: () => setValidating(false),
        },
        { formula_expression: text.trim() }
      );
    }, 500);
  }

  function setSourceMode(m: "raw" | "computed") {
    setMode(m);
    if (m === "computed") scheduleValidate(formula);
    else { if (validateTimer.current) clearTimeout(validateTimer.current); setValidation(null); }
  }

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current;
    if (!el) { setFormula((f) => f + snippet); return; }
    const start = el.selectionStart ?? formula.length;
    const end = el.selectionEnd ?? formula.length;
    const next = formula.slice(0, start) + snippet + formula.slice(end);
    setFormula(next);
    setTokenMatches([]);
    setTokenRange(null);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function handleFormulaChange(text: string) {
    setFormula(text);
    updateTokenMatches(text);
    scheduleValidate(text);
  }

  function updateTokenMatches(text: string) {
    const el = textareaRef.current;
    const pos = el?.selectionStart ?? text.length;
    const hit = tokenAtCursor(text, pos);
    if (!hit) { setTokenMatches([]); setTokenRange(null); return; }
    setTokenRange({ start: hit.start, end: hit.end });
    if (tokenTimer.current) clearTimeout(tokenTimer.current);
    tokenTimer.current = setTimeout(() => {
      apiAuthGet<KpisResponse>(`${BASE}?search=${encodeURIComponent(hit.token)}`, {
        onSuccess: (res) => setTokenMatches((res.data ?? []).slice(0, 8).map((k) => ({ abbr: k.abbr, full_form: k.full_form }))),
        onError: () => setTokenMatches([]),
      });
    }, 250);
  }

  function pickToken(pickedAbbr: string) {
    if (!tokenRange) return;
    const next = formula.slice(0, tokenRange.start) + pickedAbbr + formula.slice(tokenRange.end);
    setFormula(next);
    setTokenMatches([]);
    const start = tokenRange.start;
    setTokenRange(null);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      const pos = start + pickedAbbr.length;
      textareaRef.current?.setSelectionRange(pos, pos);
    });
  }

  function addFallbackAbbr() {
    if (!addFallback || fallbackAbbrs.includes(addFallback)) return;
    setFallbackAbbrs((prev) => [...prev, addFallback]);
    setAddFallback("");
  }

  function moveFallback(idx: number, dir: -1 | 1) {
    const next = [...fallbackAbbrs];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setFallbackAbbrs(next);
  }

  function removeFallback(idx: number) {
    setFallbackAbbrs((prev) => prev.filter((_, i) => i !== idx));
  }

  function runPreview() {
    if (!isEdit || !previewSymbol.trim()) return;
    // frequency is required by the backend now — always sent, never omitted.
    const params = new URLSearchParams({ symbol: previewSymbol.trim().toUpperCase(), frequency: previewFrequency });
    if (previewFrequency === "daily" && resampleMode) params.set("resample_mode", resampleMode);
    apiAuthGet<PreviewResponse>(`${BASE}/${kpi!.abbr}/preview?${params}`, {
      onStart: () => { setPreviewing(true); setPreviewError(null); },
      onSuccess: (res) => setPreviewResult(res.data),
      onError: setPreviewError,
      onComplete: () => setPreviewing(false),
    });
  }

  function handleSave() {
    const payload = {
      abbr: abbr.trim().toUpperCase(),
      full_form: fullForm.trim(),
      formula_expression: mode === "computed" ? formula.trim() || null : null,
      // The backend only touches fields present as a key in the body — omitted/undefined always
      // means "leave unchanged," never "clear." To actually clear a field we must send an
      // explicit null (or [] for the array field), not let it collapse to undefined.
      fallback_abbrs: fallbackAbbrs,
      unit_label: unitLabel.trim() || null,
      kpi_type: kpiType.trim() || null,
      denomination: denomination.trim() || null,
      description: description.trim() || null,
      prowess_name: mode === "raw" ? prowessName.trim() || null : null,
      quarterly_prowess_name: mode === "raw" ? quarterlyProwessName.trim() || null : null,
    };

    const callbacks = {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: () => { onSaved(); onClose(); },
      onError: (err: string) => setError(err),
      onComplete: () => setSaving(false),
    };

    if (isEdit) {
      apiAuthPut<KpiResponse>(`${BASE}/${kpi!.abbr}`, callbacks, payload);
    } else {
      apiAuthPost<KpiResponse>(BASE, callbacks, payload);
    }
  }

  const missingFields = [
    !abbr.trim() && "Abbr",
    !fullForm.trim() && "Full Form",
  ].filter((f): f is string => !!f);
  const canSave = missingFields.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[820px] max-h-[90vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3">
              {isEdit ? "Edit KPI" : "New KPI"}
            </p>
            <p className="text-[15px] font-semibold text-ink mt-0.5 font-mono">{abbr || "UNTITLED"}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Abbr</label>
              <input
                value={abbr}
                onChange={(e) => setAbbr(e.target.value.toUpperCase())}
                disabled={isEdit}
                placeholder="NET_DEBT_EQ"
                className={`${INPUT_CLS} font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Full Form</label>
              <input value={fullForm} onChange={(e) => setFullForm(e.target.value)} placeholder="Net Debt to Equity" className={INPUT_CLS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLS}>Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this metric represents…"
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Source</label>
            <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary">
              {(["raw", "computed"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSourceMode(m)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                    mode === m ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {m === "raw" ? "Raw value (Prowess CSV)" : "Computed (formula)"}
                </button>
              ))}
            </div>
          </div>

          {mode === "raw" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Annual CSV column name</label>
                <input
                  value={prowessName}
                  onChange={(e) => setProwessName(e.target.value)}
                  placeholder="Net Debt/Equity"
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Quarterly CSV column name</label>
                <input
                  value={quarterlyProwessName}
                  onChange={(e) => setQuarterlyProwessName(e.target.value)}
                  placeholder="Total income"
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className={LABEL_CLS}>Formula Expression</label>
              <div className="flex flex-wrap items-center gap-1.5">
                {FUNCTIONS.map((fn) => (
                  <button
                    key={fn}
                    type="button"
                    onClick={() => insertAtCursor(fn)}
                    className="rounded-sm bg-secondary text-ink-3 hover:text-ink text-[11px] font-mono px-1.5 py-0.5 transition-colors"
                  >
                    {fn}
                  </button>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                rows={3}
                value={formula}
                onChange={(e) => handleFormulaChange(e.target.value)}
                onKeyUp={() => updateTokenMatches(formula)}
                onClick={() => updateTokenMatches(formula)}
                onBlur={() => { setTokenMatches([]); setTokenRange(null); }}
                placeholder="PAT / REV_OP * 100"
                className={`${INPUT_CLS} font-mono resize-none`}
              />

              {tokenMatches.length > 0 && (
                <div className="rounded-md border border-hair bg-card shadow-lg divide-y divide-[var(--qc-hair)] max-h-[160px] overflow-y-auto">
                  {tokenMatches.map((m) => (
                    <button
                      key={m.abbr}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); pickToken(m.abbr); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary transition-colors"
                    >
                      <span className="text-[12px] font-mono font-medium text-ink">{m.abbr}</span>
                      <span className="text-[11px] text-ink-3 ml-2">{m.full_form}</span>
                    </button>
                  ))}
                </div>
              )}

              {validating && (
                <p className="flex items-center gap-1.5 text-[11px] text-ink-3">
                  <Loader2 className="size-3 animate-spin" /> Validating…
                </p>
              )}
              {!validating && validation && (
                <div className="space-y-1.5">
                  <div className={`flex items-center gap-1.5 text-[12px] ${validation.valid ? "text-up" : "text-down"}`}>
                    {validation.valid ? <CheckCircle2 className="size-3.5 shrink-0" /> : <AlertCircle className="size-3.5 shrink-0" />}
                    {validation.valid ? "Valid formula" : validation.error}
                  </div>
                  {validation.referenced_abbrs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {validation.referenced_abbrs.map((r) => (
                        <span
                          key={r.abbr}
                          title={r.full_form}
                          className={`text-[10px] font-mono rounded-sm px-1.5 py-0.5 ${
                            r.exists ? "text-ink-3 bg-secondary" : "text-down bg-down-soft"
                          }`}
                        >
                          {r.abbr}{!r.exists && " — not found"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-ink-3">
                Grammar: <code className="font-mono">+ - * / ( )</code>, bare metric-abbr references, and{" "}
                <code className="font-mono">CAGR/AVG/SUM/DELTA(abbr, window?)</code>,{" "}
                <code className="font-mono">MAX/MIN/COALESCE(a, b, …)</code>. No <code className="font-mono">%</code>{" "}
                operator — write percentages as <code className="font-mono">* 100</code>. No exponent (
                <code className="font-mono">^</code>) support.
              </p>
            </div>
          )}

          <div>
            <label className={LABEL_CLS}>Fallback Chain</label>
            <p className="text-[11px] text-ink-3 mb-2">Tried in order if this metric resolves null.</p>
            {fallbackAbbrs.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {fallbackAbbrs.map((f, idx) => (
                  <div key={f} className="flex items-center gap-2 rounded-md border border-hair px-2.5 py-1.5">
                    <span className="text-[10px] text-ink-3 w-4 shrink-0">{idx + 1}</span>
                    <span className="flex-1 text-[12px] font-mono text-ink">{f}</span>
                    <button
                      type="button"
                      onClick={() => moveFallback(idx, -1)}
                      disabled={idx === 0}
                      className="text-ink-3 hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFallback(idx, 1)}
                      disabled={idx === fallbackAbbrs.length - 1}
                      className="text-ink-3 hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => removeFallback(idx)} className="text-ink-3 hover:text-down">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <KpiAbbrPicker value={addFallback} onChange={setAddFallback} placeholder="Search KPI to add as fallback…" />
              </div>
              <button
                type="button"
                onClick={addFallbackAbbr}
                disabled={!addFallback}
                className="flex items-center gap-1 rounded-md border border-hair px-3 py-2 text-[12px] font-medium text-ink hover:border-ink disabled:opacity-40 transition-colors shrink-0"
              >
                <Plus className="size-3.5" /> Add
              </button>
            </div>
          </div>

          {isEdit && (
            <div className="rounded-md border border-hair p-3 space-y-3">
              <div>
                <p className={`${LABEL_CLS} mb-0.5`}>Preview (against real data)</p>
                <p className="text-[11px] text-ink-3">
                  Resolves through the same resolver production uses. Reflects the last saved version of
                  this KPI — save your changes above, then preview.
                </p>
              </div>
              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="text-[10px] text-ink-3 block mb-1">Symbol</label>
                  <input
                    value={previewSymbol}
                    onChange={(e) => setPreviewSymbol(e.target.value.toUpperCase())}
                    placeholder="RELIANCE"
                    className={`${INPUT_CLS} w-36 font-mono`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-3 block mb-1">Frequency</label>
                  <select value={previewFrequency} onChange={(e) => setPreviewFrequency(e.target.value as KpiFrequency)} className={`${INPUT_CLS} w-32`}>
                    <option value="annual">Annual</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                {previewFrequency === "daily" && (
                  <div>
                    <label className="text-[10px] text-ink-3 block mb-1">Resample</label>
                    <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary">
                      {([
                        { value: "" as const, label: "Default" },
                        { value: "average" as const, label: "Average" },
                      ]).map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setResampleMode(opt.value)}
                          className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                            resampleMode === opt.value ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={runPreview}
                  disabled={!previewSymbol.trim() || previewing}
                  className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-2 text-[12px] font-medium text-ink hover:border-ink disabled:opacity-40 transition-colors"
                >
                  {previewing && <Loader2 className="size-3.5 animate-spin" />}
                  Run Preview
                </button>
              </div>

              {previewError && (
                <div className="flex items-center gap-2 text-[12px] text-down">
                  <AlertCircle className="size-3.5 shrink-0" /> {previewError}
                </div>
              )}

              {previewResult && (
                <div className="rounded-md bg-secondary p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[20px] font-mono font-semibold text-ink">
                      {previewResult.value ?? "—"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-ink-3 bg-card rounded-sm px-1.5 py-0.5 border border-hair">
                      {previewResult.source}
                    </span>
                    {previewResult.source_type && (
                      <span className="text-[10px] uppercase tracking-wider text-ink-3 bg-card rounded-sm px-1.5 py-0.5 border border-hair">
                        {previewResult.source_type}
                      </span>
                    )}
                    {previewResult.fallbackAbbr && (
                      <span className="text-[10px] text-warn">via fallback: {previewResult.fallbackAbbr}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-ink">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">As of</span>
                    {previewResult.period ? (
                      <span className="font-mono">
                        {previewResult.period.frequency === "daily"
                          ? previewResult.period.date
                          : `${previewResult.period.quarter} ${previewResult.period.fiscal_year}`}
                      </span>
                    ) : (
                      <span className="text-ink-3">not returned for this preview</span>
                    )}
                  </div>
                  {previewResult.trace.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Built from</p>
                      {previewResult.trace.map((t) => (
                        <div key={t.abbr} className="flex items-center gap-2 text-[12px]">
                          <span className="font-mono text-ink">{t.abbr}</span>
                          <span className="text-ink-3">= {t.value ?? "—"}</span>
                          <span className="text-[10px] text-ink-3">
                            ({t.source}{t.source_type ? `, ${t.source_type}` : ""}{t.fallbackAbbr ? `, via ${t.fallbackAbbr}` : ""})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
          {error ? (
            <div className="flex items-start gap-1.5 text-[12px] text-down max-w-[420px]">
              <AlertCircle className="size-3.5 shrink-0 mt-px" /> {error}
            </div>
          ) : missingFields.length > 0 ? (
            <div className="flex items-start gap-1.5 text-[12px] text-warn max-w-[420px]">
              <AlertCircle className="size-3.5 shrink-0 mt-px" /> Missing required: {missingFields.join(", ")}
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
