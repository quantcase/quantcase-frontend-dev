"use client";

import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStepConfig } from "./stepper-constants";

interface StepperHeaderProps {
  step: number;
  completedSteps: number[];
  hasSWP: boolean;
}

export function StepperHeader({ step, completedSteps, hasSWP }: StepperHeaderProps) {
  const STEP_CONFIG = getStepConfig(hasSWP);
  return (
    <div className="flex gap-4 px-6 py-4 border-b border-[#E2E2E2]" style={{ background: "#fff" }}>
      {STEP_CONFIG.map((s) => {
        const done   = completedSteps.includes(s.number);
        const active = s.number === step;
        const filled = done || active;
        return (
          <div key={s.number} className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <motion.span
                layout
                animate={{
                  background: active ? "var(--qc-text-heading)" : done ? "var(--qc-text-heading)" : "#EBEBEB",
                  color:      active || done ? "#fff" : "var(--qc-text-muted)",
                  scale:      active ? 1.08 : 1,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
                style={{ width: 28, height: 28, fontSize: 11 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={`num-${s.number}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {s.number}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider leading-none mb-0.5" style={{ color: "var(--qc-text-muted)" }}>
                  Step {s.number}
                </p>
                <motion.p
                  animate={{ color: filled ? "var(--qc-text-heading)" : "var(--qc-text-muted)" }}
                  transition={{ duration: 0.3 }}
                  className="text-[13px] font-semibold leading-tight"
                >
                  {s.shortTitle}
                </motion.p>
              </div>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--qc-border-default)" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "var(--qc-text-heading)" }}
                initial={false}
                animate={{ width: filled ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
