"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/constants";
import {
  Slide1Problem,
  Slide2MOD,
  Slide3LiveScore,
  Slide4Demat,
  Slide5Search,
} from "./_components/OnboardingSlides";

const TOTAL_SLIDES = 5;

const NEXT_LABELS = [
  "Continue",
  "See the framework",
  "See a live score",
  "Connect your demat",
  "Start researching",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [completing, setCompleting] = useState(false);

  function patchOnboarding(step: number, completed: boolean) {
    const token = localStorage.getItem("qc_at");
    if (!token) return Promise.resolve();
    return fetch(`${BACKEND_URL}/api/auth/me/onboarding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ onboarding_step: step, ...(completed ? { onboarding_completed: true } : {}) }),
    }).catch(() => {});
  }

  const complete = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    await patchOnboarding(TOTAL_SLIDES, true);
    localStorage.setItem("qc_onboarding_completed", "true");
    router.push("/investor/dashboard");
  }, [completing, router]);

  async function handleNext() {
    const nextSlide = current + 1;
    if (nextSlide >= TOTAL_SLIDES) {
      await complete();
      return;
    }
    // fire-and-forget step update
    patchOnboarding(nextSlide, false);
    setCurrent(nextSlide);
  }

  function handleBack() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  const slides = [
    <Slide1Problem key="s1" />,
    <Slide2MOD key="s2" />,
    <Slide3LiveScore key="s3" />,
    <Slide4Demat key="s4" onSkip={complete} />,
    <Slide5Search key="s5" />,
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F5F5F5",
        overflow: "hidden",
      }}
    >
      {/* Nav bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 48px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#F5F5F5",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ibm-plex-serif), Georgia, serif",
            fontSize: 20,
            color: "#1a3a5c",
            letterSpacing: "-0.02em",
          }}
        >
          Quantcase
        </span>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                borderRadius: 2,
                transition: "all 0.35s ease",
                width: i === current ? 36 : 22,
                background:
                  i < current
                    ? "rgba(26,58,92,0.3)"
                    : i === current
                    ? "#1a3a5c"
                    : "#bbbbbb",
              }}
            />
          ))}
        </div>

        <span
          style={{
            fontSize: 12,
            color: "#bbbbbb",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Indian markets intelligence
        </span>
      </nav>

      {/* Slide area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {slides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              opacity: i === current ? 1 : 0,
              transform: i === current ? "translateX(0)" : i < current ? "translateX(-32px)" : "translateX(32px)",
              pointerEvents: i === current ? "all" : "none",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 48px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "#F5F5F5",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          disabled={current === 0}
          style={{
            background: "none",
            border: current === 0 ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
            color: current === 0 ? "transparent" : "#777777",
            padding: "11px 22px",
            borderRadius: 6,
            fontSize: 14,
            cursor: current === 0 ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          ← Back
        </button>

        <span style={{ fontSize: 13, color: "#bbbbbb" }}>
          {current + 1} of {TOTAL_SLIDES}
        </span>

        <button
          onClick={handleNext}
          disabled={completing}
          style={{
            background: "#1a3a5c",
            color: "#fff",
            border: "none",
            padding: "12px 32px",
            borderRadius: 6,
            fontSize: 15,
            fontWeight: 500,
            cursor: completing ? "not-allowed" : "pointer",
            letterSpacing: "0.01em",
            opacity: completing ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!completing) (e.currentTarget as HTMLButtonElement).style.background = "#122844";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1a3a5c";
          }}
        >
          {completing ? "Setting up…" : NEXT_LABELS[current]} {!completing && "→"}
        </button>
      </footer>
    </div>
  );
}
