"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Lock, Loader2, X } from "lucide-react";
import { useOpportunityPrompt, SECTION_ID_MAP } from "@/hooks/useOpportunityPrompt";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { JobStatusResponse } from "@/types/management";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SideWindowSection {
  id: string;
  label: string;
}

export const DEFAULT_SECTIONS: SideWindowSection[] = [
  { id: "industry_overview", label: "Industry Overview" },
  { id: "competition", label: "Competition" },
  { id: "financial_strength", label: "Financial Strength" },
  { id: "customer_traction", label: "Customer Traction" },
];

interface CustomJobResponse {
  success: boolean;
  job: { id: string };
}

interface PromptSideWindowProps {
  callId: string;
  sections?: SideWindowSection[];
  callsAnalyzed?: string[];
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onSectionUpdate?: (sectionKey: string, sectionResult: unknown) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromptSideWindow({
  callId,
  sections = DEFAULT_SECTIONS,
  selectedSection,
  onSectionChange,
  onSectionUpdate,
  onClose,
}: PromptSideWindowProps) {
  const { data, loading } = useOpportunityPrompt(callId, selectedSection);
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data?.instructions) {
      setInstructions(data.instructions);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const pollJob = (jobId: string) => {
    pollingRef.current = setInterval(() => {
      apiCall<JobStatusResponse>(`${BACKEND_URL}/api/jobs/${jobId}`, {
        onSuccess: (response) => {
          const job = response.data;
          if (job.status === "completed") {
            stopPolling();
            setGenerating(false);
            setDone(true);
            setTimeout(() => setDone(false), 2000);

            const returnvalue = job.bullmqObject?.returnvalue as {
              sectionKey?: string;
              sectionResult?: unknown;
            } | undefined;

            if (returnvalue?.sectionKey && returnvalue?.sectionResult && onSectionUpdate) {
              onSectionUpdate(returnvalue.sectionKey, returnvalue.sectionResult);
            }
          } else if (job.status === "failed") {
            stopPolling();
            setGenerating(false);
            setGenerateError("Analysis failed. Please try again.");
          }
        },
        onError: () => {
          stopPolling();
          setGenerating(false);
          setGenerateError("Failed to check job status.");
        },
      });
    }, 2000);
  };

  const handleGenerate = () => {
    if (!callId || generating) return;
    setGenerateError(null);
    setGenerating(true);
    stopPolling();

    const apiSection = SECTION_ID_MAP[selectedSection] ?? selectedSection;
    const url = `${BACKEND_URL}/api/calls/${callId}/opportunity/analysis/custom`;

    apiPost<CustomJobResponse>(
      url,
      {
        onSuccess: (response) => {
          const jobId = response.job?.id;
          if (jobId) {
            pollJob(jobId);
          } else {
            setGenerating(false);
            setGenerateError("No job ID returned from server.");
          }
        },
        onError: (err) => {
          setGenerating(false);
          setGenerateError(err || "Failed to start analysis.");
        },
      },
      { section: apiSection, customInstructions: instructions }
    );
  };

  const metrics = data?.metrics ?? [];

  return (
    <div className="fixed top-0 right-0 h-screen w-[460px] z-50 flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Prompt Context
        </p>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Section Selector */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
            Section
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {sections.map((section) => {
              const isSelected = selectedSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  disabled={generating}
                  className={`text-left px-3 py-2 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pre Computed Metrics — collapsible */}
        <div className="border-b border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setMetricsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Pre Computed Metrics
              </span>
              {!loading && metrics.length > 0 && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">({metrics.length})</span>
              )}
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${metricsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {metricsOpen && (
            <div className="px-4 pb-3">
              {loading ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse my-1" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="flex items-center gap-2 py-0.5">
                      <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">→</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{metric.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Instructions */}
        <div className="flex flex-col flex-1 px-4 py-3 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              System Instructions
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating || loading || !callId}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-colors disabled:cursor-not-allowed ${
                done
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : generating
                  ? "bg-blue-400 text-white opacity-80"
                  : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              }`}
            >
              {done ? (
                <>
                  <Check className="h-3 w-3" />
                  Done
                </>
              ) : generating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
          {loading ? (
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 flex-1 animate-pulse" />
          ) : (
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={generating}
              className="w-full resize-none rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-mono flex-1 disabled:opacity-60"
              spellCheck={false}
            />
          )}
          {generateError && (
            <p className="mt-2 text-[11px] text-red-500 dark:text-red-400">{generateError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
