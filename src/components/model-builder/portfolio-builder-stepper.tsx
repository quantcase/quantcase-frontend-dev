"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import type { RiskProfileType } from "@/types/portfolio";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AssetClassKey = "equity" | "debt" | "cash" | "commodities" | "alternatives";

export interface AssetClassAlloc { enabled: boolean; pct: number }
export interface SubClassAlloc   { enabled: boolean; pct: number }

interface RiskProfileDef {
  type: RiskProfileType;
  label: string;
  description: string;
  riskLabel: string;
  riskColor: string;
  allocs: string;
}

interface CapitalChipDef  { label: string; value: number }
interface AssetClassDef   { key: AssetClassKey; label: string; description: string }
interface SubClassDef     { key: string; label: string; description: string }

// ── Config ─────────────────────────────────────────────────────────────────────

const RISK_PROFILES: RiskProfileDef[] = [
  { type: "conservative", label: "Conservative", description: "Capital preservation, steady income",  riskLabel: "Low risk",    riskColor: "text-blue-600 bg-blue-50",     allocs: "Eq 20 · Debt 55 · Cash 10 · Comm 10 · Alt 5" },
  { type: "balanced",     label: "Balanced",     description: "Mix of growth and stability",          riskLabel: "Medium risk", riskColor: "text-emerald-600 bg-emerald-50", allocs: "Eq 50 · Debt 30 · Cash 7 · Comm 7 · Alt 6"  },
  { type: "aggressive",   label: "Aggressive",   description: "High growth, higher volatility",       riskLabel: "High risk",   riskColor: "text-red-600 bg-red-50",       allocs: "Eq 75 · Debt 10 · Cash 5 · Comm 5 · Alt 5"  },
];

const PRESET_ALLOCS: Record<RiskProfileType, Record<AssetClassKey, number>> = {
  conservative: { equity: 20, debt: 55, cash: 10, commodities: 10, alternatives: 5 },
  balanced:     { equity: 50, debt: 30, cash: 7,  commodities: 7,  alternatives: 6 },
  aggressive:   { equity: 75, debt: 10, cash: 5,  commodities: 5,  alternatives: 5 },
};

const CAPITAL_CHIPS: CapitalChipDef[] = [
  { label: "₹5 L",   value: 500000    },
  { label: "₹10 L",  value: 1000000   },
  { label: "₹25 L",  value: 2500000   },
  { label: "₹50 L",  value: 5000000   },
  { label: "₹1 Cr",  value: 10000000  },
  { label: "₹2 Cr",  value: 20000000  },
  { label: "₹5 Cr",  value: 50000000  },
  { label: "₹10 Cr", value: 100000000 },
];

export const ASSET_CLASSES: AssetClassDef[] = [
  { key: "equity",       label: "Equity",                  description: "Listed ownership in companies"           },
  { key: "debt",         label: "Debt / Fixed Income",     description: "Public lending instruments"              },
  { key: "cash",         label: "Cash & Equivalents",      description: "Liquidity & treasury holdings"           },
  { key: "commodities",  label: "Commodities",             description: "Store-of-value & raw material exposure"  },
  { key: "alternatives", label: "Alternative Investments", description: "Non-traditional, yield & derivatives"    },
];

const SUB_CLASSES: Record<AssetClassKey, SubClassDef[]> = {
  equity:       [
    { key: "core",         label: "Core",         description: "Stable compounders, quality large caps" },
    { key: "growth",       label: "Growth",       description: "High earnings growth, scalable businesses" },
    { key: "satellite",    label: "Satellite",    description: "Cyclicals, thematic, event-driven" },
    { key: "mutual_funds", label: "Mutual Funds", description: "All equity MF exposures" },
    { key: "etfs",         label: "ETFs",         description: "All equity ETF exposures" },
  ],
  debt:         [
    { key: "govt_bonds", label: "Govt Bonds",     description: "Sovereign & PSU bonds" },
    { key: "corp_bonds", label: "Corp Bonds",     description: "Investment grade corporate debt" },
    { key: "fd",         label: "Fixed Deposits", description: "Bank & NBFC FDs" },
    { key: "debt_mf",    label: "Debt MFs",       description: "All debt mutual fund exposures" },
  ],
  cash:         [
    { key: "liquid_mf", label: "Liquid MFs", description: "Overnight & liquid mutual funds" },
    { key: "savings",   label: "Savings",    description: "Bank savings & sweep accounts" },
    { key: "tbills",    label: "T-Bills",    description: "Treasury bills & short-term govt paper" },
  ],
  commodities:  [
    { key: "precious",    label: "Precious Metals",  description: "Gold, Silver, Platinum" },
    { key: "industrial",  label: "Industrial Metals", description: "Copper, Aluminium, Lithium" },
    { key: "energy",      label: "Energy",            description: "Crude Oil, Natural Gas, Coal" },
    { key: "agriculture", label: "Agriculture",       description: "Wheat, Sugar, Cotton" },
  ],
  alternatives: [
    { key: "reits",  label: "REITs",  description: "Real estate investment trusts" },
    { key: "invits", label: "InvITs", description: "Infrastructure investment trusts" },
    { key: "pms",    label: "PMS",    description: "Portfolio management services" },
    { key: "aif",    label: "AIF",    description: "Alternative investment funds" },
  ],
};

