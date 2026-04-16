"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import type { StoredModel, PortfolioData } from "@/types/portfolio";

type CreateModelInput = Omit<PortfolioData, "id">;

interface UseModelsReturn {
  models: StoredModel[];
  loading: boolean;
  error: string | null;
  createModel: (input: CreateModelInput) => Promise<StoredModel>;
  updateModel: (id: string, patch: Partial<StoredModel>) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  getModel: (id: string) => StoredModel | undefined;
  refetch: () => void;
}

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<StoredModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${BACKEND_URL}/api/models`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`);
        return res.json();
      })
      .then((data) => setModels(data?.data ?? data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tick]);

  const createModel = useCallback(async (input: CreateModelInput): Promise<StoredModel> => {
    const res = await fetch(`${BACKEND_URL}/api/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Failed to create model: ${res.status}`);
    const data = await res.json();
    const created: StoredModel = data?.data ?? data;
    setModels((prev) => [...prev, created]);
    return created;
  }, []);

  const updateModel = useCallback(async (id: string, patch: Partial<StoredModel>): Promise<void> => {
    const res = await fetch(`${BACKEND_URL}/api/models/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Failed to update model: ${res.status}`);
    const data = await res.json();
    const updated: StoredModel = data?.data ?? data;
    setModels((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, []);

  const deleteModel = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${BACKEND_URL}/api/models/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete model: ${res.status}`);
    setModels((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const getModel = useCallback(
    (id: string): StoredModel | undefined => models.find((m) => m.id === id),
    [models]
  );

  return { models, loading, error, createModel, updateModel, deleteModel, getModel, refetch };
}
