"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

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

function Navbar({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b backdrop-blur-xl" : "bg-transparent"
      }`}
      style={scrolled ? { background: "rgba(245,240,230,0.70)", borderColor: "rgba(14,26,43,0.08)" } : {}}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4 md:px-12">
        <Link
          href="/"
          className="text-xl tracking-tight"
          style={{ ...serif, color: "#0E1A2B", textDecoration: "none" }}
        >
          Quantcase
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link href="/#framework" className="nav-link text-sm" style={{ ...sans, color: "rgba(14,26,43,0.80)", textDecoration: "none" }}>
            Framework
          </Link>
          <Link href="/essays" className="nav-link text-sm" style={{ ...sans, color: "#0E1A2B", textDecoration: "none", fontWeight: 500 }}>
            Essays
          </Link>
        </nav>

        <Link href="/signin" className="lp-cta-btn group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
          Start free
          <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </header>
  );
}

export default function EssaysPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#F5F0E6", minHeight: "100vh" }}>
      <Navbar scrolled={scrolled} />

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

        <div className="relative mx-auto max-w-[1280px] px-8 md:px-12">
          <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp} className="mb-8 flex items-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
            <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
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
            className="mt-8 max-w-xl text-base md:text-lg"
            style={{ ...sans, color: "#3A4B61", lineHeight: 1.55 }}
          >
            Deep dives into management quality, earnings call patterns, and the signals that separate conviction from noise.
          </motion.p>
        </div>
      </section>

      {/* Coming soon section */}
      <section className="relative pb-40 md:pb-60" style={{ background: "#F5F0E6" }}>
        <div className="mx-auto max-w-[1280px] px-8 md:px-12">

          {/* Coming soon banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14 flex items-center justify-center"
          >
            <div
              className="inline-flex items-center gap-3 rounded-full px-6 py-3"
              style={{
                border: "1px solid rgba(185,138,62,0.25)",
                background: "rgba(185,138,62,0.06)",
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "#B98A3E" }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#B98A3E" }} />
              </span>
              <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.26em", color: "#B98A3E" }}>
                First essays dropping soon
              </span>
            </div>
          </motion.div>

          {/* Placeholder cards — blurred / locked */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {placeholderCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55 + i * 0.10, ease: [0.16, 1, 0.3, 1] }}
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
                    className="rounded-full px-4 py-1.5 text-[10px] uppercase"
                    style={{ ...mono, letterSpacing: "0.22em", border: "1px solid rgba(14,26,43,0.10)", color: "rgba(14,26,43,0.45)" }}
                  >
                    Coming soon
                  </span>
                </div>

                {/* Card content (visible beneath blur) */}
                <div className="p-7">
                  <span
                    className="inline-block rounded-sm px-2.5 py-1 text-[9px] uppercase mb-5"
                    style={{ ...mono, letterSpacing: "0.18em", background: "rgba(14,26,43,0.06)", color: "rgba(14,26,43,0.45)" }}
                  >
                    {card.tag}
                  </span>
                  <h3
                    className="mb-3 leading-snug"
                    style={{ ...serif, color: "#0E1A2B", fontSize: "1.25rem", fontWeight: 400, margin: 0, marginBottom: "0.75rem" }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ ...sans, color: "#3A4B61" }}>
                    {card.desc}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.35)" }}>
                      {card.readTime} read
                    </span>
                    <span style={{ ...mono, color: "rgba(14,26,43,0.30)", fontSize: "0.85rem" }}>→</span>
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
            <p className="mb-6 text-sm" style={{ ...sans, color: "#3A4B61" }}>
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

      {/* Footer */}
      <footer className="relative" style={{ borderTop: "1px solid rgba(14,26,43,0.08)", background: "#EFE8D8" }}>
        <div className="mx-auto max-w-[1280px] px-8 py-12 md:py-16 md:px-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-2xl" style={{ ...serif, color: "#0E1A2B", fontWeight: 400 }}>Quantcase</div>
              <p className="mt-3 max-w-xs text-sm" style={{ ...sans, color: "#3A4B61" }}>
                The algorithm behind every great investor.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <div className="text-[10px] uppercase mb-4" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Product</div>
                <ul className="space-y-3 text-sm" style={{ padding: 0 }}>
                  {/* ["Example", "/#example"] removed while LandingLiveExample is hidden — restore with it. */}
                  {[["Framework", "/#framework"], ["Engine", "/#engine"], ["Portfolio", "/#portfolio"]].map(([label, href]) => (
                    <li key={label} style={{ listStyleType: "none", marginLeft: 0 }}>
                      <Link href={href} className="lp-footer-link">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] uppercase mb-4" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.50)" }}>Company</div>
                <ul className="space-y-3 text-sm" style={{ padding: 0 }}>
                  {["About", "Essays", "Careers", "Contact"].map((l) => (
                    <li key={l} style={{ listStyleType: "none", marginLeft: 0 }}>
                      <a href="#" className="lp-footer-link">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="hairline mt-12 md:mt-16" />
          <div
            className="mt-6 flex flex-col items-start justify-between gap-3 text-[10px] uppercase md:flex-row md:items-center"
            style={{ ...mono, letterSpacing: "0.18em", color: "rgba(14,26,43,0.50)" }}
          >
            <span>© 2026 Quantcase · All rights reserved</span>
            <span className="leading-relaxed" style={{ letterSpacing: "0.12em" }}>Not investment advice.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
