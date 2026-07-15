"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Circle } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { rawFetch, rawPut } from "@/lib/api";
import {
  PostHtmlConfig,
  PostHtmlConfigsListResponse,
  PostHtmlConfigUpdateBody,
  PostHtmlConfigPreviewResponse,
  POST_HTML_TYPE_LABELS,
  CONFIG_ROWS,
} from "./types";
import { ConfigEditor } from "./ConfigEditor";
import { ConfigPreviewModal } from "./ConfigPreviewModal";

const CONFIGS_API = `${BACKEND_URL}/api/post-html-analysis/configs`;

interface Props {
  ticker: string | null;
}

export function ConfigsPanel({ ticker }: Props) {
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
    if (!ticker) { setPreview(null); setPreviewError("Select a ticker on the Dispatch tab first."); setShowPreview(true); return; }
    const params = new URLSearchParams({ ticker });
    rawFetch<PostHtmlConfigPreviewResponse>(`${CONFIGS_API}/${selected.layer_id}/${selected.type}/preview?${params}`, {
      onStart: () => { setPreviewing(true); setPreviewError(null); setPreview(null); setShowPreview(true); },
      onSuccess: setPreview,
      onError: setPreviewError,
      onComplete: () => setPreviewing(false),
    });
  }

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[480px] rounded-[10px] border border-hair bg-card overflow-hidden">
      {/* Row list — fixed 4 seeded configs, no create/delete */}
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
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`w-full flex items-center gap-2 px-4 py-3 text-left border-b border-hair transition-colors ${
                selectedKey === key ? "bg-secondary" : "hover:bg-secondary"
              }`}
            >
              <Circle className={`size-1.5 shrink-0 ${cfg?.is_active ?? true ? "fill-up text-up" : "fill-ink-3 text-ink-3"}`} />
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-ink truncate">{cfg?.name ?? POST_HTML_TYPE_LABELS[type]}</p>
                <p className="text-[10px] text-ink-3 uppercase tracking-wide">{layer_id} / {type}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
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
