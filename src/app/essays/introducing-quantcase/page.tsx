"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
          className="flex items-center gap-2.5"
          style={{ textDecoration: "none" }}
        >
          <Image
            src="/logos/logo-text-dark.png"
            alt="Quantcase"
            width={169}
            height={39}
            className="h-[30px] w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link href="/#framework" className="nav-link text-sm" style={{ ...sans, color: "rgba(14,26,43,0.80)", textDecoration: "none" }}>
            Framework
          </Link>
          <Link href="/essays" className="nav-link text-sm" style={{ ...sans, color: "#0E1A2B", textDecoration: "none", fontWeight: 500 }}>
            Essays
          </Link>
        </nav>

        <Link href="/register" className="lp-cta-btn group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
          Get started
          <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </header>
  );
}

export default function IntroducingQuantcasePage() {
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
      <section className="relative pt-40 pb-16 md:pt-52 md:pb-24 overflow-hidden border-b" style={{ borderColor: "rgba(14,26,43,0.08)" }}>
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

        <div className="relative mx-auto max-w-[800px] px-8 md:px-12 text-center flex flex-col items-center">
          <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp} className="mb-6 flex items-center gap-4">
            <span className="text-[13px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
              Vision
            </span>
          </motion.div>

          <motion.h1
            custom={1} initial="hidden" animate="show" variants={fadeUp}
            style={{
              ...serif,
              color: "#0E1A2B",
              fontSize: "clamp(3rem, 7.2vw, 5.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: 0,
            }}
          >
            What is QuantCase
          </motion.h1>

          <motion.div custom={2} initial="hidden" animate="show" variants={fadeUp} className="mt-8 flex items-center gap-4 text-base" style={{ ...mono, color: "rgba(14,26,43,0.5)" }}>
            <span>2026</span>
            {/* <span className="h-1 w-1 rounded-full bg-current opacity-50" /> */}
            {/* <span>Confidential</span> */}
            <span className="h-1 w-1 rounded-full bg-current opacity-50" />
            <span>4 min read</span>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-20 md:py-32" style={{ background: "#F5F0E6" }}>
        <div className="mx-auto max-w-[720px] px-8 md:px-0">
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="prose prose-xl prose-slate max-w-none text-[1.125rem]"
            style={{ ...sans, color: "#3A4B61", lineHeight: 1.7, fontSize: "1.35rem" }}
          >
            <h2 style={{ ...serif, color: "#0E1A2B", fontSize: "2.4rem", marginTop: 0, marginBottom: "1.5rem" }}>The Problem and the Design</h2>
            
            <p className="mb-6">
              Most Fundamental analysis is tedious. You have to go into the company's data. You have to look at their annual reports, their quarterly earnings transcripts, their presentations released periodically. For any one company, this would usually amount to anywhere between 500 and 1,000 pages a year. Any investor individually would hold between 20 and 30 stocks in their portfolio. That's between 10,000 and 30,000 pages of reading materials.
            </p>
            <p className="mb-6">
              Now, while that might sound like a lot, and it is, for anyone who is willing to spend that time to absorb this information, will most definitely have an edge in terms of portfolio performance. Unfortunately, we live in a time of diminishing attention spans. The question remains: how do we distill information in such a way that we are capturing the synthesis of any asset that we are exploring an investment in?
            </p>
            <p className="mb-8">
              This is where QuantCase's MOD framework comes into play. The methodology is simple—can we take all of this information, and condense it into answering just three core questions:
            </p>

            <ul className="mb-10 space-y-4 rounded-xl p-8" style={{ background: "rgba(14,26,43,0.03)", border: "1px solid rgba(14,26,43,0.06)" }}>
              <li className="flex gap-4">
                <span className="font-bold text-[#B98A3E]">1.</span>
                <div>
                  <strong className="text-[#0E1A2B] block mb-1">How good is the company’s management?</strong>
                  <span className="text-base opacity-80">Do they disclose bad news in time? How is their guidance credibility? Is the promoter acting in good faith? Is the management good at allocating their resources?</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-[#B98A3E]">2.</span>
                <div>
                  <strong className="text-[#0E1A2B] block mb-1">Is it an attractive opportunity?</strong>
                  <span className="text-base opacity-80">Is the industry growing? How's the competitive intensity? How's the financial strength of the business? Has the company built durable distribution?</span>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="font-bold text-[#B98A3E]">3.</span>
                <div>
                  <strong className="text-[#0E1A2B] block mb-1">Is it a good deal?</strong>
                  <span className="text-base opacity-80">Is the quality of their revenue improving or deteriorating? Are their earnings expected to grow or stay stagnant?</span>
                </div>
              </li>
            </ul>

            <p className="mb-6">
              The team behind QuantCase has been investing in global markets, both on the private and public equity side, for over a decade. What we've learnt from being an investor for that long is that there is no end to analysis. Fortunately, we live in a time where information and data are abundant. At the same time, actionable insight is something which is getting lost in the sea of content and information.
            </p>
            <p className="mb-6">
              What people miss about companies is that they are living, breathing organisms made up of hundreds and often thousands of employees who contribute to a singular mission. The interactions between different stakeholders of a company, be it the customers, the competition, the suppliers, the investors, all of those interactions create a broad range and depth of signals. But they also generate a lot more noise. What QuantCase excels at is interpreting those signals. Be it signals arising during analyst questioning or emerging in annual reports or simply in activity of the promoter group.
            </p>
            <p className="mb-10 font-medium text-[#0E1A2B]">
              QuantCase extracts signals per company from transcripts, annual reports and decks. We detect and interpret patterns across those signals, routing them into our lens architecture - <span style={{ color: "#B98A3E" }}>MANAGEMENT</span> - <span style={{ color: "#B98A3E" }}>OPPORTUNITY</span> - <span style={{ color: "#B98A3E" }}>DEAL</span>.
            </p>

            <div className="mb-12 border-t pt-10" style={{ borderColor: "rgba(14,26,43,0.08)" }}>
              <p className="mb-6 italic text-[#0E1A2B]">
                Below are real analyses of HDFC Bank and Reliance. One data point is noise. The same pattern holding across peers, across quarters, or across a metric’s own path over time is signal — that’s what the examples below are built to catch.
              </p>
            </div>

            <h3 style={{ ...serif, color: "#0E1A2B", fontSize: "2.1rem", marginTop: 0, marginBottom: "1rem" }}>HDFC Bank</h3>
            <p className="mb-4">
              <strong>The story everyone knows:</strong> the merger brought a giant loan book and not enough deposits, the CD ratio spiked to 111.5%, and the bank has been walking it down since. A before/after read says fixed — 95% by June 2025.
            </p>
            <p className="mb-4">
              <strong>The quarter-by-quarter path says otherwise.</strong> The ratio re-widened to 98.5% by Q3 FY26 as loans outran deposits again, then deposits caught up and pulled it back to ~95% by March 2026. Management still wants the pre-merger 85–90% by FY27. So we interpret that the overhang is shrinking — but on a glide path, not a straight line.
            </p>
            <div className="mb-12 mt-6 rounded-lg p-6" style={{ background: "rgba(185,138,62,0.05)", borderLeft: "4px solid #B98A3E" }}>
              <p className="m-0">
                <strong>The aha:</strong> resolution is a path, not a switch. A stale snapshot says the de-risking is done; the path says it isn't. And every quarter spent above 85–90% is a quarter of costlier funding — which hits margin before it ever hits guidance.
              </p>
            </div>

            <div className="my-12">
              <Image 
                src="/images/essays/image2.png" 
                alt="HDFC Bank" 
                width={1200} 
                height={600} 
                className="w-full h-auto rounded-xl shadow-sm" 
                style={{ border: "1px solid rgba(14,26,43,0.08)" }}
              />
            </div>

            <h3 style={{ ...serif, color: "#0E1A2B", fontSize: "2.1rem", marginTop: 0, marginBottom: "1rem" }}>Reliance</h3>
            <p className="mb-4">
              <strong>Everyone parses Reliance's quarterly calls. Wrong document.</strong> Reliance commits once a year, at the AGM - the calls just report against what was already set there. So we read the AGMs, and watch each bet harden.
            </p>
            <ul className="mb-6 space-y-2 list-disc pl-5 opacity-90">
              <li><strong>The AI bet: 2023</strong>, a partnership with Nvidia — no capacity, no date.</li>
              <li><strong>2024</strong>, "gigawatt-scale AI data centres in Jamnagar" — a plan, still no date.</li>
              <li><strong>2026</strong>: 120 MW live by end-2026, on Nvidia GB300s. Vague → directional → dated.</li>
            </ul>
            <p className="mb-4">
              Solar and batteries walk the same ladder — a module line under build becomes ~1 GW of HJT modules actually produced; an old FY22 plan becomes 40 GWh starting this year, committed to 120.
            </p>
            <p className="mb-4">
              And these aren't three bets. It’s a pattern formation, indicating a bigger objective in the making. The solar and battery rows exist to make Jamnagar's compute cheap - a solar yield gain is an AI margin event.
            </p>
            <div className="mb-12 mt-6 rounded-lg p-6" style={{ background: "rgba(185,138,62,0.05)", borderLeft: "4px solid #B98A3E" }}>
              <p className="m-0">
                <strong>The aha:</strong> you're no longer debating a narrative. You have a date. If 120 MW isn't live by end-2026, the AI thesis cracks — quarters before it would ever show up in the P&L.
              </p>
            </div>

            <div className="my-12">
              <Image 
                src="/images/essays/image1.png" 
                alt="Reliance" 
                width={1200} 
                height={600} 
                className="w-full h-auto rounded-xl shadow-sm" 
                style={{ border: "1px solid rgba(14,26,43,0.08)" }}
              />
            </div>

            <div className="mt-16 text-center">
              <p className="text-2xl mb-2" style={{ ...serif, color: "#0E1A2B" }}>
                Pattern recognition is the nuance between analysis and interpretation. Its what sets us apart.
              </p>
              <p className="text-base font-bold uppercase tracking-widest text-[#B98A3E]">
                We call it QuantCase Intuition.
              </p>
            </div>

          </motion.article>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
