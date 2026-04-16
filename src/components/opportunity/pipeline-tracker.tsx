import type { PipelineStep } from "@/types/management";

interface PipelineTrackerProps {
  steps: PipelineStep[];
}

function StepIcon({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  if (status === "processing") {
    return (
      <svg className="w-4 h-4 text-[#0F172B] animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    );
  }
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D1D5DB]" />;
}

function StepRow({ step, isLast }: { step: PipelineStep; isLast: boolean }) {
  const isDone = step.status === "completed";
  const isFailed = step.status === "failed";
  const isProcessing = step.status === "processing";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-[#E2E2E2]" : ""} ${isProcessing ? "bg-[#F5F5F5]" : "bg-white"}`}
    >
      <div className="shrink-0 w-5 h-5 flex items-center justify-center">
        <StepIcon status={step.status} />
      </div>
      <span className={`text-[13px] flex-1 ${isDone ? "text-[#0F172B]" : isFailed ? "text-red-600" : isProcessing ? "text-[#0F172B] font-medium" : "text-[#888888]"}`}>
        {step.label}
      </span>
      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm ${
        isDone       ? "bg-emerald-50 text-emerald-700" :
        isFailed     ? "bg-red-50 text-red-600" :
        isProcessing ? "bg-[#0F172B]/5 text-[#0F172B]" :
                       "bg-[#F5F5F5] text-[#888888]"
      }`}>
        {step.status}
      </span>
    </div>
  );
}

export function PipelineTracker({ steps }: PipelineTrackerProps) {
  if (steps.length === 0) return null;

  const completedCount = steps.filter(s => s.status === "completed").length;
  const totalSteps = steps.length;
  const progressPct = Math.round((completedCount / totalSteps) * 100);
  const overallFailed = steps.some(s => s.status === "failed");
  const overallDone = completedCount === totalSteps;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#0F172B]">
          {overallDone ? "Analysis Complete" : overallFailed ? "Analysis Failed" : "Running Analysis Pipeline"}
        </p>
        <span className="text-[11px] font-semibold text-[#888888]">
          {completedCount}/{totalSteps} steps
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#E2E2E2] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${overallFailed ? "bg-red-500" : overallDone ? "bg-emerald-600" : "bg-[#0F172B]"}`}
          style={{ width: `${overallDone ? 100 : progressPct}%` }}
        />
      </div>

      <div className="space-y-0 border border-[#E2E2E2] rounded-[8px] overflow-hidden">
        {steps.map((step, idx) => (
          <StepRow key={step.analysis_type} step={step} isLast={idx === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}
