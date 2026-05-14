import { useState, useEffect, useRef, useCallback } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiCall, apiPost } from "@/lib/api";
import type { OverviewAnalysis, OverviewAnalysisApiResponse, OverviewTriggerResponse } from "@/types/overview";

type JobStatus = "pending" | "processing" | "completed" | "failed";

interface JobStatusResponse {
  data: { status: JobStatus; error?: string };
}

// ─── Fetch hook ────────────────────────────────────────────────────────────────

interface UseOverviewFetchResult {
  data: OverviewAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOverviewFetch(callId: string): UseOverviewFetchResult {
  const [data, setData] = useState<OverviewAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!callId.trim()) return;
    apiCall<OverviewAnalysisApiResponse>(`${BACKEND_URL}/api/analysis/overview?callId=${callId}`, {
      onStart: () => { setLoading(true); setError(null); },
      onSuccess: (res) => {
        const d = res.data;
        setData(d.available ? d : null);
        setLoading(false);
      },
      onError: (err) => { setError(err); setLoading(false); },
    });
  }, [callId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Trigger hook ──────────────────────────────────────────────────────────────

interface UseOverviewTriggerOptions {
  callId: string;
  onComplete?: () => void;
}

interface UseOverviewTriggerResult {
  isAnalyzing: boolean;
  analyzeError: string | null;
  jobStatus: JobStatus | null;
  progress: number;
  trigger: () => void;
}

export function useOverviewTrigger({ callId, onComplete }: UseOverviewTriggerOptions): UseOverviewTriggerResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [progress, setProgress] = useState(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const stopAll = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  }, []);

  const pollJob = useCallback((jobId: string) => {
    apiCall<JobStatusResponse>(`${BACKEND_URL}/api/jobs/${jobId}`, {
      onSuccess: (res) => {
        const status = res.data.status;
        setJobStatus(status);
        if (status === "completed") {
          setProgress(100);
          stopAll();
          setIsAnalyzing(false);
          setTimeout(() => onComplete?.(), 800);
        } else if (status === "failed") {
          stopAll();
          setIsAnalyzing(false);
          setAnalyzeError(res.data.error || "Analysis job failed");
        }
      },
      onError: (err) => { stopAll(); setIsAnalyzing(false); setAnalyzeError(err); },
    });
  }, [stopAll, onComplete]);

  const trigger = useCallback(() => {
    setAnalyzeError(null);
    setJobStatus(null);
    setProgress(0);
    setIsAnalyzing(true);

    apiPost<OverviewTriggerResponse>(
      `${BACKEND_URL}/api/analysis/overview`,
      {
        onSuccess: (res) => {
          const jobId = res.jobId;
          setJobStatus("pending");
          pollJob(jobId);
          pollingRef.current = setInterval(() => pollJob(jobId), 2000);
        },
        onError: (err) => { setIsAnalyzing(false); setAnalyzeError(err); },
      },
      { callId, forceRefresh: false },
    );
  }, [callId, pollJob]);

  // Animate progress bar while processing
  useEffect(() => {
    if (jobStatus === "processing") {
      const totalDuration = 40000;
      const targetProgress = 95;
      const interval = 100;
      const step = targetProgress / (totalDuration / interval);
      let cur = 0;
      progressRef.current = setInterval(() => {
        cur += step;
        if (cur >= targetProgress) {
          cur = targetProgress;
          if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
        }
        setProgress(Math.round(cur));
      }, interval);
    }
    return () => { if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; } };
  }, [jobStatus]);

  useEffect(() => () => stopAll(), [stopAll]);

  return { isAnalyzing, analyzeError, jobStatus, progress, trigger };
}
