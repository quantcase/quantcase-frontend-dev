"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Eye, TrendingUp, BarChart2,
  Factory, Swords, Shield, Users,
  Zap, RefreshCw, Award, DollarSign,
} from "lucide-react";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const factors = [
  {
    letter: "M",
    title: "Management",
    tagline: "Do they do what they say?",
    index: "01",
    description:
      "We track guidance hit rates, tone shifts, and insider behaviour across every earnings call.",
    lenses: [
      {
        slug: "guidance-credibility",
        name: "Guidance Credibility",
        desc: "Hit rate on every forward target — revenue, margin, capacity.",
        Icon: Target,
      },
      {
        slug: "disclosure-honesty",
        name: "Disclosure Honesty",
        desc: "Transparency in risk communication, tone consistency, and material omissions.",
        Icon: Eye,
      },
      {
        slug: "capital-allocation",
        name: "Capital Allocation",
        desc: "Quality of reinvestment decisions — capex discipline, ROIC trends, buyback rationale.",
        Icon: TrendingUp,
      },
      {
        slug: "promoter-activity",
        name: "Promoter Activity",
        desc: "Insider buying, pledge trends, related-party signals.",
        Icon: BarChart2,
      },
    ],
  },
  {
    letter: "O",
    title: "Opportunity",
    tagline: "Is this a good industry to be in?",
    index: "02",
    description:
      "We map competitive dynamics, financial moats, and demand trajectories to reveal the ceiling of any business.",
    lenses: [
      {
        slug: "industry-analysis",
        name: "Industry Analysis",
        desc: "Demand signals, supply constraints, margin trajectory.",
        Icon: Factory,
      },
      {
        slug: "competition",
        name: "Competition",
        desc: "Pricing power, market share, entry barriers vs. peers.",
        Icon: Swords,
      },
      {
        slug: "financial-strength",
        name: "Financial Strength",
        desc: "ROCE, debt profile, free cash flow quality.",
        Icon: Shield,
      },
      {
        slug: "customer-distribution",
        name: "Customer Distribution",
        desc: "Retention, wallet share expansion, concentration risk.",
        Icon: Users,
      },
    ],
  },
  {
    letter: "D",
    title: "Deal",
    tagline: "Is the price right?",
    index: "03",
    description:
      "We model three valuation scenarios with probability weights — a rigorous framework for entry and exit decisions.",
    lenses: [
      {
        slug: "eps-engine",
        name: "EPS Engine",
        desc: "Revenue CAGR vs. industry, earnings trajectory and quality.",
        Icon: Zap,
      },
      {
        slug: "pe-rerating-potential",
        name: "P/E Re-rating",
        desc: "Where P/E sits vs. industry — room to expand or compress.",
        Icon: RefreshCw,
      },
      {
        slug: "earning-quality",
        name: "Earning Quality",
        desc: "Cash conversion, accruals analysis, recurring vs. one-off earnings.",
        Icon: Award,
      },
      {
        slug: "target-price-matrix",
        name: "Target Price Matrix",
        desc: "Bear, base, bull scenarios — each with a probability weight.",
        Icon: DollarSign,
      },
    ],
  },
];

