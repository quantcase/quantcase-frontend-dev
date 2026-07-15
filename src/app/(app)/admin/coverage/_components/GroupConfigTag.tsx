"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Tag } from "lucide-react";
import { apiPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { L2CompanyGroupOption, L2ConfigKeyOption } from "./types";

interface Props {
  group: L2CompanyGroupOption;
  configKeys: L2ConfigKeyOption[];
  onTagged: (slug: string, configKey: string | null) => void;
}

/**
 * Config tagging for the group currently selected above, always editable — even when already
 * tagged, since an admin may want to change it. Untagged tickers hard-fail L2 runs with a 400,
 * so this is surfaced directly on the L2 tab rather than requiring a trip to /admin/company-groups.
 */
export function GroupConfigTag({ group, configKeys, onTagged }: Props) {
  const [draft, setDraft] = useState(group.config_key ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = draft !== (group.config_key ?? "");

  function save() {
    const nextKey = draft || null;
    apiPut<{ success: boolean }>(`${BACKEND_URL}/admin/company-groups/${group.slug}`, {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: () => onTagged(group.slug, nextKey),
      onError: setError,
      onComplete: () => setSaving(false),
    }, { config_key: nextKey });
  }

  return (
    <div className="rounded-[10px] border border-hair bg-card p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-ink-3 shrink-0" />
          <span className="text-[14px] font-semibold text-ink">{group.name}</span>
        </div>
        {!draft && (
          <span className="flex items-center gap-1 text-[11px] text-warn">
            <AlertCircle className="size-3.5 shrink-0" />
            Untagged — tickers in this group will 400 on L2 runs.
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 max-w-sm rounded-md border border-hair px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-hair-strong"
        >
          <option value="">Untagged</option>
          {configKeys.map((c) => (
            <option key={c.key} value={c.key}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Save
        </button>
      </div>

      {error && <p className="text-[11px] text-down">{error}</p>}
    </div>
  );
}
