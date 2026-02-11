interface ApiCallbacks<T> {
  onStart?: () => void;
  onSuccess: (data: T) => void;
  onError: (error: string) => void;
  onComplete?: () => void;
}

/**
 * Simple network utility for API calls with callbacks
 * @param url - The API endpoint URL
 * @param callbacks - Callbacks for different stages of the request
 */
export function apiCall<T>(url: string, callbacks: ApiCallbacks<T>): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      if (!data || !data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }
      onSuccess(data);
    })
    .catch(err => {
      onError(err.message || 'Failed to load data');
    })
    .finally(() => {
      onComplete?.();
    });
}
