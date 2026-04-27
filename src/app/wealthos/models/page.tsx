"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModels } from "@/hooks/useModels";
import { PortfolioBuilderStepper } from "@/components/model-builder/portfolio-builder-stepper";
import { formatCapital } from "@/components/model-builder/portfolio-builder-stepper";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  X,
  ArrowUpRight,
  Layers,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import type { StoredModel, RiskProfileType } from "@/types/portfolio";

// ─── Constants ─────────────────────────────────────────────────────────────────

const RISK_LABELS: Record<RiskProfileType, string> = {
  conservative: "Conservative",
  balanced: "Balanced",
  aggressive: "Aggressive",
};

const RISK_COLOR: Record<RiskProfileType, string> = {
  conservative: "var(--qc-up)",
  balanced: "var(--qc-warn)",
  aggressive: "var(--qc-down)",
};

const ASSET_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

// ─── Modal ─────────────────────────────────────────────────────────────────────

function PortfolioBuilderModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl mx-auto my-0 sm:my-10 sm:rounded-lg overflow-hidden"
        style={{ background: "#fff", maxHeight: "calc(100dvh - 80px)" }}
      >
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#E2E2E2", background: "#fff" }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "#0F172B" }}>
              Wealth Builder
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
              Model Portfolio Library — configure and save for relationship managers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors shrink-0"
            style={{ color: "#888888" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col flex-1 min-h-0">
          <PortfolioBuilderStepper onSuccess={onSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}

// ─── Model Row ─────────────────────────────────────────────────────────────────

function ModelRow({ model, rank }: { model: StoredModel; rank: number }) {
  const assetClasses = model.assetClasses ?? [];
  const totalPct = assetClasses.reduce((s, a) => s + a.pct, 0);
  const isBalanced = Math.round(totalPct) === 100;
  const isOver = totalPct > 100;
  const allocationColor = isOver
    ? "var(--qc-down)"
    : isBalanced
    ? "var(--qc-up)"
    : "var(--qc-warn)";
  const riskColor = RISK_COLOR[model.riskProfile] ?? "var(--qc-text-muted)";

  return (
    <Link
      href={`/model-builder/${model.id}`}
      className="group flex items-center gap-4 transition-all duration-150 no-underline"
      style={{
        padding: "11px 16px",
        borderBottom: "1px solid var(--qc-border-default)",
        background: "transparent",
        display: "flex",
        textDecoration: "none",
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          color: "var(--qc-text-muted)",
          width: 20,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      {/* Icon */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--qc-surface-panel)",
          border: "1px solid var(--qc-border-default)",
        }}
      >
        <Layers className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="truncate"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }}
          >
            {model.name}
          </span>
        </div>
        {model.whyThisPortfolio?.[0] && (
          <p
            className="truncate"
            style={{ fontSize: 10, color: "var(--qc-text-muted)", marginTop: 1 }}
          >
            {model.whyThisPortfolio[0]}
          </p>
        )}
      </div>

      {/* Allocation mini-bar */}
      <div className="shrink-0" style={{ width: 80 }}>
        {assetClasses.length > 0 ? (
          <>
            <div className="flex h-[4px] rounded-full overflow-hidden gap-px mb-1">
              {assetClasses.map((entry, i) => (
                <div
                  key={entry.key}
                  style={{
                    width: `${entry.pct}%`,
                    background: ASSET_COLORS[i % ASSET_COLORS.length],
                  }}
                />
              ))}
              {totalPct < 100 && (
                <div style={{ width: `${100 - totalPct}%`, background: "#E2E2E2" }} />
              )}
            </div>
            <span
              style={{
                fontSize: 9,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                color: allocationColor,
                fontWeight: 700,
              }}
            >
              {Math.round(totalPct)}% allocated
            </span>
          </>
        ) : (
          <span style={{ fontSize: 10, color: "var(--qc-text-muted)" }}>—</span>
        )}
      </div>

      {/* Capital */}
      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 60 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-text-heading)",
          }}
        >
          {formatCapital(model.capital)}
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-text-muted)", textTransform: "uppercase" }}>
          capital
        </span>
      </div>

      {/* Risk profile */}
      <div className="shrink-0" style={{ minWidth: 76 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: riskColor,
            background: `color-mix(in srgb, ${riskColor} 12%, transparent)`,
            padding: "2px 8px",
            borderRadius: 20,
            border: `1px solid color-mix(in srgb, ${riskColor} 25%, transparent)`,
          }}
        >
          {RISK_LABELS[model.riskProfile] ?? model.riskProfile}
        </span>
      </div>

      {/* Date */}
      <div className="shrink-0" style={{ minWidth: 60, textAlign: "right" }}>
        <span style={{ fontSize: 10, color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
          {formatDate(model.createdAt)}
        </span>
      </div>

      {/* Arrow */}
      <ArrowUpRight
        className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        style={{ color: "var(--qc-text-muted)" }}
      />
    </Link>
  );
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="flex flex-col gap-0.5 flex-1"
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--qc-surface-panel)",
        border: "1px solid var(--qc-border-default)",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "var(--qc-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          color: color ?? "var(--qc-text-heading)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Right Panel ────────────────────────────────────────────────────────────────

