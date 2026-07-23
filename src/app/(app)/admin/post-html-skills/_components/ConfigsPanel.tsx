"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Circle } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch, rawPut, authFetch } from "@/lib/api";
import { TickerSearch, TickerOption } from "../../html-skills/_components/TickerSearch";
import { FAVORITE_TICKERS } from "../../html-skills/_components/types";
import {
  PostHtmlConfig,
  PostHtmlConfigsListResponse,
  PostHtmlConfigUpdateBody,
  PostHtmlConfigPreviewResponse,
  POST_HTML_TYPE_LABELS,
  CONFIG_ROWS,
} from "./types";
import { RailRow } from "./RailRow";
import { ConfigEditor } from "./ConfigEditor";
import { ConfigPreviewModal } from "./ConfigPreviewModal";
import { TechnicalsConfigPanel } from "./TechnicalsConfigPanel";

const CONFIGS_API = `${BACKEND_URL}/api/post-html-analysis/configs`;
// The technicals skill lives on a different backend surface (/admin/skills);
// its row renders a self-contained config panel instead of the post-HTML ConfigEditor.
const TECHNICALS_ROW_KEY = "skill:technical-intelligence";

interface StocksApiResponseLite {
  data?: { company: string; company_name?: string }[];
}

export function ConfigsPanel() {
  const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
  const [ticker, setTicker] = useState<string | null>(null);

  const [configs, setConfigs] = useState<PostHtmlConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>(`${CONFIG_ROWS[0].layer_id}:${CONFIG_ROWS[0].type}`);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PostHtmlConfigPreviewResponse | null>(null);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/transcript/stocks`)
      .then(async (res) => {
        const json: StocksApiResponseLite = await res.json();
        setTickerOptions((json.data ?? []).map((s) => ({ symbol: s.company, name: s.company_name || s.company })));
      })
      .catch(() => {});
  }, []);

  const loadConfigs = useCallback(() => {
    rawFetch<PostHtmlConfigsListResponse>(`${CONFIGS_API}?includeInactive=true`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setConfigs(res.configs ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const selected = configs.find((c) => `${c.layer_id}:${c.type}` === selectedKey) ?? null;

  function handleSave(updates: PostHtmlConfigUpdateBody) {
    if (!selected) return;
    rawPut<{ success: boolean; config: PostHtmlConfig }>(`${CONFIGS_API}/${selected.layer_id}/${selected.type}`, {
      onStart: () => { setSaving(true); setSaveError(null); },
      onSuccess: (res) => {
        setConfigs((prev) => prev.map((c) => (`${c.layer_id}:${c.type}` === selectedKey ? res.config ?? { ...c, ...updates } : c)));
      },
      onError: setSaveError,
      onComplete: () => setSaving(false),
    }, updates);
  }

  function handlePreview() {
    if (!selected) return;
    if (!ticker) { setPreview(null); setPreviewError("Select a preview ticker first."); setShowPreview(true); return; }
    const params = new URLSearchParams({ ticker });
    rawFetch<PostHtmlConfigPreviewResponse>(`${CONFIGS_API}/${selected.layer_id}/${selected.type}/preview?${params}`, {
      onStart: () => { setPreviewing(true); setPreviewError(null); setPreview(null); setShowPreview(true); },
      onSuccess: setPreview,
      onError: setPreviewError,
      onComplete: () => setPreviewing(false),
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-[480px] gap-3">
      {/* Preview ticker — self-contained; feeds the prompt Preview dry-run. */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Preview ticker</span>
        <TickerSearch value={ticker} onChange={setTicker} options={tickerOptions} favorites={[...FAVORITE_TICKERS]} />
        <span className="text-[11px] text-ink-3">used by the per-config prompt Preview</span>
      </div>

      <div className="flex flex-1 min-h-0 rounded-[10px] border border-hair bg-card overflow-hidden">
        {/* Row list — fixed 4 seeded configs + technicals, no create/delete */}
        <div className="w-[220px] shrink-0 border-r border-hair overflow-y-auto">
          {loading && <p className="px-4 py-3 text-[12px] text-ink-3">Loading…</p>}
          {error && !loading && (
            <div className="flex items-center gap-1.5 px-4 py-3 text-[11px] text-down">
              <AlertCircle className="size-3.5 shrink-0" /> {error}
            </div>
          )}
          {CONFIG_ROWS.map(({ layer_id, type }) => {
            const key = `${layer_id}:${type}`;
            const cfg = configs.find((c) => c.layer_id === layer_id && c.type === type);
            return (
              <RailRow
                key={key}
                active={selectedKey === key}
                onClick={() => setSelectedKey(key)}
                marker={<Circle className={`size-1.5 shrink-0 ${cfg?.is_active ?? true ? "fill-up text-up" : "fill-ink-3 text-ink-3"}`} />}
                name={cfg?.name ?? POST_HTML_TYPE_LABELS[type]}
                sublabel={`${layer_id} / ${type}`}
              />
            );
          })}

          {/* Technicals skill — separate backend surface; active state lives in its panel. */}
          <RailRow
            active={selectedKey === TECHNICALS_ROW_KEY}
            onClick={() => setSelectedKey(TECHNICALS_ROW_KEY)}
            marker={<Circle className="size-1.5 shrink-0 fill-ink-3 text-ink-3" />}
            name="Technicals"
            sublabel="skill / technical-intelligence"
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {selectedKey === TECHNICALS_ROW_KEY ? (
            <TechnicalsConfigPanel />
          ) : selected ? (
            <ConfigEditor
              key={selectedKey}
              config={selected}
              saving={saving}
              saveError={saveError}
              onSave={handleSave}
              onPreview={handlePreview}
              previewing={previewing}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-ink-3">
              {loading ? "Loading configs…" : "Config not found"}
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <ConfigPreviewModal
          ticker={ticker ?? ""}
          loading={previewing}
          error={previewError}
          preview={preview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
