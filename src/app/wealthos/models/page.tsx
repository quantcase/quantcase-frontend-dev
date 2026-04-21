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
    void model;
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-5" style={{ background: "var(--qc-surface-base)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between">
        <h1
          className="uppercase tracking-wide"
          style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)", letterSpacing: "0.05em" }}
        >
          Approved Investment Models
        </h1>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? "Cancel" : "+ Add Model"}
        </Button>
      </div>

      {showForm && <CreateModelForm onSuccess={handleModelCreated} onCancel={() => setShowForm(false)} />}

      <SectionPanel title="All Models" subtitle={`${models.length} approved models`} contentClassName="px-6 pb-6">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse"
                style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}
              />
            ))}
          </div>
        )}
        {error && <p className="py-4" style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>}
        {!loading && models.length === 0 && (
          <p className="py-6 text-center" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>
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
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>}>
      <ModelsContent />
    </Suspense>
  );
}
