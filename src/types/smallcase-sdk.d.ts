// Ambient global for the smallcase Gateway JavaScript SDK.
// Loaded via <Script src="https://gateway.smallcase.com/scdk/2.0.0/scdk.js"> in the (app) layout.
// The SDK only runs on the whitelisted origin (https://www.quantcase.ai/); on other
// origins window.scDK may be present but transactions are rejected by smallcase.

declare global {
  interface ScDKConfig {
    amo?: boolean;
  }

  interface ScDKOptions {
    gateway: string;
    /** null for the first (guest) connect; the SDK manages the token afterwards */
    smallcaseAuthToken: string | null;
    config?: ScDKConfig;
  }

  interface ScDKTriggerParams {
    transactionId: string;
    /** optional list of broker keys to restrict the picker */
    brokers?: string[];
  }

  interface ScDKTransactionResponse {
    success: boolean;
    transaction?: string;
    [key: string]: unknown;
  }

  interface ScDKInstance {
    triggerTransaction(params: ScDKTriggerParams): Promise<ScDKTransactionResponse>;
    /** Swap the session token on an existing instance (token is minted fresh per transaction) */
    setSmallcaseAuthToken?(smallcaseAuthToken: string): void;
    brokerLogout?(): Promise<unknown>;
    showOrders?(): Promise<unknown>;
  }

  interface Window {
    scDK?: new (options: ScDKOptions) => ScDKInstance;
  }
}

export {};
