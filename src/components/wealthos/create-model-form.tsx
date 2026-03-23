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

  const inputClass = "w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">New Approved Model</h3>
        <button type="button" onClick={onCancel} className="text-xs text-zinc-400 hover:text-zinc-600">Cancel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className={labelClass}>Model Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Conservative Debt Ladder" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Type *</label>
          <select value={modelType} onChange={e => setModelType(e.target.value as ModelType)} required className={inputClass}>
            {MODEL_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..." className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Model Data (JSON, optional)</label>
          <textarea
            value={dataJson}
            onChange={e => setDataJson(e.target.value)}
            rows={3}
            placeholder='{"target_duration": 3, "max_credit_risk": "AA"}'
            className={`${inputClass} resize-none font-mono text-xs`}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Creating..." : "Create Model"}
      </Button>
    </form>
  );
}
