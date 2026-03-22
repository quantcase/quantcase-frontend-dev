"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useModels } from "@/hooks/useModels";
import { ClientContextCard } from "@/components/model-builder/client-context-card";
import { RiskProfileCard } from "@/components/model-builder/risk-profile-card";
import { ICAlignmentCard } from "@/components/model-builder/ic-alignment-card";
import { WhyThisPortfolioCard } from "@/components/model-builder/why-this-portfolio-card";
import { AllocatedPositionsCard } from "@/components/model-builder/allocated-positions-card";
import { RebalanceTriggersCard } from "@/components/model-builder/rebalance-triggers-card";
import { AssetScreenerCard } from "@/components/model-builder/asset-screener-card";
import type { StockOption } from "@/components/molecules/stock-search-panel";
import type {
  StoredModel,
  RiskProfileType,
  AssetClass,
  Position,
  RebalanceTrigger,
} from "@/types/portfolio";

const PROFILE_TARGETS: Record<RiskProfileType, Record<AssetClass, number>> = {
  conservative: { quality_compounder: 50, growth: 20, value: 20, income: 10 },
  balanced:     { quality_compounder: 40, growth: 35, value: 20, income: 5 },
  aggressive:   { quality_compounder: 25, growth: 50, value: 20, income: 5 },
};

const RISK_PROFILE_LABELS: Record<RiskProfileType, string> = {
  conservative: "Conservative",
  balanced: "Balanced",
  aggressive: "Aggressive",
};

function computeTriggers(positions: Position[], profile: RiskProfileType): RebalanceTrigger[] {
  const targets = PROFILE_TARGETS[profile];
  const totals: Partial<Record<AssetClass, number>> = {};
  const totalAlloc = positions.reduce((s, p) => s + p.allocation, 0);

  for (const pos of positions) {
    totals[pos.assetClass] = (totals[pos.assetClass] ?? 0) + pos.allocation;
  }

  const triggers: RebalanceTrigger[] = [];
  let triggerId = 0;

  for (const [cls, target] of Object.entries(targets) as [AssetClass, number][]) {
    const current = totals[cls] ?? 0;
    const currentPct = totalAlloc > 0 ? Math.round((current / totalAlloc) * 100) : 0;
    const deviation = Math.abs(currentPct - target);
    if (deviation >= 10) {
      const labels: Record<AssetClass, string> = {
        quality_compounder: "Quality Compounder",
        growth: "Growth",
        value: "Value",
        income: "Income",
      };
      triggers.push({
        id: String(++triggerId),
        assetClass: labels[cls],
        currentAllocation: currentPct,
        targetAllocation: target,
        severity: deviation >= 20 ? "critical" : "warning",
      });
    }
  }

  return triggers;
}

