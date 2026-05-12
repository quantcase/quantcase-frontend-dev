import { useState, useEffect, useRef, useCallback } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiPost, apiCall } from '@/lib/api';
import type { JobStatus, JobStatusResponse } from '@/types/management';
import type { InsightType, AnalysisTriggerResponse } from '@/types/analysis';

interface UseAnalyzeTriggerOptions {
  callId: string;
  types: InsightType[];
  onComplete?: () => void;
}

export function useAnalyzeTrigger({ callId, types, onComplete }: UseAnalyzeTriggerOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
  const [progress, setProgress] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const allStatuses = Object.values(jobStatuses);
  const aggregateStatus: JobStatus | null = allStatuses.length === 0
    ? null
    : allStatuses.some(s => s === "failed") ? "failed"
    : allStatuses.every(s => s === "completed") ? "completed"
    : allStatuses.some(s => s === "processing") ? "processing"
    : "pending";

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  }, []);

  const pollJobs = useCallback((ids: string[]) => {
    ids.forEach(jobId => {
      apiCall<JobStatusResponse>(`${BACKEND_URL}/api/jobs/${jobId}`, {
        onSuccess: (response) => {
          const status = response.data.status;
          setJobStatuses(prev => {
            const updated = { ...prev, [jobId]: status };
            const statuses = Object.values(updated);
            if (statuses.every(s => s === "completed")) {
              setProgress(100);
              stopPolling();
              setIsAnalyzing(false);
              setTimeout(() => onComplete?.(), 1000);
            } else if (statuses.some(s => s === "failed")) {
              stopPolling();
              setIsAnalyzing(false);
              setAnalyzeError(response.data.error || "One or more jobs failed");
            }
            return updated;
          });
        },
        onError: (err) => {
          stopPolling();
          setIsAnalyzing(false);
          setAnalyzeError(err);
        },
      });
    });
  }, [stopPolling, onComplete]);

  const trigger = useCallback(async () => {
    setAnalyzeError(null);
    setJobStatuses({});
    setProgress(0);
    setIsAnalyzing(true);

    try {
      const jobIds = await new Promise<string[]>((resolve, reject) => {
        apiPost<AnalysisTriggerResponse>(`${BACKEND_URL}/api/analysis`, {
          onSuccess: (response) => resolve(response.jobs.map(j => j.jobId)),
          onError: reject,
        }, { callId, types });
      });

      const initial: Record<string, JobStatus> = {};
      jobIds.forEach(id => { initial[id] = "pending"; });
      setJobStatuses(initial);
      pollJobs(jobIds);
      pollingRef.current = setInterval(() => pollJobs(jobIds), 2000);
    } catch (err: unknown) {
      setIsAnalyzing(false);
      setAnalyzeError(err instanceof Error ? err.message : "Failed to start analysis");
    }
  }, [callId, types, pollJobs]);

  useEffect(() => {
    if (aggregateStatus === "processing") {
      const totalDuration = 40000;
      const targetProgress = 95;
      const updateInterval = 100;
      const step = targetProgress / (totalDuration / updateInterval);
      let cur = 0;

      progressRef.current = setInterval(() => {
        cur += step;
        if (cur >= targetProgress) {
          cur = targetProgress;
          if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
        }
        setProgress(Math.round(cur));
      }, updateInterval);
    }
    return () => {
      if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
    };
  }, [aggregateStatus]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { isAnalyzing, analyzeError, aggregateStatus, progress, trigger };
}
