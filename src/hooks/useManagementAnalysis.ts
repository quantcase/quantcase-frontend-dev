import { useAnalysis } from './useAnalysis';
import type { InsightData } from '@/types/analysis';

export function useManagementAnalysis(callId: string) {
  const { getInsight, loading, error } = useAnalysis(callId);
  const data: InsightData | null = getInsight('management');
  return { data, loading, error };
}
