"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { INTERCOM_APP_ID } from "@/lib/constants";
import { useUser } from "@/components/providers/UserContext";

declare global {
  interface Window {
    Intercom?: {
      (command: string, ...args: unknown[]): void;
      q?: unknown[];
      c?: (args: unknown) => void;
    };
    intercomSettings?: Record<string, unknown>;
  }
}

function loadIntercomScript() {
  const w = window;
  const ic = w.Intercom;
  if (typeof ic === "function") {
    ic("reattach_activator");
    ic("update", w.intercomSettings);
    return;
  }

  const queue: unknown[] = [];
  const i = ((...args: unknown[]) => {
    i.c?.(args);
  }) as NonNullable<typeof window.Intercom>;
  i.q = queue;
  i.c = (args: unknown) => {
    queue.push(args);
  };
  w.Intercom = i;

  const load = () => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = `https://widget.intercom.io/widget/${INTERCOM_APP_ID}`;
    const x = document.getElementsByTagName("script")[0];
    x.parentNode?.insertBefore(s, x);
  };

  if (document.readyState === "complete") {
    load();
  } else {
    window.addEventListener("load", load, false);
  }
}

/**
 * Boots the Intercom messenger app-wide (logged-out visitors and signed-in
 * users) and pushes an "update" on every route change so new messages/tours
 * targeted at the current page are picked up.
 */
export function IntercomProvider() {
  const pathname = usePathname();
  const { id, email, displayName } = useUser();
  const bootedRef = useRef(false);

  useEffect(() => {
    loadIntercomScript();
  }, []);

  useEffect(() => {
    if (!window.Intercom) return;

    window.Intercom("boot", {
      api_base: "https://api-iam.intercom.io",
      app_id: INTERCOM_APP_ID,
      ...(id ? { user_id: id } : {}),
      ...(displayName ? { name: displayName } : {}),
      ...(email ? { email } : {}),
    });
    bootedRef.current = true;
  }, [id, email, displayName]);

  useEffect(() => {
    if (!bootedRef.current || !window.Intercom) return;
    window.Intercom("update");
  }, [pathname]);

  return null;
}
