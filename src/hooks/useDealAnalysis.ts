import { useAnalysis } from './useAnalysis';
import type { InsightData } from '@/types/analysis';

export function useDealAnalysis(callId: string) {
  const { getInsight, loading, error } = useAnalysis(callId);
  const data: InsightData | null = getInsight('deal');
  return { data, loading, error };
}
