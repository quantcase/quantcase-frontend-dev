"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FileText, Zap, MessageSquareQuote } from "lucide-react";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const sources = [
  "Earnings transcripts", "Competitor filings", "Price signals", "Sector data",
  "Insider activity", "Macro indicators", "10-K filings", "Conference calls", "Analyst notes",
];

const calibrations = [
  { label: "Guidance accuracy", short: "Guidance", tag: "Proactive disclosure", tagColor: "#2D7A4F", tagBg: "rgba(45,122,79,0.10)", value: 84 },
  { label: "Valuation signal", short: "Valuation", tag: "Limited re-rating potential", tagColor: "#C0392B", tagBg: "rgba(192,57,43,0.10)", value: 71 },
  { label: "Distribution strength", short: "Distribution", tag: "Moderate", tagColor: "#B98A3E", tagBg: "rgba(185,138,62,0.12)", value: 78 },
];

const metrics = [
  { num: 50, suffix: "K+", label: "Documents read", decimals: 0, Icon: FileText, iconBg: "rgba(185,138,62,0.08)", iconColor: "#B98A3E", iconBorder: "rgba(185,138,62,0.20)" },
  { num: 600, suffix: "K+", label: "Signals analyzed", decimals: 0, Icon: Zap, iconBg: "rgba(185,138,62,0.08)", iconColor: "#B98A3E", iconBorder: "rgba(185,138,62,0.20)" },
  { num: 20, suffix: "K+", label: "Guidance promises tracked", decimals: 0, Icon: MessageSquareQuote, iconBg: "rgba(185,138,62,0.08)", iconColor: "#B98A3E", iconBorder: "rgba(185,138,62,0.20)" },
];

function AnimatedNumber({ to, suffix, decimals }: { to: number; suffix: string; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent = v.toFixed(decimals) + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, decimals]);

  return <span ref={ref}>0{suffix}</span>;
}

function CalibrationBar({ value, delay = 0, inView }: { value: number; delay?: number; inView: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setW(value), delay);
    return () => clearTimeout(id);
  }, [inView, value, delay]);

  return (
    <div className="relative h-[3px] w-full overflow-hidden rounded-full" style={{ background: "rgba(14,26,43,0.08)" }}>
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${w}%`,
          background: "linear-gradient(90deg, #B98A3E 0%, #D4A95F 100%)",
          transition: "width 1600ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 0 8px rgba(185,138,62,0.5)",
        }}
      />
    </div>
  );
}

export default function LandingPoweredByAi() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section id="engine" className="relative overflow-hidden py-20 md:py-32" style={{ background: "#F5F0E6" }}>
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.35,
          backgroundImage: "radial-gradient(rgba(14,26,43,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 900,
          height: 500,
          background: "radial-gradient(ellipse at 50% 0%, rgba(185,138,62,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-8 md:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
            <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
              Powered by AI
            </span>
            <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
          </div>
          <h2
            style={{
              ...serif,
              color: "#0E1A2B",
              fontSize: "clamp(2rem, 4.6vw, 4.25rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Reads everything{" "}
            <span style={{ color: "rgba(14,26,43,0.45)", fontStyle: "italic" }}>you don&apos;t have time to.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base" style={{ ...sans, color: "rgba(14,26,43,0.55)" }}>
            Hundreds of documents per company: peer comparisons, sector filings, years of earnings history; all read together, never
            in isolation; distilled into a single, decisive verdict.
          </p>
        </motion.div>

        {/* Marquee */}
        <div
          className="relative mt-12 overflow-hidden py-2"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="marquee-track gap-3">
            {[...sources, ...sources].map((s, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase"
                style={{
                  ...mono,
                  letterSpacing: "0.18em",
                  color: "rgba(14,26,43,0.55)",
                  border: "1px solid rgba(14,26,43,0.08)",
                  background: "rgba(14,26,43,0.04)",
                }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: "#B98A3E" }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div ref={sectionRef} className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

          {/* Left: calibration panel — 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(14,26,43,0.09)", background: "rgba(14,26,43,0.03)" }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between px-7 py-4"
              style={{ borderBottom: "1px solid rgba(14,26,43,0.07)" }}
            >
              <div className="flex items-center gap-2.5 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.24em", color: "rgba(14,26,43,0.45)" }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "#B98A3E" }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#B98A3E" }} />
                </span>
                Live calibration
              </div>
              <span className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.24em", color: "rgba(14,26,43,0.28)" }}>
                Updating
              </span>
            </div>

            {/* Bars list */}
            <div className="divide-y" style={{ borderColor: "rgba(14,26,43,0.06)" }}>
              {calibrations.map((c, i) => (
                <motion.div
                  key={c.label}
                  className="group relative px-7 py-6"
                  whileHover={{ background: "rgba(14,26,43,0.025)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <span
                        className="text-[10px] uppercase block mb-1"
                        style={{ ...mono, letterSpacing: "0.20em", color: "rgba(14,26,43,0.28)" }}
                      >
                        0{i + 1}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[14px]" style={{ ...sans, color: "rgba(14,26,43,0.70)", fontWeight: 400 }}>
                          {c.label}
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] uppercase"
                          style={{ ...mono, letterSpacing: "0.16em", color: c.tagColor, background: c.tagBg }}
                        >
                          <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: c.tagColor }} />
                          {c.tag}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        ...mono,
                        color: "#0E1A2B",
                        fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        fontWeight: 400,
                        flexShrink: 0,
                      }}
                    >
                      {c.value}%
                    </span>
                  </div>
                  <CalibrationBar value={c.value} delay={400 + i * 180} inView={gridInView} />
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <div className="px-7 py-4" style={{ borderTop: "1px solid rgba(14,26,43,0.06)" }}>
              <p className="text-[12px] leading-relaxed" style={{ ...sans, color: "rgba(14,26,43,0.35)", margin: 0 }}>
                Every prediction is tracked against real outcomes and recalibrated continuously.
              </p>
            </div>
          </motion.div>

          {/* Right: metric tiles — 5 cols */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.10, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.018 }}
                className="flex-1 flex items-center gap-5 rounded-2xl px-6 py-5 cursor-default overflow-hidden relative"
                style={{
                  border: "1px solid rgba(14,26,43,0.09)",
                  background: "rgba(14,26,43,0.03)",
                }}
              >
                {/* Large background watermark icon */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -bottom-3 opacity-[0.045]"
                  style={{ color: "#0E1A2B" }}
                >
                  <m.Icon size={88} strokeWidth={1} />
                </div>

                {/* Prominent icon block */}
                <div className="relative flex-shrink-0">
                  {/* Outer halo ring */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: m.iconBg,
                      transform: "scale(1.35)",
                      opacity: 0.5,
                      borderRadius: 20,
                    }}
                  />
                  <motion.div
                    whileHover={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 0.5 }}
                    className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      background: m.iconBg,
                      border: `1px solid ${m.iconBorder}`,
                      color: m.iconColor,
                    }}
                  >
                    <m.Icon size={24} strokeWidth={1.4} />
                  </motion.div>
                </div>

                {/* Label + number stacked */}
                <div className="relative flex flex-col gap-1 flex-1 min-w-0">
                  <div
                    className="text-[10px] uppercase"
                    style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.38)" }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      ...mono,
                      color: "#0E1A2B",
                      fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      fontWeight: 400,
                    }}
                  >
                    <AnimatedNumber to={m.num} suffix={m.suffix} decimals={m.decimals} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
