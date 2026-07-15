"use client";

import { motion } from "framer-motion";
import { RadarIcon } from "lucide-react";
import { MonoLabel } from "@/components/ds";

// Decorative "scanning radar" illustration — matches the insight-page empty
// state so the whole product reads with one visual language for "analysis in
// flight". Built purely from --qc-* tokens.
function RadarIllustration() {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;
  const rings = [0.33, 0.66, 1];
  const n = 4;

  const spokes = Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n;
    return { x: cx + maxR * Math.sin(angle), y: cy - maxR * Math.cos(angle) };
  });
  const ringPoints = (ratio: number) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n;
      const r = maxR * ratio;
      return `${(cx + r * Math.sin(angle)).toFixed(1)},${(cy - r * Math.cos(angle)).toFixed(1)}`;
    }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {rings.map((r, i) => (
        <polygon
          key={i}
          points={ringPoints(r)}
          fill="none"
          stroke="var(--qc-hair)"
          strokeWidth={i === rings.length - 1 ? 1.1 : 0.9}
          strokeDasharray={i === rings.length - 1 ? undefined : "3 3"}
        />
      ))}
      {spokes.map((pt, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="var(--qc-hair)" strokeWidth={0.9} />
      ))}

      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="overview-radar-sweep" x1="50%" y1="50%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--qc-ink-3)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--qc-ink-3)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={`M${cx},${cy} L${cx + maxR},${cy} A${maxR},${maxR} 0 0 0 ${cx + maxR * Math.cos(Math.PI / 4)},${cy - maxR * Math.sin(Math.PI / 4)} Z`}
          fill="url(#overview-radar-sweep)"
        />
        <line x1={cx} y1={cy} x2={cx + maxR} y2={cy} stroke="var(--qc-ink-3)" strokeWidth={1.2} strokeOpacity={0.5} />
      </motion.g>

      <circle cx={cx} cy={cy} r={3} fill="var(--qc-ink-3)" />
    </svg>
  );
}

export function OverviewEmptyState({ company }: { company?: string | null }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16" style={{ background: "var(--qc-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[14px] px-8 py-12 text-center"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        <div className="flex items-center justify-center" style={{ marginBottom: 20 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 200, height: 200, borderRadius: "50%",
              background: "var(--qc-section)", border: "1px solid var(--qc-hair)",
            }}
          >
            <RadarIllustration />
          </div>
        </div>

        <MonoLabel size={10} tracking="0.14em" color="var(--qc-ink-3)" style={{ display: "block", marginBottom: 10 }}>
          QuantCase Overview
        </MonoLabel>

        <h2 style={{
          fontSize: "var(--qc-fz-22)", fontWeight: "var(--qc-w-regular)", lineHeight: 1.3,
          color: "var(--qc-ink)", fontFamily: "var(--qc-font-serif)", margin: "0 0 10px",
        }}>
          Analysis not ready yet
        </h2>

        <p style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-3)", lineHeight: 1.6, margin: 0 }}>
          We haven&apos;t completed the QuantCase overview
          {company ? <> for <span style={{ color: "var(--qc-ink-2)", fontWeight: "var(--qc-w-semi)" }}>{company}</span></> : null}
          {" "}yet. Our engine is still working on it — check back again shortly.
        </p>

        <div className="flex items-center justify-center" style={{ gap: 8, marginTop: 20 }}>
          <RadarIcon size={13} strokeWidth={1.8} style={{ color: "var(--qc-ink-3)" }} />
          <span style={{ fontSize: "var(--qc-fz-11)", color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)" }}>
            Coverage is added continuously
          </span>
        </div>
      </motion.div>
    </div>
  );
}
