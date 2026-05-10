import { useAnalysis } from './useAnalysis';
import type { InsightData } from '@/types/analysis';

export function useOpportunityAnalysis(callId: string) {
  const { getInsight, loading, error } = useAnalysis(callId);
  const data: InsightData | null = getInsight('opportunity');
  return { data, loading, error };
}
