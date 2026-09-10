"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useWealthModels } from "@/hooks/useWealthModels";
import { apiAuthPost, apiAuthPut } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Layers,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";
import type { WealthModel, ModelType } from "@/types/wealthos";

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODEL_TYPES: { label: string; value: ModelType }[] = [
  { label: "Equity", value: "equity" },
  { label: "Debt", value: "debt" },
  { label: "Hybrid", value: "hybrid" },
  { label: "PMS", value: "pms" },
  { label: "AIF", value: "aif" },
  { label: "Structured", value: "structured" },
];

const TYPE_COLOR: Record<ModelType, string> = {
  equity: "var(--qc-up)",
  debt: "var(--qc-ink)",
  hybrid: "var(--qc-warn)",
  structured: "var(--qc-down)",
  pms: "var(--qc-brand-accent)",
  aif: "color-mix(in srgb, var(--qc-brand-accent) 70%, white)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid var(--qc-hair)",
  background: "var(--qc-card)",
  color: "var(--qc-ink)",
  fontSize: 13,
  padding: "7px 12px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--qc-ink-2)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
};

// ─── Create Model Modal ────────────────────────────────────────────────────────

function CreateModelModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [modelType, setModelType] = useState<ModelType>("equity");
  const [version, setVersion] = useState("1.0");
  const [minInvestmentCr, setMinInvestmentCr] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body: Record<string, unknown> = {
      name: name.trim(),
      model_type: modelType,
      version: version.trim() || "1.0",
      is_published: isPublished,
    };
    if (description.trim()) body.description = description.trim();
    if (minInvestmentCr) body.min_investment_cr = parseFloat(minInvestmentCr);

    apiAuthPost<{ success: boolean }>(
      `${BACKEND_URL}/api/wealthos/models`,
      {
        onStart: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          onSuccess();
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
      },
      body
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--qc-ink)" }}>
              Create Approved Model Portfolio
            </h2>
            <p className="text-xs" style={{ color: "var(--qc-ink-2)" }}>
              Define a firm-level model for CIO approval and RM client allocation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ color: "var(--qc-ink-2)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label style={labelStyle}>Model Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Quantcase High Alpha Growth"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Model Type *</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value as ModelType)}
                required
                style={inputStyle}
              >
                {MODEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 1.0"
                style={inputStyle}
              />
            </div>

            <div className="md:col-span-2">
              <label style={labelStyle}>Min Investment (₹ Cr)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minInvestmentCr}
                onChange={(e) => setMinInvestmentCr(e.target.value)}
                placeholder="e.g. 0.5 (₹50 Lakhs) or 5.0"
                style={inputStyle}
              />
            </div>

            <div className="md:col-span-2">
              <label style={labelStyle}>Investment Thesis / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Key philosophy, benchmark index, rebalancing cadence..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded cursor-pointer"
              />
              <label htmlFor="is_published" className="text-xs cursor-pointer select-none" style={{ color: "var(--qc-ink)" }}>
                Publish immediately to RM recommendations catalog
              </label>
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded text-xs font-mono"
              style={{ background: "rgba(220,38,38,0.1)", color: "var(--qc-down)", border: "1px solid var(--qc-down)" }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--qc-hair)" }}>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Creating..." : "Save Model"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Model Row ─────────────────────────────────────────────────────────────────