function FactorTab({
  factor,
  isActive,
  onClick,
}: {
  factor: (typeof factors)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start text-left w-full"
      style={{ cursor: "pointer", background: "none", border: "none", padding: "0 0 16px" }}
    >
      <span
        className="mb-2 text-[10px] uppercase"
        style={{
          ...mono,
          letterSpacing: "0.25em",
          color: isActive ? "#B98A3E" : "rgba(245,240,230,0.25)",
          transition: "color 0.3s",
        }}
      >
        {factor.index}
      </span>

      <span
        style={{
          ...serif,
          fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)",
          lineHeight: 1,
          fontWeight: 400,
          color: isActive ? "#D4A95F" : "rgba(245,240,230,0.15)",
          transition: "color 0.4s ease",
          display: "block",
        }}
      >
        {factor.letter}
      </span>

      <div className="mt-2">
        <div
          className="text-sm font-medium"
          style={{
            ...sans,
            color: isActive ? "#F5F0E6" : "rgba(245,240,230,0.40)",
            transition: "color 0.3s",
          }}
        >
          {factor.title}
        </div>
        <div
          className="mt-0.5 text-xs"
          style={{
            ...sans,
            color: isActive ? "rgba(245,240,230,0.55)" : "rgba(245,240,230,0.20)",
            transition: "color 0.3s",
          }}
        >
          {factor.tagline}
        </div>
      </div>

      {/* Active indicator bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-px"
        animate={{
          width: isActive ? "100%" : "30%",
          opacity: isActive ? 1 : 0.2,
          background: isActive
            ? "linear-gradient(90deg, #B98A3E 0%, rgba(185,138,62,0.0) 100%)"
            : "rgba(245,240,230,0.12)",
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
    </button>
  );
}

function LensCard({
  lens,
  index,
}: {
  lens: (typeof factors)[0]["lenses"][0];
  index: number;
}) {
  const { Icon } = lens;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-start gap-4 rounded-xl p-4 transition-colors"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(245,240,230,0.07)",
      }}
      whileHover={{
        background: "rgba(185,138,62,0.05)",
        borderColor: "rgba(185,138,62,0.18)",
      }}
    >
      <div
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{
          background: "rgba(185,138,62,0.10)",
          border: "1px solid rgba(185,138,62,0.20)",
          color: "#B98A3E",
        }}
      >
        <Icon size={14} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-snug" style={{ ...sans, color: "#F5F0E6" }}>
          {lens.name}
        </div>
        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ ...sans, color: "rgba(245,240,230,0.48)", margin: "0.25rem 0 0" }}
        >
          {lens.desc}
        </p>
      </div>
    </motion.div>
  );
}

const CYCLE_MS = 4000;

export default function LandingModFramework() {
  const [active, setActive] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const factor = factors[active];
  const hoveredRef = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => {
      if (!hoveredRef.current) {
        setActive((prev) => (prev + 1) % factors.length);
      }
    }, CYCLE_MS);
    return () => clearInterval(tick);
  }, [cycleKey]);

  function manualSelect(i: number) {
    setActive(i);
    setCycleKey((k) => k + 1);
  }

  return (
    <section
      id="framework"
      className="relative overflow-hidden py-16 md:py-24"
      style={{ background: "#0E1A2B", color: "#F5F0E6" }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.05,
          backgroundImage: "radial-gradient(rgba(212,169,95,0.9) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Ambient glow behind active factor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        animate={{ left: `${(active / 2) * 55 + 12}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          top: "5%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(185,138,62,0.055) 0%, transparent 65%)",
          transform: "translateX(-50%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-8 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-5 flex items-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
            <span
              className="text-[11px] uppercase"
              style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}
            >
              The framework
            </span>
          </div>
          <h2
            style={{
              ...serif,
              color: "#F5F0E6",
              fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Three lenses.{" "}
            <span style={{ color: "rgba(245,240,230,0.70)", fontStyle: "italic" }}>
              Scored independently.
            </span>
          </h2>
          <p className="mt-4 max-w-lg text-base" style={{ ...sans, color: "rgba(245,240,230,0.60)" }}>
            Every listed company distilled into what actually drives returns.{" "}
            <span
              className="whitespace-nowrap"
              style={{ ...mono, letterSpacing: "0.1em", color: "#B98A3E" }}
            >
              M · O · D.
            </span>
          </p>
        </motion.div>

        {/* Main interactive area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 md:mt-12"
        >
          {/* Factor tab selector */}
          <div
            className="grid grid-cols-3 gap-6 md:gap-12"
            style={{ borderBottom: "1px solid rgba(245,240,230,0.08)" }}
            onMouseEnter={() => { hoveredRef.current = true; }}
            onMouseLeave={() => { hoveredRef.current = false; }}
          >
            {factors.map((f, i) => (
              <FactorTab key={f.letter} factor={f} isActive={active === i} onClick={() => manualSelect(i)} />
            ))}
          </div>

          {/* Detail panel */}
          <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-5 md:gap-12">

            {/* Left: context column — 2/5 */}
            <div className="relative md:col-span-2">
              {/* Watermark letter */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`wm-${active}`}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.08 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute -right-2 -top-4 select-none"
                  aria-hidden
                  style={{
                    ...serif,
                    fontSize: "clamp(7rem, 12vw, 12rem)",
                    lineHeight: 1,
                    fontWeight: 400,
                    color: "rgba(185,138,62,0.05)",
                    userSelect: "none",
                  }}
                >
                  {factor.letter}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`ctx-${active}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  {/* Pill */}
                  <div
                    className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1"
                    style={{
                      background: "rgba(185,138,62,0.10)",
                      border: "1px solid rgba(185,138,62,0.20)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#B98A3E" }} />
                    <span
                      className="text-[10px] uppercase"
                      style={{ ...mono, letterSpacing: "0.2em", color: "#B98A3E" }}
                    >
                      {factor.title}
                    </span>
                  </div>

                  <h3
                    className="mb-4 leading-tight"
                    style={{
                      ...serif,
                      color: "#F5F0E6",
                      fontSize: "clamp(1.4rem, 2.2vw, 2rem)",
                      fontWeight: 400,
                    }}
                  >
                    {factor.tagline}
                  </h3>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ ...sans, color: "rgba(245,240,230,0.55)", maxWidth: "36ch" }}
                  >
                    {factor.description}
                  </p>

                  {/* Step dots */}
                  <div className="mt-6 flex items-center gap-2.5">
                    {factors.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => manualSelect(i)}
                        style={{
                          height: 3,
                          width: active === i ? 28 : 8,
                          borderRadius: 99,
                          background: active === i ? "#B98A3E" : "rgba(245,240,230,0.18)",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: lens grid — 3/5 */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`lenses-${active}`}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {factor.lenses.map((lens, i) => (
                    <LensCard key={lens.slug} lens={lens} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
