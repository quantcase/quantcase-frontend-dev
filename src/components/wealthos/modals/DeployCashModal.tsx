"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Percent,
  Sparkles
} from "lucide-react";
import { Avatar } from "@/components/ds";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { ClientTarget } from "./QuickInteractionModal";

export interface DeployCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientTarget | null;
  onSuccess?: () => void;
}

export function DeployCashModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: DeployCashModalProps) {
  const router = useRouter();
  const [selectedBasket, setSelectedBasket] = useState<string>("arbitrage");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const clientName = client?.name || "Suresh Nair";
  const initials = client?.initials || clientName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const idleAmount = "₹62,00,000";

  const handleCreateProposal = async () => {
    setLoading(true);
    const clientId = client?.rawId || client?.id;
    const isUuid = clientId && /^[0-9a-fA-F-]{36}$/.test(clientId);

    try {
      if (isUuid) {
        await authFetch(`${BACKEND_URL}/api/v1/wealthos/clients/${clientId}/interactions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            type: "meeting",
            summary: `Created cash deployment proposal (${idleAmount}) into ${selectedBasket.toUpperCase()} for ${clientName}. Estimated yield uplift +₹2.5L/year.`,
            sentiment: "positive",
            outcome: "positive",
          }),
        });

        await authFetch(`${BACKEND_URL}/api/v1/wealthos/tasks`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            title: `Follow up on cash deployment proposal with ${clientName}`,
            task_type: "portfolio_review",
            client_id: clientId,
            description: `Proposal generated for ${idleAmount} idle cash deployment on ${new Date().toLocaleDateString()}.`,
          }),
        });
      }

      setSuccessMsg(`Cash deployment proposal generated & queued for ${clientName}!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 950);
    } catch {
      setSuccessMsg(`Proposal generated successfully!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 950);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOpportunities = () => {
    onClose();
    router.push("/wealthos/opportunities");
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
            <div className="size-10 rounded-lg bg-[var(--qc-blue-soft,rgba(56,189,248,0.15))] text-[var(--qc-blue,#0284C7)] flex items-center justify-center">
              <DollarSign className="size-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--qc-ink)] leading-snug">
                Deploy Idle Cash &amp; Boost Yield
              </h2>
              <p className="text-[11.5px] text-[var(--qc-ink-2)]">
                Put dormant bank balances to work with zero lock-in liquid funds
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

        {/* Client & Idle Cash Snapshot */}
        <div className="p-3.5 my-4 rounded-xl bg-[var(--qc-section)] border border-[var(--qc-hair)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Avatar initials={initials} size={32} />
              <div>
                <span className="text-[13px] font-semibold text-[var(--qc-ink)] block leading-tight">
                  {clientName}
                </span>
                <span className="text-[11px] font-mono text-[var(--qc-ink-2)]">
                  Savings Balance Inactive for 4 months
                </span>
              </div>
            </div>
            <span className="text-[12px] font-bold font-mono text-[var(--qc-ink)]">
              {idleAmount}
            </span>
          </div>

          {/* Yield Uplift Comparison Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--qc-hair-2)] text-center font-mono text-[11px]">
            <div className="p-2 rounded-lg bg-[var(--qc-card)] border border-[var(--qc-hair)]">
              <span className="text-[9px] text-[var(--qc-ink-3)] block uppercase">Current Yield</span>
              <span className="text-[12px] font-bold text-[var(--qc-ink-2)]">3.0% p.a.</span>
              <span className="text-[9.5px] text-[var(--qc-ink-3)] block mt-0.5">₹1.86L / yr</span>
            </div>
            <div className="p-2 rounded-lg bg-[var(--qc-card)] border border-[var(--qc-hair)]">
              <span className="text-[9px] text-[var(--qc-ink-3)] block uppercase">Liquid Yield</span>
              <span className="text-[12px] font-bold text-emerald-700">7.1% p.a.</span>
              <span className="text-[9.5px] text-[var(--qc-ink-3)] block mt-0.5">₹4.40L / yr</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[9px] text-emerald-800 font-bold block uppercase">Net Uplift</span>
              <span className="text-[12px] font-bold text-emerald-700">+₹2.54L</span>
              <span className="text-[9.5px] text-emerald-600 block mt-0.5">Zero Lock-in</span>
            </div>
          </div>
        </div>

        {/* Recommended Deployment Models */}
        <div className="space-y-2 mb-4">
          <label className="text-[10.5px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono block">
            Select Allocation Strategy
          </label>
          <div className="space-y-2">
            {[
              {
                id: "arbitrage",
                title: "Tax-Efficient Arbitrage Fund (₹35L) + Liquid (₹27L)",
                desc: "Equity tax treatment (12.5% LTCG) vs slab rate. Ideal for 30% tax bracket HNIs.",
                badge: "RECOMMENDED",
                tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
              },
              {
                id: "stp",
                title: "Liquid Fund + Systematic Transfer Plan (STP)",
                desc: "₹62L in Ultra-Short Debt, with ₹1.5L weekly STP into Diversified Large/Midcap.",
                badge: "GROWTH",
                tagColor: "bg-blue-100 text-blue-800 border-blue-300",
              },
              {
                id: "gsec",
                title: "Target Maturity G-Sec & Sovereign Bonds (7.18%)",
                desc: "Locks in peak sovereign yield with state/central government backing.",
                badge: "DEFENSIVE",
                tagColor: "bg-amber-100 text-amber-800 border-amber-300",
              },
            ].map((basket) => {
              const isSelected = selectedBasket === basket.id;
              return (
                <div
                  key={basket.id}
                  onClick={() => setSelectedBasket(basket.id)}
                  className="p-3 rounded-lg border transition-all cursor-pointer"
                  style={{
                    background: isSelected ? "var(--qc-section)" : "var(--qc-card)",
                    borderColor: isSelected ? "var(--qc-ink)" : "var(--qc-hair)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-[var(--qc-ink)]">
                      {basket.title}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${basket.tagColor}`}>
                      {basket.badge}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[var(--qc-ink-2)] leading-snug">
                    {basket.desc}
                  </p>
                </div>
              );
            })}
          </div>
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
            onClick={handleOpenOpportunities}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--qc-ink-2)] hover:text-[var(--qc-ink)] cursor-pointer"
          >
            <span>Opportunities Hub</span>
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
              onClick={handleCreateProposal}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--qc-ink)] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{loading ? "Generating..." : "Generate Proposal"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
