"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import type { RiskProfileType, GoalType } from "@/types/portfolio";
import {
  RISK_PROFILES,
  GOALS,
  CAPITAL_CHIPS,
  RISK_METER,
  RISK_ALLOC_BARS,
  formatCapital,
} from "./stepper-constants";

// ── Risk Meter ─────────────────────────────────────────────────────────────────

function RiskMeter({ type }: { type: Exclude<RiskProfileType, "goal-based"> }) {
  const { dots, color } = RISK_METER[type];
  return (
    <div className="flex gap-1 items-end">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm transition-all"
          style={{
            width: 5,
            height: 4 + i * 1.8,
            background: i < dots ? color : "var(--qc-border-default)",
          }}
        />
      ))}
    </div>
  );
}

// ── Alloc Bar ──────────────────────────────────────────────────────────────────

function AllocBar({ type }: { type: Exclude<RiskProfileType, "goal-based"> }) {
  const bars = RISK_ALLOC_BARS[type];
  return (
    <div className="space-y-1.5">
      <div className="flex h-2 w-full rounded-full overflow-hidden gap-px">
        {bars.map((b) => (
          <div key={b.label} style={{ width: `${b.pct}%`, background: b.color }} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: b.color }} />
            <span className="text-[10px]" style={{ color: "var(--qc-text-muted)" }}>{b.label} {b.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Goal-based Card ────────────────────────────────────────────────────────────

function GoalBasedCard({
  active,
  selectedGoal,
  onSelect,
  onGoalChange,
}: {
  active: boolean;
  selectedGoal: GoalType | null;
  onSelect: () => void;
  onGoalChange: (g: GoalType) => void;
}) {
  const goal = selectedGoal ? GOALS.find((g) => g.type === selectedGoal) : null;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="rounded-xl text-left flex flex-col"
      animate={{
        borderColor: active ? "var(--qc-text-heading)" : "var(--qc-border-default)",
        background:  active ? "#F8F9FB" : "#fff",
        borderWidth:  active ? 2 : 1,
        padding:      active ? 15 : 16,
        boxShadow:   active ? "0 4px 16px rgba(15,23,43,0.10)" : "0 0px 0px rgba(0,0,0,0)",
      }}
      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(15,23,43,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      style={{ borderStyle: "solid" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--qc-text-heading)" }}>Goal-based</p>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--qc-text-muted)" }}>Auto-maps risk by goal</p>
        </div>
        <div className="rounded-md px-2 py-1 shrink-0 ml-2" style={{ background: "var(--qc-surface-panel)" }}>
          <div className="flex gap-1 items-end">
            {[3, 6, 9].map((dots, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ width: 5, height: 4 + i * 2.5, background: i === 0 ? "#3B82F6" : i === 1 ? "#10B981" : "#EF4444" }}
              />
            ))}
          </div>
        </div>
      </div>

      <span
        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 self-start"
        style={{ background: "#EFF6FF", color: "#3B82F6" }}
      >
        Select goal
      </span>

      <div className="mt-auto w-full" onClick={(e) => e.stopPropagation()}>
        <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--qc-text-muted)" }}>Client goal</p>
        <div className="relative">
          <select
            value={selectedGoal ?? ""}
            onChange={(e) => {
              const val = e.target.value as GoalType;
              onGoalChange(val);
              onSelect();
            }}
            className="w-full appearance-none rounded-lg border border-[#E2E2E2] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#0F172B] transition-all pr-8"
            style={{ color: selectedGoal ? "var(--qc-text-heading)" : "var(--qc-text-muted)" }}
          >
            <option value="" disabled>— pick a goal —</option>
            {GOALS.map((g) => (
              <option key={g.type} value={g.type}>{g.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--qc-text-muted)" }} />
        </div>
        {goal && (
          <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: "var(--qc-text-muted)" }}>
            <span>Maps to</span>
            <span className="font-semibold capitalize" style={{ color: "var(--qc-text-heading)" }}>{goal.riskProfile}</span>
            {goal.hasSWP && (
              <>
                <span>·</span>
                <span className="font-semibold text-emerald-600">SWP available</span>
              </>
            )}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────────

interface Step1Props {
  riskProfile: RiskProfileType;
  setRiskProfile: (p: RiskProfileType) => void;
  selectedGoal: GoalType | null;
  setSelectedGoal: (g: GoalType | null) => void;
  capital: number | null;
  capitalRaw: string;
  setCapitalRaw: (s: string) => void;
  onCapitalChip: (v: number) => void;
  portfolioName: string;
  setPortfolioName: (s: string) => void;
}

export function Step1RiskCapital({
  riskProfile,
  setRiskProfile,
  selectedGoal,
  setSelectedGoal,
  capital,
  capitalRaw,
  setCapitalRaw,
  onCapitalChip,
  portfolioName,
  setPortfolioName,
}: Step1Props) {
  return (
    <div className="space-y-5">
      {/* Risk Profile */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--qc-text-muted)" }}>Risk Profile</p>
        <div className="grid grid-cols-2 gap-3">
          {RISK_PROFILES.map((profile) => {
            const active = profile.type === riskProfile;
            const meter  = RISK_METER[profile.type];
            return (
              <motion.button
                key={profile.type}
                type="button"
                onClick={() => { setRiskProfile(profile.type); setSelectedGoal(null); }}
                className="rounded-xl text-left flex flex-col"
                animate={{
                  borderColor: active ? "var(--qc-text-heading)" : "var(--qc-border-default)",
                  background:  active ? "#F8F9FB" : "#fff",
                  borderWidth:  active ? 2 : 1,
                  padding:      active ? 15 : 16,
                  boxShadow:   active ? "0 4px 16px rgba(15,23,43,0.10)" : "0 0px 0px rgba(0,0,0,0)",
                }}
                whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(15,23,43,0.10)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ borderStyle: "solid" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--qc-text-heading)" }}>{profile.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--qc-text-muted)" }}>{profile.description}</p>
                  </div>
                  <div className="rounded-md px-2 py-1 shrink-0 ml-2" style={{ background: meter.accent }}>
                    <RiskMeter type={profile.type} />
                  </div>
                </div>
                <span
                  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 self-start"
                  style={{ background: meter.accent, color: meter.color }}
                >
                  {profile.riskLabel}
                </span>
                <div className="mt-auto">
                  <AllocBar type={profile.type} />
                </div>
              </motion.button>
            );
          })}

          <GoalBasedCard
            active={riskProfile === "goal-based"}
            selectedGoal={selectedGoal}
            onSelect={() => setRiskProfile("goal-based")}
            onGoalChange={(g) => { setSelectedGoal(g); setRiskProfile("goal-based"); }}
          />
        </div>
      </div>

      {/* Portfolio Capital */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--qc-text-muted)" }}>Portfolio Capital</p>
        <div className="flex items-center gap-2 rounded-xl border border-[#E2E2E2] px-4 py-3 bg-white focus-within:border-[#0F172B] focus-within:ring-1 focus-within:ring-[#0F172B] transition-all">
          <span className="text-lg" style={{ color: "var(--qc-text-muted)" }}>₹</span>
          <input
            type="text"
            value={capitalRaw}
            onChange={(e) => setCapitalRaw(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 bg-transparent text-lg focus:outline-none placeholder:text-zinc-300"
            style={{ color: capitalRaw ? "var(--qc-text-heading)" : undefined }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CAPITAL_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => onCapitalChip(chip.value)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:border-[#0F172B] hover:text-[#0F172B]"
              style={{
                border:     capital === chip.value ? "1px solid #0F172B" : "1px solid #E2E2E2",
                color:      capital === chip.value ? "var(--qc-text-heading)" : "var(--qc-text-muted)",
                background: capital === chip.value ? "var(--qc-surface-panel)" : "#fff",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Name */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--qc-text-muted)" }}>Portfolio Name</p>
        <input
          type="text"
          value={portfolioName}
          onChange={(e) => setPortfolioName(e.target.value)}
          placeholder='e.g. "Aggressive Growth — HNI Tier 1" or "Conservative Income — Retiree"'
          className="w-full rounded-xl border border-[#E2E2E2] px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#0F172B] focus:ring-1 focus:ring-[#0F172B] transition-all placeholder:text-zinc-300"
          style={{ color: portfolioName ? "var(--qc-text-heading)" : undefined }}
        />
      </div>
    </div>
  );
}
