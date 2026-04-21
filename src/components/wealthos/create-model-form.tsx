"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { WealthModel, ModelType } from "@/types/wealthos";

interface CreateModelFormProps {
  onSuccess: (model: WealthModel) => void;
  onCancel: () => void;
}

const MODEL_TYPES: ModelType[] = ["equity", "debt", "hybrid", "structured", "pms", "aif"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid var(--qc-border-default)",
  background: "var(--qc-surface-card)",
  color: "var(--qc-text-heading)",
  fontSize: 13,
  padding: "7px 12px",
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

export function CreateModelForm({ onSuccess, onCancel }: CreateModelFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modelType, setModelType] = useState<ModelType>("equity");
  const [dataJson, setDataJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsedData: Record<string, unknown> | undefined;
    if (dataJson.trim()) {
      try {
        parsedData = JSON.parse(dataJson);
      } catch {
        setError("Model data must be valid JSON");
        return;
      }
    }

    const body: Record<string, unknown> = { name, model_type: modelType };
    if (description) body.description = description;
    if (parsedData) body.data = parsedData;

    apiPost<{ data: WealthModel }>(
      `${BACKEND_URL}/api/wealthos/models`,
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
        border: "1px solid var(--qc-border-default)",
        background: "var(--qc-surface-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)" }}>
          New Approved Model
        </h3>
        <button
          type="button"
          onClick={onCancel}
          style={{ fontSize: 12, color: "var(--qc-text-muted)" }}
          className="hover:opacity-70 transition-opacity"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label style={labelStyle}>Model Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Conservative Debt Ladder" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Type *</label>
          <select value={modelType} onChange={e => setModelType(e.target.value as ModelType)} required style={inputStyle}>
            {MODEL_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." style={inputStyle} />
        </div>
        <div className="md:col-span-2">
          <label style={labelStyle}>Model Data (JSON, optional)</label>
          <textarea
            value={dataJson}
            onChange={e => setDataJson(e.target.value)}
            rows={3}
            placeholder='{"target_duration": 3, "max_credit_risk": "AA"}'
            style={{ ...inputStyle, resize: "none", fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: 12 }}
          />
        </div>
      </div>
      {error && <p style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Creating..." : "Create Model"}
      </Button>
    </form>
  );
}
