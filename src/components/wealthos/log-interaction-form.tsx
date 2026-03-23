"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { InteractionType } from "@/types/wealthos";

interface LogInteractionFormProps {
  clientId: string;
  onSuccess: () => void;
}

const INTERACTION_TYPES: InteractionType[] = ["call", "email", "whatsapp", "meeting", "sms"];

export function LogInteractionForm({ clientId, onSuccess }: LogInteractionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<InteractionType>("call");
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [rmId, setRmId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    apiPost(
      `${BACKEND_URL}/api/wealthos/clients/${clientId}/interactions`,
      {
        onStart: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          setIsOpen(false);
          setSummary("");
          setSentiment("");
          setRmId("");
          onSuccess();
        },
        onError: (err) => { setError(err); setLoading(false); },
      },
      {
        type,
        summary: summary || undefined,
        sentiment: sentiment || undefined,
        timestamp: new Date(timestamp).toISOString(),
        rm_id: rmId || undefined,
      }
    );
  };

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        + Log Interaction
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Log Interaction</h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-xs text-zinc-400 hover:text-zinc-600">Cancel</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Type *</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as InteractionType)}
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {INTERACTION_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Timestamp *</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Summary</label>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={2}
          placeholder="What was discussed..."
          className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Sentiment</label>
          <input
            type="text"
            value={sentiment}
            onChange={e => setSentiment(e.target.value)}
            placeholder="positive / neutral / negative"
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">RM ID</label>
          <input
            type="text"
            value={rmId}
            onChange={e => setRmId(e.target.value)}
            placeholder="Optional RM UUID"
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Logging..." : "Log Interaction"}
      </Button>
    </form>
  );
}
