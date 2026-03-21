"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthRM } from "@/types/wealthos";

interface CreateRMFormProps {
  onSuccess: (rm: WealthRM) => void;
  onCancel: () => void;
}

export function CreateRMForm({ onSuccess, onCancel }: CreateRMFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [performanceScore, setPerformanceScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body: Record<string, unknown> = { name };
    if (email) body.email = email;
    if (team) body.team = team;
    if (performanceScore) body.performance_score = Number(performanceScore);

    apiPost<{ data: WealthRM }>(
      `${BACKEND_URL}/api/wealthos/rm`,
      {
        onStart: () => setLoading(true),
        onSuccess: (response) => { setLoading(false); onSuccess(response.data); },
        onError: (err) => { setError(err); setLoading(false); },
      },
      body
    );
  };

  const inputClass = "w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">New Relationship Manager</h3>
        <button type="button" onClick={onCancel} className="text-xs text-zinc-400 hover:text-zinc-600">Cancel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Priya Shah" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@firm.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Team</label>
          <input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="e.g. North" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Performance Score</label>
          <input type="number" value={performanceScore} onChange={e => setPerformanceScore(e.target.value)} min={0} max={100} placeholder="e.g. 80" className={inputClass} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Creating..." : "Create RM"}
      </Button>
    </form>
  );
}
