"use client";

import { motion } from "framer-motion";
import { PenLine } from "lucide-react";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const modSnapshot = [
  { key: "M", value: 88 },
  { key: "O", value: 84 },
  { key: "D", value: 76 },
];

const dimensions = [
  { label: "Management", active: true },
  { label: "Opportunity", active: false },
  { label: "Deal", active: false },
];

const drivers = [
  { label: "Capital allocation", active: true },
  { label: "Disclosure honesty", active: true },
  { label: "Guidance accuracy", active: false },
];

const convictions = ["Watching", "Interested", "Moderate", "High", "Highest"];

export default function LandingJournal() {
  return (
    <section id="journal" className="relative py-24 md:py-44" style={{ background: "#EFE8D8" }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          {/* Left: copy */}
          <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-center">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
              <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
                Investment journal
              </span>
            </div>
            <h2
              style={{
                ...serif,
                color: "#0E1A2B",
                fontSize: "clamp(2rem, 4.5vw, 4.25rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontWeight: 400,
                margin: 0,
              }}
            >
              Write the thesis.
              <br />
              <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>Trust the alert.</span>
            </h2>
            <p className="mt-6 max-w-md text-base" style={{ ...sans, color: "#3A4B61" }}>
              Every position gets a reason. Quantcase watches the reason and tells you the moment the data turns.
            </p>
          </div>

          {/* Right: journal card */}
          <div className="lg:col-span-7">
            <div className="relative">
              {/* Floating thesis-at-risk alert */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4, ease: easeOut }}
                className="absolute -top-7 right-4 z-10 hidden items-center gap-3 rounded-2xl px-5 py-3 sm:flex md:right-8"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(14,26,43,0.08)",
                  boxShadow: "0 20px 45px rgba(14,26,43,0.14)",
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "#DC2626" }} />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "#DC2626" }} />
                </span>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ ...mono, letterSpacing: "0.14em", color: "#DC2626" }}>
                    Thesis at risk
                  </div>
                  <div className="text-xs" style={{ ...sans, color: "#0E1A2B" }}>
                    KPIGREEN · order book miss
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1, ease: easeOut }}
                className="overflow-hidden rounded-3xl"
                style={{
                  border: "1px solid rgba(14,26,43,0.08)",
                  background: "#EFE8D8",
                  boxShadow: "0 30px 80px rgba(14,26,43,0.10)",
                }}
              >
                {/* Header strip */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: "rgba(185,138,62,0.15)" }}
                    >
                      <PenLine className="h-4 w-4" style={{ color: "#B98A3E" }} />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.45)" }}>
                        Investment journal
                      </div>
                      <div className="text-sm font-medium" style={{ ...sans, color: "#0E1A2B" }}>
                        Complete your thesis · 1 of 4
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="h-1 w-6 rounded-full"
                        style={{ background: i === 0 ? "#B98A3E" : "rgba(14,26,43,0.12)" }}
                      />
                    ))}
                  </div>
                </div>

                {/* White inner panel */}
                <div className="mx-2 mb-2 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(14,26,43,0.06)" }}>
                  {/* Stock header */}
                  <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
                    <div>
                      <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.40)" }}>
                        Reliance · NSE
                      </div>
                      <div className="mt-1 text-2xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>
                        Reliance Industries
                      </div>
                      <div className="mt-1 text-xs" style={{ ...sans, color: "#3A4B61" }}>
                        Oil &amp; Gas · ₹15.2L Cr
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium" style={{ ...sans, color: "#0E1A2B" }}>₹2,847</div>
                      <span
                        className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px]"
                        style={{ ...mono, background: "rgba(16,185,129,0.12)", color: "#059669" }}
                      >
                        ▲ +0.43%
                      </span>
                    </div>
                  </div>

                  {/* MOD snapshot */}
                  <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
                    <div className="mb-3 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.40)" }}>
                      MOD snapshot
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {modSnapshot.map((m) => (
                        <div
                          key={m.key}
                          className="rounded-xl px-3 py-2.5"
                          style={{ background: "#F5F0E6", border: "1px solid rgba(14,26,43,0.06)" }}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm" style={{ ...serif, color: "#B98A3E" }}>{m.key}</span>
                            <span className="text-base font-medium" style={{ ...sans, color: "#0E1A2B" }}>{m.value}</span>
                          </div>
                          <div className="mt-2 h-1 w-full rounded-full" style={{ background: "rgba(14,26,43,0.10)" }}>
                            <div
                              className="h-1 rounded-full"
                              style={{ width: `${m.value}%`, background: "#B98A3E" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q1: dimension */}
                  <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
                    <div className="mb-3 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(14,26,43,0.45)" }}>
                      01 · Which dimension drove your decision?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dimensions.map((d) => (
                        <span
                          key={d.label}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
                          style={
                            d.active
                              ? { ...sans, background: "rgba(185,138,62,0.15)", color: "#0E1A2B", border: "1px solid rgba(185,138,62,0.35)" }
                              : { ...sans, background: "#F5F0E6", color: "#3A4B61", border: "1px solid rgba(14,26,43,0.06)" }
                          }
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: d.active ? "#B98A3E" : "rgba(14,26,43,0.25)" }}
                          />
                          {d.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Q2: driver */}
                  <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
                    <div className="mb-3 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(14,26,43,0.45)" }}>
                      02 · What specifically drove your view?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {drivers.map((d) => (
                        <span
                          key={d.label}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
                          style={
                            d.active
                              ? { ...sans, background: "rgba(185,138,62,0.15)", color: "#0E1A2B", border: "1px solid rgba(185,138,62,0.35)" }
                              : { ...sans, background: "#F5F0E6", color: "#3A4B61", border: "1px solid rgba(14,26,43,0.06)" }
                          }
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: d.active ? "#B98A3E" : "rgba(14,26,43,0.25)" }}
                          />
                          {d.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Q3: thesis text */}
                  <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
                    <div className="mb-3 flex items-center justify-between text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(14,26,43,0.45)" }}>
                      <span>03 · Write your thesis</span>
                      <span>142 / 300</span>
                    </div>
                    <div
                      className="rounded-xl px-4 py-4"
                      style={{ background: "#F5F0E6", border: "1px solid rgba(14,26,43,0.06)" }}
                    >
                      <p className="text-sm italic leading-relaxed" style={{ ...serif, color: "#0E1A2B" }}>
                        &ldquo;Buying for the Jio value unlock and disciplined capital allocation. The conglomerate discount
                        narrows once retail and Jio list separately.&rdquo;
                        <span className="ml-0.5 inline-block h-4 w-px align-middle" style={{ background: "#0E1A2B" }} />
                      </p>
                    </div>
                  </div>

                  {/* Q4: conviction */}
                  <div className="px-6 py-5">
                    <div className="mb-3 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(14,26,43,0.45)" }}>
                      04 · How much conviction do you have?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {convictions.map((c) => (
                        <span
                          key={c}
                          className="rounded-full px-3.5 py-1.5 text-xs font-medium"
                          style={
                            c === "High"
                              ? { ...sans, background: "#0E1A2B", color: "#FFFFFF" }
                              : { ...sans, background: "#F5F0E6", color: "#3A4B61", border: "1px solid rgba(14,26,43,0.06)" }
                          }
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer actions (illustrative only — not interactive) */}
                <div className="flex items-center justify-between px-6 py-4" style={{ pointerEvents: "none" }}>
                  <span className="text-sm" style={{ ...sans, color: "#3A4B61" }}>
                    Skip this stock →
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full px-4 py-2 text-xs font-medium"
                      style={{ ...sans, color: "#0E1A2B", border: "1px solid rgba(14,26,43,0.15)" }}
                    >
                      Save for later
                    </span>
                    <span
                      className="rounded-full px-4 py-2 text-xs font-medium"
                      style={{ ...sans, background: "#0E1A2B", color: "#F5F0E6" }}
                    >
                      Save &amp; next →
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
