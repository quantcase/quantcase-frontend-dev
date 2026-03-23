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

/**
 * Fetch without success/data validation — for endpoints that return raw JSON
 */
export function rawFetch<T>(url: string, callbacks: ApiCallbacks<T>): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then((data: T) => onSuccess(data))
    .catch((err) => onError(err.message || 'Failed to load data'))
    .finally(() => onComplete?.());
}

/**
 * Simple network utility for PUT API calls with callbacks
 */
export function apiPut<T>(url: string, callbacks: ApiCallbacks<T>, body?: unknown): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      if (!data || !data.success) throw new Error('Invalid response format from API');
      onSuccess(data);
    })
    .catch(err => onError(err.message || 'Failed to complete request'))
    .finally(() => onComplete?.());
}

/**
 * Simple network utility for DELETE API calls with callbacks
 */
export function apiDelete<T>(url: string, callbacks: ApiCallbacks<T>): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      if (res.status === 204) return { success: true };
      return res.json();
    })
    .then(data => {
      if (!data || !data.success) throw new Error('Invalid response format from API');
      onSuccess(data);
    })
    .catch(err => onError(err.message || 'Failed to complete request'))
    .finally(() => onComplete?.());
}

/**
 * Simple network utility for POST API calls with callbacks
 * @param url - The API endpoint URL
 * @param callbacks - Callbacks for different stages of the request
 * @param body - Optional request body
 */
export function apiPost<T>(url: string, callbacks: ApiCallbacks<T>, body?: unknown): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      if (!data || !data.success) {
        throw new Error('Invalid response format from API');
      }
      onSuccess(data);
    })
    .catch(err => {
      onError(err.message || 'Failed to complete request');
    })
    .finally(() => {
      onComplete?.();
    });
}
