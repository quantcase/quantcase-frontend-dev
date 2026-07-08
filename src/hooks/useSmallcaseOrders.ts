"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "@/lib/constants";
import { apiAuthGet, apiAuthPost } from "@/lib/api";
import { triggerTransaction } from "@/lib/smallcase";
import type {
  SmallcaseOrder,
  SmallcaseOrdersData,
  SmallcaseOrderTransaction,
  SmallcasePlaceOrderInput,
} from "@/types/smallcase";

/**
 * Reads the user's smallcase orders and places new ones.
 *
 * Place flow: POST /orders → SDK triggerTransaction → poll GET /orders until the
 * newest order leaves a non-terminal state (pending/placed). Order status is
 * ultimately driven by smallcase's webhook to the backend, so we poll to reflect it.
 */

const ORDERS_POLL_INTERVAL = 2000;
const MAX_POLLS = 30; // ~60s ceiling so a stuck order doesn't poll forever

export type PlaceStep =
  | "idle"
  | "creating"     // POST /orders
  | "awaiting_sdk" // SDK order UI is open
  | "tracking"     // polling GET /orders for status
  | "done"
  | "error";

const TERMINAL: SmallcaseOrder["status"][] = ["completed", "failed", "cancelled"];

interface UseSmallcaseOrdersOptions {
  onPlaced?: () => void;
}

export function useSmallcaseOrders({ onPlaced }: UseSmallcaseOrdersOptions = {}) {
  const [orders, setOrders] = useState<SmallcaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [placeStep, setPlaceStep] = useState<PlaceStep>("idle");
  const [placeError, setPlaceError] = useState<string | null>(null);

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const mountedRef = useRef(true);

  const clearPollTimer = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearPollTimer();
    };
  }, [clearPollTimer]);

  // ── Read: GET /orders ────────────────────────────────────────────────────
  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    apiAuthGet<{ success: boolean; data: SmallcaseOrdersData }>(
      `${BACKEND_URL}/api/smallcase/orders`,
      {
        onSuccess: (res) => {
          if (!mountedRef.current) return;
          setOrders(res.data.orders ?? []);
        },
        onError: (err) => {
          if (!mountedRef.current) return;
          // "not connected" isn't an error worth showing here — just leave the list empty.
          const notConnected = err.includes("404") || err.toLowerCase().includes("not connected");
          setError(notConnected ? null : err);
          setOrders([]);
        },
        onComplete: () => mountedRef.current && setLoading(false),
      }
    );
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Place: POST /orders → SDK → poll ─────────────────────────────────────
  const placeFail = useCallback((message: string) => {
    if (!mountedRef.current) return;
    clearPollTimer();
    setPlaceError(message);
    setPlaceStep("error");
  }, [clearPollTimer]);

  // A ref holds the latest callback so the self-scheduled poll always calls the current one.
  const pollRef = useRef<() => void>(() => {});
  const pollUntilSettled = useCallback(() => {
    apiAuthGet<{ success: boolean; data: SmallcaseOrdersData }>(
      `${BACKEND_URL}/api/smallcase/orders?page=1&limit=10`,
      {
        onSuccess: (res) => {
          if (!mountedRef.current) return;
          const list = res.data.orders ?? [];
          setOrders(list);
          const newest = list[0];
          pollCountRef.current += 1;

          const settled = newest && TERMINAL.includes(newest.status);
          if (settled || pollCountRef.current >= MAX_POLLS) {
            setPlaceStep("done");
            onPlaced?.();
            return;
          }
          pollTimeoutRef.current = setTimeout(() => pollRef.current(), ORDERS_POLL_INTERVAL);
        },
        onError: (err) => placeFail(err),
      }
    );
  }, [onPlaced, placeFail]);
  pollRef.current = pollUntilSettled;

  const placeOrder = useCallback((input: SmallcasePlaceOrderInput) => {
    setPlaceError(null);
    setPlaceStep("creating");
    pollCountRef.current = 0;

    apiAuthPost<{ success: boolean; data: SmallcaseOrderTransaction }>(
      `${BACKEND_URL}/api/smallcase/orders`,
      {
        onSuccess: async (res) => {
          const { transactionId } = res.data;
          setPlaceStep("awaiting_sdk");
          try {
            await triggerTransaction(transactionId);
          } catch (sdkErr) {
            placeFail(sdkErr instanceof Error ? sdkErr.message : "Order was cancelled.");
            return;
          }
          if (!mountedRef.current) return;
          setPlaceStep("tracking");
          pollUntilSettled();
        },
        onError: (err) => placeFail(err),
      },
      input
    );
  }, [placeFail, pollUntilSettled]);

  const resetPlace = useCallback(() => {
    clearPollTimer();
    setPlaceError(null);
    setPlaceStep("idle");
  }, [clearPollTimer]);

  return {
    orders, loading, error, refetch: fetchOrders,
    placeOrder, placeStep, placeError, resetPlace,
  };
}
