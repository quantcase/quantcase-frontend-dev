"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/constants";
import { GoogleSignInButton } from "@/components/molecules/google-signin-button";
import { usesInvestorFlow, type AccountType } from "@/components/providers/UserContext";
import type { GoogleAuthResponse } from "@/types/auth";

/** Only allow internal, non-signin return paths — guards against open redirects. */
function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/signin")) return null;
  return raw;
}

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        style={{ fontSize: 11, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.07em" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg outline-none transition-all"
        style={{ border: "1px solid #E2E2E2", padding: "11px 14px", fontSize: 14, color: "#121212", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#0F172B";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15,23,43,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#E2E2E2";
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
        }}
      />
    </div>
  );
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function routeAfterAuth(accessToken: string, acctType: string | undefined) {
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    if (acctType) localStorage.setItem("qc_account_type", acctType);

    // Always fetch /api/auth/me to get onboarding state and resolve accountType if missing
    const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (meRes.ok) {
      const me = await meRes.json();
      const resolvedType: string | undefined = me?.accountType ?? me?.account_type ?? acctType;
      if (resolvedType) localStorage.setItem("qc_account_type", resolvedType);

      const onboardingDone: boolean = me?.onboarding_completed ?? me?.profile?.onboarding_completed ?? true;
      localStorage.setItem("qc_onboarding_completed", String(onboardingDone));

      if (!onboardingDone) {
        router.push("/onboarding");
        return;
      }

      if (next) {
        router.push(next);
        return;
      }
      router.push(usesInvestorFlow((resolvedType ?? null) as AccountType) ? "/investor/dashboard" : "/dashboard");
    } else {
      // Fallback: route based on signin response accountType
      if (next) {
        router.push(next);
        return;
      }
      router.push(usesInvestorFlow((acctType ?? null) as AccountType) ? "/investor/dashboard" : "/dashboard");
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("qc_at", data.access_token);
      localStorage.setItem("qc_rt", data.refresh_token);

      const acctType: string | undefined = data?.accountType ?? data?.account_type;
      await routeAfterAuth(data.access_token, acctType);
    } catch {
      setError("Unable to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(data: GoogleAuthResponse) {
    setError("");
    setGoogleLoading(true);
    try {
      localStorage.setItem("qc_at", data.access_token);
      localStorage.setItem("qc_rt", data.refresh_token);
      await routeAfterAuth(data.access_token, data.user?.accountType);
    } catch {
      setError("Unable to reach server. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[360px]">
      {/* Mobile-only logo */}
      <div className="mb-10 lg:hidden">
        <Image
          src="/logos/logo-text-dark.png"
          alt="QuantCase"
          width={139}
          height={32}
          className="h-6 w-auto"
        />
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 500, color: "#0F172B", marginBottom: 6, letterSpacing: "-0.02em" }}>
        Welcome back
      </h1>
      <p style={{ fontSize: 14, color: "#888888", marginBottom: 36, lineHeight: 1.5 }}>
        Sign in to your research workspace.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@firm.com"
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-lg px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <p className="text-down" style={{ fontSize: 13 }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg transition-all"
          style={{
            background: "#0F172B",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            padding: "12px 0",
            marginTop: 2,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
            boxShadow: loading ? "none" : "0 2px 8px rgba(15,23,43,0.25)",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3" style={{ marginTop: 24 }}>
        <div style={{ flex: 1, height: 1, background: "#E2E2E2" }} />
        <span style={{ fontSize: 11, color: "rgba(18,18,18,0.40)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          or
        </span>
        <div style={{ flex: 1, height: 1, background: "#E2E2E2" }} />
      </div>

      <div style={{ marginTop: 20 }}>
        <GoogleSignInButton
          disabled={loading || googleLoading}
          onSuccess={handleGoogleSuccess}
          onError={setError}
        />
      </div>

      {/* <p style={{ fontSize: 12, color: "rgba(18,18,18,0.40)", marginTop: 32, textAlign: "center", lineHeight: 1.6 }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "#0F172B", fontWeight: 500, textDecoration: "none" }}>
          Create one
        </Link>
      </p> */}
    </div>
  );
}
