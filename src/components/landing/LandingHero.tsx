"use client";

import { motion } from "framer-motion";
import CinematicCanvas from "./CinematicCanvas";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const serif: React.CSSProperties = {
  fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)",
};
const mono: React.CSSProperties = {
  fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",
};
const sans: React.CSSProperties = {
  fontFamily: "'Geist', system-ui, sans-serif",
};

export default function LandingHero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden"
      style={{ minHeight: "100vh", background: "#F5F0E6" }}
    >
      {/* Canvas background */}
      <div className="absolute inset-0 -z-0">
        <CinematicCanvas />
      </div>

      {/* Top fade for navbar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32"
        style={{ background: "linear-gradient(to bottom, #F5F0E6, rgba(245,240,230,0.6), transparent)" }}
      />

      <div className="relative z-20 mx-auto flex min-h-screen max-w-[1280px] flex-col justify-end px-8 pb-20 pt-36 md:px-12 md:pb-28 md:pt-48">
        {/* Overline */}
        <motion.div
          custom={0} initial="hidden" animate="show" variants={fadeUp}
          className="mb-10 flex items-center gap-4"
        >
          <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
          <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
            The Quantcase thesis
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1} initial="hidden" animate="show" variants={fadeUp}
          style={{
            ...serif,
            color: "#0E1A2B",
            fontSize: "clamp(2.75rem, 8vw, 7.5rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            fontWeight: 400,
            margin: 0,
          }}
        >
          The algorithm behind
          <br />every great investor.
          <br />
          <span className="serif-italic" style={{ color: "rgba(14,26,43,0.85)" }}>Now for everyone.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={2} initial="hidden" animate="show" variants={fadeUp}
          className="mt-8 max-w-xl text-base md:text-lg"
          style={{ ...sans, color: "#3A4B61", lineHeight: 1.55 }}
        >
          Top investors don&apos;t have better instincts. They have a repeatable
          process. Quantcase is that process, built into a single score.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3} initial="hidden" animate="show" variants={fadeUp}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <a
            href="#framework"
            className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-medium transition-all"
            style={{ ...sans, background: "#0E1A2B", color: "#F5F0E6" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#B98A3E"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0E1A2B"; }}
          >
            See how it works
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#framework"
            className="text-sm underline-offset-4 hover:underline"
            style={{ ...sans, color: "#0E1A2B" }}
          >
            Read the framework
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          custom={4} initial="hidden" animate="show" variants={fadeUp}
          className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] uppercase"
          style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.55)" }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse-soft" style={{ background: "#B98A3E" }} />
            Indian &amp; US Equities
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(14,26,43,0.40)" }} />
            Self-improving AI
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(14,26,43,0.40)" }} />
            SOC 2 · Read-only
          </span>
        </motion.div>
      </div>

      {/* Floating glass score chip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-24 right-8 z-20 hidden lg:block"
      >
        <div
          className="glass animate-float rounded-3xl p-5"
          style={{ width: 230, transform: "rotate(-3deg)", boxShadow: "0 24px 80px rgba(14,26,43,0.08)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "rgba(14,26,43,0.60)" }}>
              HDFCBANK · NSE
            </span>
            <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ ...mono, background: "#0E1A2B", color: "#F5F0E6" }}>
              ▲ Buy
            </span>
          </div>
          <div className="flex items-end gap-1">
            <span style={{ ...serif, fontSize: 52, lineHeight: 1, color: "#0E1A2B" }}>84</span>
            <span className="mb-1 text-xs" style={{ ...mono, color: "rgba(14,26,43,0.60)" }}>/100</span>
          </div>
          <div className="mt-4 flex justify-between text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.15em", color: "rgba(14,26,43,0.60)" }}>
            <span>M <span style={{ color: "#0E1A2B" }}>91</span></span>
            <span>O <span style={{ color: "#0E1A2B" }}>78</span></span>
            <span>D <span style={{ color: "#0E1A2B" }}>82</span></span>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-[10px] uppercase"
        style={{ ...mono, letterSpacing: "0.3em", color: "rgba(14,26,43,0.50)" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span>Scroll</span>
          <span className="h-8 w-px" style={{ background: "rgba(14,26,43,0.30)" }} />
        </div>
      </div>
    </section>
  );
}
