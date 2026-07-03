"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SignInPreviewCard } from "./SignInPreviewCard";

const SLIDE_LABELS = [
  { text: "Indian Stocks.", color: "#a5b4fc" },
  { text: "Mutual Funds.", color: "#6ee7b7" },
  { text: "US Stocks.",    color: "#fb923c" },
  { text: "Private Markets.", color: "#fde68a" },
];
const INTERVAL_MS = 4500;

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    label: "AI Earnings Analysis",
    desc: "Decode management tone, guidance credibility, and forward signals from every call.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    label: "Real-time Screening",
    desc: "Filter thousands of stocks by fundamentals, technicals, and QuantCase scores instantly.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: "Management Intelligence",
    desc: "Score leadership quality across capital allocation, execution history, and communication.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

export function SignInHeroPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDE_LABELS.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const current = SLIDE_LABELS[index];

  return (
    <div
      className="relative hidden lg:flex flex-col justify-between h-full overflow-hidden"
      style={{ background: "#0F172B", padding: "48px 48px 40px" }}
    >
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Glow orbs — subtle pulse */}
      <motion.div
        className="absolute"
        style={{ top: -120, right: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)", pointerEvents: "none" }}
        animate={{ scale: [1, 1.08, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute"
        style={{ bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%)", pointerEvents: "none" }}
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Logo + Branding Hero */}
      <motion.div
        className="relative"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo + Wordmark + Headline stacked */}
        <Link href="/" className="flex flex-col items-start gap-3">
          <Image
            src="/logos/logo-text-white.png"
            alt="QuantCase"
            width={187}
            height={43}
            className="h-9 w-auto"
            priority
          />
          <div className="flex flex-col justify-center">
            <h1 style={{ fontSize: 20, fontWeight: 300, color: "lightgray", letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0, paddingTop: 4 }}>
              Enterprise-grade research across{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{
                    display: "inline-block",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontSize: 24,
                    fontWeight: 500,
                    color: current.color,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {current.text}
                </motion.span>
              </AnimatePresence>
            </h1>
          </div>
        </Link>
      </motion.div>

      {/* Preview card */}
      <motion.div
        className="relative flex-1 flex items-center justify-center py-6"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
      >
        <SignInPreviewCard index={index} />
      </motion.div>

      {/* Feature list */}
      <div className="relative flex flex-col gap-5">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.3 }}
          style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}
        >
          What you get
        </motion.p>
        {features.map(({ icon, label, desc }, i) => (
          <motion.div
            key={label}
            className="flex items-start gap-3.5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.38 + i * 0.1 }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
              style={{ width: 32, height: 32, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              {icon}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", marginBottom: 1 }}>{label}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
