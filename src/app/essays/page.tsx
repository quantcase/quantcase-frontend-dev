"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.09, duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const placeholderCards = [
  {
    tag: "Management",
    title: "How we score a CEO's credibility across 12 quarters",
    desc: "The specific signals we track in earnings calls — and why word choice matters more than the numbers.",
    readTime: "8 min",
  },
  {
    tag: "Framework",
    title: "Why most investors ignore the most predictive data point",
    desc: "Guidance accuracy is the single best leading indicator of stock performance. Here's how we measure it.",
    readTime: "6 min",
  },
  {
    tag: "Case Study",
    title: "HDFC Bank: three years of guidance vs. reality",
    desc: "A retrospective on every promise management made — and a breakdown of what it meant for the stock.",
    readTime: "12 min",
  },
];

export default function EssaysPage() {
  return (
    <div style={{ background: "#F5F0E6", minHeight: "100vh" }}>
      <LandingNavbar ctaText="Get started" />

      {/* Hero */}
      <section className="relative pt-40 pb-28 md:pt-52 md:pb-36 overflow-hidden">
        {/* Subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.25,
            backgroundImage: "radial-gradient(rgba(14,26,43,0.18) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Gold halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: 900,
            height: 600,
            background: "radial-gradient(ellipse at 50% 0%, rgba(185,138,62,0.10) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-6 sm:px-8 md:px-12">
          <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp} className="mb-8 flex items-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
            <span className="text-[14px] uppercase font-medium" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
              Essays &amp; case studies
            </span>
          </motion.div>

          <motion.h1
            custom={1} initial="hidden" animate="show" variants={fadeUp}
            style={{
              ...serif,
              color: "#0E1A2B",
              fontSize: "clamp(2.75rem, 7vw, 6.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              fontWeight: 400,
              margin: 0,
            }}
          >
            How great investors
            <br />
            <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>actually think.</span>
          </motion.h1>

          <motion.p
            custom={2} initial="hidden" animate="show" variants={fadeUp}
            className="mt-8 max-w-xl text-[18px] md:text-[20px]"
            style={{ ...sans, color: "#3A4B61", lineHeight: 1.6 }}
          >
            Deep dives into management quality, earnings call patterns, and the signals that separate conviction from noise.
          </motion.p>
        </div>
      </section>

      {/* Essays Section */}
      <section className="relative pb-40 md:pb-60" style={{ background: "#F5F0E6" }}>
        <div className="mx-auto max-w-[1280px] px-6 sm:px-8 md:px-12">

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Real Card: Introducing QuantCase */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/essays/introducing-quantcase"
                className="group relative block h-full overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg"
                style={{
                  border: "1px solid rgba(14,26,43,0.15)",
                  background: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                }}
              >
                <div className="p-8">
                  <span
                    className="inline-block rounded-sm px-3 py-1 text-[12px] uppercase font-medium mb-5"
                    style={{ ...mono, letterSpacing: "0.18em", background: "rgba(185,138,62,0.12)", color: "#B98A3E" }}
                  >
                    Vision
                  </span>
                  <h3
                    className="mb-3 leading-snug transition-colors group-hover:text-[#B98A3E]"
                    style={{ ...serif, color: "#0E1A2B", fontSize: "1.65rem", fontWeight: 400, margin: 0, marginBottom: "0.75rem" }}
                  >
                    What is QuantCase
                  </h3>
                  <p className="text-[18px] leading-relaxed" style={{ ...sans, color: "#3A4B61" }}>
                    The problem with fundamental analysis, our MOD framework, and extracting signal from the noise. Includes real case studies on HDFC Bank and Reliance.
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[13px] uppercase font-medium" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.45)" }}>
                      4 min read
                    </span>
                    <span className="transition-transform group-hover:translate-x-1" style={{ ...mono, color: "#B98A3E", fontSize: "1.1rem" }}>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Placeholder Cards — blurred / locked */}
            {placeholderCards.slice(1).map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.65 + i * 0.10, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl"
                style={{
                  border: "1px solid rgba(14,26,43,0.08)",
                  background: "rgba(14,26,43,0.025)",
                }}
              >
                {/* Frosted overlay */}
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-[3px]"
                  style={{ background: "rgba(245,240,230,0.55)" }}
                >
                  <span
                    className="rounded-full px-4 py-1.5 text-[12px] uppercase font-medium"
                    style={{ ...mono, letterSpacing: "0.22em", border: "1px solid rgba(14,26,43,0.12)", color: "rgba(14,26,43,0.55)" }}
                  >
                    Coming soon
                  </span>
                </div>

                {/* Card content (visible beneath blur) */}
                <div className="p-8">
                  <span
                    className="inline-block rounded-sm px-3 py-1 text-[12px] uppercase font-medium mb-5"
                    style={{ ...mono, letterSpacing: "0.18em", background: "rgba(14,26,43,0.06)", color: "rgba(14,26,43,0.45)" }}
                  >
                    {card.tag}
                  </span>
                  <h3
                    className="mb-3 leading-snug"
                    style={{ ...serif, color: "#0E1A2B", fontSize: "1.65rem", fontWeight: 400, margin: 0, marginBottom: "0.75rem" }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-[18px] leading-relaxed" style={{ ...sans, color: "#3A4B61" }}>
                    {card.desc}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[13px] uppercase font-medium" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.35)" }}>
                      {card.readTime} read
                    </span>
                    <span style={{ ...mono, color: "rgba(14,26,43,0.30)", fontSize: "1.1rem" }}>→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Notify CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 text-center"
          >
            <p className="mb-6 text-[18px] md:text-[20px]" style={{ ...sans, color: "#3A4B61" }}>
              We write about what we find. Occasionally. No filler.
            </p>
            <Link
              href="/signin"
              className="lp-cta-btn group inline-flex items-center gap-3 rounded-full px-9 py-5 text-base font-medium"
            >
              Get notified when we publish
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

