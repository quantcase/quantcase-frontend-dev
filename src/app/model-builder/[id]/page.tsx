"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { formatCapital } from "@/components/model-builder/portfolio-builder-stepper";
import type { StoredModel, AssetClassEntry } from "@/types/portfolio";

// ── Helpers ──────────────────────────────────────────────────────────────────

const RISK_PROFILE_LABELS: Record<string, string> = {
  conservative: "Conservative",
  balanced:     "Balanced",
  aggressive:   "Aggressive",
};

const RISK_PROFILE_COLORS: Record<string, string> = {
  conservative: "text-blue-600 bg-blue-50",
  balanced:     "text-emerald-600 bg-emerald-50",
  aggressive:   "text-red-600 bg-red-50",
};

function modelsEqual(a: StoredModel, b: StoredModel) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ── AllocationBar ────────────────────────────────────────────────────────────

function AllocationBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 rounded-full w-full" style={{ background: "#F0F0F0" }}>
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${Math.min(pct, 100)}%`, background: "#0F172B" }}
      />
    </div>
  );
}

// ── AssetClassPanel ──────────────────────────────────────────────────────────

function AssetClassPanel({
  entry,
  capital,
  onPctChange,
}: {
  entry: AssetClassEntry;
  capital: number;
  onPctChange: (key: string, pct: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Label + amount */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "#0F172B" }}>
            {entry.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
            {formatCapital(entry.amount)}
          </p>
        </div>

        {/* Pct input */}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            min={0}
            max={100}
            value={entry.pct}
            onChange={(e) => onPctChange(entry.key, Number(e.target.value))}
            className="w-14 rounded border border-[#E2E2E2] px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
            style={{ color: "#0F172B" }}
          />
          <span className="text-sm" style={{ color: "#888888" }}>%</span>
        </div>

        {/* Expand toggle */}
        {entry.subClasses.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-[#E2E2E2] px-2.5 py-1 text-xs font-medium hover:border-zinc-300 transition-colors shrink-0"
            style={{ color: "#0F172B" }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            sub-classes
          </button>
        )}
      </div>

      {/* Allocation bar */}
      <div className="px-4 pb-3">
        <AllocationBar pct={entry.pct} />
      </div>

      {/* Sub-classes */}
      {expanded && entry.subClasses.length > 0 && (
        <div className="border-t border-[#F0F0F0]">
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_90px_90px] gap-2 px-4 py-2"
            style={{ background: "#F5F5F5" }}
          >
            <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>Sub-class</p>
            <p className="text-[10px] uppercase tracking-wider font-medium text-right" style={{ color: "#888888" }}>% of class</p>
            <p className="text-[10px] uppercase tracking-wider font-medium text-right" style={{ color: "#888888" }}>Amount</p>
          </div>

          {entry.subClasses.map((sub) => (
            <div
              key={sub.key}
              className="grid grid-cols-[1fr_90px_90px] gap-2 px-4 py-2.5 border-t border-[#F5F5F5]"
            >
              <p className="text-sm" style={{ color: "#0F172B" }}>{sub.label}</p>
              <p className="text-sm text-right font-medium" style={{ color: "#0F172B" }}>{sub.pct}%</p>
              <p className="text-sm text-right" style={{ color: "#888888" }}>{formatCapital(sub.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  const [saved,  setSaved]  = useState<StoredModel | undefined>(undefined);
  const [draft,  setDraft]  = useState<StoredModel | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (serverModel && !saved) {
      setSaved(serverModel);
      setDraft(serverModel);
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

  const assetClasses  = model!.assetClasses ?? [];
  const totalPct      = assetClasses.reduce((s, a) => s + a.pct, 0);
  const isBalanced    = Math.round(totalPct) === 100;

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const handleDiscard = () => setDraft(saved);

  const handleDelete = async () => {
    try {
      await deleteModel(id);
      router.push("/model-builder");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAssetPctChange = (key: string, pct: number) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            assetClasses: prev.assetClasses.map((a) =>
              a.key === key
                ? { ...a, pct, amount: Math.round(prev.capital * (pct / 100)) }
                : a
            ),
          }
        : prev
    );
  };

  const updateField = <K extends keyof StoredModel>(key: K, value: StoredModel[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const riskProfile   = model!.riskProfile;
  const riskColorCls  = RISK_PROFILE_COLORS[riskProfile] ?? "text-zinc-600 bg-zinc-100";

  return (
    <div className="min-h-screen pt-8 mb-8 px-4" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto space-y-6">

        {/* Back nav */}
        <Link href="/model-builder" className="text-xs transition-colors" style={{ color: "#888888" }}>
          ← Models
        </Link>

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
              Portfolio Model
            </p>
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateField("name", e.target.value)}
              className="text-[28px] font-medium bg-transparent focus:outline-none border-b border-transparent focus:border-[#E2E2E2] transition-colors"
              style={{ color: "#0F172B", lineHeight: 1.2 }}
            />
            <div className="flex items-center gap-2 pt-0.5">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${riskColorCls}`}>
                {RISK_PROFILE_LABELS[riskProfile] ?? riskProfile}
              </span>
              <span style={{ color: "#E2E2E2" }}>·</span>
              <span className="text-xs" style={{ color: "#888888" }}>
                {formatCapital(model!.capital)}
              </span>
              <span style={{ color: "#E2E2E2" }}>·</span>
              <span className="text-xs" style={{ color: "#888888" }}>
                {model!.client?.clientName !== "—" ? model!.client?.clientName : "No client assigned"}
              </span>
            </div>
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
          <SummaryTile label="Asset Classes" value={String(assetClasses.length)} sub="active classes" />
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
          <div className="lg:col-span-2 space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: "rgba(18,18,18,0.50)" }}>
                Asset Allocation
              </p>
              <div className="space-y-3">
                {assetClasses.map((entry) => (
                  <AssetClassPanel
                    key={entry.key}
                    entry={entry}
                    capital={model!.capital}
                    onPctChange={handleAssetPctChange}
                  />
                ))}
              </div>
            </div>

            {/* Allocation summary bar */}
            {assetClasses.length > 0 && (
              <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-4 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
                  Allocation Breakdown
                </p>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {assetClasses.map((entry, i) => {
                    const SEGMENT_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];
                    return (
                      <div
                        key={entry.key}
                        style={{ width: `${entry.pct}%`, background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                        title={`${entry.label}: ${entry.pct}%`}
                      />
                    );
                  })}
                  {totalPct < 100 && (
                    <div
                      style={{ width: `${100 - totalPct}%`, background: "#F0F0F0" }}
                      title="Unallocated"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {assetClasses.map((entry, i) => {
                    const SEGMENT_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];
                    return (
                      <div key={entry.key} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                        />
                        <span className="text-xs" style={{ color: "#888888" }}>
                          {entry.label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "#0F172B" }}>
                          {entry.pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Client context + portfolio notes */}
          <div className="space-y-4">

            {/* Client context */}
            <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
              <div className="px-2 pt-1 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
                  Client Context
                </p>
              </div>
              <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 space-y-4">

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>Client Name</p>
                  <input
                    value={draft?.client?.clientName ?? ""}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev ? { ...prev, client: { ...prev.client, clientName: e.target.value } } : prev
                      )
                    }
                    className="w-full bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-[#E2E2E2] transition-colors"
                    style={{ color: "#0F172B" }}
                    placeholder="—"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>AUM</p>
                  <p className="text-sm font-semibold" style={{ color: "#0F172B" }}>
                    {formatCapital(model!.capital)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>Last Updated</p>
                  <p className="text-sm" style={{ color: "#888888" }}>
                    {model!.client?.latestUpdate ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Portfolio notes / thesis */}
            <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
              <div className="px-2 pt-1 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(18,18,18,0.50)" }}>
                  Portfolio Thesis
                </p>
              </div>
              <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4">
                {model!.whyThisPortfolio?.length > 0 ? (
                  <ul className="space-y-2">
                    {model!.whyThisPortfolio.map((point, i) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color: "#888888" }}>
                        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: "#888888" }} />
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs" style={{ color: "#888888" }}>
                    No thesis added yet.
                  </p>
                )}
              </div>
            </div>

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
