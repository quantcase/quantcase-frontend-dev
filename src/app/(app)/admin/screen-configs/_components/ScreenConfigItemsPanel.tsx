"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiAuthDelete, apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { ScreenConfigItemFormDialog } from "./ScreenConfigItemFormDialog";
import { CompanyGroupOption, ScreenConfigItem, ScreenConfigResponse } from "./types";

const BASE = `${BACKEND_URL}/admin/screen-configs`;

interface Props {
  sectionKey: string;
  sectionDecimalPlaces?: number | null;
  abbrOptions: string[];
  companyGroups: CompanyGroupOption[];
}

function ItemRow({ item, companyGroups, onEdit, onDelete }: {
  item: ScreenConfigItem;
  companyGroups: CompanyGroupOption[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const groupName = item.company_group_slug
    ? companyGroups.find((g) => g.slug === item.company_group_slug)?.name ?? item.company_group_slug
    : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-secondary px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-mono font-medium text-ink">{item.kpi_abbr}</span>
          {item.label && <span className="text-[11px] text-ink-3">&ldquo;{item.label}&rdquo;</span>}
          <span className="text-[10px] text-ink-3">#{item.display_order}</span>
          {item.highlight && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-golden-ink bg-card border border-hair rounded-sm px-1.5 py-0.5">Highlight</span>
          )}
          {item.expandable && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue-soft rounded-sm px-1.5 py-0.5">Expandable</span>
          )}
          {item.series_type && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-card border border-hair rounded-sm px-1.5 py-0.5">{item.series_type}</span>
          )}
          {item.decimal_places != null && (
            <span className="text-[10px] text-ink-3">{item.decimal_places}dp</span>
          )}
          {groupName && (
            <span className="text-[10px] text-ink-3">scoped: {groupName}</span>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        <button onClick={onEdit} className="flex size-6 items-center justify-center rounded text-ink-3 hover:text-ink transition-colors">
          <Pencil className="size-3.5" />
        </button>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="flex size-6 items-center justify-center rounded text-ink-3 hover:text-down transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={onDelete} className="text-[11px] font-medium text-down hover:underline">Confirm</button>
            <button onClick={() => setConfirmDelete(false)} className="text-ink-3 hover:text-ink"><X className="size-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ScreenConfigItemsPanel({ sectionKey, sectionDecimalPlaces, abbrOptions, companyGroups }: Props) {
  const [items, setItems] = useState<ScreenConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScreenConfigItem | null>(null);
  const [dialogKey, setDialogKey] = useState(0);

  function load() {
    apiAuthGet<ScreenConfigResponse>(`${BASE}/${sectionKey}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => setItems([...(res.data.items ?? [])].sort((a, b) => a.display_order - b.display_order)),
      onError: setError,
      onComplete: () => setLoading(false),
    });
  }

  useEffect(() => { load(); }, [sectionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function openAdd() {
    setEditingItem(null);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function openEdit(item: ScreenConfigItem) {
    setEditingItem(item);
    setDialogOpen(true);
    setDialogKey((k) => k + 1);
  }

  function handleDelete(item: ScreenConfigItem) {
    const prev = items;
    setItems((it) => it.filter((i) => i.id !== item.id));
    apiAuthDelete<{ success: boolean }>(`${BASE}/${sectionKey}/items/${item.id}`, {
      onSuccess: () => {},
      onError: (err) => { setItems(prev); setError(err); },
    });
  }

  return (
    <div className="rounded-md border border-hair p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Metrics in this section</p>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-md border border-hair px-2.5 py-1.5 text-[11px] font-medium text-ink hover:border-ink transition-colors"
        >
          <Plus className="size-3.5" /> Attach metric
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 text-[12px] text-ink-3"><Loader2 className="size-3.5 animate-spin" /> Loading…</div>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-ink-3">No metrics attached yet.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              companyGroups={companyGroups}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </div>
      )}

      <ScreenConfigItemFormDialog
        key={dialogKey}
        open={dialogOpen}
        sectionKey={sectionKey}
        item={editingItem}
        sectionDecimalPlaces={sectionDecimalPlaces}
        abbrOptions={abbrOptions}
        companyGroups={companyGroups}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
