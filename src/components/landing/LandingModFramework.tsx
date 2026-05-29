"use client";

import { motion } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const cards = [
  {
    letter: "M",
    title: "Management",
    question: "Do they do what they say?",
    items: [
      { name: "Guidance accuracy", desc: "Hit rate on every forward target — revenue, margin, capacity." },
      { name: "Red flags", desc: "Tone shifts, serial deferrals, unexplained management changes." },
      { name: "Thesis integrity", desc: "Is the original bull case still intact — or quietly abandoned?" },
      { name: "Promoter activity", desc: "Insider buying, pledge trends, related-party signals." },
    ],
  },
  {
    letter: "O",
    title: "Opportunity",
    question: "Is this a good industry to be in?",
    items: [
      { name: "Industry dynamics", desc: "Demand signals, supply constraints, margin trajectory." },
      { name: "Competitive position", desc: "Pricing power, market share, entry barriers vs. peers." },
      { name: "Financial strength", desc: "ROCE, debt profile, free cash flow quality." },
      { name: "Customer traction", desc: "Retention, wallet share expansion, concentration risk." },
    ],
  },
  {
    letter: "D",
    title: "Deal",
    question: "Is the price right?",
    items: [
      { name: "EPS engine", desc: "Revenue CAGR vs. industry, earnings trajectory and quality." },
      { name: "Valuation re-rating", desc: "Where P/E sits vs. industry — room to expand or compress." },
      { name: "Target price matrix", desc: "Bear, base, bull scenarios — each with a probability weight." },
    ],
  },
];

export default function LandingModFramework() {
  return (
    <section
      id="framework"
      className="relative overflow-hidden py-24 md:py-44"
      style={{ background: "#0E1A2B", color: "#F5F0E6" }}
    >
      {/* Gold dotted grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.06,
          backgroundImage: "radial-gradient(rgba(212,169,95,0.9) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="max-w-2xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
            <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
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
            <span className="serif-italic" style={{ color: "rgba(245,240,230,0.80)" }}>Scored independently.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base" style={{ ...sans, color: "rgba(245,240,230,0.70)" }}>
            Every listed company distilled into what actually drives returns.{" "}
            <span className="whitespace-nowrap" style={{ ...mono, letterSpacing: "0.1em", color: "#B98A3E" }}>
              M · O · D.
            </span>
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:mt-20 md:grid-cols-3 md:gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.letter}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="lp-mod-card group relative flex flex-col rounded-3xl p-7 backdrop-blur-sm md:p-8"
            >
              <div className="mb-10 flex items-baseline justify-between">
                <span
                  style={{
                    ...serif,
                    color: "#B98A3E",
                    fontSize: "clamp(4rem, 7vw, 7rem)",
                    lineHeight: 1,
                    fontWeight: 400,
                  }}
                >
                  {c.letter}
                </span>
                <span className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.25em", color: "rgba(245,240,230,0.40)" }}>
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-2xl" style={{ ...serif, color: "#F5F0E6", fontWeight: 400, margin: 0 }}>{c.title}</h3>
              <p className="mt-2 text-sm" style={{ ...sans, color: "rgba(245,240,230,0.60)", margin: "0.5rem 0 0" }}>{c.question}</p>

              <ul className="mt-10 space-y-5 pt-8" style={{ borderTop: "1px solid rgba(245,240,230,0.10)", padding: 0 }}>
                {c.items.map((it) => (
                  <li key={it.name} style={{ listStyleType: "none", marginLeft: 0 }}>
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all group-hover:scale-150"
                        style={{ background: "#B98A3E" }}
                      />
                      <div>
                        <div className="text-sm font-medium" style={{ ...sans, color: "#F5F0E6" }}>{it.name}</div>
                        <p className="mt-1 text-xs leading-relaxed" style={{ ...sans, color: "rgba(245,240,230,0.55)", margin: "0.25rem 0 0" }}>
                          {it.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
