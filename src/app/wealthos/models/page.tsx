"use client";

import { useState, Suspense } from "react";
import { useWealthModels } from "@/hooks/useWealthModels";
import { ModelCard } from "@/components/wealthos/model-card";
import { CreateModelForm } from "@/components/wealthos/create-model-form";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Button } from "@/components/ui/button";
import type { WealthModel } from "@/types/wealthos";

function ModelsContent() {
  const [showForm, setShowForm] = useState(false);
  const { data: models, loading, error } = useWealthModels();

  const handleModelCreated = (model: WealthModel) => {
    setShowForm(false);
    // Model list will refresh on next render if we add refetch support
    // For now, page reload works since the hook re-runs on mount
    void model;
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">Approved Investment Models</h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? "Cancel" : "+ Add Model"}
        </Button>
      </div>

      {showForm && <CreateModelForm onSuccess={handleModelCreated} onCancel={() => setShowForm(false)} />}

      <SectionPanel title="All Models" subtitle={`${models.length} approved models`} contentClassName="px-6 pb-6">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)}
          </div>
        )}
        {error && <p className="text-sm text-red-500 py-4">{error}</p>}
        {!loading && models.length === 0 && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">
            No approved models yet. Add one to enable AI suggestions.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {models.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}

export default function WealthOSModelsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading...</div>}>
      <ModelsContent />
    </Suspense>
  );
}