function RightPanel({
  models,
  onAddModel,
}: {
  models: StoredModel[];
  onAddModel: () => void;
}) {
  const totalCapital = models.reduce((s, m) => s + (m.capital ?? 0), 0);

  const riskCounts = { conservative: 0, balanced: 0, aggressive: 0 };
  models.forEach((m) => {
    if (m.riskProfile in riskCounts) riskCounts[m.riskProfile]++;
  });

  const avgAssetClasses =
    models.length > 0
      ? models.reduce((s, m) => s + (m.assetClasses?.length ?? 0), 0) / models.length
      : 0;

  // Most used asset class
  const acFreq: Record<string, number> = {};
  models.forEach((m) =>
    (m.assetClasses ?? []).forEach((ac) => {
      acFreq[ac.label] = (acFreq[ac.label] ?? 0) + 1;
    })
  );
  const topAC = Object.entries(acFreq).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-3" style={{ position: "sticky", top: 16 }}>
      {/* Lime hero */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #c8f569 0%, #a8e63d 40%, #7ecb1a 100%)",
          padding: "20px 18px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#2d5a00",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Model Library
        </p>
        <div className="flex items-end gap-3 mb-4">
          <div>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                color: "#1a3a00",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {models.length}
            </p>
            <p style={{ fontSize: 11, color: "#3a6e00", marginTop: 2 }}>
              Portfolio Models
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(26,58,0,0.15)" }}
          >
            <TrendingUp className="size-2.5" style={{ color: "#2d5a00" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1a3a00",
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
              }}
            >
              {formatCapital(totalCapital)}
            </span>
            <span style={{ fontSize: 10, color: "#3a6e00" }}>total AUM</span>
          </div>
        </div>
      </div>

      {/* Risk breakdown */}
      <div
        className="rounded-[14px]"
        style={{
          background: "var(--qc-surface-card)",
          border: "1px solid var(--qc-border-default)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          Risk Profile Mix
        </p>
        {(["conservative", "balanced", "aggressive"] as RiskProfileType[]).map((rp) => {
          const count = riskCounts[rp];
          const pct = models.length > 0 ? (count / models.length) * 100 : 0;
          return (
            <div key={rp} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--qc-text-heading)",
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {RISK_LABELS[rp]}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                    fontWeight: 700,
                    color: RISK_COLOR[rp],
                  }}
                >
                  {count}
                </span>
              </div>
              <div
                className="h-[4px] rounded-full overflow-hidden"
                style={{ background: "var(--qc-surface-panel)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: RISK_COLOR[rp], opacity: 0.7 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div
        className="rounded-[14px]"
        style={{
          background: "var(--qc-surface-card)",
          border: "1px solid var(--qc-border-default)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Library Stats
        </p>
        <div className="flex gap-2 mb-2">
          <StatPill label="Avg Classes" value={avgAssetClasses.toFixed(1)} />
          <StatPill label="Top Asset" value={topAC?.[0] ?? "—"} />
        </div>
      </div>

      {/* Quick actions */}
      <div
        className="rounded-[14px]"
        style={{
          background: "var(--qc-surface-card)",
          border: "1px solid var(--qc-border-default)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Plus, label: "New Model", action: onAddModel },
            { icon: Layers, label: "Compare Models", action: undefined },
            { icon: Shield, label: "Risk Review", action: undefined },
            { icon: Zap, label: "AI Suggest", action: undefined },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1.5 rounded-[10px] transition-all"
              style={{
                padding: "10px 8px",
                background: "var(--qc-surface-panel)",
                border: "1px solid var(--qc-border-default)",
                cursor: action ? "pointer" : "default",
                opacity: action ? 1 : 0.5,
              }}
            >
              <Icon className="size-3.5" style={{ color: "var(--qc-text-muted)" }} />
              <span
                style={{
                  fontSize: 9,
                  color: "var(--qc-text-muted)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Content ───────────────────────────────────────────────────────────────

function ModelsContent() {
  const router = useRouter();
  const { models, loading, error } = useModels();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = (id: string) => {
    setModalOpen(false);
    router.push(`/model-builder/${id}`);
  };

  const RISK_ORDER: Record<string, number> = { aggressive: 0, balanced: 1, conservative: 2 };
  const sortedModels = models
    .slice()
    .sort((a, b) => (RISK_ORDER[a.riskProfile] ?? 9) - (RISK_ORDER[b.riskProfile] ?? 9));

  return (
    <>
      <div style={{ background: "#FBFAF7", minHeight: "100vh", padding: "20px 24px" }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p
              style={{
                fontSize: 9,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "var(--qc-text-muted)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              WealthOS · Model Library
            </p>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--qc-text-heading)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Investment Models{" "}
              {models.length > 0 && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--qc-text-muted)",
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                    letterSpacing: 0,
                  }}
                >
                  {models.length}
                </span>
              )}
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 transition-all"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: "var(--qc-accent-primary)",
              color: "var(--qc-accent-primary-fg)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            <Plus className="size-3.5" />
            New Model
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 290px", alignItems: "start" }}>
          {/* Left: models list */}
          <div>
            <div
              className="rounded-[14px] overflow-hidden"
              style={{
                background: "var(--qc-surface-card)",
                border: "1px solid var(--qc-border-default)",
              }}
            >
              {/* Table header */}
              <div
                className="flex items-center gap-4"
                style={{
                  padding: "8px 16px",
                  borderBottom: "1px solid var(--qc-border-default)",
                  background: "var(--qc-surface-panel)",
                }}
              >
                <span style={{ width: 20, flexShrink: 0 }} />
                <span style={{ width: 32, flexShrink: 0 }} />
                <span
                  className="flex-1"
                  style={{
                    fontSize: 9,
                    color: "var(--qc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Model Name
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    width: 80,
                    flexShrink: 0,
                  }}
                >
                  Allocation
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 60,
                    textAlign: "right",
                  }}
                >
                  Capital
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 76,
                    textAlign: "center",
                  }}
                >
                  Risk
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 60,
                    textAlign: "right",
                  }}
                >
                  Created
                </span>
                <span style={{ width: 14, flexShrink: 0 }} />
              </div>

              {loading && (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl animate-pulse"
                      style={{ background: "var(--qc-surface-panel)" }}
                    />
                  ))}
                </div>
              )}

              {error && (
                <p className="p-4" style={{ fontSize: 13, color: "var(--qc-down)" }}>
                  {error}
                </p>
              )}

              {!loading && models.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--qc-surface-panel)",
                      border: "1px solid var(--qc-border-default)",
                    }}
                  >
                    <Layers className="size-5" style={{ color: "var(--qc-text-muted)" }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", marginBottom: 4 }}>
                    No models yet
                  </p>
                  <p style={{ fontSize: 11, color: "var(--qc-text-muted)", marginBottom: 16 }}>
                    Build your first model portfolio to enable AI suggestions.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5"
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      background: "var(--qc-accent-primary)",
                      color: "var(--qc-accent-primary-fg)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    <Plus className="size-3.5" />
                    Build first model
                  </button>
                </div>
              )}

              {sortedModels.map((model, i) => (
                <ModelRow key={model.id} model={model} rank={i + 1} />
              ))}
            </div>
          </div>

          {/* Right panel */}
          <RightPanel models={models} onAddModel={() => setModalOpen(true)} />
        </div>
      </div>

      {modalOpen && (
        <PortfolioBuilderModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

export default function WealthOSModelsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>
          Loading…
        </div>
      }
    >
      <ModelsContent />
    </Suspense>
  );
}
