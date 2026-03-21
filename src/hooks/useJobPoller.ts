import { useState, useEffect, useRef, useCallback } from "react";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";

type JobStatus = "pending" | "processing" | "completed" | "failed";

interface JobStatusResponse {
  data: {
    status: JobStatus;
    error?: string;
  };
}

interface UseJobPollerOptions {
  onComplete?: () => void;
  onError?: (msg: string) => void;
  /** Duration in ms to animate progress from 0 to 95%. Default: 40000 */
  animationDuration?: number;
}

interface UseJobPollerReturn {
  isPolling: boolean;
  progress: number;
  startPolling: (jobIds: string[]) => void;
  stopPolling: () => void;
}

export function useJobPoller({
  onComplete,
  onError,
  animationDuration = 40000,
}: UseJobPollerOptions = {}): UseJobPollerReturn {
  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const pollAllJobs = useCallback((ids: string[]) => {
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
              setIsPolling(false);
              onComplete?.();
            } else if (statuses.some(s => s === "failed")) {
              stopPolling();
              setIsPolling(false);
              onError?.(response.data.error || "One or more jobs failed");
            }

            return updated;
          });
        },
        onError: (error) => {
          stopPolling();
          setIsPolling(false);
          onError?.(error);
        },
      });
    });
  }, [stopPolling, onComplete, onError]);

  const startPolling = useCallback((jobIds: string[]) => {
    if (jobIds.length === 0) return;

    setProgress(0);
    setIsPolling(true);
    const initialStatuses: Record<string, JobStatus> = {};
    jobIds.forEach(id => { initialStatuses[id] = "pending"; });
    setJobStatuses(initialStatuses);

    pollAllJobs(jobIds);
    pollingIntervalRef.current = setInterval(() => pollAllJobs(jobIds), 2000);
  }, [pollAllJobs]);

  // Animate progress bar when polling is active
  useEffect(() => {
    const allStatuses = Object.values(jobStatuses);
    const isProcessing = allStatuses.length > 0 && !allStatuses.every(s => s === "completed") && !allStatuses.some(s => s === "failed");

    if (isProcessing && isPolling) {
      const targetProgress = 95;
      const updateInterval = 100;
      const progressPerStep = targetProgress / (animationDuration / updateInterval);
      let currentProgress = 0;

      progressIntervalRef.current = setInterval(() => {
        currentProgress += progressPerStep;
        if (currentProgress >= targetProgress) {
          currentProgress = targetProgress;
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
        setProgress(Math.round(currentProgress));
      }, updateInterval);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPolling, jobStatuses, animationDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { isPolling, progress, startPolling, stopPolling };
}
