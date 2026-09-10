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
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [targetAumCr, setTargetAumCr] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body: Record<string, unknown> = {
      display_name: displayName.trim(),
      email: email.trim().toLowerCase(),
    };
    if (phone.trim()) body.phone = phone.trim();
    if (team.trim()) body.team = team.trim();
    if (targetAumCr) body.target_aum_cr = parseFloat(targetAumCr);
    if (password) body.password = password;
    if (notes.trim()) body.notes = notes.trim();

    apiPost<{ data: WealthRM }>(
      `${BACKEND_URL}/api/wealthos/rm`,
      {
        onStart: () => setLoading(true),
        onSuccess: (response) => {
          setLoading(false);
          onSuccess(response.data);
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
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
          <label style={labelStyle}>Full Name *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Priya Shah"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email (Firm Login) *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="priya@quantcase.ai"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91-9876543210"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Team / Division</label>
          <input
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="e.g. North India - UHNI"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Target AUM (₹ Cr)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={targetAumCr}
            onChange={(e) => setTargetAumCr(e.target.value)}
            placeholder="e.g. 500"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Initial Password (Optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters (default: Quantcase@123)"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Notes / Bio</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Senior Private Banker with 12+ years experience in Family Offices"
          style={inputStyle}
        />
      </div>
      {error && (
        <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>
      )}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Creating..." : "Create RM Profile"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
