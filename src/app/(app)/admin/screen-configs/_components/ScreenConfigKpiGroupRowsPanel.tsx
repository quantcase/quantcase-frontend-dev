"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, RefreshCw } from "lucide-react";
import { apiAuthDelete, apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { KpiGroupTree } from "../../kpi-groups/_components/KpiGroupTree";
import { KpiGroupFormDialog } from "../../kpi-groups/_components/KpiGroupFormDialog";
import { KpiGroupNode, KpiGroupTreeResponse, flattenTree } from "../../kpi-groups/_components/types";
import { CompanyGroupOption } from "./types";

const BASE = `${BACKEND_URL}/admin/kpi-groups`;

interface Props {
  branchSlug: string;
  abbrOptions: string[];
  companyGroups: CompanyGroupOption[];
}

// Rows for a financials.pnl/.balance-sheet/.cashflow section come straight from a KpiGroup
// branch's children — this reuses the same tree CRUD as the standalone /admin/kpi-groups page,
// scoped to just that branch, so add/edit/delete/reparent here is exactly "manage rows".
export function ScreenConfigKpiGroupRowsPanel({ branchSlug, abbrOptions, companyGroups }: Props) {
  const [fullTree, setFullTree] = useState<KpiGroupNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<KpiGroupNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const load = useCallback(() => {
    apiAuthGet<KpiGroupTreeResponse>(`${BASE}/tree`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setFullTree(res.data ?? []),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const branch = flattenTree(fullTree).find((n) => n.slug === branchSlug) ?? null;
  const rows = branch?.children
    ? [...branch.children].sort((a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label))
    : [];

  function openAddChild(parentId: string) {
    setEditingNode(null);
    setDefaultParentId(parentId);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEdit(node: KpiGroupNode) {
    setEditingNode(node);
    setDefaultParentId(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function handleDelete(node: KpiGroupNode) {
    apiAuthDelete<{ success: boolean }>(`${BASE}/${node.slug}`, {
      onSuccess: load,
      onError: setError,
    });
  }

  return (
    <div className="rounded-md border border-hair p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Rows in this branch</p>
          <p className="text-[11px] text-ink-3 mt-0.5 font-mono">{branchSlug}</p>
        </div>
        <div className="flex items-center gap-2">
          {branch && (
            <button
              type="button"
              onClick={() => openAddChild(branch.id)}
              className="flex items-center gap-1.5 rounded-md border border-hair px-2.5 py-1.5 text-[11px] font-medium text-ink hover:border-ink transition-colors"
            >
              <Plus className="size-3.5" /> Add row
            </button>
          )}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="flex items-center gap-2 text-[12px] text-ink-3"><Loader2 className="size-3.5 animate-spin" /> Loading…</div>
      ) : !branch ? (
        <p className="text-[12px] text-down">Branch &ldquo;{branchSlug}&rdquo; not found in the KPI Groups tree.</p>
      ) : rows.length === 0 ? (
        <p className="text-[12px] text-ink-3">No rows yet — add one to populate this table.</p>
      ) : (
        <KpiGroupTree nodes={rows} onAddChild={openAddChild} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <KpiGroupFormDialog
        key={dialogKey}
        open={dialogOpen}
        node={editingNode}
        defaultParentId={defaultParentId}
        tree={fullTree}
        abbrOptions={abbrOptions}
        companyGroups={companyGroups}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
