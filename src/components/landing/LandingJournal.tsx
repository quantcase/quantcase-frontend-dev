"use client";

import { motion } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const steps = [
  {
    n: "01",
    title: "State your thesis",
    body: "Pick the dimension driving the buy, in one sentence.",
  },
  {
    n: "02",
    title: "Set your conviction",
    body: "Rate it Watching to Highest — your baseline going forward.",
  },
  {
    n: "03",
    title: "We watch it for you",
    body: "Every new call and MOD shift gets checked against it.",
  },
];

export default function LandingJournal() {
  return (
    <section id="journal" className="relative py-24 md:py-44" style={{ background: "#EFE8D8" }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          {/* Left: copy + steps */}
          <div className="lg:col-span-6">
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
              Your thesis.{" "}
              <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>Never left unchecked.</span>
            </h2>
            <p className="mt-6 max-w-md text-base" style={{ ...sans, color: "#3A4B61" }}>
              Your reason for owning it, checked against reality every quarter.
            </p>

            <div className="mt-10 space-y-0" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: easeOut }}
                  className="flex items-center gap-5 py-5"
                  style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}
                >
                  <span className="text-sm" style={{ ...mono, color: "#B98A3E", letterSpacing: "0.05em" }}>
                    {s.n}
                  </span>
                  <div className="flex flex-1 flex-wrap items-baseline gap-x-2">
                    <span className="text-base font-medium" style={{ ...sans, color: "#0E1A2B" }}>{s.title}</span>
                    <span className="text-sm" style={{ ...sans, color: "#3A4B61" }}>— {s.body}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: journal card w/ AI thesis check */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: easeOut }}
              className="overflow-hidden rounded-3xl"
              style={{
                border: "1px solid rgba(14,26,43,0.08)",
                background: "#F5F0E6",
                boxShadow: "0 30px 80px rgba(14,26,43,0.10)",
              }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ ...mono, letterSpacing: "0.03em", color: "#0E1A2B" }}>
                    HDFCBANK
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[9px] uppercase"
                    style={{ ...mono, letterSpacing: "0.14em", background: "rgba(217,119,6,0.12)", color: "#B45309" }}
                  >
                    ⚡ Thesis partial
                  </span>
                </div>
                <span className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.40)" }}>
                  MOD 84 ↓
                </span>
              </div>

              <div className="px-6 py-5">
                <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "rgba(14,26,43,0.45)" }}>
                  Your thesis
                </div>
                <p className="mt-2 text-[15px] italic leading-relaxed" style={{ ...serif, color: "#0E1A2B", fontStyle: "italic" }}>
                  &ldquo;Retail deposit franchise re-accelerates once merger integration costs roll off — margin expansion by FY26.&rdquo;
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(14,26,43,0.45)" }}>
                    Conviction
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: d <= 4 ? "#B98A3E" : "rgba(14,26,43,0.15)" }}
                      />
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
                  className="mt-5 rounded-2xl px-4 py-4"
                  style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.18)" }}
                >
                  <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "#B45309" }}>
                    🤖 AI thesis check
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ ...sans, color: "#7C4A0C" }}>
                    Net interest margin fell 40bps this quarter — the merger drag you flagged hasn&apos;t rolled off yet.
                    Your FY26 timeline may be optimistic. Consider a review trigger at the next print.
                  </p>
                </motion.div>
              </div>

              <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
                <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "rgba(14,26,43,0.45)" }}>
                  Checked automatically every earnings call
                </span>
                <a href="#cta" className="text-sm underline-offset-4 hover:underline" style={{ ...sans, color: "#B98A3E" }}>
                  Revise thesis →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
