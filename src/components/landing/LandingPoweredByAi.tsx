"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const sources = [
  "Earnings transcripts", "Competitor filings", "Price signals", "Sector data",
  "Insider activity", "Macro indicators", "10-K filings", "Conference calls", "Analyst notes",
];

const calibrations = [
  { label: "Guidance accuracy model", value: 84 },
  { label: "Valuation signals", value: 71 },
  { label: "Management flags", value: 78 },
];

function ProgressBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(14,26,43,0.10)" }}>
      <div
        className="h-full"
        style={{ width: `${w}%`, background: "#B98A3E", transition: "width 1600ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </div>
  );
}

export default function LandingPoweredByAi() {
  return (
    <section id="engine" className="relative py-24 md:py-44" style={{ background: "#F5F0E6" }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
            <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
              Powered by AI
            </span>
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
          </div>
          <h2
            style={{
              ...serif,
              color: "#0E1A2B",
              fontSize: "clamp(2rem, 4.6vw, 4.25rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Reads everything{" "}
            <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>you don&apos;t have time to.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base" style={{ ...sans, color: "#3A4B61" }}>
            Every earnings call. Every filing. Every competitor move. Synthesised in seconds — and unlike a human analyst, it never
            forgets what management promised last quarter.
          </p>
        </div>

        {/* Marquee */}
        <div
          className="relative mt-16 overflow-hidden py-2"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="marquee-track gap-4">
            {[...sources, ...sources].map((s, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase"
                style={{
                  ...mono,
                  letterSpacing: "0.18em",
                  color: "rgba(14,26,43,0.70)",
                  border: "1px solid rgba(14,26,43,0.08)",
                  background: "#EFE8D8",
                }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: "#B98A3E" }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Calibration grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:mt-24 md:grid-cols-12 md:gap-8">
          {/* Calibrations panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl p-7 backdrop-blur-md md:col-span-7 md:p-10"
            style={{ border: "1px solid rgba(14,26,43,0.08)", background: "rgba(255,255,255,0.40)" }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.60)" }}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "#B98A3E" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#B98A3E" }} />
                </span>
                Live calibration
              </div>
              <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.40)" }}>
                Updating
              </span>
            </div>
            <div className="space-y-8">
              {calibrations.map((c, i) => (
                <div key={c.label}>
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-sm" style={{ ...sans, color: "#0E1A2B" }}>{c.label}</span>
                    <span className="text-2xl" style={{ ...mono, color: "#0E1A2B" }}>{c.value}%</span>
                  </div>
                  <ProgressBar value={c.value} delay={300 + i * 200} />
                </div>
              ))}
            </div>
            <p className="mt-10 pt-6 text-sm" style={{ ...sans, color: "#3A4B61", borderTop: "1px solid rgba(14,26,43,0.08)" }}>
              A self-improving system — every prediction tracked against real outcomes, recalibrating continuously.
            </p>
          </motion.div>

          {/* Metric tiles */}
          <div className="grid grid-cols-1 gap-6 md:col-span-5 md:gap-8">
            {[
              { num: "12.4M", label: "Documents read" },
              { num: "3,840", label: "Companies tracked" },
              { num: "98.2%", label: "Uptime" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl p-6 md:p-8"
                style={{ border: "1px solid rgba(14,26,43,0.08)", background: "#EFE8D8" }}
              >
                <div
                  style={{
                    ...mono,
                    color: "#0E1A2B",
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {m.num}
                </div>
                <div className="mt-3 text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.55)" }}>
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
