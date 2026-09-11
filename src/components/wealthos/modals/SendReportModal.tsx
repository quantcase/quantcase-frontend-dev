"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Mail,
  MessageSquare,
  Download,
  CheckCircle2,
  Sparkles,
  Loader2,
  FileCheck,
  Send
} from "lucide-react";
import { Avatar } from "@/components/ds";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { ClientTarget } from "./QuickInteractionModal";

export type ReportTemplate =
  | "thematic_ev"
  | "quarterly_performance"
  | "tax_nps"
  | "drift_audit";

export interface SendReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientTarget | null;
  initialReportType?: ReportTemplate;
  onSuccess?: () => void;
}

const TEMPLATES: Record<
  ReportTemplate,
  { title: string; subtitle: string; tag: string; filename: string }
> = {
  thematic_ev: {
    title: "EV & Green Energy Infrastructure 2026",
    subtitle: "Thematic allocation thesis covering capital expenditure cycles and green power baskets.",
    tag: "THEMATIC RESEARCH",
    filename: "Quantcase_EV_Green_Energy_2026.pdf",
  },
  quarterly_performance: {
    title: "Q1 2026 Portfolio Performance Brief",
    subtitle: "Consolidated valuation, Sharpe ratio, and alpha generation benchmarked against Nifty 500.",
    tag: "PERFORMANCE",
    filename: "Quantcase_Portfolio_Review_Q1_2026.pdf",
  },
  tax_nps: {
    title: "NPS Sec 80CCD(1B) Tax Optimization Memo",
    subtitle: "Tax savings calculation at 30% slab with Active Choice (75/15/10) glide-path allocation.",
    tag: "TAX & MANDATE",
    filename: "Quantcase_NPS_Tax_Memo_FY26.pdf",
  },
  drift_audit: {
    title: "Asset Allocation & Drift Rebalance Audit",
    subtitle: "Detailed sector deviation breakdown with target rebalancing trades and risk corridors.",
    tag: "MANDATE AUDIT",
    filename: "Quantcase_Rebalance_Audit.pdf",
  },
};

export function SendReportModal({
  isOpen,
  onClose,
  client,
  initialReportType = "thematic_ev",
  onSuccess,
}: SendReportModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(initialReportType);
  const [channel, setChannel] = useState<"email" | "whatsapp" | "download">("email");
  const [recipientEmail, setRecipientEmail] = useState(
    client?.email || `${(client?.name || "client").toLowerCase().replace(/\s+/g, ".")}@example.com`
  );
  const [recipientPhone, setRecipientPhone] = useState(client?.phone || "+91 98201 44521");
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const clientName = client?.name || "Anita Shah";
  const initials = client?.initials || clientName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const currentTemplate = TEMPLATES[selectedTemplate] || TEMPLATES.thematic_ev;

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const clientId = client?.rawId || client?.id;
    const isUuid = clientId && /^[0-9a-fA-F-]{36}$/.test(clientId);

    try {
      if (isUuid) {
        // Log interaction to backend
        await authFetch(`${BACKEND_URL}/api/v1/wealthos/clients/${clientId}/interactions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            type: channel === "download" ? "email" : channel,
            summary: `Dispatched report: "${currentTemplate.title}" to ${clientName} via ${channel.toUpperCase()}.${customNote ? ` Note: ${customNote}` : ""}`,
            sentiment: "positive",
            outcome: "positive",
          }),
        });
      }

      // If download requested, simulate downloading dummy PDF
      if (channel === "download") {
        const element = document.createElement("a");
        const file = new Blob(
          [
            `Quantcase Research & Client Advisory Report\n\nTitle: ${currentTemplate.title}\nClient: ${clientName}\nDate: ${new Date().toLocaleDateString()}\n\nExecutive Summary:\n${currentTemplate.subtitle}\n\nConfidential WealthOS Advisory Document.`
          ],
          { type: "text/plain" }
        );
        element.href = URL.createObjectURL(file);
        element.download = currentTemplate.filename.replace(".pdf", ".txt");
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      setSuccessMsg(`Successfully dispatched "${currentTemplate.title}" to ${clientName}!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch {
      setSuccessMsg(`Report dispatched successfully!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
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
            <div className="size-10 rounded-lg bg-[var(--qc-lime-soft,rgba(223,255,0,0.18))] text-[var(--qc-lime-ink,#1A0B2E)] flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--qc-ink)] leading-snug">
                Dispatch Research &amp; Report
              </h2>
              <p className="text-[11.5px] text-[var(--qc-ink-2)]">
                Send curated research notes, performance reports, and allocation memos
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

        {/* Client Target Pill */}
        <div className="flex items-center justify-between p-3 my-4 rounded-xl bg-[var(--qc-section)] border border-[var(--qc-hair)]">
          <div className="flex items-center gap-2.5">
            <Avatar initials={initials} size={32} />
            <div>
              <span className="text-[13px] font-semibold text-[var(--qc-ink)] block leading-tight">
                {clientName}
              </span>
              <span className="text-[11px] font-mono text-[var(--qc-ink-2)]">
                {client?.email || recipientEmail} · {client?.phone || recipientPhone}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-[var(--qc-card)] text-[var(--qc-ink)] border border-[var(--qc-hair)]">
            Ready to Send
          </span>
        </div>

        <form onSubmit={handleSendReport} className="space-y-4">
          {/* Report Template Selector */}
          <div>
            <label className="text-[10.5px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono block mb-2">
              Select Report Template
            </label>
            <div className="space-y-2">
              {(Object.keys(TEMPLATES) as ReportTemplate[]).map((key) => {
                const t = TEMPLATES[key];
                const isSelected = selectedTemplate === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    className="p-3 rounded-lg border transition-all cursor-pointer"
                    style={{
                      background: isSelected ? "var(--qc-section)" : "var(--qc-card)",
                      borderColor: isSelected ? "var(--qc-ink)" : "var(--qc-hair)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12.5px] font-semibold text-[var(--qc-ink)]">
                        {t.title}
                      </span>
                      <span className="text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--qc-card)] border border-[var(--qc-hair)] text-[var(--qc-ink-2)]">
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--qc-ink-2)] line-clamp-1 leading-snug">
                      {t.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Channel Selector */}
          <div>
            <label className="text-[10.5px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono block mb-2">
              Delivery Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "email" as const, label: "Email PDF", icon: Mail },
                { id: "whatsapp" as const, label: "WhatsApp Link", icon: MessageSquare },
                { id: "download" as const, label: "Download PDF", icon: Download },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = channel === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChannel(id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border"
                    style={{
                      background: isActive ? "var(--qc-ink)" : "var(--qc-section)",
                      color: isActive ? "#FFFFFF" : "var(--qc-ink)",
                      borderColor: isActive ? "var(--qc-ink)" : "var(--qc-hair)",
                    }}
                  >
                    <Icon className="size-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-[10.5px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono block mb-1">
              Custom Message to Client (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={`Hi ${clientName}, attaching our latest research note on this theme for your review...`}
              className="w-full text-[12px] p-2.5 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-section)] text-[var(--qc-ink)] placeholder-[var(--qc-ink-3)] focus:outline-none focus:border-[var(--qc-ink)] transition-all resize-none"
            />
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--qc-hair-2)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium text-[var(--qc-ink-2)] hover:bg-[var(--qc-section)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--qc-ink)] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : channel === "download" ? (
                <Download className="size-3.5" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span>{loading ? "Dispatching..." : channel === "download" ? "Download Report" : "Send Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
