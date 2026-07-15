"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { ModelBuilderCard } from "@/components/model-builder/model-builder-card";
import { PortfolioBuilderStepper } from "@/components/model-builder/portfolio-builder-stepper";

// ── Modal ─────────────────────────────────────────────────────────────────────

function PortfolioBuilderModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dialog */}
      <div
        className="relative flex flex-col w-full max-w-4xl mx-auto my-0 sm:my-10 sm:rounded-lg overflow-hidden"
        style={{ background: "var(--qc-card)", maxHeight: "calc(100dvh - 80px)" }}
      >
        {/* Fixed header */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
        >
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--qc-ink)" }}>
              Wealth Builder
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--qc-ink-2)" }}>
              Model Portfolio Library — configure and save for relationship managers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors shrink-0"
            style={{ color: "var(--qc-ink-2)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper — owns scrollable content + footer buttons internally */}
        <div className="flex flex-col flex-1 min-h-0">
          <PortfolioBuilderStepper onSuccess={onSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ModelBuilderPage() {
  const router = useRouter();
  const { models, loading, error } = useModels();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = (id: string) => {
    setModalOpen(false);
    router.push(`/model-builder/${id}`);
  };

  return (
    <>
      <div className="min-h-screen bg-secondary mb-8 px-4 py-8">
        <div className="mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: "var(--qc-ink)" }}>
                Wealth Builder
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: "var(--qc-ink-2)" }}>
                Model Portfolio Library — configure and save for relationship managers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[var(--qc-on-dark)] transition-colors hover:opacity-90"
              style={{ background: "var(--qc-ink)" }}
            >
              <Plus className="h-4 w-4" />
              New Portfolio
            </button>
          </div>

          {/* Models list */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>Loading models...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-24">
              <p className="text-sm text-down">{error}</p>
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}
              >
                <Plus className="w-5 h-5" style={{ color: "var(--qc-ink-2)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--qc-ink)" }}>
                No portfolios yet
              </p>
              <p className="text-xs mb-6" style={{ color: "var(--qc-ink-2)" }}>
                Build your first model portfolio to get started.
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-md px-5 py-2.5 text-sm font-semibold text-[var(--qc-on-dark)] transition-colors hover:opacity-90"
                style={{ background: "var(--qc-ink)" }}
              >
                Build your first portfolio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <ModelBuilderCard key={model.id} model={model} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modal — rendered outside page flow so it overlays everything */}
      {modalOpen && (
        <PortfolioBuilderModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
