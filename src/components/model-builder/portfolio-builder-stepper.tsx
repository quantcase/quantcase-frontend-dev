"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModels } from "@/hooks/useModels";
import type { RiskProfileType, GoalType } from "@/types/portfolio";

import { StepperHeader } from "./stepper-header";
import { Step1RiskCapital } from "./step1-risk-capital";
import { Step2AssetClasses } from "./step2-asset-classes";
import { Step3SubClasses } from "./step3-sub-classes";
import { Step4SWP } from "./step4-swp";

import type {
  AssetClassKey,
  AssetClassAlloc,
  SubClassAlloc,
  PassiveIncomeState,
  RetirementIncomeState,
  ChildEducationState,
} from "./stepper-types";

import {
  GOALS,
  PRESET_ALLOCS,
  SUB_CLASSES,
  ASSET_CLASSES,
  DEFAULT_PASSIVE,
  DEFAULT_RETIREMENT,
  DEFAULT_CHILD_EDUCATION,
  MILESTONE_DEFS,
  formatCapital,
  parseCapitalInput,
  defaultSubAllocs,
  resolvedRiskProfile,
} from "./stepper-constants";

import type { SwpConfig } from "@/types/portfolio";

// ── Re-export constants consumed by other files (backwards compat) ─────────────
export {  ASSET_CLASSES, SUB_CLASSES, formatCapital };
export type { AssetClassKey, AssetClassAlloc, SubClassAlloc };

// ── Props ──────────────────────────────────────────────────────────────────────

