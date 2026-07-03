"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BACKEND_URL } from "@/lib/constants";

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

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.message || data?.error || "Registration failed. Please try again.");
        return;
      }

      localStorage.setItem("qc_at", data.access_token);
      localStorage.setItem("qc_rt", data.refresh_token);
      localStorage.setItem("qc_onboarding_completed", "false");

      const acctType: string | undefined = data?.accountType ?? data?.account_type;
      if (acctType) localStorage.setItem("qc_account_type", acctType);

      router.push("/onboarding");
    } catch {
      setError("Unable to reach server. Please try again.");
    } finally {
      setLoading(false);
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
        Create your account
      </h1>
      <p style={{ fontSize: 14, color: "#888888", marginBottom: 36, lineHeight: 1.5 }}>
        Start your 7-day free trial. No credit card required.
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
            <p className="text-red-600" style={{ fontSize: 13 }}>{error}</p>
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

      <p style={{ fontSize: 12, color: "rgba(18,18,18,0.40)", marginTop: 24, textAlign: "center", lineHeight: 1.6 }}>
        Already have an account?{" "}
        <Link href="/signin" style={{ color: "#0F172B", fontWeight: 500, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>

      <p style={{ fontSize: 11, color: "rgba(18,18,18,0.30)", marginTop: 12, textAlign: "center", lineHeight: 1.6 }}>
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
