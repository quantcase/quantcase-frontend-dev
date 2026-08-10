"use client";

import { useState } from "react";
import Image from "next/image";
import { SignInHeroPanel } from "@/components/signin/SignInHeroPanel";

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        style={{ fontSize: 11, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.07em" }}
      >
        {label} {!required && <span style={{ color: "#888888", textTransform: "none", fontWeight: 400 }}>(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
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

function RequestAccessForm() {
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  }

  if (success) {
    return (
      <div className="w-full max-w-[360px] text-center">
        <h1 style={{ fontSize: 28, fontWeight: 500, color: "#0F172B", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Request Received
        </h1>
        <p style={{ fontSize: 15, color: "#3A4B61", lineHeight: 1.6 }}>
          Thank you for your interest! We have received your request and will be in touch shortly.
        </p>
      </div>
    );
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
        Request Access
      </h1>
      <p style={{ fontSize: 14, color: "#888888", marginBottom: 36, lineHeight: 1.5 }}>
        Join the waitlist to get enterprise-grade research.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="John Doe"
          autoComplete="name"
        />
        <FormField
          id="profession"
          label="Profession"
          type="text"
          value={profession}
          onChange={setProfession}
          placeholder="Fund Manager, Analyst, etc."
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
          id="mobile"
          label="Mobile number"
          type="tel"
          value={mobile}
          onChange={setMobile}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          required={false}
        />
        
        <div className="flex flex-col gap-2">
          <label
            htmlFor="income"
            style={{ fontSize: 11, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.07em" }}
          >
            Income Level
          </label>
          <select
            id="income"
            required
            value={income}
            onChange={(e) => setIncome(e.target.value)}
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
          >
            <option value="" disabled>Select income level</option>
            <option value="0_10">0-10Lac PA</option>
            <option value="10_25">10-25Lac PA</option>
            <option value="25_50">25-50Lac PA</option>
            <option value="50_plus">50Lac +</option>
          </select>
        </div>

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
          {loading ? "Submitting…" : "Request access"}
        </button>
      </form>
    </div>
  );
}

export default function RequestAccessPage() {
  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#F5F5F5" }}>
      <div className="lg:w-[52%] xl:w-[55%] flex-shrink-0 h-full">
        <SignInHeroPanel />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <RequestAccessForm />
      </div>
    </div>
  );
}