interface PortfolioBuilderStepperProps {
  onSuccess: (modelId: string) => void;
  onCancel: () => void;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function PortfolioBuilderStepper({ onSuccess, onCancel }: PortfolioBuilderStepperProps) {
  const { createModel } = useModels();

  const [step, setStep]                     = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1
  const [riskProfile, setRiskProfile]     = useState<RiskProfileType>("aggressive");
  const [selectedGoal, setSelectedGoal]   = useState<GoalType | null>(null);
  const [capitalRaw, setCapitalRaw]       = useState("");
  const [capital, setCapital]             = useState<number | null>(null);
  const [portfolioName, setPortfolioName] = useState("");

  // Step 2
  const [assetAllocs, setAssetAllocs] = useState<Record<AssetClassKey, AssetClassAlloc>>(() => {
    const p = PRESET_ALLOCS.aggressive;
    return Object.fromEntries(
      (Object.keys(p) as AssetClassKey[]).map((k) => [k, { enabled: p[k] > 0, pct: p[k] }])
    ) as Record<AssetClassKey, AssetClassAlloc>;
  });

  // Step 3
  const [subAllocsMap, setSubAllocsMap] = useState<Record<AssetClassKey, Record<string, SubClassAlloc>>>(() =>
    Object.fromEntries(
      (Object.keys(SUB_CLASSES) as AssetClassKey[]).map((key) => [key, defaultSubAllocs(key)])
    ) as Record<AssetClassKey, Record<string, SubClassAlloc>>
  );

  // Step 4 — SWP states
  const [passiveIncomeState,    setPassiveIncomeState]    = useState<PassiveIncomeState>(DEFAULT_PASSIVE);
  const [retirementIncomeState, setRetirementIncomeState] = useState<RetirementIncomeState>(DEFAULT_RETIREMENT);
  const [childEducationState,   setChildEducationState]   = useState<ChildEducationState>(DEFAULT_CHILD_EDUCATION);

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Derived
  const goalDef = selectedGoal ? GOALS.find((g) => g.type === selectedGoal) : null;
  const hasSWP  = riskProfile === "goal-based" && !!goalDef?.hasSWP;

  const effectiveRiskProfile = resolvedRiskProfile(riskProfile, selectedGoal);

  const activeClasses = (Object.keys(assetAllocs) as AssetClassKey[]).filter((k) => assetAllocs[k].enabled);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSetRiskProfile = (p: RiskProfileType) => {
    setRiskProfile(p);
    if (p !== "goal-based") {
      setSelectedGoal(null);
      const preset = PRESET_ALLOCS[p as Exclude<RiskProfileType, "goal-based">];
      setAssetAllocs(
        Object.fromEntries(
          (Object.keys(preset) as AssetClassKey[]).map((k) => [k, { enabled: preset[k] > 0, pct: preset[k] }])
        ) as Record<AssetClassKey, AssetClassAlloc>
      );
    }
  };

  const handleGoalChange = (g: GoalType) => {
    setSelectedGoal(g);
    const goal = GOALS.find((gd) => gd.type === g);
    if (goal) {
      const preset = PRESET_ALLOCS[goal.riskProfile];
      setAssetAllocs(
        Object.fromEntries(
          (Object.keys(preset) as AssetClassKey[]).map((k) => [k, { enabled: preset[k] > 0, pct: preset[k] }])
        ) as Record<AssetClassKey, AssetClassAlloc>
      );
    }
  };

  const handleCapitalChip = (v: number) => {
    setCapital(v);
    setCapitalRaw(formatCapital(v));
  };

  const handleCapitalRawChange = (raw: string) => {
    setCapitalRaw(raw);
    setCapital(parseCapitalInput(raw));
  };

  const goToStep = (n: number, fromStep: number) => {
    setCompletedSteps((prev) => prev.includes(fromStep) ? prev : [...prev, fromStep]);
    setStep(n);
  };

  const goBack = (toStep: number, fromStep: number) => {
    setCompletedSteps((prev) => prev.filter((s) => s !== fromStep));
    setStep(toStep);
  };

  // ── Build SWP config ──────────────────────────────────────────────────────────

  const buildSwpConfig = (): SwpConfig | undefined => {
    if (!hasSWP || !selectedGoal) return undefined;

    if (selectedGoal === "passive_income") {
      const s = passiveIncomeState;
      return {
        goal_type: "passive_income",
        corpus: capital ?? 0,
        start_date: s.startDate,
        end_date: s.endDate || null,
        withdrawal_method: s.withdrawalMethod,
        fixed_amount: s.withdrawalMethod === "fixed" ? parseFloat(s.fixedAmount) || null : null,
        withdrawal_rate_pa: s.withdrawalMethod === "percentage" ? parseFloat(s.withdrawalRate) / 100 || null : null,
        frequency: s.frequency as "monthly" | "quarterly" | "half-yearly" | "annual",
        payout_date: (parseInt(s.payoutDate) as 1 | 15) || 1,
        step_up_rate: s.stepUpRate ? parseFloat(s.stepUpRate) / 100 : null,
        portfolio_cagr_assumed: parseFloat(s.cagr) / 100 || 0.08,
        status: "active",
      };
    }

    if (selectedGoal === "retirement_income") {
      const s = retirementIncomeState;
      return {
        goal_type: "retirement_income",
        client_dob: s.clientDob,
        retirement_age: parseInt(s.retirementAge) || 60,
        target_longevity_age: parseInt(s.targetLongevityAge) || 85,
        corpus: capital ?? 0,
        withdrawal_method: s.withdrawalMethod,
        fixed_amount: s.withdrawalMethod === "fixed" ? parseFloat(s.fixedAmount) || null : null,
        withdrawal_rate_pa: s.withdrawalMethod === "percentage" ? parseFloat(s.withdrawalRate) / 100 || null : null,
        frequency: s.frequency as "monthly" | "quarterly" | "half-yearly" | "annual",
        step_up_rate: s.stepUpRate ? parseFloat(s.stepUpRate) / 100 : null,
        inflation_rate: 0.06,
        portfolio_cagr_assumed: parseFloat(s.cagr) / 100 || 0.07,
        nominee: { name: s.nomineeName, relation: s.nomineeRelation, contact: s.nomineeContact },
        status: "active",
      };
    }

    if (selectedGoal === "child_education") {
      const s = childEducationState;
      const milestones = MILESTONE_DEFS.map((m) => ({
        id: m.id,
        active: s[m.key] as boolean,
        trigger_age: m.id === "school" ? 14 : m.id === "ug" ? 18 : m.id === "pg" ? 22 : 24,
      }));
      return {
        goal_type: "child_education",
        child_dob: s.childDob,
        corpus: capital ?? 0,
        inflation_rate: parseFloat(s.inflationRate) / 100 || 0.06,
        portfolio_cagr_assumed: parseFloat(s.cagr) / 100 || 0.08,
        milestones,
        status: "active",
      };
    }

    return undefined;
  };

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!capital) return;
    setSaving(true);
    setError(null);
    try {
      const assetClasses = activeClasses.map((k) => {
        const def = ASSET_CLASSES.find((c) => c.key === k)!;
        const subClasses = Object.entries(subAllocsMap[k])
          .filter(([, alloc]) => alloc.enabled)
          .map(([subKey, alloc]) => {
            const subDef = SUB_CLASSES[k].find((s) => s.key === subKey)!;
            return {
              key: subKey,
              label: subDef.label,
              pct: alloc.pct,
              amount: capital * (assetAllocs[k].pct / 100) * (alloc.pct / 100),
            };
          });
        return {
          key: k,
          label: def.label,
          pct: assetAllocs[k].pct,
          amount: capital * (assetAllocs[k].pct / 100),
          subClasses,
        };
      });

      const newModel = await createModel({
        name: portfolioName,
        riskProfile: effectiveRiskProfile,
        capital,
        assetClasses,
        client: {
          clientName: "—",
          aum: formatCapital(capital),
          latestUpdate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        },
        positions: [],
        whyThisPortfolio: [],
        goalType: selectedGoal ?? undefined,
        swpConfig: buildSwpConfig(),
      });

      onSuccess(newModel.id);
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  // ── Footer logic ──────────────────────────────────────────────────────────────

  const step2Total    = Object.values(assetAllocs).reduce((s, a) => s + (a.enabled ? a.pct : 0), 0);
  const step1Valid    = !!capital && !!portfolioName.trim() && (riskProfile !== "goal-based" || !!selectedGoal);

  const footerBack = step === 2 ? () => { setDirection(-1); goBack(1, 2); }
    : step === 3 ? () => { setDirection(-1); goBack(2, 3); }
    : step === 4 ? () => { setDirection(-1); goBack(3, 4); }
    : undefined;

  const footerNext = step === 1 ? () => { setDirection(1); goToStep(2, 1); }
    : step === 2 ? () => { setDirection(1); goToStep(3, 2); }
    : step === 3 && hasSWP ? () => { setDirection(1); goToStep(4, 3); }
    : handleSave;

  const footerNextLabel =
    step === 1 ? "Continue →" :
    step === 2 ? "Configure sub-classes →" :
    step === 3 && hasSWP ? "Configure SWP →" :
    saving ? "Saving..." : "Save to library →";

  const footerNextDisabled =
    step === 1 ? !step1Valid :
    step === 2 ? Math.round(step2Total) !== 100 :
    saving;

  // ── Slide animation ───────────────────────────────────────────────────────────

  const [direction, setDirection] = useState(1);

  const slideVariants = {
    enter:  (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StepperHeader step={step} completedSteps={completedSteps} hasSWP={hasSWP} />

      <div className="flex-1 overflow-y-auto px-6 py-6 relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            {step === 1 && (
              <Step1RiskCapital
                riskProfile={riskProfile}
                setRiskProfile={handleSetRiskProfile}
                selectedGoal={selectedGoal}
                setSelectedGoal={(g) => { setSelectedGoal(g); if (g) handleGoalChange(g); }}
                capital={capital}
                capitalRaw={capitalRaw}
                setCapitalRaw={handleCapitalRawChange}
                onCapitalChip={handleCapitalChip}
                portfolioName={portfolioName}
                setPortfolioName={setPortfolioName}
              />
            )}

            {step === 2 && (
              <Step2AssetClasses
                capital={capital!}
                assetAllocs={assetAllocs}
                setAssetAllocs={setAssetAllocs}
              />
            )}

            {step === 3 && (
              <Step3SubClasses
                riskProfile={riskProfile}
                capital={capital!}
                assetAllocs={assetAllocs}
                subAllocsMap={subAllocsMap}
                setSubAllocsMap={setSubAllocsMap}
                activeClasses={activeClasses}
              />
            )}

            {step === 4 && hasSWP && selectedGoal && (
              <Step4SWP
                goalType={selectedGoal}
                passiveIncomeState={passiveIncomeState}
                setPassiveIncomeState={setPassiveIncomeState}
                retirementIncomeState={retirementIncomeState}
                setRetirementIncomeState={setRetirementIncomeState}
                childEducationState={childEducationState}
                setChildEducationState={setChildEducationState}
              />
            )}

            {error && <p className="text-sm text-red-600 text-center pt-4">{error}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-[#E2E2E2] bg-white">
        <AnimatePresence mode="wait" initial={false}>
          {footerBack ? (
            <motion.button
              key="back"
              type="button"
              onClick={footerBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium hover:bg-zinc-50"
              style={{ color: "var(--qc-ink)" }}
            >
              ← Back
            </motion.button>
          ) : (
            <motion.button
              key="cancel"
              type="button"
              onClick={onCancel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm hover:text-zinc-700 transition-colors"
              style={{ color: "var(--qc-ink-2)" }}
            >
              Cancel
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            key={footerNextLabel}
            type="button"
            onClick={footerNext}
            disabled={footerNextDisabled}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: footerNextDisabled ? 0.4 : 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            whileHover={footerNextDisabled ? {} : { scale: 1.02 }}
            whileTap={footerNextDisabled ? {} : { scale: 0.97 }}
            className="rounded-md px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed"
            style={{ background: "var(--qc-ink)" }}
          >
            {footerNextLabel}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}
