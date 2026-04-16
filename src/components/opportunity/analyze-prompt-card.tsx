import type { TranscriptCall } from "@/types/management";
import { useAnalyzePipeline } from "@/hooks/useAnalyzePipeline";
import { PipelineTracker } from "./pipeline-tracker";

interface AnalyzePromptCardProps {
  transcriptCall: TranscriptCall;
}

function MetaField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-[#888888]">{label}</p>
      <p className={`text-[13px] font-semibold text-[#0F172B] mt-0.5 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</p>
    </div>
  );
}

export function AnalyzePromptCard({ transcriptCall }: AnalyzePromptCardProps) {
  const { isAnalyzing, analyzeError, pipelineSteps, handleAnalyze } = useAnalyzePipeline(transcriptCall.id);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4">

        {/* Company header */}
        <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-5">
          <p className="text-[11px] uppercase tracking-wider text-[#888888] font-medium mb-1">Opportunity Factor Analysis</p>
          <h2 className="text-[22px] font-[400] text-[#0F172B] leading-tight">{transcriptCall.company_name}</h2>
          <p className="text-[13px] text-[#888888] mt-0.5">{transcriptCall.basic_industry}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-[#E2E2E2]">
            <MetaField label="Ticker" value={transcriptCall.company} />
            <MetaField label="Quarter" value={`${transcriptCall.quarter} ${transcriptCall.fiscal_year}`} />
            <MetaField label="Call Date" value={transcriptCall.call_date} />
            <MetaField label="Call ID" value={transcriptCall.id} mono />
          </div>
        </div>

        {/* Analysis card */}
        <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-5 space-y-4">

          {!isAnalyzing && pipelineSteps.length === 0 && !analyzeError && (
            <p className="text-[13px] text-[#888888]">No opportunity analysis available for this transcript yet.</p>
          )}

          {analyzeError && (
            <div className="flex items-start gap-2.5 p-3 rounded-[8px] bg-red-50 border border-red-200">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[12px] text-red-600">{analyzeError}</p>
            </div>
          )}

          <PipelineTracker steps={pipelineSteps} />

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-[#0F172B] text-white hover:bg-[#1e293b] font-semibold py-3 px-4 rounded-[8px] text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing
              ? pipelineSteps.length === 0 ? "Starting..." : "Analyzing..."
              : analyzeError ? "Retry Analysis" : "Analyze"}
          </button>

          {transcriptCall.ppt_url && (
            <a
              href={transcriptCall.ppt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[12px] text-[#888888] hover:text-[#0F172B] transition-colors"
            >
              View Presentation →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
