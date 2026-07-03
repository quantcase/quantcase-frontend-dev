"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { apiCall, apiPost, apiPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { TagMultiPicker } from "@/components/molecules/tag-multi-picker";
import { CheckboxField } from "@/components/molecules/checkbox-field";
import {
  CompanyGroup,
  FilterType,
  CoverageFilter,
  MatchMode,
  DynamicFilterConfig,
  FilterConfig,
  ResolveResult,
  isManualConfig,
} from "./types";

const BASE = `${BACKEND_URL}/admin/company-groups`;
const INPUT_CLS =
  "w-full rounded-md border border-[#E2E2E2] px-3 py-2 text-sm text-[#0F172B] focus:outline-none focus:ring-1 focus:ring-[#0F172B]";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5";

const EMPTY_COVERAGE: CoverageFilter = { transcript: false, ppt: false, annualReport: false, match: "any" };

interface Props {
  open: boolean;
  group: CompanyGroup | null;
  companies: string[];
  onClose: () => void;
  onSaved: () => void;
}

function MatchToggle({ value, onChange }: { value: MatchMode; onChange: (v: MatchMode) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#888888]">Match:</span>
      <div className="inline-flex rounded-md border border-[#E2E2E2] p-0.5 bg-[#F5F5F5]">
        {(["any", "all"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-[4px] transition-colors ${
              value === m ? "bg-white text-[#0F172B] shadow-sm" : "text-[#888888] hover:text-[#0F172B]"
            }`}
          >
            {m === "any" ? "Match any of these" : "Match all of these"}
          </button>
        ))}
      </div>
    </div>
  );
}

function CoverageFilterBlock({
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
  value: CoverageFilter;
  onChange: (v: CoverageFilter) => void;
}) {
  return (
    <div className="rounded-md border border-[#E2E2E2] p-3">
      <CheckboxField checked={enabled} onChange={onEnabledChange} label={label} hint={hint} />
      {enabled && (
        <div className="mt-3 pl-5 space-y-3">
          <div className="flex gap-5">
            {(["transcript", "ppt", "annualReport"] as const).map((key) => (
              <label key={key} className="flex items-center gap-1.5 text-[12px] text-[#0F172B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!value[key]}
                  onChange={(e) => onChange({ ...value, [key]: e.target.checked })}
                  className="size-3.5 accent-[#0F172B]"
                />
                {key === "annualReport" ? "Annual Report" : key === "ppt" ? "PPT" : "Transcript"}
              </label>
            ))}
          </div>
          <MatchToggle value={value.match} onChange={(m) => onChange({ ...value, match: m })} />
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

  const [coverageEnabled, setCoverageEnabled] = useState(!!dyn?.coverage);
  const [coverage, setCoverage] = useState<CoverageFilter>(dyn?.coverage ?? EMPTY_COVERAGE);

  const [pendingEnabled, setPendingEnabled] = useState(!!dyn?.pendingExtraction);
  const [pending, setPending] = useState<CoverageFilter>(dyn?.pendingExtraction ?? EMPTY_COVERAGE);

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
    if (coverageEnabled) cfg.coverage = coverage;
    if (pendingEnabled) cfg.pendingExtraction = pending;
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
    filterType === "dynamic" && !coverageEnabled && !pendingEnabled && !marketCapEnabled && !(industriesEnabled && industries.length > 0);

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

      <div className="relative z-10 flex flex-col w-[600px] max-h-[90vh] bg-white rounded-[10px] border border-[#E2E2E2] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E2E2] shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888888]">
              {currentSlug ? "Edit Group" : "New Group"}
            </p>
            <p className="text-[15px] font-semibold text-[#0F172B] mt-0.5">{name || "Untitled group"}</p>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-[#888888] hover:text-[#0F172B] hover:bg-[#F5F5F5] transition-colors"
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
            <div className="inline-flex rounded-md border border-[#E2E2E2] p-0.5 bg-[#F5F5F5]">
              {(["manual", "dynamic"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                    filterType === t ? "bg-white text-[#0F172B] shadow-sm" : "text-[#888888] hover:text-[#0F172B]"
                  }`}
                >
                  {t === "manual" ? "Manual list" : "Filter-based"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#888888] mt-1.5">
              {filterType === "manual"
                ? "A fixed ticker list — static until you edit it."
                : "Recomputed live every time this group is used — never a frozen snapshot."}
            </p>
          </div>

          {filterType === "manual" && (
            <div>
              <label className={LABEL_CLS}>Tickers</label>
              <TagMultiPicker options={companies} selected={manualTickers} onChange={setManualTickers} placeholder="Add a ticker…" />
            </div>
          )}

          {filterType === "dynamic" && (
            <div className="space-y-3">
              <CoverageFilterBlock
                label="Has these documents"
                hint="Companies with the checked document types present in the DB."
                enabled={coverageEnabled}
                onEnabledChange={setCoverageEnabled}
                value={coverage}
                onChange={setCoverage}
              />
              <CoverageFilterBlock
                label="Pending L1 extraction"
                hint="Has the document, but it hasn't been extracted yet (the L1 backlog)."
                enabled={pendingEnabled}
                onEnabledChange={setPendingEnabled}
                value={pending}
                onChange={setPending}
              />

              <div className="rounded-md border border-[#E2E2E2] p-3">
                <CheckboxField
                  checked={marketCapEnabled}
                  onChange={setMarketCapEnabled}
                  label="Market cap range"
                  hint="In ₹ crore, using each company's latest known price."
                />
                {marketCapEnabled && (
                  <div className="mt-3 pl-5 flex items-center gap-3">
                    <div>
                      <label className="text-[10px] text-[#888888] block mb-1">Min (Cr)</label>
                      <input
                        type="number"
                        value={marketCapMin}
                        onChange={(e) => setMarketCapMin(e.target.value)}
                        placeholder="0"
                        className={`${INPUT_CLS} w-28`}
                      />
                    </div>
                    <span className="text-[#888888] mt-4">–</span>
                    <div>
                      <label className="text-[10px] text-[#888888] block mb-1">Max (Cr)</label>
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

              <div className="rounded-md border border-[#E2E2E2] p-3">
                <CheckboxField
                  checked={industriesEnabled}
                  onChange={setIndustriesEnabled}
                  label="Industries"
                  hint="Sector / basic-industry match."
                />
                {industriesEnabled && (
                  <div className="mt-3 pl-5">
                    <TagMultiPicker options={[]} selected={industries} onChange={setIndustries} uppercase={false} placeholder="e.g. Banks, NBFC…" />
                  </div>
                )}
              </div>

              {isEmptyDynamic && (
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                  <AlertCircle className="size-3.5 shrink-0" />
                  No filters selected — this group will always be empty.
                </div>
              )}
            </div>
          )}

          {resolveResult && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
              This group currently matches <span className="font-semibold">{resolveResult.count}</span> companies.
            </div>
          )}
          {resolving && (
            <div className="flex items-center gap-2 text-[12px] text-[#888888]">
              <Loader2 className="size-3.5 animate-spin" /> Resolving live count…
            </div>
          )}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-[#E2E2E2] flex items-center justify-between">
          {error ? <p className="text-xs text-red-600 max-w-[280px]">{error}</p> : <span />}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors"
            >
              {currentSlug ? "Done" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
