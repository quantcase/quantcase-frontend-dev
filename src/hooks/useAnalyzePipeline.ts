import { useState, useRef, useEffect } from "react";
import { apiPost, apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { FullPipelineResponse, PipelineJobStatusResponse, PipelineStep } from "@/types/management";

export function useAnalyzePipeline(callId: string) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const pollJob = (jobId: string) => {
    apiCall<PipelineJobStatusResponse>(`${BACKEND_URL}/api/jobs/${jobId}`, {
      onSuccess: (response) => {
        const steps = response.data.all_steps ?? [];
        if (steps.length > 0) setPipelineSteps(steps);

        const failedStep = steps.find(s => s.status === "failed");
        const allDone = steps.length > 0 && steps.every(s => s.status === "completed");

        if (failedStep) {
          stopPolling();
          setIsAnalyzing(false);
          setAnalyzeError(`Step "${failedStep.label}" failed`);
        } else if (allDone) {
          stopPolling();
          setIsAnalyzing(false);
          setTimeout(() => window.location.reload(), 1500);
        }
      },
      onError: (error: string) => {
        stopPolling();
        setIsAnalyzing(false);
        setAnalyzeError(error);
      },
    });
  };

  const handleAnalyze = () => {
    setAnalyzeError(null);
    setPipelineSteps([]);
    setIsAnalyzing(true);

    apiPost<FullPipelineResponse>(`${BACKEND_URL}/api/calls/${callId}/opportunity/analysis/full`, {
      onSuccess: (response) => {
        const job = response.job;
        if (job.all_steps) setPipelineSteps(job.all_steps);
        pollJob(job.id);
        pollingIntervalRef.current = setInterval(() => pollJob(job.id), 2000);
      },
      onError: (error: string) => {
        setIsAnalyzing(false);
        setAnalyzeError(error);
      },
    });
  };

  useEffect(() => () => stopPolling(), []);

  return { isAnalyzing, analyzeError, pipelineSteps, handleAnalyze };
}
