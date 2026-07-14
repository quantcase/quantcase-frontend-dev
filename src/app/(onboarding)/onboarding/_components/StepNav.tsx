"use client";

import { motion } from "framer-motion";
import { OB } from "./theme";

export interface StepNavItem {
  label: string;
}

interface StepNavProps {
  steps: StepNavItem[];
  current: number;
}

export function StepNav({ steps, current }: StepNavProps) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "stretch",
        padding: "0 48px",
        background: OB.bg,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {steps.map((step, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <div
            key={step.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 22,
              paddingBottom: 14,
              paddingRight: 24,
            }}
          >
            <span
              style={{
                fontFamily: OB.mono,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: active ? OB.ink : done ? OB.ink2 : OB.faint,
                whiteSpace: "nowrap",
                transition: "color 0.3s ease",
              }}
            >
              {String(i + 1).padStart(2, "0")} {step.label}
            </span>
            <div style={{ position: "relative", height: 2, background: OB.borderSoft, overflow: "hidden" }}>
              <motion.div
                initial={false}
                animate={{ width: active || done ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: active ? OB.ink : OB.faint,
                }}
              />
            </div>
          </div>
        );
      })}
    </nav>
  );
}
