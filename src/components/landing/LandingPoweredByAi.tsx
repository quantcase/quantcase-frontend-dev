"use client";

import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FileText, Zap, MessageSquareQuote,
  Newspaper, BarChart2, Users, LineChart, Presentation, Mic, ScrollText,
  Radar, Fingerprint, GitBranch, Compass,
} from "lucide-react";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const sources = [
  "Earnings calls", "Investor PPTs", "Annual reports", "Exchange filings",
  "Market data", "Sector data", "Bulk & block deals", "Analyst reports",
];

const inputSources = [
  { label: "Earnings calls", Icon: Mic },
  { label: "Investor PPTs", Icon: Presentation },
  { label: "Annual reports", Icon: ScrollText },
  { label: "Exchange filings", Icon: FileText },
  { label: "Market data", Icon: LineChart },
  { label: "Sector data", Icon: BarChart2 },
  { label: "Bulk & block deals", Icon: Users },
  { label: "Analyst reports", Icon: Newspaper },
];

const outputs = [
  {
    label: "Signals",
    desc: "Discrete, trackable events pulled from raw disclosure.",
    Icon: Radar,
  },
  {
    label: "QC Intuition",
    desc: "Pattern-weighted judgement calibrated against outcomes.",
    Icon: Fingerprint,
  },
  {
    label: "Patterns",
    desc: "Recurring behaviour across quarters, peers, and cycles.",
    Icon: GitBranch,
  },
  {
    label: "Decision Intelligence",
    desc: "A single, decisive verdict — not another dashboard.",
    Icon: Compass,
  },
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

type Pt = { x: number; y: number };

// Cubic bezier from a card's right edge (or left edge, for outputs) into the engine rim.
// Anchors are real measured pixel positions, so the line always touches the card exactly.
function flowCurve(from: Pt, to: Pt) {
  const dx = (to.x - from.x) * 0.55;
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y} ${to.x - dx} ${to.y} ${to.x} ${to.y}`;
}

// One flowing dot per path, driven by native SVG <animateMotion> so it always follows
// the exact curve (no drift, unlike animating offsetDistance as a plain CSS property).
function FlowDot({ d, delay, period, color, size }: { d: string; delay: number; period: number; color: string; size: number }) {
  return (
    <circle r={size} fill={color}>
      <animateMotion
        dur={`${period}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={d}
        keyPoints="0;1"
        keyTimes="0;1"
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.08;0.85;1"
        dur={`${period}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

function EngineDiagram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inView = useInView(wrapRef, { once: true, margin: "-100px" });
  const [activeOutput, setActiveOutput] = useState(0);
  const [geometry, setGeometry] = useState<{ w: number; h: number; sources: Pt[]; outputs: Pt[]; engine: Pt; engineR: number } | null>(null);

  useEffect(() => {
    function measure() {
      const wrap = wrapRef.current;
      const engineEl = engineRef.current;
      if (!wrap || !engineEl) return;
      const wrapBox = wrap.getBoundingClientRect();

      const sources = sourceRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const b = el.getBoundingClientRect();
        return { x: b.right - wrapBox.left, y: b.top + b.height / 2 - wrapBox.top };
      });
      const outputsPts = outputRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const b = el.getBoundingClientRect();
        return { x: b.left - wrapBox.left, y: b.top + b.height / 2 - wrapBox.top };
      });
      const eb = engineEl.getBoundingClientRect();
      const engine = { x: eb.left + eb.width / 2 - wrapBox.left, y: eb.top + eb.height / 2 - wrapBox.top };

      setGeometry({ w: wrapBox.width, h: wrapBox.height, sources, outputs: outputsPts, engine, engineR: eb.width / 2 });
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setActiveOutput((v) => (v + 1) % outputs.length), 2200);
    return () => clearInterval(id);
  }, [inView]);

  const n = inputSources.length;
  const m = outputs.length;

  return (
    <div ref={wrapRef} className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-y-8 lg:gap-x-16">
        {/* Left: source list */}
        <div className="order-2 lg:order-1 grid grid-cols-2 lg:grid-cols-1 gap-2.5 lg:max-w-[300px] lg:ml-auto">
          {inputSources.map((s, i) => (
            <motion.div
              key={s.label}
              ref={(el) => {
                sourceRefs.current[i] = el;
              }}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ border: "1px solid rgba(14,26,43,0.09)", background: "#EEEAE0" }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(185,138,62,0.10)", color: "#B98A3E" }}
              >
                <s.Icon size={15} strokeWidth={1.6} />
              </div>
              <span className="text-[13px] leading-tight" style={{ ...sans, color: "rgba(14,26,43,0.68)" }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Center: engine node (connector lines are drawn in the shared overlay SVG below) */}
        <div className="order-1 lg:order-2 mx-auto flex items-center justify-center py-6 lg:py-0" style={{ width: 168, height: 168 }}>
          <div ref={engineRef} className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
            {/* Expanding pulse rings (HTML, since they're purely decorative and don't need pixel-perfect anchoring) */}
            {inView &&
              [0, 1].map((k) => (
                <motion.span
                  key={`pulse-${k}`}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid #B98A3E" }}
                  initial={{ opacity: 0.55, scale: 1 }}
                  animate={{ opacity: 0, scale: 2.1 }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: k * 1.4 }}
                />
              ))}
            {/* Rotating dashed rings */}
            {inView && (
              <motion.span
                className="absolute rounded-full"
                style={{ inset: -14, border: "1px dashed rgba(185,138,62,0.4)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              />
            )}
            {inView && (
              <motion.span
                className="absolute rounded-full"
                style={{ inset: -6, border: "1px dashed rgba(185,138,62,0.3)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />
            )}
            {/* Glow */}
            <span
              aria-hidden
              className="absolute rounded-full"
              style={{ inset: -60, background: "radial-gradient(circle, rgba(185,138,62,0.30) 0%, rgba(185,138,62,0.08) 55%, transparent 75%)" }}
            />
            {/* Core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full w-full flex-col items-center justify-center rounded-full text-center"
              style={{
                background: "linear-gradient(135deg, #16283F 0%, #0A1220 100%)",
                border: "1px solid rgba(185,138,62,0.55)",
              }}
            >
              <span className="text-[9px] uppercase leading-none" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(245,240,230,0.55)" }}>
                QC
              </span>
              <span className="mt-1.5 text-[15px] leading-tight" style={{ ...serif, color: "#F5F0E6", fontStyle: "italic" }}>
                Engine
              </span>
            </motion.div>
          </div>
        </div>

        {/* Right: output cards */}
        <div className="order-3 flex flex-col gap-2.5 lg:max-w-[300px]">
          {outputs.map((o, i) => {
            const isActive = inView && activeOutput === i;
            return (
              <motion.div
                key={o.label}
                ref={(el) => {
                  outputRefs.current[i] = el;
                }}
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex items-start gap-3 rounded-xl px-4 py-3.5 overflow-hidden"
                style={{
                  border: isActive ? "1px solid rgba(185,138,62,0.45)" : "1px solid rgba(14,26,43,0.09)",
                  background: isActive ? "#F3E9D8" : "#EEEAE0",
                  boxShadow: isActive ? "0 4px 20px -4px rgba(185,138,62,0.25)" : "none",
                  transition: "border-color 0.5s ease, background 0.5s ease, box-shadow 0.5s ease",
                }}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="output-active-dot"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 top-0 h-full w-[3px]"
                      style={{ background: "#B98A3E" }}
                    />
                  )}
                </AnimatePresence>
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: isActive ? "rgba(185,138,62,0.16)" : "rgba(14,26,43,0.05)",
                    color: isActive ? "#B98A3E" : "rgba(14,26,43,0.45)",
                    transition: "background 0.5s ease, color 0.5s ease",
                  }}
                >
                  <o.Icon size={16} strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px]" style={{ ...sans, color: "#0E1A2B", fontWeight: 500 }}>
                    {o.label}
                  </div>
                  <div className="mt-0.5 text-[11.5px] leading-snug" style={{ ...sans, color: "rgba(14,26,43,0.45)" }}>
                    {o.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shared overlay SVG: connector lines from measured card positions to/from the engine rim */}
      {geometry && (
        <svg
          className="pointer-events-none absolute inset-0"
          width={geometry.w}
          height={geometry.h}
          viewBox={`0 0 ${geometry.w} ${geometry.h}`}
          aria-hidden
        >
          {/* Static base paths */}
          {geometry.sources.map((p, i) => (
            <path key={`in-static-${i}`} d={flowCurve(p, { x: geometry.engine.x - geometry.engineR, y: geometry.engine.y })} fill="none" stroke="rgba(14,26,43,0.10)" strokeWidth={1.5} />
          ))}
          {geometry.outputs.map((p, i) => (
            <path key={`out-static-${i}`} d={flowCurve({ x: geometry.engine.x + geometry.engineR, y: geometry.engine.y }, p)} fill="none" stroke="rgba(14,26,43,0.10)" strokeWidth={1.5} />
          ))}

          {inView && (
            <>
              {/* Animated draw-in — inputs */}
              {geometry.sources.map((p, i) => (
                <motion.path
                  key={`in-draw-${i}`}
                  d={flowCurve(p, { x: geometry.engine.x - geometry.engineR, y: geometry.engine.y })}
                  fill="none"
                  stroke="#B98A3E"
                  strokeWidth={1.5}
                  strokeOpacity={0.55}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
              {/* Animated draw-in — outputs */}
              {geometry.outputs.map((p, i) => (
                <motion.path
                  key={`out-draw-${i}`}
                  d={flowCurve({ x: geometry.engine.x + geometry.engineR, y: geometry.engine.y }, p)}
                  fill="none"
                  stroke="#B98A3E"
                  strokeWidth={1.5}
                  strokeOpacity={activeOutput === i ? 0.85 : 0.4}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 1.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transition: "stroke-opacity 0.5s ease" }}
                />
              ))}

              {/* Flowing particles — inputs into engine */}
              {geometry.sources.map((p, i) => (
                <FlowDot
                  key={`in-dot-${i}`}
                  d={flowCurve(p, { x: geometry.engine.x - geometry.engineR, y: geometry.engine.y })}
                  delay={1.2 + i * (2.4 / n)}
                  period={2.4}
                  color="#D4A95F"
                  size={2.6}
                />
              ))}
              {/* Flowing particles — engine into outputs */}
              {geometry.outputs.map((p, i) => (
                <FlowDot
                  key={`out-dot-${i}`}
                  d={flowCurve({ x: geometry.engine.x + geometry.engineR, y: geometry.engine.y }, p)}
                  delay={2.1 + i * 0.55}
                  period={1.5}
                  color="#B98A3E"
                  size={3}
                />
              ))}
            </>
          )}
        </svg>
      )}
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

        {/* Engine diagram: sources -> QC engine -> outputs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-14 rounded-2xl px-6 py-10 md:px-10 md:py-14"
          style={{ border: "1px solid rgba(14,26,43,0.09)", background: "rgba(14,26,43,0.03)" }}
        >
          <EngineDiagram />
        </motion.div>

        {/* Main grid */}
        <div ref={sectionRef} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

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