function modelsEqual(a: StoredModel, b: StoredModel): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function ModelDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const router = useRouter();
  const { getModel, updateModel, deleteModel, loading } = useModels();

  const serverModel = getModel(id);

  // saved tracks the last-persisted state; draft tracks in-progress edits
  const [saved, setSaved] = useState<StoredModel | undefined>(undefined);
  const [draft, setDraft] = useState<StoredModel | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  // Seed saved+draft once the model arrives from the API
  useEffect(() => {
    if (serverModel && !saved) {
      setSaved(serverModel);
      setDraft(serverModel);
    }
  }, [serverModel, saved]);

  const model = draft ?? saved;
  const positions = model?.positions ?? [];

  const isDirty = !!(saved && draft && !modelsEqual(saved, draft));

  const triggers = useMemo(
    () => (model ? computeTriggers(positions, model.activeProfile) : []),
    [model, positions]
  );

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
        <Link href="/model-builder" className="text-xs transition-colors" style={{ color: "#888888" }}>
          ← Back to Models
        </Link>
      </div>
    );
  }

  const totalAllocation = positions.reduce((s, p) => s + p.allocation, 0);

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
  };

  const handleDelete = async () => {
    try {
      await deleteModel(id);
      router.push("/model-builder");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRemovePosition = (posId: string) => {
    setDraft((prev) =>
      prev ? { ...prev, positions: prev.positions.filter((p) => p.id !== posId) } : prev
    );
  };

  const handleUpdateAllocation = (posId: string, allocation: number) => {
    setDraft((prev) =>
      prev
        ? { ...prev, positions: prev.positions.map((p) => p.id === posId ? { ...p, allocation } : p) }
        : prev
    );
  };

  const handleAddStock = (stock: StockOption) => {
    if (positions.some((p) => p.ticker === stock.ticker)) return;
    const newPosition: Position = {
      id: crypto.randomUUID(),
      company: stock.name,
      ticker: stock.ticker,
      assetClass: "quality_compounder",
      score: 0,
      allocation: 5,
    };
    setDraft((prev) =>
      prev ? { ...prev, positions: [...prev.positions, newPosition] } : prev
    );
  };

  const updateField = <K extends keyof StoredModel>(key: K, value: StoredModel[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const icStatus: "ok" | "over" | "under" =
    totalAllocation > 100 ? "over" : totalAllocation >= 90 ? "ok" : "under";

  const icTitle =
    totalAllocation >= 90 && totalAllocation <= 100
      ? "Current positions align with the selected model framework"
      : totalAllocation > 100
      ? "Portfolio is over-allocated — review positions"
      : "Portfolio has remaining capacity — consider adding positions";

  const icDescription =
    totalAllocation >= 90 && totalAllocation <= 100
      ? "All holdings meet the conviction and quality thresholds for this risk profile."
      : totalAllocation > 100
      ? "Total allocation exceeds 100%. Reduce position sizes to rebalance."
      : `${100 - totalAllocation}% of allocation capacity remaining.`;

  return (
    <div className="min-h-screen pt-8 mb-8 px-4" style={{ background: "#FFFFFF" }}>
      <div className="container mx-auto max-w-7xl space-y-6">

        {/* Back nav */}
        <Link href="/model-builder" className="text-xs transition-colors" style={{ color: "#888888" }}>
          ← Models
        </Link>

        {/* Header */}
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
            <div className="flex items-center gap-2">
              <input
                value={draft?.style ?? ""}
                onChange={(e) => updateField("style", e.target.value)}
                className="text-sm bg-transparent focus:outline-none border-b border-transparent focus:border-[#E2E2E2] transition-colors"
                style={{ color: "#888888" }}
              />
              <span style={{ color: "#E2E2E2" }}>·</span>
              <span
                className="text-xs font-medium rounded-sm px-2 py-0.5"
                style={{ background: "#F5F5F5", color: "#0F172B" }}
              >
                {model && RISK_PROFILE_LABELS[model.activeProfile]}
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

        {/* 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left — context + profile */}
          <div className="space-y-4">
            <ClientContextCard client={model!.client} />
            <RiskProfileCard
              activeProfile={model!.activeProfile}
              onProfileChange={(p) => updateField("activeProfile", p)}
            />
            <ICAlignmentCard title={icTitle} description={icDescription} status={icStatus} />
          </div>

          {/* Middle — thesis + positions */}
          <div className="space-y-4">
            <WhyThisPortfolioCard
              points={model!.whyThisPortfolio}
              onEdit={() => {}}
            />
            <AllocatedPositionsCard
              positions={positions}
              totalAllocation={totalAllocation}
              onRemovePosition={handleRemovePosition}
              onUpdateAllocation={handleUpdateAllocation}
            />
          </div>

          {/* Right — triggers + screener */}
          <div className="space-y-4">
            <RebalanceTriggersCard triggers={triggers} />
            <AssetScreenerCard
              addedTickers={positions.map((p) => p.ticker)}
              onAddStock={handleAddStock}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
