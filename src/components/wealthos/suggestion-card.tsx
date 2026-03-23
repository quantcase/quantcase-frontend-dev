"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiPut, apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { PriorityBadge } from "./priority-badge";
import { useJobPoller } from "@/hooks/useJobPoller";
import { Progress } from "@/components/ui/progress";
import type { WealthSuggestion, MessageChannel } from "@/types/wealthos";

interface SuggestionCardProps {
  suggestion: WealthSuggestion;
  clientId: string;
  onStatusChange: () => void;
}

const CHANNELS: MessageChannel[] = ["call", "email", "whatsapp"];

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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={suggestion.priority} />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Score {(suggestion.score * 100).toFixed(0)}
        </span>
      </div>

      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">{suggestion.suggested_action}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{suggestion.reason}</p>

      {suggestion.talking_points.length > 0 && (
        <ul className="space-y-1 mb-3">
          {suggestion.talking_points.map((point, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {suggestion.message && (
        <div className="rounded-md border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 mb-3">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">&ldquo;{suggestion.message}&rdquo;</p>
        </div>
      )}

      {suggestion.status !== "pending" && (
        <span className="inline-flex items-center text-xs text-zinc-400 dark:text-zinc-500 capitalize">
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
        <div className="mt-3 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <div className="flex gap-2">
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as MessageChannel)}
              className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="text"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Optional context..."
              className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button size="sm" onClick={handleGenerateMessage} disabled={isPolling || msgJobQueued}>
              {isPolling ? "Generating..." : "Send"}
            </Button>
          </div>
          {(isPolling || msgJobQueued) && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1" />
              <p className="text-[10px] text-zinc-400">Generating message... {progress}%</p>
            </div>
          )}
          {msgError && <p className="text-xs text-red-600 dark:text-red-400">{msgError}</p>}
        </div>
      )}
    </div>
  );
}
