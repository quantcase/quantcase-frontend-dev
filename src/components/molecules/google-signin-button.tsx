"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { BACKEND_URL, GOOGLE_CLIENT_ID } from "@/lib/constants";
import type { GoogleAuthResponse } from "@/types/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (data: GoogleAuthResponse) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google) return;

    async function handleCredentialResponse(response: { credential: string }) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: response.credential }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403) {
            onError(data?.error || "This is an invite-only platform. Please contact us for an invite.");
          } else if (res.status === 401) {
            onError("Your Google session expired. Please try signing in again.");
          } else {
            onError(data?.error || "Google sign-in failed. Please try again.");
          }
          return;
        }

        onSuccess(data as GoogleAuthResponse);
      } catch {
        onError("Unable to reach server. Please try again.");
      }
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        void handleCredentialResponse(response);
      },
    });

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: 360,
      text: "continue_with",
      shape: "rectangular",
    });
  }, [scriptLoaded, onSuccess, onError]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        ref={buttonRef}
        aria-disabled={disabled}
        style={{
          pointerEvents: disabled ? "none" : "auto",
          opacity: disabled ? 0.65 : 1,
          display: "flex",
          justifyContent: "center",
        }}
      />
    </>
  );
}
