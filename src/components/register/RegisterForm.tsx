"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { GoogleSignInButton } from "@/components/molecules/google-signin-button";
import type { GoogleAuthResponse, RegisterPayload, RegisterResponse } from "@/types/auth";
import { usesInvestorFlow, type AccountType } from "@/components/providers/UserContext";

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  disabled?: boolean;
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
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg outline-none transition-all"
        style={{
          border: "1px solid #E2E2E2",
          padding: "11px 14px",
          fontSize: 14,
          color: disabled ? "#888888" : "#121212",
          background: disabled ? "#F5F5F5" : "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={(e) => {
          if (disabled) return;
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

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[360px]">
      <div className="mb-10 lg:hidden">
        <Image src="/logos/logo-text-dark.png" alt="QuantCase" width={139} height={32} className="h-6 w-auto" />
      </div>
      {children}
    </div>
  );
}

function GoogleSignInSection({
  loading,
  onSuccess,
  onError,
  error,
}: {
  loading: boolean;
  onSuccess: (data: GoogleAuthResponse) => void;
  onError: (message: string) => void;
  error: string;
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#E2E2E2" }} />
        <span style={{ fontSize: 11, color: "rgba(18,18,18,0.40)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          or
        </span>
        <div style={{ flex: 1, height: 1, background: "#E2E2E2" }} />
      </div>
      <GoogleSignInButton disabled={loading} onSuccess={onSuccess} onError={onError} />
      {error && (
        <div className="rounded-lg px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca", marginTop: 16 }}>
          <p className="text-down" style={{ fontSize: 13 }}>{error}</p>
        </div>
      )}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSuccess(data: GoogleAuthResponse) {
    setGoogleError("");
    setGoogleLoading(true);
    try {
      localStorage.setItem("qc_at", data.access_token);
      localStorage.setItem("qc_rt", data.refresh_token);
      if (data.user?.accountType) localStorage.setItem("qc_account_type", data.user.accountType);

      const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (meRes.ok) {
        const me = await meRes.json();
        const onboardingDone = me?.onboarding_completed ?? me?.profile?.onboarding_completed ?? false;
        localStorage.setItem("qc_onboarding_completed", String(onboardingDone));
        
        const resolvedType = me?.accountType ?? me?.account_type ?? data.user?.accountType;
        if (resolvedType) localStorage.setItem("qc_account_type", resolvedType);

        if (!onboardingDone) {
          router.push("/onboarding");
        } else {
          router.push(usesInvestorFlow((resolvedType ?? null) as AccountType) ? "/investor/dashboard" : "/dashboard");
        }
      } else {
        localStorage.setItem("qc_onboarding_completed", "false");
        router.push("/onboarding");
      }
    } catch {
      localStorage.setItem("qc_onboarding_completed", "false");
      router.push("/onboarding");
    } finally {
      setGoogleLoading(false);
    }
  }


  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const payload: RegisterPayload = {
      email,
      password,
      display_name: name || undefined,
    };

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.detail || data.message || "Registration failed. Please try again.");
        return;
      }

      const success = data as RegisterResponse;
      localStorage.setItem("qc_at", success.access_token);
      localStorage.setItem("qc_rt", success.refresh_token);
      localStorage.setItem("qc_onboarding_completed", "false");
      if (success.user?.accountType) localStorage.setItem("qc_account_type", success.user.accountType);

      router.push("/onboarding");
    } catch {
      setError("Unable to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  }



  return (
    <CenteredState>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: "#0F172B", marginBottom: 6, letterSpacing: "-0.02em" }}>
        Create your account
      </h1>
      <p style={{ fontSize: 14, color: "#888888", marginBottom: 36, lineHeight: 1.5 }}>
        Create an account to get started.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          id="name"
          label="Full name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Jane Smith"
          autoComplete="name"
        />
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
          placeholder="Min. 8 characters"
          autoComplete="new-password"
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <GoogleSignInSection loading={googleLoading} onSuccess={handleGoogleSuccess} onError={setGoogleError} error={googleError} />

      <p style={{ fontSize: 12, color: "rgba(18,18,18,0.40)", marginTop: 24, textAlign: "center", lineHeight: 1.6 }}>
        Already have an account?{" "}
        <Link href="/signin" style={{ color: "#0F172B", fontWeight: 500, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>

      <p style={{ fontSize: 11, color: "rgba(18,18,18,0.30)", marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </CenteredState>
  );
}
