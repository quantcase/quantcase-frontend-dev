"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { useWealthRMList } from "@/hooks/useWealthRM";
import type { WealthClient, Segment, RiskProfile } from "@/types/wealthos";

const SEGMENTS: Segment[] = ["HNI", "UHNI", "Retail", "Institutional", "Private"];
const RISK_PROFILES: RiskProfile[] = ["conservative", "moderate", "aggressive"];

export function CreateClientForm() {
  const router = useRouter();
  const { data: rms } = useWealthRMList();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rmId, setRmId] = useState("");
  const [segment, setSegment] = useState<Segment>("HNI");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderate");
  const [engagementScore, setEngagementScore] = useState("");
  const [churnProbability, setChurnProbability] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body: Record<string, unknown> = {
      name,
      segment,
      risk_profile: riskProfile,
    };
    if (email) body.email = email;
    if (phone) body.phone = phone;
    if (rmId) body.rm_id = rmId;
    if (engagementScore) body.engagement_score = Number(engagementScore);
    if (churnProbability) body.churn_probability = Number(churnProbability);

    apiPost<{ data: WealthClient }>(
      `${BACKEND_URL}/api/wealthos/clients`,
      {
        onStart: () => setLoading(true),
        onSuccess: (response) => {
          setLoading(false);
          router.push(`/wealthos/clients/${response.data.id}`);
        },
        onError: (err) => { setError(err); setLoading(false); },
      },
      body
    );
  };

  const inputClass = "w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Rajan Mehta" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rajan@example.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-9876543210" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Relationship Manager</label>
          <select value={rmId} onChange={e => setRmId(e.target.value)} className={inputClass}>
            <option value="">— Unassigned —</option>
            {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Segment *</label>
          <select value={segment} onChange={e => setSegment(e.target.value as Segment)} required className={inputClass}>
            {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Risk Profile *</label>
          <select value={riskProfile} onChange={e => setRiskProfile(e.target.value as RiskProfile)} required className={inputClass}>
            {RISK_PROFILES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Engagement Score (0–100)</label>
          <input type="number" value={engagementScore} onChange={e => setEngagementScore(e.target.value)} min={0} max={100} placeholder="e.g. 60" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Churn Probability (0–1)</label>
          <input type="number" value={churnProbability} onChange={e => setChurnProbability(e.target.value)} min={0} max={1} step={0.01} placeholder="e.g. 0.3" className={inputClass} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Client"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
