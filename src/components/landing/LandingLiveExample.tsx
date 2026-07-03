"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

type TabKey = "fundamentals" | "technicals";

const CYCLE_MS = 4500;

const panels: Record<
  TabKey,
  {
    heading: [string, string];
    description: string;
    checklist: { label: string; state: string }[];
    stats: { l: string; v: number }[];
    verdictLabel: string;
    verdict: string;
    verdictSub: string;
    chips: [string, string];
  }
> = {
  fundamentals: {
    heading: ["Fundamentals & Technicals.", "In one screen."],
    description:
      "MOD tells you what to own. Automated technicals tell you when to pull the trigger. One screen. Complete picture.",
    checklist: [
      { label: "Revenue growth (YoY)", state: "Accelerating — 18.4%" },
      { label: "Return on equity", state: "Best-in-class — 17.9%" },
      { label: "Net interest margin", state: "Stable — 4.1%" },
      { label: "Asset quality (NPA)", state: "Improving — 1.24%" },
    ],
    stats: [
      { l: "Growth", v: 88 },
      { l: "Profitability", v: 91 },
      { l: "Balance sheet", v: 85 },
    ],
    verdictLabel: "Verdict",
    verdict: "Accumulate on dips",
    verdictSub: "3Y base target ₹2,050",
    chips: ["ROE 17.9% · top decile", "NPA 1.24% · improving"],
  },
  technicals: {
    heading: ["Fundamentals & Technicals.", "In one screen."],
    description:
      "MOD tells you what to own. Automated technicals tell you when to pull the trigger. One screen. Complete picture.",
    checklist: [
      { label: "RSI momentum", state: "Oversold — entry zone" },
      { label: "50/200 MA crossover", state: "Bullish crossover" },
      { label: "Volume trend", state: "Accumulation phase" },
      { label: "Support / resistance", state: "Above key support" },
    ],
    stats: [
      { l: "Momentum", v: 74 },
      { l: "Trend", v: 82 },
      { l: "Volume", v: 79 },
    ],
    verdictLabel: "Signal",
    verdict: "Entry zone forming",
    verdictSub: "Bullish crossover confirmed",
    chips: ["RSI 38 · oversold", "MA 50/200 ✕ bullish"],
  },
};

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function LandingLiveExample() {
  const [active, setActive] = useState<TabKey>("fundamentals");
  const panel = panels[active];

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev === "fundamentals" ? "technicals" : "fundamentals"));
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

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
              {panel.heading[0]}
              <br />
              <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>{panel.heading[1]}</span>
            </h2>
            <p className="mt-6 max-w-md text-base" style={{ ...sans, color: "#3A4B61" }}>
              {panel.description}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="mt-10 flex items-center gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#B98A3E" }} />
                <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.24em", color: "#B98A3E" }}>
                  {active === "fundamentals" ? "Fundamentals" : "Technicals"}
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.ul
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: easeOut, delay: 0.05 }}
                className="mt-6 space-y-0 pt-8"
                style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}
              >
                {panel.checklist.map((t, i) => (
                  <motion.li
                    key={t.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: easeOut }}
                    className="flex items-start justify-between gap-4 py-2 sm:items-center"
                    style={{ listStyleType: "none", marginLeft: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 mt-0.5 sm:mt-0" style={{ background: "#B98A3E" }} />
                      <span className="text-sm" style={{ ...sans, color: "#0E1A2B" }}>{t.label}</span>
                    </div>
                    <span className="text-xs uppercase text-right flex-shrink-0" style={{ ...mono, letterSpacing: "0.15em", color: "#3A4B61" }}>
                      {t.state}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
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
                    <span style={{ color: "#B98A3E" }}>▲</span> Strong
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

                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    <div className="grid grid-cols-3 gap-4 mt-10 pt-8" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
                      {panel.stats.map((m, i) => (
                        <motion.div
                          key={m.l}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.05, ease: easeOut }}
                          className="text-center"
                        >
                          <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.55)" }}>
                            {m.l}
                          </div>
                          <div className="mt-2 text-4xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>{m.v}</div>
                          <div className="mx-auto mt-3 h-0.5 w-12 overflow-hidden rounded-full" style={{ background: "rgba(14,26,43,0.10)" }}>
                            <motion.div
                              className="h-full"
                              style={{ background: "#B98A3E" }}
                              initial={{ width: 0 }}
                              animate={{ width: `${m.v}%` }}
                              transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: easeOut }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-10 rounded-2xl p-5" style={{ background: "#EFE8D8" }}>
                      <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.2em", color: "rgba(14,26,43,0.55)" }}>
                        {panel.verdictLabel}
                      </div>
                      <div className="mt-2 text-lg" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>
                        {panel.verdict} ·{" "}
                        <span style={{ color: "rgba(14,26,43,0.70)" }}>{panel.verdictSub}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating mini chips */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: easeOut }}
                >
                  <div className="pointer-events-none absolute -left-6 top-30 hidden animate-float-slow lg:block">
                    <div className="glass rounded-full px-4 py-2 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.70)" }}>
                      {panel.chips[0]}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -right-4 bottom-16 hidden animate-float lg:block">
                    <div className="glass rounded-full px-4 py-2 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.70)" }}>
                      {panel.chips[1]}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
