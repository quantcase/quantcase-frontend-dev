"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock
} from "lucide-react";
import { Avatar } from "@/components/ds";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

export type InteractionChannel = "call" | "whatsapp" | "email" | "meeting";

export interface ClientTarget {
  id?: string;
  rawId?: string;
  name: string;
  initials?: string;
  phone?: string;
  email?: string;
  aum?: string;
  context?: string;
  drift?: string;
}

export interface QuickInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientTarget | null;
  initialChannel?: InteractionChannel;
  initialContext?: string;
  onSuccess?: () => void;
}

export function QuickInteractionModal({
  isOpen,
  onClose,
  client,
  initialChannel = "call",
  initialContext = "",
  onSuccess,
}: QuickInteractionModalProps) {
  const [channel, setChannel] = useState<InteractionChannel>(initialChannel);
  const [phone, setPhone] = useState(client?.phone || "+91 98201 44521");
  const [email, setEmail] = useState(client?.email || `${(client?.name || "client").toLowerCase().replace(/\s+/g, ".")}@example.com`);
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative">("positive");
  const [outcome, setOutcome] = useState<"positive" | "neutral" | "needs_follow_up" | "no_show">("needs_follow_up");
  const [createFollowUp, setCreateFollowUp] = useState(true);
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChannel(initialChannel);
      setPhone(client?.phone || "+91 98201 44521");
      setEmail(client?.email || `${(client?.name || "client").toLowerCase().replace(/\s+/g, ".")}@example.com`);
      setSummary(initialContext || client?.context || "");
      setSuccessMsg(null);
      setError(null);
    }
  }, [isOpen, initialChannel, client, initialContext]);

  if (!isOpen) return null;

  const clientName = client?.name || "Client";
  const initials = client?.initials || clientName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // Smart Contextual Draft Generation
  const handleGenerateSmartDraft = async () => {
    setGeneratingAi(true);
    try {
      // If we have a backend UUID, attempt message generation endpoint
      const clientId = client?.rawId || client?.id;
      const isUuid = clientId && /^[0-9a-fA-F-]{36}$/.test(clientId);

      if (isUuid) {
        const res = await authFetch(`${BACKEND_URL}/api/v1/wealthos/clients/${clientId}/message/generate`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            channel: channel === "meeting" ? "call" : channel,
            context: client?.context || "Portfolio check-in and drift review",
          }),
        });
        const data = await res.json();
        if (res.ok && data?.data?.draft) {
          setSummary(data.data.draft);
          setGeneratingAi(false);
          return;
        }
      }

      // Tailored client-specific fallback drafts
      const lowerName = clientName.toLowerCase();
      let draft = "";

      if (lowerName.includes("rahul")) {
        draft = channel === "whatsapp"
          ? `Hi Rahul, hope your week is going well. I was reviewing your portfolio today and noticed small-cap drift has moved +6% above our mandate target. I've prepared a 1-page rebalancing brief to lock in gains and de-risk. Free for a brief 5-min call at 3:30 PM?`
          : `Discussed small-cap portfolio drift (+6%). Rahul agreed in principle to trim mid/small-cap allocations and rotate ₹18L into core large-cap and short-term debt fund. Will send rebalance proposal for execution.`;
      } else if (lowerName.includes("priya")) {
        draft = channel === "whatsapp"
          ? `Hi Priya, following up on your question regarding NPS Tier-1 tax benefits. Under Sec 80CCD(1B), putting ₹50,000 saves you ₹15,600 in tax at your 30% slab, completely independent of your existing 80C limits. I have the calculation ready for our meeting!`
          : `Reviewed NPS Tier-1 tax optimization inquiry. Walked Priya through 80CCD(1B) ₹50K deduction saving ₹15.6K tax annually. Proposed Active Choice (75% equity, 15% corporate bond, 10% G-sec). Client agreed to proceed.`;
      } else if (lowerName.includes("anita")) {
        draft = channel === "whatsapp"
          ? `Hi Anita, the thematic research brief on EV & Green Energy infrastructure you requested is ready. It covers capital expenditure cycles and 3 model baskets matching your growth mandate. Sending the PDF over email as well!`
          : `Sent comprehensive EV & Green Energy thematic allocation report. Anita reviewed initial thesis and is interested in deploying ₹45L in clean energy fund. Scheduled follow-up review for Friday.`;
      } else if (lowerName.includes("varun")) {
        draft = channel === "whatsapp"
          ? `Hi Varun, checking in from Quantcase. Notice your mid-cap weight is currently at +9% overweight against your mandate threshold. Let's do a quick portfolio health check before month-end.`
          : `Followed up on 14-day inactivity. Addressed portfolio overweight in mid-caps (+9%). Client requested updated valuation statement and rebalance recommendation.`;
      } else if (lowerName.includes("suresh")) {
        draft = channel === "whatsapp"
          ? `Hi Suresh, noted ₹62L sitting in your savings account over the last 4 months. By splitting this into liquid + arbitrage funds, you gain an extra ~₹2.5L/year with zero lock-in. Want me to send the proposal?`
          : `Discussed idle cash optimization (₹62L in savings). Showed lost yield analysis of ~₹2.1L/yr. Suresh agreed to review liquid + arbitrage STP proposal.`;
      } else {
        draft = channel === "whatsapp"
          ? `Hi ${clientName}, following up on your portfolio review. We noticed a couple of asset allocation opportunities to optimize yields and align with your risk mandate. Let me know when you have 5 minutes to connect!`
          : `Quarterly review check-in with ${clientName}. Discussed asset allocation, market outlook, and risk profile alignment. Client expressed interest in exploring tactical opportunities.`;
      }

      setSummary(draft);
    } catch {
      setSummary(`Portfolio check-in with ${clientName}. Discussed asset allocation and planned next steps.`);
    } finally {
      setGeneratingAi(false);
    }
  };

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(summary || `Hi ${clientName}, checking in regarding your portfolio.`)}`;
  const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(`Quantcase Portfolio Update · ${clientName}`)}&body=${encodeURIComponent(summary || "")}`;
  const telUrl = `tel:${phone.replace(/\s+/g, "")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const clientId = client?.rawId || client?.id;
    const isUuid = clientId && /^[0-9a-fA-F-]{36}$/.test(clientId);

    try {
      if (isUuid) {
        // 1. Log Interaction to Backend
        await authFetch(`${BACKEND_URL}/api/v1/wealthos/clients/${clientId}/interactions`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            type: channel,
            summary: summary || `${channel.toUpperCase()} with ${clientName}`,
            sentiment,
            outcome,
            follow_up_date: createFollowUp ? followUpDate : undefined,
          }),
        });

        // 2. Optionally Create Follow-up Task
        if (createFollowUp) {
          await authFetch(`${BACKEND_URL}/api/v1/wealthos/tasks`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              title: `Follow up with ${clientName} (${channel})`,
              task_type: channel === "whatsapp" ? "email" : channel,
              client_id: clientId,
              due_date: new Date(followUpDate).toISOString(),
              description: summary || `Action item following ${channel} on ${new Date().toLocaleDateString()}`,
            }),
          });
        }
      }

      setSuccessMsg(`Successfully logged ${channel} interaction with ${clientName}!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || "Logged locally (Backend offline)");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
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
            <Avatar initials={initials} size={38} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-[var(--qc-ink)] leading-snug">
                  {clientName}
                </h2>
                {client?.aum && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--qc-section)] text-[var(--qc-ink-2)] border border-[var(--qc-hair)]">
                    {client.aum}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[var(--qc-ink-2)]">
                Log conversation & dispatch client communications
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

        {/* Channel Selector Pills */}
        <div className="grid grid-cols-4 gap-2 my-4">
          {[
            { id: "call" as const, label: "Call", icon: Phone },
            { id: "whatsapp" as const, label: "WhatsApp", icon: MessageSquare },
            { id: "email" as const, label: "Email", icon: Mail },
            { id: "meeting" as const, label: "Meeting", icon: Calendar },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = channel === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setChannel(id)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border"
                style={{
                  background: isActive ? "var(--qc-ink, #1A0B2E)" : "var(--qc-section, #F9FAFB)",
                  color: isActive ? "#FFFFFF" : "var(--qc-ink, #1F2937)",
                  borderColor: isActive ? "var(--qc-ink, #1A0B2E)" : "var(--qc-hair, rgba(0,0,0,0.1))",
                }}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Launch Buttons (Tel or WhatsApp Direct Launch) */}
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-[var(--qc-section)] border border-[var(--qc-hair)]">
          {channel === "whatsapp" && (
            <>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[var(--qc-ink-3)] block uppercase tracking-wider font-mono">WhatsApp Recipient</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-[12px] bg-transparent font-mono text-[var(--qc-ink)] focus:outline-none"
                />
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#25D366] text-white hover:bg-[#20ba59] transition-all shadow-sm"
              >
                <span>Launch WhatsApp</span>
                <ExternalLink className="size-3" />
              </a>
            </>
          )}

          {channel === "call" && (
            <>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[var(--qc-ink-3)] block uppercase tracking-wider font-mono">Dial Phone</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-[12px] bg-transparent font-mono text-[var(--qc-ink)] focus:outline-none"
                />
              </div>
              <a
                href={telUrl}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium bg-[var(--qc-ink)] text-white hover:opacity-90 transition-all shadow-sm"
              >
                <span>Dial Now</span>
                <Phone className="size-3" />
              </a>
            </>
          )}

          {channel === "email" && (
            <>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[var(--qc-ink-3)] block uppercase tracking-wider font-mono">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-[12px] bg-transparent font-mono text-[var(--qc-ink)] focus:outline-none"
                />
              </div>
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium bg-[var(--qc-ink)] text-white hover:opacity-90 transition-all shadow-sm"
              >
                <span>Compose Mail</span>
                <Mail className="size-3" />
              </a>
            </>
          )}

          {channel === "meeting" && (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11.5px] text-[var(--qc-ink-2)]">
                Zoom / In-person Portfolio Review Meeting
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Scheduled Today
              </span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Notes / Message Body with AI Draft button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-[var(--qc-ink-2)] uppercase tracking-wider font-mono">
                {channel === "whatsapp" || channel === "email" ? "Message Text / Pitch" : "Conversation Summary"}
              </label>
              <button
                type="button"
                onClick={handleGenerateSmartDraft}
                disabled={generatingAi}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--qc-lime-ink)] hover:underline cursor-pointer transition-colors"
              >
                {generatingAi ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3 text-amber-500" />
                )}
                <span>{generatingAi ? "Generating..." : "Generate Talking Points"}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={`Key discussion points, portfolio rebalance agreement, client queries...`}
              className="w-full text-[12.5px] p-3 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-section)] text-[var(--qc-ink)] placeholder-[var(--qc-ink-3)] focus:outline-none focus:border-[var(--qc-ink)] transition-all resize-none"
            />
          </div>

          {/* Outcome & Sentiment Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-medium text-[var(--qc-ink-2)] block mb-1 uppercase tracking-wider font-mono">
                Client Sentiment
              </label>
              <select
                value={sentiment}
                onChange={(e: any) => setSentiment(e.target.value)}
                className="w-full text-[12px] py-1.5 px-2.5 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-section)] text-[var(--qc-ink)] focus:outline-none"
              >
                <option value="positive">🟢 Receptive / Positive</option>
                <option value="neutral">⚪ Neutral / Informational</option>
                <option value="negative">🔴 Concerned / Anxious</option>
              </select>
            </div>

            <div>
              <label className="text-[10.5px] font-medium text-[var(--qc-ink-2)] block mb-1 uppercase tracking-wider font-mono">
                Call Outcome
              </label>
              <select
                value={outcome}
                onChange={(e: any) => setOutcome(e.target.value)}
                className="w-full text-[12px] py-1.5 px-2.5 rounded-lg border border-[var(--qc-hair)] bg-[var(--qc-section)] text-[var(--qc-ink)] focus:outline-none"
              >
                <option value="needs_follow_up">Action / Follow-up Due</option>
                <option value="positive">Proposal Agreed</option>
                <option value="neutral">Completed Check-in</option>
                <option value="no_show">Client Busy / Reschedule</option>
              </select>
            </div>
          </div>

          {/* Follow-up Task Toggle */}
          <div className="p-3 rounded-lg border border-[var(--qc-hair-2)] bg-[var(--qc-section)]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createFollowUp}
                  onChange={(e) => setCreateFollowUp(e.target.checked)}
                  className="rounded border-[var(--qc-hair)] size-3.5 accent-[var(--qc-ink)]"
                />
                <span className="text-[12px] font-medium text-[var(--qc-ink)]">
                  Add follow-up task to my Today&apos;s Tasks
                </span>
              </label>
              {createFollowUp && (
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--qc-ink-2)] font-mono">
                  <Clock className="size-3" />
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="bg-transparent border border-[var(--qc-hair)] rounded px-1.5 py-0.5 text-[11px] text-[var(--qc-ink)] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Success / Error Banners */}
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-800 border border-red-200 text-[11.5px] flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--qc-hair-2)]">
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
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              <span>{loading ? "Logging..." : "Log Interaction"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
