"use client";

import { motion } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

export default function LandingFinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden py-28 md:py-52" style={{ background: "#F5F0E6" }}>
      {/* Gold halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(185,138,62,0.18), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1280px] px-8 text-center md:px-12">
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
          <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
            You&apos;re ready
          </span>
          <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="mx-auto max-w-5xl"
          style={{
            ...serif,
            color: "#0E1A2B",
            fontSize: "clamp(2.5rem, 6.75vw, 6.75rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            fontWeight: 400,
            margin: 0,
          }}
        >
          Search any stock.{" "}
          <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>Get the full picture.</span>
        </motion.h2>

        <p className="mx-auto mt-8 max-w-xl text-base" style={{ ...sans, color: "#3A4B61" }}>
          Any Indian or US stock, analysed in seconds — scored across MOD, benchmarked against peers, with a clear recommendation.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <a href="/signin" className="lp-cta-btn group inline-flex items-center gap-3 rounded-full px-9 py-5 text-base font-medium">
            Start researching
            <span className="inline-block transition-transform group-hover:translate-x-1">↗</span>
          </a>
          <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>
            Free during preview
          </span>
        </div>

        {/* Mock search bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative mx-auto mt-14 max-w-2xl"
        >
          <div
            className="flex items-center gap-4 rounded-full px-7 py-5 backdrop-blur-xl"
            style={{
              border: "1px solid rgba(14,26,43,0.08)",
              background: "rgba(255,255,255,0.60)",
              boxShadow: "0 20px 60px rgba(14,26,43,0.06)",
            }}
          >
            <span className="text-xs uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "rgba(14,26,43,0.45)" }}>
              Search
            </span>
            <span className="h-5 w-px" style={{ background: "rgba(14,26,43,0.15)" }} />
            <span className="text-base" style={{ ...sans, color: "rgba(14,26,43,0.80)" }}>
              HDFCBANK<span className="blink" style={{ color: "rgba(14,26,43,0.40)" }}>|</span>
            </span>
            <span className="ml-auto text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "#B98A3E" }}>
              Score in 3s
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
