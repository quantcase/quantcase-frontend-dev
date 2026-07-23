"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Circle, Loader2 } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet, apiAuthPut } from "@/lib/api";
import {
  TechnicalsSkill,
  SkillsListResponse,
  SkillResponse,
  SkillUpdateBody,
  TECHNICALS_SKILL_SLUG,
} from "./technicals-config-types";
import { TechnicalsConfigEditor } from "./TechnicalsConfigEditor";

const SKILLS_API = `${BACKEND_URL}/admin/skills`;

/**
 * TechnicalsConfigPanel — the Technicals row of the Configs page. Config editing
 * only; the Technicals bulk-analysis dispatch flow lives on the Dispatch page.
 */
export function TechnicalsConfigPanel() {
  const [skill, setSkill] = useState<TechnicalsSkill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadSkill = useCallback(() => {
    apiAuthGet<SkillsListResponse>(SKILLS_API, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (list) => {
        const found = (list.data ?? []).find((s) => s.slug === TECHNICALS_SKILL_SLUG);
        if (!found) {
          setError(`No skill with slug "${TECHNICALS_SKILL_SLUG}" found.`);
          setLoading(false);
          return;
        }
        // Authoritative single read (list rows may be trimmed on some backends).
        apiAuthGet<SkillResponse>(`${SKILLS_API}/${found.id}`, {
          onSuccess: (res) => setSkill(res.data),
          onError: setError,
          onComplete: () => setLoading(false),
        });
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, []);

  useEffect(() => { loadSkill(); }, [loadSkill]);

  function handleSave(updates: SkillUpdateBody) {
    if (!skill) return;
    apiAuthPut<SkillResponse>(`${SKILLS_API}/${skill.id}`, {
      onStart: () => { setSaving(true); setSaveError(null); },
      onSuccess: (res) => setSkill(res.data ?? { ...skill, ...updates }),
      onError: setSaveError,
      onComplete: () => setSaving(false),
    }, updates);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hair shrink-0">
        <Circle className={`size-1.5 shrink-0 ${skill?.isActive ?? true ? "fill-up text-up" : "fill-ink-3 text-ink-3"}`} />
        <span className="text-[13px] font-semibold text-ink">{skill?.name ?? "Technicals"}</span>
        <span className="text-[10px] font-medium rounded-sm px-1.5 py-0.5 bg-secondary text-ink-3 uppercase tracking-wide">
          skill / {TECHNICALS_SKILL_SLUG}
        </span>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-ink-3">
          <Loader2 className="size-4 animate-spin" /> Loading skill…
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-4 py-3 text-sm text-down max-w-md">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </div>
        </div>
      )}

      {!loading && !error && skill && (
        <div className="flex-1 overflow-hidden">
          <TechnicalsConfigEditor key={skill.id} skill={skill} saving={saving} saveError={saveError} onSave={handleSave} />
        </div>
      )}
    </div>
  );
}
