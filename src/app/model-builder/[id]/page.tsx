"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { formatCapital } from "@/components/model-builder/portfolio-builder-stepper";
import {
  AssetClassForm,
  SubClassForm,
  assetClassEntriesToItems,
  assetClassEntriesToSubItemsMap,
  type AssetClassItem,
  type SubClassItem,
} from "@/components/model-builder/asset-allocation-editor";
import type { AssetClassKey } from "@/components/model-builder/portfolio-builder-stepper";
import type { StoredModel } from "@/types/portfolio";
import { LinkedClientsPanel, ModelHoldingsPanel } from "@/components/model-builder/model-side-panels";

// ── Helpers ─────────────────────────────────────────────────────────────────

const RISK_PROFILE_LABELS: Record<string, string> = {
  conservative: "Conservative",
  balanced:     "Balanced",
  aggressive:   "Aggressive",
};


function modelsEqual(a: StoredModel, b: StoredModel) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── SummaryTile ───────────────────────────────────────────────────────────────

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "#888888" }}>
        {label}
      </p>
      <p className="text-base font-semibold" style={{ color: "#0F172B" }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#888888" }}>{sub}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ModelDetailPage() {
  const params = useParams();
  const id     = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const router = useRouter();
  const { getModel, updateModel, deleteModel, loading } = useModels();

  const serverModel = getModel(id);

  const [saved,       setSaved]       = useState<StoredModel | undefined>(undefined);
  const [draft,       setDraft]       = useState<StoredModel | undefined>(undefined);
  const [assetItems,  setAssetItems]  = useState<AssetClassItem[]>([]);
  const [subItemsMap, setSubItemsMap] = useState<Record<AssetClassKey, SubClassItem[]>>({} as Record<AssetClassKey, SubClassItem[]>);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (serverModel && !saved) {
      setSaved(serverModel);
      setDraft(serverModel);
      setAssetItems(assetClassEntriesToItems(serverModel.assetClasses ?? []));
      setSubItemsMap(assetClassEntriesToSubItemsMap(serverModel.assetClasses ?? []));
    }
  }, [serverModel, saved]);

  const model = draft ?? saved;
  const isDirty = !!(saved && draft && !modelsEqual(saved, draft));

  if (loading && !model) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm" style={{ color: "#888888" }}>Loading...</p>
      </div>
    );
  }

  if (!loading && !model) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-medium" style={{ color: "#0F172B" }}>Model not found</p>
        <Link href="/model-builder" className="text-xs" style={{ color: "#888888" }}>
          ← Back to Models
        </Link>
      </div>
    );
  }

  const enabledItems = assetItems.filter((e) => e.enabled);
  const totalPct     = assetItems.reduce((s, e) => s + (e.enabled ? e.pct : 0), 0);
  const isBalanced   = Math.round(totalPct) === 100;
  const assetPcts    = Object.fromEntries(assetItems.map((e) => [e.key, e.pct])) as Record<AssetClassKey, number>;

  const syncDraftAssetClasses = (nextItems: AssetClassItem[], nextSubMap: Record<AssetClassKey, SubClassItem[]>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const assetClasses = nextItems
        .filter((item) => item.enabled)
        .map((item) => {
          const cap = prev.capital * (item.pct / 100);
          const subs = (nextSubMap[item.key] ?? [])
            .filter((s) => s.enabled)
            .map((s) => ({ key: s.key, label: s.label, pct: s.pct, amount: Math.round(cap * (s.pct / 100)) }));
          return { key: item.key, label: item.key, pct: item.pct, amount: Math.round(cap), subClasses: subs };
        });
      return { ...prev, assetClasses };
    });
  };

  const handleAssetItemsChange = (next: AssetClassItem[]) => {
    setAssetItems(next);
    syncDraftAssetClasses(next, subItemsMap);
  };

  const handleSubItemsChange = (key: AssetClassKey, nextSubs: SubClassItem[]) => {
    const nextMap = { ...subItemsMap, [key]: nextSubs };
    setSubItemsMap(nextMap);
    syncDraftAssetClasses(assetItems, nextMap);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await updateModel(id, draft);
      setSaved(draft);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setDraft(saved);
    setAssetItems(assetClassEntriesToItems(saved?.assetClasses ?? []));
    setSubItemsMap(assetClassEntriesToSubItemsMap(saved?.assetClasses ?? []));
  };

  const handleDelete = async () => {
    try {
      await deleteModel(id);
      router.push("/model-builder");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const updateField = <K extends keyof StoredModel>(key: K, value: StoredModel[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const riskProfile = model!.riskProfile;

  return (
    <div className="min-h-screen pt-4 mb-8 px-4" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/model-builder" className="transition-colors shrink-0" style={{ color: "#0F172B" }}>
              <ArrowLeft style={{ width: 28, height: 28, strokeWidth: 1.5 }} />
            </Link>
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
              className="text-[28px] font-medium bg-transparent focus:outline-none border-b border-transparent focus:border-[#E2E2E2] transition-colors"
              style={{ color: "#0F172B", lineHeight: 1.2 }}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDirty && (
              <>
                <button
                  onClick={handleDiscard}
                  className="rounded-md border border-[#E2E2E2] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[#F5F5F5]"
                  style={{ color: "#888888" }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#0F172B" }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="rounded-md border border-[#E2E2E2] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              style={{ color: "#888888" }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* ── Summary tiles ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryTile label="Total Capital" value={formatCapital(model!.capital)} />
          <SummaryTile label="Risk Profile"  value={RISK_PROFILE_LABELS[riskProfile] ?? riskProfile} />
          <SummaryTile label="Asset Classes" value={String(enabledItems.length)} sub="active classes" />
          <SummaryTile
            label="Total Allocation"
            value={`${Math.round(totalPct)}%`}
            sub={isBalanced ? "Balanced" : totalPct > 100 ? "Over-allocated" : "Under-allocated"}
          />
        </div>

        {/* ── Allocation status banner ── */}
        {!isBalanced && (
          <div
            className="rounded-[10px] px-4 py-3 text-sm font-medium flex items-center justify-between"
            style={{
              background: totalPct > 100 ? "#FEF2F2" : "#FFF7F0",
              color:      totalPct > 100 ? "#991B1B" : "#92400E",
              border:     `1px solid ${totalPct > 100 ? "#FECACA" : "#FED7AA"}`,
            }}
          >
            <span>
              {totalPct > 100
                ? `Over-allocated by ${Math.round(totalPct - 100)}% — reduce asset class weights`
                : `${Math.round(100 - totalPct)}% unallocated — adjust weights to reach 100%`}
            </span>
            <span className="font-semibold">{Math.round(totalPct)}%</span>
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Asset allocation (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Allocation summary bar */}
            {enabledItems.length > 0 && (
              <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-4 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
                  Allocation Breakdown
                </p>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {enabledItems.map((item, i) => {
                    const SEGMENT_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];
                    return (
                      <div
                        key={item.key}
                        style={{ width: `${item.pct}%`, background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                        title={`${item.key}: ${item.pct}%`}
                      />
                    );
                  })}
                  {totalPct < 100 && (
                    <div style={{ width: `${100 - totalPct}%`, background: "#F0F0F0" }} title="Unallocated" />
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {enabledItems.map((item, i) => {
                    const SEGMENT_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];
                    return (
                      <div key={item.key} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                        <span className="text-xs" style={{ color: "#888888" }}>{item.key}</span>
                        <span className="text-xs font-semibold" style={{ color: "#0F172B" }}>{item.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Asset class toggles + sliders */}
            <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
              <div className="px-2 pt-1 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
                  Asset Allocation
                </p>
              </div>
              <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
                <AssetClassForm
                  capital={model!.capital}
                  items={assetItems}
                  onChange={handleAssetItemsChange}
                />
              </div>
            </div>

            {/* Sub-class form for active asset classes */}
            {enabledItems.length > 0 && (
              <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
                <div className="px-2 pt-1 pb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
                    Sub-class Breakdown
                  </p>
                </div>
                <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] px-4">
                  <SubClassForm
                    capital={model!.capital}
                    activeAssetKeys={enabledItems.map((e) => e.key)}
                    assetPcts={assetPcts}
                    subItemsMap={subItemsMap}
                    onChange={handleSubItemsChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Client context + model holdings */}
          <div className="space-y-4">

            <LinkedClientsPanel
              linkedClientIds={draft?.linkedClientIds ?? []}
              onChange={(ids) => setDraft((prev) => prev ? { ...prev, linkedClientIds: ids } : prev)}
            />

            <ModelHoldingsPanel
              holdings={draft?.holdings ?? []}
              onChange={(h) => setDraft((prev) => prev ? { ...prev, holdings: h } : prev)}
            />

            {/* Created / updated metadata */}
            <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>Created</span>
                <span className="text-xs" style={{ color: "#0F172B" }}>
                  {new Date(model!.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>Updated</span>
                <span className="text-xs" style={{ color: "#0F172B" }}>
                  {new Date(model!.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
