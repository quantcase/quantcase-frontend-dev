"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { useWealthSuggestions } from "@/hooks/useWealthSuggestions";
import { useJobPoller } from "@/hooks/useJobPoller";
import { SuggestionCard } from "./suggestion-card";
import type { WealthJobsResponse } from "@/types/wealthos";

interface SuggestionsPanelProps {
  clientId: string;
  rmId?: string;
}

export function SuggestionsPanel({ clientId, rmId }: SuggestionsPanelProps) {
  const { data: suggestions, loading, error, refetch } = useWealthSuggestions(clientId);

  const { isPolling, progress, startPolling } = useJobPoller({
    onComplete: () => refetch(),
    onError: () => {},
  });

  const handleGenerate = () => {
    apiPost<WealthJobsResponse>(
      `${BACKEND_URL}/api/wealthos/suggestions/generate`,
      {
        onSuccess: (response) => {
          const jobIds = response.jobs.map(j => j.id);
          startPolling(jobIds);
        },
        onError: () => {},
      },
      { client_ids: [clientId], rm_id: rmId }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
          {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isPolling}>
          {isPolling ? "Generating..." : "Generate Suggestions"}
        </Button>
      </div>

      {isPolling && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p style={{ fontSize: 11, color: "var(--qc-ink-2)" }}>
            AI is generating suggestions... {progress}%
          </p>
        </div>
      )}

      {loading && (
        <p className="py-4 text-center" style={{ fontSize: 13, color: "var(--qc-ink-2)" }}>
          Loading suggestions...
        </p>
      )}
      {error && (
        <p className="py-4 text-center" style={{ fontSize: 13, color: "var(--qc-down)" }}>
          {error}
        </p>
      )}

      {!loading && suggestions.length === 0 && !isPolling && (
        <p className="py-6 text-center" style={{ fontSize: 13, color: "var(--qc-ink-2)" }}>
          No suggestions yet. Click &ldquo;Generate Suggestions&rdquo; to create AI-powered recommendations.
        </p>
      )}

      <div className="space-y-3">
        {suggestions.map(suggestion => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            clientId={clientId}
            onStatusChange={refetch}
          />
        ))}
      </div>
    </div>
  );
}