const STEP_CONFIG = [
  { number: 1, shortTitle: "Risk profile & capital", subtitle: "Choose risk level and investment amount" },
  { number: 2, shortTitle: "Asset class selection",  subtitle: "Toggle asset classes on/off"            },
  { number: 3, shortTitle: "Sub-class instruments",  subtitle: "Configure sub-classes"                  },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatCapital(val: number): string {
  if (val >= 10000000) return `₹${Math.round(val / 10000000)} Cr`;
  if (val >= 100000)   return `₹${Math.round(val / 100000)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

function parseCapitalInput(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (/cr/i.test(raw)) return Math.round(num * 10000000);
  if (/l/i.test(raw))  return Math.round(num * 100000);
  return Math.round(num);
}

function defaultSubAllocs(key: AssetClassKey): Record<string, SubClassAlloc> {
  const result: Record<string, SubClassAlloc> = {};
  SUB_CLASSES[key].forEach((s, i) => {
    result[s.key] = { enabled: i === 0, pct: i === 0 ? 100 : 0 };
  });
  return result;
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ background: on ? "#0F172B" : "#E2E2E2" }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform"
        style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
      style={{ background: checked ? "#0F172B" : "#fff", border: checked ? "none" : "1px solid #E2E2E2" }}
    >
      {checked && <Check className="w-2.5 h-2.5 text-white" />}
    </button>
  );
}

function SliderBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #0F172B ${value}%, #E2E2E2 ${value}%)`,
        accentColor: "#0F172B",
      }}
    />
  );
}

