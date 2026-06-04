"use client";

import { motion } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const technicals = [
  { label: "RSI momentum", state: "Oversold — entry zone", positive: true },
  { label: "50/200 MA crossover", state: "Bullish crossover", positive: true },
  { label: "Volume trend", state: "Accumulation phase", positive: true },
  { label: "Support / resistance", state: "Above key support", positive: true },
];

export default function LandingLiveExample() {
  return (
    <section id="example" className="relative py-24 md:py-44" style={{ background: "#EFE8D8" }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-24">
          {/* Left text */}
          <div className="lg:col-span-5">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
              <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
                Live example · HDFCBANK
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
              Fundamentals &amp; Technicals.
              <br />
              <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>In one screen.</span>
            </h2>
            <p className="mt-6 max-w-md text-base" style={{ ...sans, color: "#3A4B61" }}>
              MOD tells you what to own. Automated technicals tell you when to pull the trigger. One screen. Complete picture.
            </p>
            <ul className="mt-10 space-y-0 pt-8" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
              {technicals.map((t, i) => (
                <motion.li
                  key={t.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between gap-6 py-2"
                  style={{ listStyleType: "none", marginLeft: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: "#B98A3E" }} />
                    <span className="text-sm" style={{ ...sans, color: "#0E1A2B" }}>{t.label}</span>
                  </div>
                  <span className="text-xs uppercase" style={{ ...mono, letterSpacing: "0.15em", color: "#3A4B61" }}>
                    {t.state}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right: HDFCBANK card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto max-w-[640px]"
            >
              {/* Background glow */}
              <div
                aria-hidden
                className="absolute -inset-8 -z-10 rounded-[3rem] blur-3xl"
                style={{ background: "linear-gradient(135deg, rgba(185,138,62,0.20), #EFE8D8, rgba(14,26,43,0.05))" }}
              />
              <div
                className="rounded-[2rem] p-7 md:p-10"
                style={{
                  border: "1px solid rgba(14,26,43,0.08)",
                  background: "#F5F0E6",
                  boxShadow: "0 30px 80px rgba(14,26,43,0.10)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.55)" }}>
                      HDFCBANK · NSE
                    </div>
                    <div className="mt-2 text-3xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>HDFC Bank Ltd.</div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase"
                    style={{ ...mono, letterSpacing: "0.18em", background: "#0E1A2B", color: "#F5F0E6" }}
                  >
                    <span style={{ color: "#B98A3E" }}>▲</span> Buy
                  </span>
                </div>

                <div className="mt-10 flex items-end gap-4">
                  <div
                    style={{
                      ...serif,
                      color: "#0E1A2B",
                      fontSize: "clamp(4.5rem, 10vw, 8rem)",
                      lineHeight: 0.9,
                      letterSpacing: "-0.04em",
                      fontWeight: 400,
                    }}
                  >
                    84
                  </div>
                  <div className="pb-3 text-sm" style={{ ...mono, color: "rgba(14,26,43,0.50)" }}>/ 100</div>
                  <div className="ml-auto pb-3 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "#B98A3E" }}>
                    High conviction
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-4 pt-8" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
                  {[
                    { l: "Management", v: 91 },
                    { l: "Opportunity", v: 78 },
                    { l: "Deal", v: 82 },
                  ].map((m) => (
                    <div key={m.l} className="text-center">
                      <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.55)" }}>
                        {m.l}
                      </div>
                      <div className="mt-2 text-4xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>{m.v}</div>
                      <div className="mx-auto mt-3 h-0.5 w-12 overflow-hidden rounded-full" style={{ background: "rgba(14,26,43,0.10)" }}>
                        <div className="h-full" style={{ width: `${m.v}%`, background: "#B98A3E" }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-2xl p-5" style={{ background: "#EFE8D8" }}>
                  <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "rgba(14,26,43,0.55)" }}>
                    Verdict
                  </div>
                  <div className="mt-2 text-lg" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>
                    Accumulate on dips ·{" "}
                    <span style={{ color: "rgba(14,26,43,0.70)" }}>3Y base target ₹2,050</span>
                  </div>
                </div>
              </div>

              {/* Floating mini chips */}
              <div className="pointer-events-none absolute -left-6 top-12 hidden animate-float-slow lg:block">
                <div className="glass rounded-full px-4 py-2 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.70)" }}>
                  RSI 38 · oversold
                </div>
              </div>
              <div className="pointer-events-none absolute -right-4 bottom-16 hidden animate-float lg:block">
                <div className="glass rounded-full px-4 py-2 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.70)" }}>
                  MA 50/200 ✕ bullish
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
