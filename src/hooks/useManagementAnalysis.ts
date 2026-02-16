import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/lib/constants';
import { apiCall } from '@/lib/api';
import { ManagementDashboardResponse, TimeframeOption, ManagementDashboardData } from '@/types/management';

export function useManagementAnalysis(callId: string, timeframe: TimeframeOption = 'rolling_3_year') {
  const [data, setData] = useState<ManagementDashboardData | Record<string, never>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId.trim()) return;

    const url = `${BACKEND_URL}/api/management/analysis?callId=${callId}&timeframe=${timeframe}`;

    apiCall<ManagementDashboardResponse>(url, {
      onStart: () => {
        setLoading(true);
        setError(null);
        setData({});
      },
      onSuccess: (data) => {
        setData(data.data);
        setLoading(false);
      },
      onError: (error) => {
        setError(error);
        setData({});
        setLoading(false);
      },
    });
  }, [callId, timeframe]);

  return { data, loading, error };
}
