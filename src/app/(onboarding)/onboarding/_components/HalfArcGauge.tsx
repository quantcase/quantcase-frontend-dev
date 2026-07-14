"use client";

import { motion } from "framer-motion";
import { OB } from "./theme";

interface HalfArcGaugeProps {
  score: number;
  maxScore?: number;
  ticker?: string;
  size?: number;
  delay?: number;
}

export function HalfArcGauge({ score, maxScore = 100, ticker, size = 210, delay = 0.15 }: HalfArcGaugeProps) {
  const strokeW = size * 0.045;
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const halfCircumference = Math.PI * r;
  const pct = Math.min(1, Math.max(0, score / maxScore));

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div style={{ width: size, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size / 2 + strokeW / 2} viewBox={`0 0 ${size} ${size / 2 + strokeW / 2}`}>
        <path d={arcPath} fill="none" stroke={OB.border} strokeWidth={strokeW} strokeLinecap="round" />
        <motion.path
          d={arcPath}
          fill="none"
          stroke={OB.accent}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={halfCircumference}
          initial={{ strokeDashoffset: halfCircumference }}
          animate={{ strokeDashoffset: halfCircumference * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </svg>
      <div style={{ marginTop: -size * 0.28, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            fontFamily: OB.serif,
            fontStyle: "italic",
            fontSize: size * 0.34,
            color: OB.accent,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {score}
        </span>
        <span style={{ fontFamily: OB.mono, fontSize: size * 0.052, color: OB.muted, marginTop: 2 }}>
          / {maxScore}
        </span>
      </div>
      {ticker && (
        <span
          style={{
            marginTop: 10,
            fontFamily: OB.mono,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: OB.muted,
          }}
        >
          {ticker}
        </span>
      )}
    </div>
  );
}
