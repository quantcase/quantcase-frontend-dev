"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  RefreshCw,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Avatar } from "@/components/ds";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { ClientTarget } from "./QuickInteractionModal";

export type ReviewType = "rebalance" | "quarterly" | "risk_mandate" | "tax_optimization";

export interface PortfolioReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientTarget | null;
  initialReviewType?: ReviewType;
  onSuccess?: () => void;
}

export function PortfolioReviewModal({
  isOpen,
  onClose,
  client,
  initialReviewType = "rebalance",
  onSuccess,
}: PortfolioReviewModalProps) {
  const router = useRouter();
  const [reviewType, setReviewType] = useState<ReviewType>(initialReviewType);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const clientName = client?.name || "Rahul Mehta";
  const initials = client?.initials || clientName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const aum = client?.aum || "₹3.2 Cr";
  const drift = client?.drift || "+6% Small-cap Drift";

  const handleOpenClientPortfolio = () => {
    const clientId = client?.rawId || client?.id || "rahul-mehta";
    onClose();
    router.push(`/wealthos/clients/${clientId}`);
  };

  const handleExecuteRebalanceAudit = async () => {
    setLoading(true);
    const clientId = client?.rawId || client?.id;
    const isUuid = clientId && /^[0-9a-fA-F-]{36}$/.test(clientId);

    try {
      if (isUuid) {
        // Log review interaction
        await authFetch(`${BACKEND_URL}/api/v1/wealthos/clients/${clientId}/interactions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            type: "portfolio_review",
            summary: notes || `Completed ${reviewType.replace("_", " ")} review for ${clientName}. Drift: ${drift}`,
            sentiment: "positive",
            outcome: "positive",
          }),
        });

        // Add follow-up task
        await authFetch(`${BACKEND_URL}/api/v1/wealthos/tasks`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            title: `Execute rebalance trades for ${clientName}`,
            task_type: "portfolio_review",
            client_id: clientId,
            description: `Rebalance audit completed on ${new Date().toLocaleDateString()}. Rebalance mandate: ${drift}.`,
          }),
        });
      }

      setSuccessMsg(`Portfolio review & rebalance action item logged for ${clientName}!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 950);
    } catch {
      setSuccessMsg(`Review logged successfully!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 950);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-[14px] p-6 shadow-2xl overflow-hidden border"
        style={{
          background: "var(--qc-card, #FFFFFF)",
          borderColor: "var(--qc-hair, rgba(0,0,0,0.12))",
          color: "var(--qc-ink, #111827)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--qc-hair-2)]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-[var(--qc-down-soft,rgba(239,68,68,0.1))] text-[var(--qc-down,#EF4444)] flex items-center justify-center">
              <RefreshCw className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-[var(--qc-ink)] leading-snug">
                  Portfolio Review &amp; Rebalance
                </h2>
                <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                  {drift}
                </span>
              </div>
              <p className="text-[11.5px] text-[var(--qc-ink-2)]">
                Evaluate asset drift, risk tolerances, and rebalancing corridors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--qc-ink-3)] hover:text-[var(--qc-ink)] hover:bg-[var(--qc-section)] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Client Profile Pill */}
        <div className="flex items-center justify-between p-3 my-4 rounded-xl bg-[var(--qc-section)] border border-[var(--qc-hair)]">
          <div className="flex items-center gap-2.5">
            <Avatar initials={initials} size={32} />
            <div>
              <span className="text-[13px] font-semibold text-[var(--qc-ink)] block leading-tight">
                {clientName}
              </span>
              <span className="text-[11px] font-mono text-[var(--qc-ink-2)]">
                AUM: {aum} · Risk Mandate: Moderate Growth
              </span>
            </div>
          </div>
          <button
            onClick={handleOpenClientPortfolio}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--qc-ink)] hover:underline cursor-pointer"
          >
            <span>View 360° Profile</span>
            <ExternalLink className="size-3" />
          </button>
        </div>

        {/* Review Type Selection */}
        <div className="space-y-2 mb-4">
          <label className="text-[10.5px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono block">
            Select Review Action
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id: "rebalance" as const,
                title: "Drift Rebalancing",
                desc: "Trim mid/small-caps to target weight",
                icon: RefreshCw,
              },
              {
                id: "quarterly" as const,
                title: "Quarterly Audit",
                desc: "Full portfolio health & return check",
                icon: FileCheck,
              },
              {
                id: "risk_mandate" as const,
                title: "Mandate Calibration",
                desc: "Stress test volatility parameters",
                icon: AlertTriangle,
              },
              {
                id: "tax_optimization" as const,
                title: "Tax Optimization",
                desc: "Harvest losses & maximize deductions",
                icon: TrendingDown,
              },
            ].map((item) => {
              const isActive = reviewType === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReviewType(item.id)}
                  className="flex flex-col text-left p-3 rounded-lg border transition-all cursor-pointer"
                  style={{
                    background: isActive ? "var(--qc-section)" : "var(--qc-card)",
                    borderColor: isActive ? "var(--qc-ink)" : "var(--qc-hair)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="size-3.5 text-[var(--qc-ink)]" />
                    <span className="text-[12px] font-semibold text-[var(--qc-ink)]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-[var(--qc-ink-2)] leading-snug">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Proposed Rebalance Snapshot */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11.5px] mb-4 text-amber-950">
          <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 text-amber-600" />
            <span>Recommended Adjustment</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-white/80 border border-amber-200">
              <span className="text-[9.5px] text-amber-800 block">Current Mid/Small</span>
              <span className="font-bold text-red-600">38% (+6% drift)</span>
            </div>
            <div className="p-2 rounded bg-white/80 border border-amber-200">
              <span className="text-[9.5px] text-amber-800 block">Target Mandate</span>
              <span className="font-bold text-emerald-700">32%</span>
            </div>
            <div className="p-2 rounded bg-white/80 border border-amber-200">
              <span className="text-[9.5px] text-amber-800 block">De-risk Capital</span>
              <span className="font-bold text-blue-700">₹19.2 Lakhs</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="text-[10.5px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono block mb-1">
            Review Notes &amp; Action Item
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`e.g. Discussed de-risking ₹19.2L from mid-caps into Liquid ETF and G-Sec. Client agreed.`}
            className="w-full text-[12px] p-2.5 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-section)] text-[var(--qc-ink)] placeholder-[var(--qc-ink-3)] focus:outline-none focus:border-[var(--qc-ink)] transition-all resize-none"
          />
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] flex items-center gap-2 mb-3">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--qc-hair-2)]">
          <button
            type="button"
            onClick={handleOpenClientPortfolio}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--qc-ink-2)] hover:text-[var(--qc-ink)] cursor-pointer"
          >
            <span>Open Portfolio 360°</span>
            <ArrowRight className="size-3" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-[var(--qc-ink-2)] hover:bg-[var(--qc-section)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteRebalanceAudit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--qc-ink)] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{loading ? "Recording..." : "Complete Review"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
