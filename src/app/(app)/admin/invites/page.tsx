"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Mail, XCircle } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import type { AdminInviteResponse, AdminInviteResult } from "@/types/auth";

const BASE = `${BACKEND_URL}/admin/invites`;

function parseEmails(raw: string): string[] {
  const emails = raw
    .split(/[\n,]/)
    .map((e) => e.trim())
    .filter(Boolean);
  return Array.from(new Set(emails));
}

function ResultRow({ result }: { result: AdminInviteResult }) {
  const config: Record<AdminInviteResult["status"], { icon: React.ReactNode; label: string; color: string }> = {
    sent: { icon: <CheckCircle2 className="size-3.5" />, label: "Sent", color: "text-emerald-600" },
    skipped: { icon: <Clock className="size-3.5" />, label: "Skipped", color: "text-amber-600" },
    failed: { icon: <XCircle className="size-3.5" />, label: "Failed", color: "text-red-600" },
  };
  const { icon, label, color } = config[result.status];

  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[#E2E2E2] bg-white px-4 py-3">
      <div className={`shrink-0 flex items-center gap-1.5 ${color}`}>
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] text-[#0F172B]">{result.email}</span>
        {result.reason && <p className="text-[12px] text-[#888888] mt-0.5">{result.reason}</p>}
      </div>
    </div>
  );
}

export default function AdminInvitesPage() {
  const [emailsInput, setEmailsInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AdminInviteResult[]>([]);

  const emails = parseEmails(emailsInput);

  function handleSend() {
    if (emails.length === 0) {
      setError("Enter at least one email address.");
      return;
    }

    setSending(true);
    setError(null);

    fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.error || `Failed to send invites: ${res.status} ${res.statusText}`);
        }
        const success = data as AdminInviteResponse;
        setResults((prev) => [...success.results, ...prev]);
        setEmailsInput("");
      })
      .catch((err) => setError(err.message || "Failed to send invites"))
      .finally(() => setSending(false));
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-[22px] font-[400] text-[var(--qc-ink)]">Beta Invites</h1>
        <p className="text-[14px] text-[var(--qc-ink-2)] mt-0.5">
          Send invite-only registration links. Each email gets a single-use link valid for 7 days.
        </p>
      </div>

      <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
        <div className="px-2 pt-1 pb-3">
          <span className="text-[14px] font-semibold uppercase tracking-[0.01em] text-[#0F172B]">
            Send invites
          </span>
        </div>
        <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 space-y-3">
          <label
            htmlFor="emails"
            className="block text-[11px] font-semibold uppercase tracking-wider text-[#0F172B]"
          >
            Email addresses
          </label>
          <textarea
            id="emails"
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            placeholder={"one@firm.com\ntwo@firm.com, three@firm.com"}
            rows={5}
            className="w-full rounded-lg outline-none transition-all resize-y"
            style={{
              border: "1px solid #E2E2E2",
              padding: "11px 14px",
              fontSize: 14,
              color: "#121212",
              background: "#fff",
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#888888]">
              {emails.length} email{emails.length !== 1 ? "s" : ""} · separate with commas or new lines
            </span>
            <button
              onClick={handleSend}
              disabled={sending || emails.length === 0}
              className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
              {sending ? "Sending…" : "Send invites"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
            Results
          </span>
          <div className="space-y-2">
            {results.map((r, i) => (
              <ResultRow key={`${r.email}-${i}`} result={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
