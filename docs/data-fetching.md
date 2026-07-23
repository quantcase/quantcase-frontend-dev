# Data fetching

All network access goes through one small module — [`src/lib/api.ts`](../src/lib/api.ts) — and is
consumed by custom hooks. There is no React Query / SWR and no data store; each hook owns its own
`loading`/`error`/`data` state.

## The callback pattern

Unlike a promise-returning client, `api.ts` helpers take a **callbacks object** and return `void`.
Every helper accepts `ApiCallbacks<T>`:

```ts
interface ApiCallbacks<T> {
  onStart?: () => void;                 // fired before the request
  onSuccess: (data: T) => void;         // receives the parsed JSON
  onError: (error: string) => void;     // receives a message string
  onComplete?: () => void;              // always fired last (finally)
}
```

`authHeaders()` injects `Content-Type: application/json` and, when a `qc_at` token is present,
`Authorization: Bearer <token>`. So **auth is automatic** — callers never set headers.

## The response envelope

The backend wraps successful responses as:

```jsonc
{ "success": true, "data": <T> }
```

The **envelope-validating** helpers assert this shape and throw
`"Invalid response format from API"` when `success` is falsy. Importantly, `onSuccess` receives the
**whole envelope**, so hooks read `response.data` (not the raw payload):

```ts
apiCall<L3AnalysisResponse>(url, {
  onSuccess: (response) => setInsights(response.data?.results ?? []),
  onError:   (err) => setError(err),
});
```

## Helper families

| Helper | Method | Envelope check | Notes |
|--------|--------|:---:|-------|
| `apiCall<T>` | GET | ✅ requires `success` **and** `data` | The workhorse GET. |
| `apiPost<T>` | POST | ✅ requires `success` | |
| `apiPut<T>` / `apiDelete<T>` | PUT / DELETE | ✅ requires `success` | `apiDelete` treats `204` as `{ success: true }`. |
| `apiAuthGet/Post/Put/Patch/Delete<T>` | * | ✅ | Same, but surface `json.error` on non-2xx; explicit bearer-token variants. |
| `apiAuthUpload<T>` | POST (multipart) | ✅ | `FormData` upload (no JSON content-type). |
| `rawFetch<T>` / `rawPost<T>` / `rawPut<T>` | GET / POST / PUT | ❌ | For endpoints that return **raw JSON** with no envelope. |
| `rawPostDownload` | POST | ❌ | Streams the response to a file download (e.g. CSV export) instead of parsing JSON. |

Rule of thumb: use `apiCall`/`apiPost`/… for the standard `{ success, data }` API; reach for the
`raw*` helpers only when an endpoint deliberately returns a bare payload or a binary file.

## The hook convention

Data hooks live in [`src/hooks/`](../src/hooks/) (~60 of them). The canonical shape: a `useEffect`
keyed on the query argument fires an `api.ts` call and maps the callbacks onto local state, returning
`{ data, loading, error }`.

[`useSummary(callId)`](../src/hooks/useSummary.ts) is the minimal example:

```ts
export function useSummary(callId: string) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId.trim()) return;
    apiCall<SummaryData>(`${BACKEND_URL}/api/summary/${callId}`, {
      onStart:   () => { setLoading(true); setError(null); setData(null); },
      onSuccess: (data) => { setData(data); setLoading(false); },
      onError:   (error) => { setError(error); setData(null); setLoading(false); },
    });
  }, [callId]);

  return { data, loading, error };
}
```

### The insight hooks

The management/opportunity/deal factor pages share one fetcher,
[`useAnalysis(ticker)`](../src/hooks/useAnalysis.ts):

- `GET /api/post-html-analysis?ticker=…&layer_id=l3`
- runs the wire results through `adaptL3Results` (see [Adapters](#adapter-layer))
- exposes `getInsight(type)` → the first `available` insight of that `InsightType`.

The per-factor hooks are 1-line wrappers, e.g.:

```ts
// useManagementAnalysis.ts
useAnalysis(callId).getInsight('management');
```

`useDealAnalysis` / `useOpportunityAnalysis` follow the same pattern.
[`useOverviewFetch(ticker)`](../src/hooks/useOverviewAnalysis.ts) hits the same endpoint with
`layer_id=l4`, adapts via `adaptL4Results`, and also exposes `refetch`.

## Adapter layer

The wire format is decoupled from the UI in [`src/lib/`](../src/lib/):

| Adapter | Transforms |
|---------|-----------|
| [`analysis-adapter.ts`](../src/lib/analysis-adapter.ts) | L3 `L3Result[]` → flat `InsightData[]`; normalizes each lens to `max_score = 100`, applies `LENS_DISPLAY_NAME` overrides, derives the top key signals. |
| [`overview-adapter.ts`](../src/lib/overview-adapter.ts) | L4 summary → `OverviewAnalysis`. |

Other `lib/` helpers include `technicals-*.ts` (indicators/scores), `journal-format.ts`,
`portfolio-format.ts`, `billing.ts`, `smallcase.ts`, `chart-tokens.ts` (token values for SVG/charts),
and `utils.ts` (`cn`, date/badge helpers).

## State management

No Redux/Zustand. Global state is **React Context only**:

- [`UserProvider`](../src/components/providers/UserContext.tsx) — user, account type, subscription,
  paywall, and smallcase connection, hydrated from `/auth/me` and cached in `localStorage` (see
  [Routing & auth](routing-and-auth.md#localstorage-keys)).
- [`ThemeProvider`](../src/components/providers/ThemeProvider.tsx) — active theme.

Everything else is local to a component or its hook. Long-running server work (AI analysis) is handled
by the polling hooks in [Async job pipeline](async-jobs.md).
