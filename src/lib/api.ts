interface ApiCallbacks<T> {
  onStart?: () => void;
  onSuccess: (data: T) => void;
  onError: (error: string) => void;
  onComplete?: () => void;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("qc_at");
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/** GET with Bearer token — expects { success, data } envelope */
export function apiAuthGet<T>(url: string, callbacks: ApiCallbacks<T>): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;
  onStart?.();
  fetch(url, { headers: authHeaders() })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
      if (!json?.success) throw new Error(json?.error ?? "Unexpected response");
      onSuccess(json);
    })
    .catch((err) => onError(err.message ?? "Failed to load data"))
    .finally(() => onComplete?.());
}

/** POST with Bearer token — expects { success } envelope */
export function apiAuthPost<T>(url: string, callbacks: ApiCallbacks<T>, body?: unknown): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;
  onStart?.();
  fetch(url, { method: "POST", headers: authHeaders(), body: body ? JSON.stringify(body) : undefined })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
      if (!json?.success) throw new Error(json?.error ?? "Unexpected response");
      onSuccess(json);
    })
    .catch((err) => onError(err.message ?? "Failed to complete request"))
    .finally(() => onComplete?.());
}

/** PATCH with Bearer token */
export function apiAuthPatch<T>(url: string, callbacks: ApiCallbacks<T>, body?: unknown): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;
  onStart?.();
  fetch(url, { method: "PATCH", headers: authHeaders(), body: body ? JSON.stringify(body) : undefined })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
      if (!json?.success) throw new Error(json?.error ?? "Unexpected response");
      onSuccess(json);
    })
    .catch((err) => onError(err.message ?? "Failed to update"))
    .finally(() => onComplete?.());
}

/** DELETE with Bearer token */
export function apiAuthDelete<T>(url: string, callbacks: ApiCallbacks<T>): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;
  onStart?.();
  fetch(url, { method: "DELETE", headers: authHeaders() })
    .then(async (res) => {
      if (res.status === 204) { onSuccess({ success: true } as T); return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
      onSuccess(json);
    })
    .catch((err) => onError(err.message ?? "Failed to delete"))
    .finally(() => onComplete?.());
}

/** Multipart file upload with Bearer token */
export function apiAuthUpload<T>(url: string, callbacks: ApiCallbacks<T>, formData: FormData): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;
  const token = getAuthToken();
  onStart?.();
  fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? `${res.status} ${res.statusText}`);
      if (!json?.success) throw new Error(json?.error ?? "Upload failed");
      onSuccess(json);
    })
    .catch((err) => onError(err.message ?? "Upload failed"))
    .finally(() => onComplete?.());
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
 * POST without success/data envelope validation — for endpoints that return raw JSON
 */
export function rawPost<T>(url: string, callbacks: ApiCallbacks<T>, body?: unknown): void {
  const { onStart, onSuccess, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then((data: T) => onSuccess(data))
    .catch((err) => onError(err.message || 'Failed to complete request'))
    .finally(() => onComplete?.());
}

interface DownloadCallbacks {
  onStart?: () => void;
  onError: (error: string) => void;
  onComplete?: () => void;
}

/**
 * POST that downloads the response as a file (e.g. CSV export) instead of parsing JSON.
 */
export function rawPostDownload(url: string, callbacks: DownloadCallbacks, body: unknown, filename: string): void {
  const { onStart, onError, onComplete } = callbacks;

  onStart?.();

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch((err) => onError(err.message || 'Failed to download file'))
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
