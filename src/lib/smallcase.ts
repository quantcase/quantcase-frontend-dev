// Thin wrapper around the smallcase Gateway JavaScript SDK (window.scDK).
// Keeps the SDK global and its quirks out of React components/hooks.
//
// The SDK script is loaded lazily via <Script> in src/app/(app)/layout.tsx and
// only runs on the whitelisted origin (https://www.quantcase.ai/). On any other
// origin — including localhost during development — window.scDK is unavailable or
// its transactions are rejected, so getScGateway() throws a clear error the calling
// hooks surface to the user.

const GATEWAY_NAME = "quantcase";

let instance: ScDKInstance | null = null;

/** True once the SDK script has loaded and window.scDK is available. */
export function isSmallcaseSdkReady(): boolean {
  return typeof window !== "undefined" && typeof window.scDK === "function";
}

/**
 * Lazily construct (and memoize) the smallcase Gateway instance, seeding it with
 * the smallcaseAuthToken the backend minted for the current transaction.
 *
 * The backend issues a fresh token per transaction, so on subsequent calls we swap
 * the token on the existing instance via setSmallcaseAuthToken. Initializing (or
 * running a transaction) with a null token yields an `internal_error` from the
 * Gateway, so a token is required.
 */
export function getScGateway(smallcaseAuthToken: string): ScDKInstance {
  if (typeof window === "undefined") {
    throw new Error("smallcase SDK is unavailable during server rendering");
  }
  if (typeof window.scDK !== "function") {
    throw new Error(
      "smallcase Gateway is still loading, or this origin is not whitelisted. Please try again in a moment."
    );
  }
  if (!smallcaseAuthToken) {
    throw new Error("Missing smallcase session token — the transaction cannot be started.");
  }
  if (!instance) {
    instance = new window.scDK({
      gateway: GATEWAY_NAME,
      smallcaseAuthToken,
      config: { amo: true },
    });
  } else {
    // Token is fresh per transaction — update the memoized instance's session.
    instance.setSmallcaseAuthToken?.(smallcaseAuthToken);
  }
  return instance;
}

/**
 * Run a backend-created transaction through the SDK's broker UI, using the
 * smallcaseAuthToken returned alongside the transactionId for that transaction.
 * Resolves when the user completes the flow; rejects on cancel/SDK error with a
 * displayable message.
 */
export async function triggerTransaction(
  transactionId: string,
  smallcaseAuthToken: string
): Promise<ScDKTransactionResponse> {
  const gateway = getScGateway(smallcaseAuthToken);
  const response = await gateway.triggerTransaction({ transactionId });
  if (!response?.success) {
    throw new Error("The broker transaction was cancelled or did not complete.");
  }
  return response;
}
