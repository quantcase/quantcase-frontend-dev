"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthPost } from "@/lib/api";
import { triggerTransaction } from "@/lib/smallcase";
import {
  isProcessing,
  type SmallcaseConnectTransaction,
  type SmallcaseConfirmResponse,
} from "@/types/smallcase";

/**
 * Drives the smallcase Gateway connect flow:
 *   1. POST /connect            → { transactionId }
 *   2. SDK triggerTransaction   → broker login UI
 *   3. POST /transactions/:id/confirm (polled while { status: 'processing' })
 *
 * Mirrors the app's callback/hook conventions (see useAnalyzeTrigger). The confirm
 * poll reuses the two-ref interval + unmount-cleanup pattern from useJobPoller.
 */

export type ConnectStep =
  | "idle"
  | "creating"    // POST /connect
  | "awaiting_sdk" // SDK broker UI is open
  | "confirming"  // POST /confirm (incl. processing poll)
  | "done"
  | "error";

const CONFIRM_POLL_INTERVAL = 2000;

interface UseSmallcaseConnectOptions {
  onConnected?: () => void;
}

export function useSmallcaseConnect({ onConnected }: UseSmallcaseConnectOptions = {}) {
  const [step, setStep] = useState<ConnectStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clearConfirmTimer = useCallback(() => {
    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearConfirmTimer();
    };
  }, [clearConfirmTimer]);

  const fail = useCallback((message: string) => {
    if (!mountedRef.current) return;
    clearConfirmTimer();
    setError(message);
    setStep("error");
  }, [clearConfirmTimer]);

  // POST /transactions/:id/confirm, re-scheduling itself while smallcase is still settling.
  // A ref holds the latest callback so the self-scheduled poll always calls the current one.
  const confirmRef = useRef<(transactionId: string) => void>(() => {});
  const confirm = useCallback((transactionId: string) => {
    apiAuthPost<{ success: boolean; data: SmallcaseConfirmResponse }>(
      `${BACKEND_URL}/api/smallcase/transactions/${transactionId}/confirm`,
      {
        onSuccess: (res) => {
          if (!mountedRef.current) return;
          const data = res.data;
          if (isProcessing(data)) {
            // Still settling on smallcase's side — poll again shortly.
            confirmTimeoutRef.current = setTimeout(
              () => confirmRef.current(transactionId),
              CONFIRM_POLL_INTERVAL
            );
            return;
          }
          if (data.is_connected) {
            setStep("done");
            onConnected?.();
          } else {
            fail("Broker connection could not be confirmed. Please try again.");
          }
        },
        onError: (err) => fail(err),
      }
    );
  }, [fail, onConnected]);
  const [premadeTxn, setPremadeTxn] = useState<{ transactionId: string; smallcaseAuthToken: string } | null>(null);

  const prepare = useCallback((intent: string = "HOLDINGS_IMPORT") => {
    apiAuthPost<{ success: boolean; data: { transactionId: string; smallcaseAuthToken: string } }>(
      `${BACKEND_URL}/api/smallcase/connect`,
      {
        onSuccess: (res) => setPremadeTxn(res.data),
        onError: (err) => console.error("Failed to prepare smallcase transaction:", err),
      },
      { intent }
    );
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  confirmRef.current = confirm;

  const connect = useCallback((intent: string = "HOLDINGS_IMPORT") => {
    if (!premadeTxn) {
      fail("Gateway is still initializing. Please wait a second and try again.");
      return;
    }

    setError(null);
    setStep("awaiting_sdk");

    const { transactionId, smallcaseAuthToken } = premadeTxn;
    const promise = triggerTransaction(transactionId, smallcaseAuthToken);
    
    // Prepare a fresh transaction in the background in case they cancel and need to retry
    prepare(intent);

    promise
      .then(() => {
        if (!mountedRef.current) return;
        setStep("confirming");
        confirm(transactionId);
      })
      .catch((sdkErr) => {
        fail(sdkErr instanceof Error ? sdkErr.message : "Broker connection failed.");
      });
  }, [premadeTxn, confirm, fail, prepare]);

  const reset = useCallback(() => {
    clearConfirmTimer();
    setError(null);
    setStep("idle");
  }, [clearConfirmTimer]);

  return { step, error, connect, reset };
}