function ModelRow({
  model,
  rank,
  onPublish,
}: {
  model: WealthModel;
  rank: number;
  onPublish: (id: string) => void;
}) {
  const [publishing, setPublishing] = useState(false);
  const typeColor = TYPE_COLOR[model.model_type] ?? "var(--qc-ink)";
  const isPublished = model.is_published ?? false;
  const mappedClients = model._count?.client_mappings ?? 0;

  const handlePublishClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPublishing(true);
    onPublish(model.id);
  };

  return (
    <div
      className="group flex items-center gap-4 transition-all duration-150"
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--qc-hair)",
        background: "transparent",
      }}
    >
      {/* Rank */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-ibm-plex-mono, monospace)",
          color: "var(--qc-ink-2)",
          width: 20,
          flexShrink: 0,
          textAlign: "right",
        }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      {/* Icon / Type badge */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "var(--qc-section)",
          border: "1px solid var(--qc-hair)",
        }}
      >
        <Layers className="size-3.5" style={{ color: typeColor }} />
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="truncate"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}
          >
            {model.name}
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "var(--qc-section)",
              color: "var(--qc-ink-2)",
              border: "1px solid var(--qc-hair)",
            }}
          >
            v{model.version || "1.0"}
          </span>
        </div>
        {model.description && (
          <p
            className="truncate"
            style={{ fontSize: 10, color: "var(--qc-ink-2)", marginTop: 1 }}
          >
            {model.description}
          </p>
        )}
      </div>

      {/* Type badge */}
      <div className="shrink-0" style={{ minWidth: 70 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: typeColor,
            background: `color-mix(in srgb, ${typeColor} 12%, transparent)`,
            padding: "2px 8px",
            borderRadius: 20,
            border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`,
            textTransform: "uppercase",
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
          }}
        >
          {model.model_type}
        </span>
      </div>

      {/* Min Investment */}
      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 64 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-ink)",
          }}
        >
          {model.min_investment_cr ? `₹${model.min_investment_cr.toFixed(1)}Cr` : "—"}
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>
          min inv
        </span>
      </div>

      {/* Mapped Clients */}
      <div className="flex flex-col items-end shrink-0" style={{ minWidth: 50 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-ink)",
          }}
        >
          {mappedClients}
        </span>
        <span style={{ fontSize: 9, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>
          clients
        </span>
      </div>

      {/* Status Badge */}
      <div className="shrink-0 flex items-center justify-center" style={{ minWidth: 90 }}>
        {isPublished ? (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              color: "var(--qc-up)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
            }}
          >
            <CheckCircle2 className="size-3" /> Published
          </span>
        ) : (
          <button
            type="button"
            onClick={handlePublishClick}
            disabled={publishing}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              color: "var(--qc-warn)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            <Clock className="size-3" /> {publishing ? "Publishing…" : "Publish Draft"}
          </button>
        )}
      </div>

      {/* Action / Link to builder */}
      <Link
        href="/model-builder"
        className="shrink-0 text-xs flex items-center gap-1 hover:underline"
        style={{ color: "var(--qc-ink-2)" }}
        title="Open in Portfolio Builder"
      >
        <ExternalLink className="size-3.5" />
      </Link>
    </div>
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
        background: "var(--qc-section)",
        border: "1px solid var(--qc-hair)",
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "var(--qc-ink-2)",
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
          color: color ?? "var(--qc-ink)",
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
  models: WealthModel[];
  onAddModel: () => void;
}) {
  const publishedCount = models.filter((m) => m.is_published).length;
  const draftCount = models.length - publishedCount;
  const totalMapped = models.reduce((s, m) => s + (m._count?.client_mappings ?? 0), 0);

  const typeCounts: Record<string, number> = {};
  models.forEach((m) => {
    typeCounts[m.model_type] = (typeCounts[m.model_type] ?? 0) + 1;
  });

  return (
    <div className="flex flex-col gap-3" style={{ position: "sticky", top: 16 }}>
      {/* Lime hero */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--qc-ink) 0%, var(--qc-ink) 100%)",
          padding: "20px 18px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Model Portfolio Hub
        </p>
        <div className="flex items-end gap-3 mb-4">
          <div>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {models.length}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Approved Models
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <CheckCircle2 className="size-2.5" style={{ color: "rgba(255,255,255,0.8)" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
              }}
            >
              {publishedCount}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>published</span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <TrendingUp className="size-2.5" style={{ color: "rgba(255,255,255,0.8)" }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
              }}
            >
              {totalMapped}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>client allocations</span>
          </div>
        </div>
      </div>

      {/* Model Types breakdown */}
      <div
        className="rounded-[14px]"
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          Model Type Mix
        </p>
        {MODEL_TYPES.map((t) => {
          const count = typeCounts[t.value] ?? 0;
          const pct = models.length > 0 ? (count / models.length) * 100 : 0;
          const col = TYPE_COLOR[t.value];
          return (
            <div key={t.value} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--qc-ink)",
                    fontWeight: 500,
                  }}
                >
                  {t.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-ibm-plex-mono, monospace)",
                    fontWeight: 700,
                    color: col,
                  }}
                >
                  {count}
                </span>
              </div>
              <div
                className="h-[4px] rounded-full overflow-hidden"
                style={{ background: "var(--qc-section)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: col, opacity: 0.85 }}
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
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-ink-2)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Lifecycle Summary
        </p>
        <div className="flex gap-2 mb-2">
          <StatPill label="Active" value={String(publishedCount)} color="var(--qc-up)" />
          <StatPill label="Drafts" value={String(draftCount)} color="var(--qc-warn)" />
        </div>
      </div>

      {/* Quick actions */}
      <div
        className="rounded-[14px]"
        style={{
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          padding: "14px 16px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: "var(--qc-ink-2)",
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
            { icon: Layers, label: "Model Builder", href: "/model-builder" },
            { icon: Shield, label: "Risk Matrix", href: "/wealthos/analytics" },
            { icon: Zap, label: "Client Roster", href: "/wealthos/clients" },
          ].map(({ icon: Icon, label, action, href }) =>
            href ? (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-1.5 rounded-[10px] transition-all no-underline"
                style={{
                  padding: "10px 8px",
                  background: "var(--qc-section)",
                  border: "1px solid var(--qc-hair)",
                }}
              >
                <Icon className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </span>
              </Link>
            ) : (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex flex-col items-center gap-1.5 rounded-[10px] transition-all cursor-pointer"
                style={{
                  padding: "10px 8px",
                  background: "var(--qc-section)",
                  border: "1px solid var(--qc-hair)",
                }}
              >
                <Icon className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {label}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────────────────────

function ModelsContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: models, loading, error } = useWealthModels(refreshKey);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handlePublish = (modelId: string) => {
    apiAuthPut<{ success: boolean }>(
      `${BACKEND_URL}/api/wealthos/models/${modelId}/publish`,
      {
        onSuccess: () => {
          setRefreshKey((k) => k + 1);
        },
        onError: (err) => {
          alert(`Failed to publish model: ${err}`);
        },
      }
    );
  };

  const filteredModels = models.filter((m) => {
    if (statusFilter === "published" && !m.is_published) return false;
    if (statusFilter === "draft" && m.is_published) return false;
    if (typeFilter !== "all" && m.model_type !== typeFilter) return false;
    return true;
  });

  return (
    <>
      <div style={{ background: "var(--qc-bg)", minHeight: "100vh", padding: "20px 24px" }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p
              style={{
                fontSize: 9,
                fontFamily: "var(--font-ibm-plex-mono, monospace)",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "var(--qc-ink-2)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              WealthOS · Firm Catalog
            </p>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--qc-ink)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Approved Model Portfolios{" "}
              {models.length > 0 && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "var(--qc-ink-2)",
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
              background: "var(--qc-ink)",
              color: "var(--qc-on-dark)",
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

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {(["all", "published", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium"
                style={{
                  background: statusFilter === s ? "var(--qc-ink)" : "var(--qc-card)",
                  color: statusFilter === s ? "var(--qc-on-dark)" : "var(--qc-ink-2)",
                  border: statusFilter === s ? "none" : "1px solid var(--qc-hair)",
                }}
              >
                {s === "all" ? "All Models" : s === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span style={{ fontSize: 11, color: "var(--qc-ink-2)", textTransform: "uppercase" }}>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                borderRadius: 6,
                border: "1px solid var(--qc-hair)",
                background: "var(--qc-card)",
                color: "var(--qc-ink)",
                fontSize: 12,
                padding: "4px 8px",
                outline: "none",
              }}
            >
              <option value="all">All Types</option>
              {MODEL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 290px", alignItems: "start" }}>
          {/* Left: models list */}
          <div>
            <div
              className="rounded-[14px] overflow-hidden"
              style={{
                background: "var(--qc-card)",
                border: "1px solid var(--qc-hair)",
              }}
            >
              {/* Table header */}
              <div
                className="flex items-center gap-4"
                style={{
                  padding: "8px 16px",
                  borderBottom: "1px solid var(--qc-hair)",
                  background: "var(--qc-section)",
                }}
              >
                <span style={{ width: 20, flexShrink: 0 }} />
                <span style={{ width: 32, flexShrink: 0 }} />
                <span
                  className="flex-1"
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Model Portfolio
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 70,
                  }}
                >
                  Type
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 64,
                    textAlign: "right",
                  }}
                >
                  Min Inv
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 50,
                    textAlign: "right",
                  }}
                >
                  Clients
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--qc-ink-2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    minWidth: 90,
                    textAlign: "center",
                  }}
                >
                  Status
                </span>
                <span style={{ width: 14, flexShrink: 0 }} />
              </div>

              {loading && (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl animate-pulse"
                      style={{ background: "var(--qc-section)" }}
                    />
                  ))}
                </div>
              )}

              {error && (
                <p className="p-4" style={{ fontSize: 13, color: "var(--qc-down)" }}>
                  {error}
                </p>
              )}

              {!loading && filteredModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--qc-section)",
                      border: "1px solid var(--qc-hair)",
                    }}
                  >
                    <Layers className="size-5" style={{ color: "var(--qc-ink-2)" }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)", marginBottom: 4 }}>
                    No models found
                  </p>
                  <p style={{ fontSize: 11, color: "var(--qc-ink-2)", marginBottom: 16 }}>
                    Create an approved model portfolio for your wealth firm.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5"
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      background: "var(--qc-ink)",
                      color: "var(--qc-on-dark)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    <Plus className="size-3.5" />
                    Create first model
                  </button>
                </div>
              )}

              {filteredModels.map((model, i) => (
                <ModelRow
                  key={model.id}
                  model={model}
                  rank={i + 1}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          </div>

          {/* Right panel */}
          <RightPanel models={models} onAddModel={() => setModalOpen(true)} />
        </div>
      </div>

      {modalOpen && (
        <CreateModelModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}

export default function WealthOSModelsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm" style={{ color: "var(--qc-ink-2)" }}>
          Loading…
        </div>
      }
    >
      <ModelsContent />
    </Suspense>
  );
}
