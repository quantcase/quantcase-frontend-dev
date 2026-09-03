"use client";

import { motion } from "framer-motion";
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

export default function DisclaimerPage() {
  return (
    <div style={{ background: "#F5F0E6", minHeight: "100vh" }}>
      <LandingNavbar ctaText="Early Access" />

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

        <div className="relative mx-auto max-w-[800px] px-6 md:px-12 text-center flex flex-col items-center">
          <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp} className="mb-6 flex items-center gap-4">
            <span className="text-[14px] md:text-[15px] uppercase font-medium" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
              Legal &amp; Regulatory
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
            Disclaimer
          </motion.h1>

          <motion.div custom={2} initial="hidden" animate="show" variants={fadeUp} className="mt-8 flex items-center gap-4 text-[15px] md:text-[17px]" style={{ ...mono, color: "rgba(14,26,43,0.5)" }}>
            <span>FU (First Unicorn) Ventures Private Limited</span>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-20 md:py-32" style={{ background: "#F5F0E6" }}>
        <div className="mx-auto max-w-[760px] px-6 md:px-0">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="prose prose-xl prose-slate max-w-none space-y-8"
            style={{ ...sans, color: "#3A4B61", lineHeight: 1.8 }}
          >
            <p className="text-[19px] md:text-[20px] leading-[1.8]" style={{ color: "#3A4B61" }}>
              You agree and understand that your access to or use of the information and material contained on this website constitutes your acceptance of the terms set out in this Disclaimer. FU (First Unicorn) Ventures Private Limited reserves the right to modify, amend, or update the terms of this Disclaimer at any time, without prior notice, and your continued use of Quantcase following any such modification shall constitute your acceptance of the updated terms.
            </p>

            <p className="text-[19px] md:text-[20px] leading-[1.8]" style={{ color: "#3A4B61" }}>
              By accessing or using Quantcase, the research platform operated by FU (First Unicorn) Ventures Private Limited (&quot;the Company&quot;), you acknowledge and agree to the terms set out below.
            </p>

            <div className="rounded-2xl p-7 sm:p-9 md:p-10 space-y-6" style={{ background: "rgba(14,26,43,0.03)", border: "1px solid rgba(14,26,43,0.06)" }}>
              <p className="text-[19px] md:text-[20px] leading-[1.8] m-0" style={{ color: "#3A4B61" }}>
                Investments in securities are subject to market risks, including the possible loss of capital, and past performance, historical returns, ratings, scores, or any analysis presented on this platform do not guarantee or provide any assurance of future results. Any rating, score, ranking, indicator or similar output made available on Quantcase should be understood in accordance with the methodology, assumptions, time horizon, benchmarks and other explanatory information made available in relation to such output and should not be treated as an assurance of future performance or returns.
              </p>
            </div>

            <p className="text-[19px] md:text-[20px] leading-[1.8]" style={{ color: "#3A4B61" }}>
              The information, analysis, and content made available on Quantcase are provided solely for general informational and educational purposes, and do not constitute investment advice, a research report or research service, or an offer, solicitation, or recommendation to buy, sell, or hold any security. No content on Quantcase includes a buy, sell, or hold rating, target price, or any similar recommendation in respect of any individual security, and nothing presented here should be construed as a personalised recommendation, as the content is general in nature and is not tailored to the investment objectives, financial situation, or particular needs of any individual user.
            </p>

            <p className="text-[19px] md:text-[20px] leading-[1.8]" style={{ color: "#3A4B61" }}>
              Quantcase uses artificial intelligence, automated analytical tools and/or algorithmic processes in connection with the processing, analysis and presentation of information available on the platform. All research opinions, findings, recommendations and conclusions generated or assisted by such tools are subject to human review and approval prior to publication.
            </p>

            <p className="text-[19px] md:text-[20px] leading-[1.8]" style={{ color: "#3A4B61" }}>
              Users are advised to independently evaluate all information available on the platform, consider their own financial circumstances and investment objectives, and undertake appropriate due diligence — including, where appropriate, consultation with a SEBI-registered investment adviser or research analyst — before making any investment decision, and should not rely solely on the information presented on Quantcase in doing so.
            </p>

            <div className="rounded-xl p-7 md:p-8 text-[19px] md:text-[20px] leading-relaxed" style={{ background: "rgba(185,138,62,0.06)", borderLeft: "4px solid #B98A3E" }}>
              <p className="m-0 text-[19px] md:text-[20px] leading-relaxed" style={{ color: "#0E1A2B" }}>
                FU (First Unicorn) Ventures Private Limited has applied for registration as a Research Analyst under the SEBI (Research Analysts) Regulations, 2014, and this application is presently under process with SEBI. The Company does not currently hold, and does not represent itself as holding, a SEBI Research Analyst registration, and the availability of content on Quantcase does not constitute, and should not be construed as, any representation of SEBI registration, approval, or endorsement. The Company is presently engaged solely in the provision of research-related informational content and does not offer investment advisory, portfolio management, distribution, or any other regulated intermediary service.
              </p>
            </div>

            <p className="text-[19px] md:text-[20px] leading-[1.8]" style={{ color: "#3A4B61" }}>
              While the Company seeks to ensure that information made available on Quantcase is derived from sources believed to be reliable, it makes no representation or warranty, express or implied, as to the accuracy, completeness, or reliability of any such information, and to the extent permitted by applicable law, shall not be liable for any loss or damage arising, directly or indirectly, from reliance on content available on the platform. Quantcase is intended for use within the territorial jurisdiction of India, and access from any jurisdiction where such access would be contrary to applicable law is not permitted.
            </p>
          </motion.article>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
