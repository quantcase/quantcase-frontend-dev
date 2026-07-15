"use client";

import { useState } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { HtmlSkillConfig } from "./types";

interface Props {
  configs: HtmlSkillConfig[];
  onSelect: (key: string | null) => void; // pick a config (or null = Default) to edit/run — closes the modal
  onCreate: (key: string, name: string) => void;
  onDelete: (key: string) => void;
  onClose: () => void;
}

// Pure list/CRUD manager — actual field editing happens in the main skill panel (SkillDetail),
// driven by whichever config is selected here. This modal never duplicates that form.
export function ConfigsModal({ configs, onSelect, onCreate, onDelete, onClose }: Props) {
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");

  function submitCreate() {
    const key = newKey.trim().replace(/\s+/g, "_");
    const name = newName.trim();
    if (!key || !name) return;
    onCreate(key, name);
    setCreating(false);
    setNewKey("");
    setNewName("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[440px] max-h-[70vh] rounded-[10px] border border-[var(--qc-border-default)] bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-[var(--qc-ink)]">Saved Configs</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-border-default)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="px-5 pt-3 text-[11px] text-ink-3">
          Pick a config to edit its fields in the main panel and use it for runs, or create a new one.
        </p>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <button
            onClick={() => onSelect(null)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-secondary transition-colors"
          >
            <span className="text-[12px] font-medium text-[var(--qc-ink)]">Default (skill&rsquo;s own settings)</span>
          </button>

          {configs.map((cfg) => (
            <div key={cfg.key} className="flex items-center gap-1 rounded-md hover:bg-secondary transition-colors">
              <button
                onClick={() => onSelect(cfg.key)}
                className="flex flex-1 flex-col items-start gap-0.5 px-3 py-2 text-left min-w-0"
              >
                <span className="text-[12px] font-medium text-[var(--qc-ink)]">{cfg.name}</span>
                <span className="text-[10px] font-mono text-ink-3">{cfg.key}</span>
              </button>
              <button
                onClick={() => onDelete(cfg.key)}
                title="Delete config"
                className="flex items-center justify-center size-7 mr-2 rounded text-ink-3 hover:text-down transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          {configs.length === 0 && !creating && (
            <p className="px-3 py-4 text-[12px] text-ink-3">No saved configs yet.</p>
          )}
        </div>

        {/* Create */}
        <div className="border-t border-[var(--qc-border-default)] p-3 shrink-0">
          {creating ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="key (e.g. ppt_only)"
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[12px] font-mono text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Display name"
                className="w-full rounded-md border border-[var(--qc-border-default)] bg-card px-3 py-2 text-[12px] text-[var(--qc-ink)] outline-none focus:border-hair-strong"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={submitCreate}
                  disabled={!newKey.trim() || !newName.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Check className="size-3.5" /> Create
                </button>
                <button
                  onClick={() => { setCreating(false); setNewKey(""); setNewName(""); }}
                  className="rounded-md px-3 py-1.5 text-[12px] font-medium text-ink-3 hover:text-[var(--qc-ink)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--qc-border-default)] px-3 py-2 text-[12px] font-medium text-ink-3 hover:text-ink hover:border-ink transition-colors"
            >
              <Plus className="size-3.5" /> New config
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
