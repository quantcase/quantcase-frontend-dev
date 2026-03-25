"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { ModelBuilderCard } from "@/components/model-builder/model-builder-card";
import { SectionPanel } from "@/components/molecules/section-panel";

export default function ModelBuilderPage() {
  const { models, loading, error } = useModels();

  return (
    <div className="min-h-screen bg-white mb-8 px-4">
      <div className="container mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#888888" }}>
              Terminal
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 500, color: "#0F172B", lineHeight: 1.1 }}>
              Portfolio Models
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#888888" }}>
              Build, manage and edit client portfolio models.
            </p>
          </div>
          <Link
            href="/model-builder/new"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ background: "#0F172B" }}
          >
            <Plus className="h-4 w-4" />
            New Model
          </Link>
        </div>

        {/* Models list panel */}
        <SectionPanel title="All Models">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: "#888888" }}>Loading models...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm mb-1" style={{ color: "#0F172B", fontWeight: 500 }}>
                No models yet
              </p>
              <p className="text-xs mb-6" style={{ color: "#888888" }}>
                Create your first portfolio model to get started.
              </p>
              <Link
                href="/model-builder/new"
                className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors"
                style={{ background: "#0F172B" }}
              >
                Create your first model
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
              {models.map((model) => (
                <ModelBuilderCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </SectionPanel>

      </div>
    </div>
  );
}
