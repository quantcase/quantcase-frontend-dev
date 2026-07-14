"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { OB } from "./_components/theme";
import { StepNav } from "./_components/StepNav";
import {
  Slide1HowItWorks,
  Slide2TheScore,
  Slide3YourJournal,
  Slide4YourStocks,
  Slide5YourBroker,
  Slide6PickAFew,
} from "./_components/OnboardingSlides";

const TOTAL_SLIDES = 6;

const STEPS = [
  { label: "HOW IT WORKS" },
  { label: "THE SCORE" },
  { label: "YOUR JOURNAL" },
  { label: "YOUR STOCKS" },
  { label: "YOUR BROKER" },
  { label: "PICK A FEW" },
];

const NEXT_LABELS = [
  "Next",
  "Next",
  "Next",
  "Next",
  "Next",
  "I'm ready",
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
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
    patchOnboarding(nextSlide, false);
    setDirection(1);
    setCurrent(nextSlide);
  }

  function handleBack() {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }

  const slides = [
    <Slide1HowItWorks key="s1" />,
    <Slide2TheScore key="s2" />,
    <Slide3YourJournal key="s3" />,
    <Slide4YourStocks key="s4" onSkip={complete} />,
    <Slide5YourBroker key="s5" />,
    <Slide6PickAFew key="s6" />,
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: OB.bg,
        overflow: "hidden",
      }}
    >
      <StepNav steps={STEPS} current={current} />

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            {slides[current]}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 48px",
          borderTop: `1px solid ${OB.borderSoft}`,
          background: OB.bg,
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          disabled={current === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: current === 0 ? "transparent" : OB.muted,
            padding: "10px 4px",
            fontFamily: OB.mono,
            fontSize: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: current === 0 ? "default" : "pointer",
            transition: "color 0.2s",
          }}
        >
          ← Back
        </button>

        <span style={{ fontFamily: OB.mono, fontSize: 12, letterSpacing: "0.04em", color: OB.faint }}>
          {String(current + 1).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
        </span>

        <button
          onClick={handleNext}
          disabled={completing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: OB.ink,
            color: "#fff",
            border: "none",
            padding: "12px 26px",
            borderRadius: 999,
            fontFamily: OB.mono,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: completing ? "not-allowed" : "pointer",
            opacity: completing ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {completing ? "Setting up…" : NEXT_LABELS[current]}
          {!completing && <ArrowRight style={{ width: 14, height: 14 }} />}
        </button>
      </footer>
    </div>
  );
}
