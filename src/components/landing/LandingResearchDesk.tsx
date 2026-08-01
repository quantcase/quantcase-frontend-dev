"use client";

import { motion } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const steps = [
  {
    num: "01",
    title: "Know in seconds, what normally takes hours.",
    desc: "Earnings calls, management guidance, filings and price action — ingested and cross-referenced the day they drop. Hours of reading, resolved into one screen.",
  },
  {
    num: "02",
    title: "Hold your assets to a better framework.",
    desc: "Management, Opportunity and Deal — each scored on its own, then combined into a single conviction score out of 100. No black box. Every number traces back to a line in a filing.",
  },
  {
    num: "03",
    title: "Stress tests your thesis.",
    desc: "Write down why you bought it. Quantcase checks that reason every quarter — and when management misses what they promised, the score moves before the market does.",
  },
];

export default function LandingResearchDesk() {
  return (
    <section id="research" className="relative py-24 md:py-44" style={{ background: "#F5F0E6" }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          {/* Sticky left column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="mb-8 flex items-center gap-4">
                <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
                <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
                  What is Quantcase
                </span>
              </div>
              <h2
                style={{
                  ...serif,
                  color: "#0E1A2B",
                  fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.03em",
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                A research desk
                <br />for one.{" "}
                <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>Yours.</span>
              </h2>
              <p className="mt-6 max-w-md text-base" style={{ ...sans, color: "#3A4B61" }}>
                Think of it as a tireless analyst who reads everything, has no ego, and never forgets.
              </p>
            </div>
          </div>

          {/* Right column: steps */}
          <div className="lg:col-span-7">
            <div className="space-y-10 md:space-y-16">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative"
                >
                  <div className="flex items-start gap-8 md:gap-12">
                    <span
                      className="transition-colors group-hover:text-[#B98A3E]"
                      style={{
                        ...mono,
                        color: "rgba(14,26,43,0.15)",
                        fontSize: "clamp(3.5rem, 8vw, 7rem)",
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {s.num}
                    </span>
                    <div className="flex-1 pt-2">
                      <h3
                        className="text-2xl md:text-3xl"
                        style={{ ...serif, color: "#0E1A2B", fontWeight: 400, margin: 0 }}
                      >
                        {s.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed md:text-base" style={{ ...sans, color: "#3A4B61" }}>
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mt-12 h-px w-full md:mt-20" style={{ background: "rgba(14,26,43,0.08)" }} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
