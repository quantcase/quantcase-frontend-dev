"use client";

import { useState } from "react";
import { Check, Lock, X } from "lucide-react";

// ─── Static Data (replace with hook/API later) ────────────────────────────────

export const DEFAULT_SECTIONS = [
  { id: "industry_overview", label: "Industry Overview" },
  { id: "competition", label: "Competition" },
  { id: "financial_strength", label: "Financial Strength" },
  { id: "customer_traction", label: "Customer Traction" },
];

export const DEFAULT_CALLS_ANALYZED: string[] = [
  "AJANTPHARM_FY2025_Q3",
  "AJANTPHARM_FY2025_Q2",
  "AJANTPHARM_FY2025_Q1",
  "AJANTPHARM_FY2024_Q4",
];

export const DEFAULT_SECTION_METRICS: Record<string, string[]> = {
  industry_overview: [
    "Industry Revenue CAGR",
    "Industry OPM CAGR",
    "Market Size (₹ Cr)",
    "Current OPM (%)",
    "Demand Signal",
    "Supply Constraint",
  ],
  competition: [
    "Porter's Competitive Score",
    "Pricing Power Index",
    "Market Position",
    "Competitive Intensity",
    "Entry Barriers",
  ],
  financial_strength: [
    "Revenue CAGR (5Y)",
    "EBITDA Margin (%)",
    "Free Cash Flow (₹ Cr)",
    "Net Debt / EBITDA",
    "ROCE (%)",
  ],
  customer_traction: [
    "Active Customers",
    "Net Revenue Retention (%)",
    "Top-10 Concentration (%)",
    "Avg Contract Value",
    "Churn Rate (%)",
  ],
};

const DEFAULT_INSTRUCTIONS = `From ALL transcripts (subject + peer), identify:
  • Are the majority of managements talking about volume growth?
  • Are order books or pipelines expanding?
  • Is management guidance on volumes and capex positive or cautious?
  • What are the key demand/supply dynamics in this industry?
Populate with short and crisp points (maximum 10 words each).`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SideWindowSection {
  id: string;
  label: string;
}

interface PromptSideWindowProps {
  sections?: SideWindowSection[];
  callsAnalyzed?: string[];
  sectionMetrics?: Record<string, string[]>;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromptSideWindow({
  sections = DEFAULT_SECTIONS,
  callsAnalyzed = DEFAULT_CALLS_ANALYZED,
  sectionMetrics = DEFAULT_SECTION_METRICS,
  selectedSection,
  onSectionChange,
  onClose,
}: PromptSideWindowProps) {
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerated(true);
    setTimeout(() => setGenerated(false), 2000);
  };

  const metrics = sectionMetrics[selectedSection] ?? [];

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
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300 mb-2">
            Section
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {sections.map((section) => {
              const isSelected = selectedSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
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

        {/* Calls Analyzed */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Lock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Calls Analyzed
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {callsAnalyzed.length === 0 ? (
              <p className="text-[11px] text-zinc-400 italic col-span-2">No calls loaded</p>
            ) : (
              callsAnalyzed.map((callId) => (
                <div
                  key={callId}
                  className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate">
                    {callId}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pre Computed Metrics — per section */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Lock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              Pre Computed Metrics
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {metrics.map((metric) => (
              <div key={metric} className="flex items-center gap-2 py-1">
                <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">→</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{metric}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Instructions */}
        <div className="flex flex-col flex-1 px-4 py-3 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
              System Instructions
            </p>
            <button
              onClick={handleGenerate}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                generated
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {generated ? (
                <>
                  <Check className="h-3 w-3" />
                  Done
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full resize-none rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 font-mono min-h-[200px]"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
