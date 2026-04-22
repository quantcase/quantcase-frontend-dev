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

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid var(--qc-border-default)",
  background: "var(--qc-surface-card)",
  color: "var(--qc-text-heading)",
  fontSize: 13,
  padding: "6px 12px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--qc-text-muted)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
};

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
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-[14px] p-4"
      style={{
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-card)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }}>
          Log Interaction
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{ fontSize: 12, color: "var(--qc-text-muted)" }}
          className="hover:opacity-70 transition-opacity"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Type *</label>
          <select value={type} onChange={e => setType(e.target.value as InteractionType)} style={inputStyle}>
            {INTERACTION_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Timestamp *</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Summary</label>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={2}
          placeholder="What was discussed..."
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>Sentiment</label>
          <input
            type="text"
            value={sentiment}
            onChange={e => setSentiment(e.target.value)}
            placeholder="positive / neutral / negative"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>RM ID</label>
          <input
            type="text"
            value={rmId}
            onChange={e => setRmId(e.target.value)}
            placeholder="Optional RM UUID"
            style={inputStyle}
          />
        </div>
      </div>

      {error && <p style={{ fontSize: 12, color: "var(--qc-down)" }}>{error}</p>}

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Logging..." : "Log Interaction"}
      </Button>
    </form>
  );
}
