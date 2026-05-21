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

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid var(--qc-hair)",
  background: "var(--qc-card)",
  color: "var(--qc-ink)",
  fontSize: 13,
  padding: "7px 12px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--qc-ink-2)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
};

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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[14px] p-5"
      style={{
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>
          New Relationship Manager
        </h3>
        <button
          type="button"
          onClick={onCancel}
          style={{ fontSize: 12, color: "var(--qc-ink-2)" }}
          className="hover:opacity-70 transition-opacity"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Priya Shah" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="priya@firm.com" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Team</label>
          <input type="text" value={team} onChange={e => setTeam(e.target.value)} placeholder="e.g. North" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Performance Score</label>
          <input type="number" value={performanceScore} onChange={e => setPerformanceScore(e.target.value)} min={0} max={100} placeholder="e.g. 80" style={inputStyle} />
        </div>
      </div>
      {error && <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Creating..." : "Create RM"}
      </Button>
    </form>
  );
}