function FooterButtons({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-[#E2E2E2] px-4 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
          style={{ color: "#0F172B" }}
        >
          ← Back
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="rounded-md px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ background: "#0F172B" }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ── Horizontal Stepper Header ─────────────────────────────────────────────────

function StepperHeader({ step, completedSteps }: { step: number; completedSteps: number[] }) {
  return (
    <div className="flex gap-2 sticky top-0 z-10 px-6 py-5 border-b border-[#E2E2E2]" style={{ background: "#F5F5F5" }}>
      {STEP_CONFIG.map((s) => {
        const done   = completedSteps.includes(s.number);
        const active = s.number === step;
        const filled = done || active;
        return (
          <div key={s.number} className="flex-1 flex flex-col gap-2">
            {/* Thick bar */}
            <div
              className="h-1.5 rounded-full transition-colors duration-300"
              style={{ background: filled ? "#0F172B" : "#E2E2E2" }}
            />
            {/* Step number */}
            <p className="text-[11px] font-semibold" style={{ color: filled ? "#0F172B" : "#888888" }}>
              Step {s.number}
            </p>
            {/* Title */}
            <p className="text-sm font-semibold leading-tight" style={{ color: filled ? "#0F172B" : "#888888" }}>
              {s.shortTitle}
            </p>
            {/* Subtitle */}
            <p className="text-xs leading-tight" style={{ color: "#888888" }}>
              {s.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Risk Profile & Capital ────────────────────────────────────────────

function Step1({
  riskProfile,
  setRiskProfile,
  capital,
  capitalRaw,
  setCapitalRaw,
  onCapitalChip,
  onContinue,
}: {
  riskProfile: RiskProfileType;
  setRiskProfile: (p: RiskProfileType) => void;
  capital: number | null;
  capitalRaw: string;
  setCapitalRaw: (s: string) => void;
  onCapitalChip: (v: number) => void;
  onContinue: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E2E2E2] bg-white p-6 space-y-6">
      {/* Risk Profile */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Risk Profile</p>
        <div className="grid grid-cols-3 gap-3">
          {RISK_PROFILES.map((profile) => {
            const active = profile.type === riskProfile;
            return (
              <button
                key={profile.type}
                type="button"
                onClick={() => setRiskProfile(profile.type)}
                className="rounded-xl border p-4 text-left transition-all"
                style={{ border: active ? "1.5px solid #0F172B" : "1px solid #E2E2E2", background: "#fff" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#0F172B" }}>{profile.label}</p>
                <p className="text-xs mb-3" style={{ color: "#888888" }}>{profile.description}</p>
                <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 ${profile.riskColor}`}>
                  {profile.riskLabel}
                </span>
                <p className="text-[11px]" style={{ color: "#888888" }}>{profile.allocs}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Portfolio Capital */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Portfolio Capital</p>
        <div className="flex items-center gap-2 rounded-xl border border-[#E2E2E2] px-4 py-3 bg-white focus-within:border-[#0F172B] focus-within:ring-1 focus-within:ring-[#0F172B] transition-all">
          <span className="text-lg" style={{ color: "#888888" }}>₹</span>
          <input
            type="text"
            value={capitalRaw}
            onChange={(e) => setCapitalRaw(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 bg-transparent text-lg focus:outline-none placeholder:text-zinc-300"
            style={{ color: capitalRaw ? "#0F172B" : undefined }}
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
                color:      capital === chip.value ? "#0F172B" : "#888888",
                background: capital === chip.value ? "#F5F5F5" : "#fff",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <FooterButtons onNext={onContinue} nextLabel="Continue →" nextDisabled={!capital} />
    </div>
  );
}

// ── Step 2: Asset Class Selection ─────────────────────────────────────────────

function AssetClassRow({
  assetDef,
  alloc,
  capital,
  onToggle,
  onSlider,
}: {
  assetDef: AssetClassDef;
  alloc: AssetClassAlloc;
  capital: number;
  onToggle: () => void;
  onSlider: (v: number) => void;
}) {
  const amount = capital * (alloc.pct / 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Toggle on={alloc.enabled} onClick={onToggle} />
          <div>
            <p className="text-sm font-semibold" style={{ color: alloc.enabled ? "#0F172B" : "#888888" }}>{assetDef.label}</p>
            <p className="text-xs" style={{ color: "#888888" }}>{assetDef.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          {alloc.enabled ? (
            <>
              <p className="text-sm font-semibold" style={{ color: "#0F172B" }}>{alloc.pct}</p>
              <p className="text-xs" style={{ color: "#888888" }}>{formatCapital(amount)}</p>
            </>
          ) : (
            <p className="text-xs" style={{ color: "#888888" }}>Off</p>
          )}
        </div>
      </div>
      {alloc.enabled && (
        <div className="pl-14">
          <SliderBar value={alloc.pct} onChange={onSlider} />
        </div>
      )}
    </div>
  );
}

function Step2({
  capital,
  assetAllocs,
  setAssetAllocs,
  onBack,
  onContinue,
}: {
  capital: number;
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>;
  setAssetAllocs: (a: Record<AssetClassKey, AssetClassAlloc>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const total      = Object.values(assetAllocs).reduce((s, a) => s + (a.enabled ? a.pct : 0), 0);
  const isComplete = Math.round(total) === 100;

  // Distribute `delta` proportionally across `others` (by their current pct), clamped to [0,100].
  function rebalanceOthers(
    allocs: Record<AssetClassKey, AssetClassAlloc>,
    changedKey: AssetClassKey,
    delta: number,
  ): Record<AssetClassKey, AssetClassAlloc> {
    const otherKeys = (Object.keys(allocs) as AssetClassKey[]).filter(
      (k) => k !== changedKey && allocs[k].enabled
    );
    const othersTotal = otherKeys.reduce((s, k) => s + allocs[k].pct, 0);
    const next = { ...allocs };
    if (otherKeys.length === 0) return next;
    if (othersTotal === 0) {
      // distribute evenly
      const share = Math.round(delta / otherKeys.length);
      otherKeys.forEach((k) => { next[k] = { ...next[k], pct: Math.max(0, Math.min(100, next[k].pct + share)) }; });
    } else {
      // distribute proportionally, accumulate rounding error on last key
      let remaining = delta;
      otherKeys.forEach((k, i) => {
        const adj = i === otherKeys.length - 1
          ? remaining
          : Math.round((allocs[k].pct / othersTotal) * delta);
        next[k] = { ...next[k], pct: Math.max(0, Math.min(100, next[k].pct + adj)) };
        remaining -= adj;
      });
    }
    return next;
  }

  const toggle = (key: AssetClassKey) => {
    const cur = assetAllocs[key];
    if (cur.enabled) {
      // turning off: give its pct to others
      const next = rebalanceOthers({ ...assetAllocs, [key]: { enabled: false, pct: 0 } }, key, cur.pct);
      next[key] = { enabled: false, pct: 0 };
      setAssetAllocs(next);
    } else {
      // turning on with equal share: pull from others to give this one a slot
      const enabledCount = (Object.keys(assetAllocs) as AssetClassKey[]).filter((k) => assetAllocs[k].enabled).length;
      const newPct = Math.round(100 / (enabledCount + 1));
      const base = { ...assetAllocs, [key]: { enabled: true, pct: newPct } };
      const next = rebalanceOthers(base, key, -newPct);
      next[key] = { enabled: true, pct: newPct };
      setAssetAllocs(next);
    }
  };

  const setSlider = (key: AssetClassKey, val: number) => {
    const prev = assetAllocs[key].pct;
    const delta = prev - val; // positive = freed up, negative = took more
    const base = { ...assetAllocs, [key]: { ...assetAllocs[key], pct: val } };
    const next = rebalanceOthers(base, key, delta);
    next[key] = { ...next[key], pct: val };
    setAssetAllocs(next);
  };

  const handleCustom = () =>
    setAssetAllocs(
      Object.fromEntries(ASSET_CLASSES.map((c) => [c.key, { enabled: true, pct: 20 }])) as Record<AssetClassKey, AssetClassAlloc>
    );

  return (
    <div className="rounded-xl border border-[#E2E2E2] bg-white p-6 space-y-4">
      {/* Banner */}
      <div
        className="rounded-lg px-4 py-3 text-sm font-semibold flex items-center justify-between"
        style={{ background: isComplete ? "#f0fdf4" : "#FFF7F0", color: isComplete ? "#166534" : "#92400e" }}
      >
        <span>
          {isComplete
            ? "Allocation complete"
            : `Allocation ${total > 100 ? "over" : "incomplete"} — ${Math.round(total)}% allocated`}
        </span>
        <span>{Math.round(total)}%</span>
      </div>

      {/* Asset rows */}
      {ASSET_CLASSES.map((def) => (
        <AssetClassRow
          key={def.key}
          assetDef={def}
          alloc={assetAllocs[def.key]}
          capital={capital}
          onToggle={() => toggle(def.key)}
          onSlider={(v) => setSlider(def.key, v)}
        />
      ))}

      {/* Divider + Custom option */}
      <div className="flex items-center gap-3 text-xs py-1" style={{ color: "#888888" }}>
        <div className="flex-1 h-px" style={{ background: "#E2E2E2" }} />
        <span>or</span>
        <div className="flex-1 h-px" style={{ background: "#E2E2E2" }} />
      </div>
      <button
        type="button"
        onClick={handleCustom}
        className="w-full flex items-center justify-between rounded-xl border border-[#E2E2E2] px-4 py-4 text-left hover:border-zinc-300 transition-colors bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F5F5F5" }}>
            <span className="text-lg font-bold" style={{ color: "#888888" }}>—</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#0F172B" }}>Create your own portfolio</p>
            <p className="text-xs" style={{ color: "#888888" }}>Set fully custom weights — equal 20% across all 5 classes as starting point</p>
          </div>
        </div>
        <span style={{ color: "#888888" }}>→</span>
      </button>

      <FooterButtons onBack={onBack} onNext={onContinue} nextLabel="Configure sub-classes →" nextDisabled={!isComplete} />
    </div>
  );
}

// ── Step 3: Sub-class Instruments ─────────────────────────────────────────────

function SubClassRow({
  sub,
  alloc,
  classCap,
  onToggle,
  onPctChange,
}: {
  sub: SubClassDef;
  alloc: SubClassAlloc;
  classCap: number;
  onToggle: () => void;
  onPctChange: (v: number) => void;
}) {
  const subAmount = classCap * (alloc.pct / 100);
  return (
    <div className="grid grid-cols-[1fr_120px_80px] gap-2 items-center py-2.5 border-b border-[#F5F5F5] last:border-0">
      <div className="flex items-center gap-3">
        <Checkbox checked={alloc.enabled} onClick={onToggle} />
        <div>
          <p className="text-sm font-medium" style={{ color: alloc.enabled ? "#0F172B" : "#888888" }}>{sub.label}</p>
          <p className="text-xs" style={{ color: "#888888" }}>{sub.description}</p>
        </div>
      </div>
      {alloc.enabled ? (
        <>
          <div className="flex justify-end">
            <input
              type="number"
              min={0}
              max={100}
              value={alloc.pct}
              onChange={(e) => onPctChange(Number(e.target.value))}
              className="w-20 rounded border border-[#E2E2E2] px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#0F172B]"
              style={{ color: "#0F172B" }}
            />
          </div>
          <p className="text-xs text-right" style={{ color: "#0F172B" }}>{formatCapital(subAmount)}</p>
        </>
      ) : (
        <>
          <p className="text-xs text-right" style={{ color: "#888888" }}>Off</p>
          <p className="text-xs text-right" style={{ color: "#888888" }}>—</p>
        </>
      )}
    </div>
  );
}

function SubClassTable({
  assetKey,
  label,
  pct,
  capital,
  subAllocs,
  setSubAllocs,
}: {
  assetKey: AssetClassKey;
  label: string;
  pct: number;
  capital: number;
  subAllocs: Record<string, SubClassAlloc>;
  setSubAllocs: (a: Record<string, SubClassAlloc>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const classCap     = capital * (pct / 100);
  const enabledTotal = Object.values(subAllocs).reduce((s, a) => s + (a.enabled ? a.pct : 0), 0);
  const isValid      = Math.round(enabledTotal) === 100;

  const toggle = (key: string) => {
    const cur = subAllocs[key];
    setSubAllocs({ ...subAllocs, [key]: { enabled: !cur.enabled, pct: cur.enabled ? 0 : 20 } });
  };

  const setPct = (key: string, val: number) =>
    setSubAllocs({ ...subAllocs, [key]: { ...subAllocs[key], pct: val } });

  return (
    <div className="border-b border-[#E2E2E2] last:border-0">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "#0F172B" }}>{label}</p>
          <p className="text-xs" style={{ color: "#888888" }}>{pct}% of portfolio · {formatCapital(classCap)}</p>
        </div>
        <div className="flex items-center gap-3">
          {isValid && <Check className="w-4 h-4 text-emerald-500" />}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-[#E2E2E2] px-3 py-1 text-xs font-medium hover:border-zinc-300 transition-colors"
            style={{ color: "#0F172B" }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            sub-classes
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pb-4">
          <div className="grid grid-cols-[1fr_120px_80px] gap-2 pb-2 border-b border-[#E2E2E2]">
            <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#888888" }}>Sub-class instrument</p>
            <p className="text-[10px] uppercase tracking-wider font-medium text-right" style={{ color: "#888888" }}>% within class</p>
            <p className="text-[10px] uppercase tracking-wider font-medium text-right" style={{ color: "#888888" }}>Amount</p>
          </div>

          {SUB_CLASSES[assetKey].map((sub) => (
            <SubClassRow
              key={sub.key}
              sub={sub}
              alloc={subAllocs[sub.key]}
              classCap={classCap}
              onToggle={() => toggle(sub.key)}
              onPctChange={(v) => setPct(sub.key, v)}
            />
          ))}

          <div className="flex justify-end pt-2">
            <p className="text-xs font-semibold" style={{ color: isValid ? "#166534" : "#b91c1c" }}>
              Total: {Math.round(enabledTotal)}%{isValid ? " ✓" : " (needs 100%)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({
  riskProfile,
  capital,
  assetAllocs,
  subAllocsMap,
  setSubAllocsMap,
  activeClasses,
  onBack,
  onSave,
  saving,
}: {
  riskProfile: RiskProfileType;
  capital: number;
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>;
  subAllocsMap: Record<AssetClassKey, Record<string, SubClassAlloc>>;
  setSubAllocsMap: (m: Record<AssetClassKey, Record<string, SubClassAlloc>>) => void;
  activeClasses: AssetClassKey[];
  onBack: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const riskLabel = RISK_PROFILES.find((p) => p.type === riskProfile)?.label ?? riskProfile;
  const summaryTiles = [
    { label: "Profile",        value: riskLabel },
    { label: "Capital",        value: formatCapital(capital) },
    { label: "Active classes", value: String(activeClasses.length) },
    { label: "Total alloc",    value: "100%", highlight: true },
  ];

  return (
    <div className="rounded-xl border border-[#E2E2E2] bg-white p-6 space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-3 pb-2">
        {summaryTiles.map(({ label, value, highlight }) => (
          <div key={label} className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "#888888" }}>{label}</p>
            <p className="text-sm font-semibold" style={{ color: highlight ? "#166534" : "#0F172B" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Sub-class tables */}
      <div>
        {activeClasses.map((key) => {
          const def = ASSET_CLASSES.find((c) => c.key === key)!;
          return (
            <SubClassTable
              key={key}
              assetKey={key}
              label={def.label}
              pct={assetAllocs[key].pct}
              capital={capital}
              subAllocs={subAllocsMap[key]}
              setSubAllocs={(next) => setSubAllocsMap({ ...subAllocsMap, [key]: next })}
            />
          );
        })}
      </div>

      <FooterButtons
        onBack={onBack}
        onNext={onSave}
        nextLabel={saving ? "Saving..." : "Save to library →"}
        nextDisabled={saving}
      />
    </div>
  );
}

// ── PortfolioBuilderStepper ───────────────────────────────────────────────────

export interface PortfolioBuilderStepperProps {
  onSuccess: (modelId: string) => void;
  onCancel: () => void;
}

export function PortfolioBuilderStepper({ onSuccess, onCancel }: PortfolioBuilderStepperProps) {
  const { createModel } = useModels();

  const [step, setStep]                   = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1
  const [riskProfile, setRiskProfile] = useState<RiskProfileType>("aggressive");
  const [capitalRaw, setCapitalRaw]   = useState("");
  const [capital, setCapital]         = useState<number | null>(null);

  // Step 2 — seeded from aggressive preset
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

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSetRiskProfile = (p: RiskProfileType) => {
    setRiskProfile(p);
    const preset = PRESET_ALLOCS[p];
    setAssetAllocs(
      Object.fromEntries(
        (Object.keys(preset) as AssetClassKey[]).map((k) => [k, { enabled: preset[k] > 0, pct: preset[k] }])
      ) as Record<AssetClassKey, AssetClassAlloc>
    );
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

  const activeClasses = (Object.keys(assetAllocs) as AssetClassKey[]).filter((k) => assetAllocs[k].enabled);

  const handleSave = async () => {
    if (!capital) return;
    setSaving(true);
    setError(null);
    try {
      const riskLabel = RISK_PROFILES.find((p) => p.type === riskProfile)?.label ?? riskProfile;

      // Build structured asset allocation payload
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
        name: `${riskLabel} Portfolio`,
        riskProfile,
        capital,
        assetClasses,
        client: {
          clientName: "—",
          aum: formatCapital(capital),
          latestUpdate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        },
        positions: [],
        whyThisPortfolio: [],
      });

      onSuccess(newModel.id);
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div>
      <StepperHeader step={step} completedSteps={completedSteps} />
      <div className="px-6 py-6 space-y-2">

      {step === 1 && (
        <Step1
          riskProfile={riskProfile}
          setRiskProfile={handleSetRiskProfile}
          capital={capital}
          capitalRaw={capitalRaw}
          setCapitalRaw={handleCapitalRawChange}
          onCapitalChip={handleCapitalChip}
          onContinue={() => goToStep(2, 1)}
        />
      )}

      {step === 2 && (
        <Step2
          capital={capital!}
          assetAllocs={assetAllocs}
          setAssetAllocs={setAssetAllocs}
          onBack={() => setStep(1)}
          onContinue={() => goToStep(3, 2)}
        />
      )}

      {step === 3 && (
        <Step3
          riskProfile={riskProfile}
          capital={capital!}
          assetAllocs={assetAllocs}
          subAllocsMap={subAllocsMap}
          setSubAllocsMap={setSubAllocsMap}
          activeClasses={activeClasses}
          onBack={() => setStep(2)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs transition-colors hover:text-zinc-700"
          style={{ color: "#888888" }}
        >
          Cancel
        </button>
      </div>
      </div>
    </div>
  );
}
