"use client";

import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FileText, Zap, MessageSquareQuote,
  Newspaper, BarChart2, Users, LineChart, Presentation, Mic, ScrollText,
  Radar, Fingerprint, Compass,
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
    Preview: SignalsPreview,
  },
  {
    label: "QC Intuition",
    desc: "Pattern-weighted judgement calibrated against outcomes.",
    Icon: Fingerprint,
    Preview: QcIntuitionPreview,
  },
  {
    label: "Decision Intelligence",
    desc: "A single, decisive verdict — not another dashboard.",
    Icon: Compass,
    Preview: DecisionPreview,
  },
];

const calibrations = [
  { label: "Guidance accuracy", short: "Guidance", tag: "Proactive disclosure", tagColor: "#2D7A4F", tagBg: "rgba(45,122,79,0.10)", value: 84 },
  { label: "Valuation signal", short: "Valuation", tag: "Limited re-rating potential", tagColor: "#C0392B", tagBg: "rgba(192,57,43,0.10)", value: 71 },
  { label: "Distribution strength", short: "Distribution", tag: "Moderate", tagColor: "#B98A3E", tagBg: "rgba(185,138,62,0.12)", value: 78 },
];

const metrics = [
  { num: 100, suffix: "M+", label: "Signals", decimals: 0, Icon: Zap, iconBg: "rgba(185,138,62,0.08)", iconColor: "#B98A3E", iconBorder: "rgba(185,138,62,0.20)" },
  { num: 6, suffix: "M+", label: "Pages", decimals: 0, Icon: FileText, iconBg: "rgba(185,138,62,0.08)", iconColor: "#B98A3E", iconBorder: "rgba(185,138,62,0.20)" },
  { num: 100, suffix: "K+", label: "Milestones tracked", decimals: 0, Icon: MessageSquareQuote, iconBg: "rgba(185,138,62,0.08)", iconColor: "#B98A3E", iconBorder: "rgba(185,138,62,0.20)" },
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

// Straight line from a card's edge to the engine rim, using real measured pixel
// positions so it always touches the card exactly.
function flowLine(from: Pt, to: Pt) {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
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

// Skeletal preview of the Signals grid UI: a bank of small status pills, half
// "achieved" (emerald), half "watch/missed" (red), mirroring the real product's
// two-column signal card layout.
function SignalsPreview() {
  const rows = [
    { tag: "PROFITABILITY", good: true },
    { tag: "PROFITABILITY", good: false },
    { tag: "MARGIN QUALITY", good: true },
    { tag: "PORTFOLIO", good: false },
  ];
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {rows.map((r, i) => (
        <div
          key={i}
          className="rounded-md px-2 py-1.5"
          style={{
            background: r.good ? "rgba(45,122,79,0.07)" : "rgba(192,57,43,0.07)",
            border: `1px solid ${r.good ? "rgba(45,122,79,0.16)" : "rgba(192,57,43,0.16)"}`,
          }}
        >
          <div
            className="text-[7px] uppercase leading-none"
            style={{ ...mono, letterSpacing: "0.08em", color: "rgba(14,26,43,0.32)" }}
          >
            {r.tag}
          </div>
          <div
            className="mt-1 h-1.5 w-3/4 rounded-full"
            style={{ background: r.good ? "#2D7A4F" : "#C0392B", opacity: 0.55 }}
          />
        </div>
      ))}
    </div>
  );
}

// Skeletal preview of the QC Intuition UI: a dark headline panel (mirroring the
// "What the ... signals reveal" narrative header) followed by table-row bars.
function QcIntuitionPreview() {
  return (
    <div className="overflow-hidden rounded-md" style={{ border: "1px solid rgba(14,26,43,0.10)" }}>
      <div
        className="px-2.5 py-2"
        style={{ background: "linear-gradient(135deg, #16283F 0%, #0A1220 100%)" }}
      >
        <div
          className="inline-block rounded-full px-1.5 py-0.5 text-[6.5px] uppercase leading-none"
          style={{ ...mono, letterSpacing: "0.08em", color: "rgba(212,169,95,0.85)", background: "rgba(212,169,95,0.14)" }}
        >
          Pattern recognition
        </div>
        <div className="mt-1.5 h-1.5 w-4/5 rounded-full" style={{ background: "rgba(245,240,230,0.55)" }} />
        <div className="mt-1 h-1.5 w-1/2 rounded-full" style={{ background: "rgba(245,240,230,0.30)" }} />
      </div>
      <div className="space-y-1 px-2.5 py-2" style={{ background: "#FBF9F4" }}>
        {[0.9, 0.7, 0.8].map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full" style={{ background: "rgba(14,26,43,0.08)", maxWidth: `${w * 100}%` }} />
            <div className="h-2.5 w-6 flex-shrink-0 rounded-sm" style={{ background: "rgba(185,138,62,0.18)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeletal preview of the Decision Intelligence UI: a rating chip + verdict bars,
// then a small framework grid of tinted tiles (green/amber/red), mirroring the
// real "QuantCase Framework" score breakdown.
function DecisionPreview() {
  const tiles = [
    { good: "pos" }, { good: "pos" }, { good: "warn" },
    { good: "pos" }, { good: "warn" }, { good: "neg" },
  ];
  const tileColor: Record<string, string> = {
    pos: "rgba(45,122,79,0.14)",
    warn: "rgba(185,138,62,0.16)",
    neg: "rgba(192,57,43,0.14)",
  };
  return (
    <div>
      <div className="flex items-center justify-between rounded-md px-2.5 py-2" style={{ background: "#FBF9F4", border: "1px solid rgba(14,26,43,0.10)" }}>
        <div className="flex-1 space-y-1">
          <div className="h-1.5 w-3/4 rounded-full" style={{ background: "#B98A3E", opacity: 0.6 }} />
          <div className="h-1.5 w-1/2 rounded-full" style={{ background: "rgba(14,26,43,0.12)" }} />
        </div>
        <div
          className="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[7px] leading-none"
          style={{ ...mono, background: "rgba(45,122,79,0.14)", color: "#2D7A4F" }}
        >
          77
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        {tiles.map((t, i) => (
          <div key={i} className="h-4 rounded-sm" style={{ background: tileColor[t.good] }} />
        ))}
      </div>
    </div>
  );
}

// Vertical connector used only in the stacked (mobile/tablet) layout, where the
// measured fan-out lines don't apply: sources sit above the engine and outputs
// below it, so a single spine with a travelling dot reads the flow direction
// without eight lines crossing each other in a 380px-wide column.
const SPINE_H = 22; // keep the travelling dot's y-range in step with the spine height

function MobileSpine() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-px lg:hidden"
      style={{
        height: SPINE_H,
        background:
          "linear-gradient(180deg, rgba(185,138,62,0) 0%, rgba(185,138,62,0.5) 50%, rgba(185,138,62,0) 100%)",
      }}
    >
      <motion.span
        className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
        style={{ background: "#D4A95F" }}
        animate={{ y: [0, SPINE_H], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function EngineDiagram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HTMLDivElement>(null);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inView = useInView(wrapRef, { once: true, margin: "-100px" });
  const [activeOutput, setActiveOutput] = useState(0);
  type Geometry = { w: number; h: number; sources: Pt[]; outputs: Pt[]; engine: Pt; engineR: number };
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const measureRef = useRef<() => void>(() => {});
  // null until measured on the client, so SSR never paints the desktop-only
  // connector overlay on a phone.
  const [isStacked, setIsStacked] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)"); // Tailwind `lg`
    const apply = () => setIsStacked(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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

    measureRef.current = measure;
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Re-measure every animation frame while an output card is expanding/collapsing, so
  // connector lines track the card's edge continuously instead of jumping once the
  // (batched, lower-frequency) ResizeObserver callback eventually fires.
  useEffect(() => {
    if (isStacked !== false) return; // no overlay lines to track in the stacked layout
    let raf = 0;
    const start = performance.now();
    const durationMs = 550; // slightly longer than the card's 0.45s expand transition
    function tick(now: number) {
      measureRef.current();
      if (now - start < durationMs) {
        raf = requestAnimationFrame(tick);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeOutput, isStacked]);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setActiveOutput((v) => (v + 1) % outputs.length), 3400);
    return () => clearInterval(id);
  }, [inView]);

  const n = inputSources.length;

  return (
    <div ref={wrapRef} className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-y-1.5 sm:gap-y-3 lg:gap-y-0 lg:gap-x-16">
        {/* Left (top when stacked): source list. Two columns while stacked so all eight
            inputs, the engine and the outputs share one mobile viewport. */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2.5 w-full lg:max-w-[300px] lg:ml-auto">
          {inputSources.map((s, i) => (
            <motion.div
              key={s.label}
              ref={(el) => {
                sourceRefs.current[i] = el;
              }}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center gap-2 rounded-lg px-2 py-1.5 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3"
              style={{ border: "1px solid rgba(14,26,43,0.09)", background: "#EEEAE0" }}
            >
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8 sm:rounded-lg [&_svg]:size-3 sm:[&_svg]:size-[15px]"
                style={{ background: "rgba(185,138,62,0.10)", color: "#B98A3E" }}
              >
                <s.Icon strokeWidth={1.6} />
              </div>
              <span className="min-w-0 text-[10.5px] leading-tight sm:text-[13px]" style={{ ...sans, color: "rgba(14,26,43,0.68)" }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>

        <MobileSpine />

        {/* Center: engine node (connector lines are drawn in the shared overlay SVG below) */}
        <div className="mx-auto flex h-[104px] w-[104px] items-center justify-center sm:h-[168px] sm:w-[168px]">
          <div ref={engineRef} className="relative flex h-[68px] w-[68px] items-center justify-center sm:h-24 sm:w-24">
            {/* Expanding pulse rings (HTML, since they're purely decorative and don't need pixel-perfect anchoring).
                Keyframe arrays (rather than a single initial->animate tween) so the loop eases back to its
                start state instead of snapping once it hits the outer scale. */}
            {inView &&
              [0, 1].map((k) => (
                <motion.span
                  key={`pulse-${k}`}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid #B98A3E" }}
                  animate={{ opacity: [0.55, 0, 0], scale: [1, 2.1, 1] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: ["easeOut", "linear"],
                    times: [0, 1, 1],
                    delay: k * 1.4,
                  }}
                />
              ))}
            {/* Rotating dashed rings */}
            {inView && (
              <motion.span
                className="absolute -inset-2.5 rounded-full sm:-inset-[14px]"
                style={{ border: "1px dashed rgba(185,138,62,0.4)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              />
            )}
            {inView && (
              <motion.span
                className="absolute -inset-1 rounded-full sm:-inset-1.5"
                style={{ border: "1px dashed rgba(185,138,62,0.3)" }}
                animate={{ rotate: -360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />
            )}
            {/* Glow */}
            <span
              aria-hidden
              className="absolute -inset-9 rounded-full sm:-inset-[60px]"
              style={{ background: "radial-gradient(circle, rgba(185,138,62,0.30) 0%, rgba(185,138,62,0.08) 55%, transparent 75%)" }}
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
              <span className="text-[7px] uppercase leading-none sm:text-[9px]" style={{ ...mono, letterSpacing: "0.16em", color: "rgba(245,240,230,0.55)" }}>
                QC
              </span>
              <span className="mt-1 text-[12px] leading-tight sm:mt-1.5 sm:text-[15px]" style={{ ...serif, color: "#F5F0E6", fontStyle: "italic" }}>
                Engine
              </span>
            </motion.div>
          </div>
        </div>

        <MobileSpine />

        {/* Right (bottom when stacked): output cards */}
        <div className="flex flex-col gap-1.5 w-full sm:gap-2.5 lg:max-w-[300px]">
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
                className="relative z-10 overflow-hidden rounded-lg px-2.5 py-2 sm:rounded-xl sm:px-4 sm:py-3.5"
                style={{
                  border: isActive ? "1px solid rgba(185,138,62,0.45)" : "1px solid rgba(14,26,43,0.09)",
                  background: isActive ? "#F3E9D8" : "#EEEAE0",
                  boxShadow: isActive ? "0 4px 20px -4px rgba(185,138,62,0.25)" : "none",
                  transition: "border-color 0.5s ease, background 0.5s ease, box-shadow 0.5s ease",
                }}
              >
                <div className="flex items-start gap-2 sm:gap-3">
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
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-lg [&_svg]:size-[13px] sm:[&_svg]:size-4"
                    style={{
                      background: isActive ? "rgba(185,138,62,0.16)" : "rgba(14,26,43,0.05)",
                      color: isActive ? "#B98A3E" : "rgba(14,26,43,0.45)",
                      transition: "background 0.5s ease, color 0.5s ease",
                    }}
                  >
                    <o.Icon strokeWidth={1.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] sm:text-[13.5px]" style={{ ...sans, color: "#0E1A2B", fontWeight: 500 }}>
                      {o.label}
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug sm:text-[11.5px]" style={{ ...sans, color: "rgba(14,26,43,0.45)" }}>
                      {o.desc}
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="preview"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="ml-9 mt-2 pt-2 sm:ml-12 sm:mt-3 sm:pt-3" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
                        <o.Preview />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shared overlay SVG: connector lines from measured card positions to/from the engine rim.
          `geometry` is re-measured every animation frame while a card expands/collapses
          (see the rAF effect above), so lines track the card's edge continuously.
          Side-by-side layout only — the anchors assume sources sit left of the engine and
          outputs right of it, which is false once the grid stacks (<lg). There, `MobileSpine`
          carries the flow instead. */}
      {geometry && isStacked === false && (() => {
        const g = geometry;
        return (
          <svg
            className="pointer-events-none absolute inset-0"
            width={g.w}
            height={g.h}
            viewBox={`0 0 ${g.w} ${g.h}`}
            aria-hidden
          >
            {/* Static base paths */}
            {g.sources.map((p, i) => (
              <path key={`in-static-${i}`} d={flowLine(p, { x: g.engine.x - g.engineR, y: g.engine.y })} fill="none" stroke="rgba(14,26,43,0.10)" strokeWidth={1.5} />
            ))}
            {g.outputs.map((p, i) => (
              <path key={`out-static-${i}`} d={flowLine({ x: g.engine.x + g.engineR, y: g.engine.y }, p)} fill="none" stroke="rgba(14,26,43,0.10)" strokeWidth={1.5} />
            ))}

            {inView && (
              <>
                {/* Animated draw-in — inputs */}
                {g.sources.map((p, i) => (
                  <motion.path
                    key={`in-draw-${i}`}
                    d={flowLine(p, { x: g.engine.x - g.engineR, y: g.engine.y })}
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
                {g.outputs.map((p, i) => (
                  <motion.path
                    key={`out-draw-${i}`}
                    d={flowLine({ x: g.engine.x + g.engineR, y: g.engine.y }, p)}
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
                {g.sources.map((p, i) => (
                  <FlowDot
                    key={`in-dot-${i}`}
                    d={flowLine(p, { x: g.engine.x - g.engineR, y: g.engine.y })}
                    delay={1.2 + i * (2.4 / n)}
                    period={2.4}
                    color="#D4A95F"
                    size={2.6}
                  />
                ))}
                {/* Flowing particles — engine into outputs */}
                {g.outputs.map((p, i) => (
                  <FlowDot
                    key={`out-dot-${i}`}
                    d={flowLine({ x: g.engine.x + g.engineR, y: g.engine.y }, p)}
                    delay={2.1 + i * 0.55}
                    period={1.5}
                    color="#B98A3E"
                    size={3}
                  />
                ))}
              </>
            )}
          </svg>
        );
      })()}
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

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
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
            Nobody reads 400 pages of an annual report.{" "}
            <span style={{ color: "rgba(14,26,43,0.45)", fontStyle: "italic" }}>We read 6 million.</span>
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
          className="relative mt-8 rounded-2xl px-3 py-5 sm:mt-14 sm:px-6 sm:py-10 md:px-10 md:py-14"
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
