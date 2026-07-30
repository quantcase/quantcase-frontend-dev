"use client";

import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { apiAuthPost, apiAuthPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiAbbrPicker } from "@/components/molecules/kpi-abbr-picker";
import {
  CompanyGroupOption,
  KpiGroupNode,
  KpiGroupResponse,
  collectDescendantIds,
  flattenTree,
} from "./types";

const BASE = `${BACKEND_URL}/admin/kpi-groups`;
const INPUT_CLS =
  "w-full rounded-md border border-hair px-3 py-2 text-sm text-ink focus:outline-none focus:border-hair-strong";
const LABEL_CLS = "block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5";

interface Props {
  open: boolean;
  node: KpiGroupNode | null;
  defaultParentId: string | null;
  tree: KpiGroupNode[];
  companyGroups: CompanyGroupOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function KpiGroupFormDialog({ open, node, defaultParentId, tree, companyGroups, onClose, onSaved }: Props) {
  const isEdit = !!node;

  const [label, setLabel] = useState(node?.label ?? "");
  const [slug, setSlug] = useState(node?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [parentId, setParentId] = useState<string | null>(node ? node.parent_id : defaultParentId);
  const [isLeaf, setIsLeaf] = useState(!!node?.kpi_abbr);
  const [kpiAbbr, setKpiAbbr] = useState(node?.kpi_abbr ?? "");
  const [companyGroupSlug, setCompanyGroupSlug] = useState(node?.company_group_slug ?? "");
  const [displayOrder, setDisplayOrder] = useState(node?.display_order != null ? String(node.display_order) : "0");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const excludedIds = node ? new Set([node.id, ...collectDescendantIds(node)]) : new Set<string>();
  const parentOptions = flattenTree(tree)
    .filter((n) => !excludedIds.has(n.id))
    .map((n) => ({ id: n.id, label: n.label, depth: ancestorDepth(tree, n.id) }));

  function ancestorDepth(nodes: KpiGroupNode[], id: string, depth = 0): number {
    for (const n of nodes) {
      if (n.id === id) return depth;
      if (n.children) {
        const found = ancestorDepth(n.children, id, depth + 1);
        if (found >= 0) return found;
      }
    }
    return -1;
  }

  function slugify(s: string) {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleSave() {
    const payload = {
      slug: slug.trim() || slugify(label),
      label: label.trim(),
      parent_id: parentId,
      kpi_abbr: isLeaf ? kpiAbbr.trim() || undefined : undefined,
      company_group_slug: companyGroupSlug.trim() || undefined,
      display_order: displayOrder.trim() ? Number(displayOrder) : 0,
    };

    const callbacks = {
      onStart: () => { setSaving(true); setError(null); },
      onSuccess: () => { onSaved(); onClose(); },
      onError: (err: string) => setError(err),
      onComplete: () => setSaving(false),
    };

    if (isEdit) {
      apiAuthPut<KpiGroupResponse>(`${BASE}/${node!.slug}`, callbacks, payload);
    } else {
      apiAuthPost<KpiGroupResponse>(BASE, callbacks, payload);
    }
  }

  const canSave = label.trim() && (!isLeaf || kpiAbbr.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[560px] max-h-[88vh] rounded-[10px] border border-hair bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-hair px-5 py-3 shrink-0">
          <p className="text-[14px] font-medium text-ink">{isEdit ? "Edit Section" : "New Section"}</p>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-ink hover:border-hair transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className={LABEL_CLS}>Label</label>
            <input
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Profitability"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Slug</label>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              disabled={isEdit}
              placeholder="profitability"
              className={`${INPUT_CLS} font-mono disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>Parent</label>
            <select
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className={INPUT_CLS}
            >
              <option value="">No parent — top level</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {"  ".repeat(p.depth)}
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Node Type</label>
            <div className="inline-flex rounded-md border border-hair p-0.5 bg-secondary">
              {([false, true] as const).map((leaf) => (
                <button
                  key={String(leaf)}
                  type="button"
                  onClick={() => setIsLeaf(leaf)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[5px] transition-colors ${
                    isLeaf === leaf ? "bg-card text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {leaf ? "KPI leaf" : "Container"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-3 mt-1.5">
              {isLeaf
                ? "This node IS a specific KPI — pick which one below."
                : "A folder that groups other sections/leaves — no KPI attached."}
            </p>
          </div>

          {isLeaf && (
            <div>
              <label className={LABEL_CLS}>KPI Abbr</label>
              <KpiAbbrPicker value={kpiAbbr} onChange={setKpiAbbr} />
            </div>
          )}

          <div>
            <label className={LABEL_CLS}>Company Group (optional)</label>
            <select
              value={companyGroupSlug}
              onChange={(e) => setCompanyGroupSlug(e.target.value)}
              className={INPUT_CLS}
            >
              <option value="">Shown for all company groups</option>
              {companyGroups.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-ink-3 mt-1.5">
              Scope this branch so it only shows for one company group (e.g. BFSI-specific sections).
            </p>
          </div>

          <div>
            <label className={LABEL_CLS}>Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className={`${INPUT_CLS} w-32`}
            />
          </div>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-hair flex items-center justify-between">
          {error ? (
            <div className="flex items-start gap-1.5 text-[12px] text-down max-w-[300px]">
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
              {isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
