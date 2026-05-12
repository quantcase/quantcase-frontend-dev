"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiPut, apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { PriorityBadge } from "./priority-badge";
import { useJobPoller } from "@/hooks/useJobPoller";
import type { WealthSuggestion, MessageChannel } from "@/types/wealthos";

interface SuggestionCardProps {
  suggestion: WealthSuggestion;
  clientId: string;
  onStatusChange: () => void;
}

const CHANNELS: MessageChannel[] = ["call", "email", "whatsapp"];

const inputStyle: React.CSSProperties = {
  borderRadius: 6,
  border: "1px solid var(--qc-hair)",
  background: "var(--qc-card)",
  color: "var(--qc-ink)",
  fontSize: 12,
  padding: "4px 8px",
  outline: "none",
};

export function SuggestionCard({ suggestion, clientId, onStatusChange }: SuggestionCardProps) {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>("whatsapp");
  const [context, setContext] = useState("");
  const [msgError, setMsgError] = useState<string | null>(null);
  const [msgJobQueued, setMsgJobQueued] = useState(false);

  const { isPolling, progress, startPolling } = useJobPoller({
    onComplete: () => { setMsgJobQueued(false); },
    onError: (err) => { setMsgError(err); setMsgJobQueued(false); },
  });

  const handleMarkUsed = () => {
    apiPut(`${BACKEND_URL}/api/wealthos/suggestions/${suggestion.id}/status`, {
      onSuccess: onStatusChange,
      onError: () => {},
    }, { status: "used" });
  };

  const handleMarkIgnored = () => {
    apiPut(`${BACKEND_URL}/api/wealthos/suggestions/${suggestion.id}/status`, {
      onSuccess: onStatusChange,
      onError: () => {},
    }, { status: "ignored" });
  };

  const handleGenerateMessage = () => {
    setMsgError(null);
    apiPost<{ job: { id: string } }>(
      `${BACKEND_URL}/api/wealthos/clients/${clientId}/message/generate`,
      {
        onSuccess: (response) => {
          setMsgJobQueued(true);
          startPolling([response.job.id]);
        },
        onError: (err) => setMsgError(err),
      },
      { channel, context: context || undefined }
    );
  };

  const isPending = suggestion.status === "pending";

  return (
    <div
      className="rounded-[14px]"
      style={{
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={suggestion.priority} />
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-ibm-plex-mono, monospace)",
            color: "var(--qc-ink-2)",
          }}
        >
          Score {(suggestion.score * 100).toFixed(0)}
        </span>
      </div>

      <p className="mb-1" style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}>
        {suggestion.suggested_action}
      </p>
      <p className="mb-3" style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
        {suggestion.reason}
      </p>

      {suggestion.talking_points.length > 0 && (
        <ul className="space-y-1 mb-3">
          {suggestion.talking_points.map((point, i) => (
            <li key={i} className="flex items-start gap-1.5" style={{ fontSize: 12, color: "var(--qc-ink)" }}>
              <span
                className="mt-0.5 size-1.5 shrink-0 rounded-full"
                style={{ background: "var(--qc-ink-2)" }}
              />
              {point}
            </li>
          ))}
        </ul>
      )}

      {suggestion.message && (
        <div
          className="rounded-md px-3 py-2 mb-3"
          style={{
            border: "1px solid var(--qc-hair-2)",
            background: "var(--qc-section)",
          }}
        >
          <p className="italic" style={{ fontSize: 12, color: "var(--qc-ink)" }}>
            &ldquo;{suggestion.message}&rdquo;
          </p>
        </div>
      )}

      {suggestion.status !== "pending" && (
        <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }} className="inline-flex items-center capitalize">
          {suggestion.status === "used" ? "✓ Acted on" : "✗ Ignored"}
        </span>
      )}

      {isPending && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Button size="sm" variant="default" onClick={handleMarkUsed}>Mark Used</Button>
          <Button size="sm" variant="outline" onClick={handleMarkIgnored}>Ignore</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowMessageForm(v => !v)}>
            Generate Message
          </Button>
        </div>
      )}

      {showMessageForm && isPending && (
        <div
          className="mt-3 space-y-2 pt-3"
          style={{ borderTop: "1px dashed var(--qc-hair-2)" }}
        >
          <div className="flex gap-2">
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as MessageChannel)}
              style={inputStyle}
            >
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="text"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Optional context..."
              className="flex-1"
              style={{ ...inputStyle, minWidth: 0 }}
            />
            <Button size="sm" onClick={handleGenerateMessage} disabled={isPolling || msgJobQueued}>
              {isPolling ? "Generating..." : "Send"}
            </Button>
          </div>
          {(isPolling || msgJobQueued) && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1" />
              <p style={{ fontSize: 10, color: "var(--qc-ink-2)" }}>
                Generating message... {progress}%
              </p>
            </div>
          )}
          {msgError && (
            <p style={{ fontSize: 12, color: "var(--qc-down)" }}>{msgError}</p>
          )}
        </div>
      )}
    </div>
  );
}
