"use client";

import { useState, useRef } from "react";
import { Check } from "lucide-react";
import {
  AssetClassForm,
  SubClassForm,
  assetAllocsToItems,
  itemsToAssetAllocs,
  subAllocsMapToItemsMap,
  itemsToSubAllocs,
} from "./asset-allocation-editor";
import { motion, AnimatePresence } from "framer-motion";
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
  allocs: string;
}

interface CapitalChipDef  { label: string; value: number }
interface AssetClassDef   { key: AssetClassKey; label: string; description: string }
export interface SubClassDef     { key: string; label: string; description: string }

// ── Config ─────────────────────────────────────────────────────────────────────

const RISK_PROFILES: RiskProfileDef[] = [
  { type: "conservative", label: "Conservative", description: "Capital preservation, steady income",  riskLabel: "Low risk",    allocs: "Eq 20 · Debt 55 · Cash 10 · Comm 10 · Alt 5" },
  { type: "balanced",     label: "Balanced",     description: "Mix of growth and stability",          riskLabel: "Medium risk", allocs: "Eq 50 · Debt 30 · Cash 7 · Comm 7 · Alt 6"  },
  { type: "aggressive",   label: "Aggressive",   description: "High growth, higher volatility",       riskLabel: "High risk",   allocs: "Eq 75 · Debt 10 · Cash 5 · Comm 5 · Alt 5"  },
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

export const SUB_CLASSES: Record<AssetClassKey, SubClassDef[]> = {
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

// ── Horizontal Stepper Header ─────────────────────────────────────────────────

function StepperHeader({ step, completedSteps }: { step: number; completedSteps: number[] }) {
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
                  background: active ? "#0F172B" : done ? "#0F172B" : "#EBEBEB",
                  color:      active || done ? "#fff" : "#888888",
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
                <p className="text-[11px] font-semibold uppercase tracking-wider leading-none mb-0.5" style={{ color: "#888888" }}>
                  Step {s.number}
                </p>
                <motion.p
                  animate={{ color: filled ? "#0F172B" : "#888888" }}
                  transition={{ duration: 0.3 }}
                  className="text-[13px] font-semibold leading-tight"
                >
                  {s.shortTitle}
                </motion.p>
              </div>
            </div>
            {/* Thicker active bar */}
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "#E2E2E2" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "#0F172B" }}
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

// ── Step 1: Risk Profile & Capital ────────────────────────────────────────────

const RISK_ALLOC_BARS: Record<RiskProfileType, { label: string; color: string; pct: number }[]> = {
  conservative: [
    { label: "Equity",  color: "#0F172B", pct: 20 },
    { label: "Debt",    color: "#475569", pct: 55 },
    { label: "Cash",    color: "#94A3B8", pct: 10 },
    { label: "Comm",    color: "#CBD5E1", pct: 10 },
    { label: "Alt",     color: "#E2E8F0", pct: 5  },
  ],
  balanced: [
    { label: "Equity",  color: "#0F172B", pct: 50 },
    { label: "Debt",    color: "#475569", pct: 30 },
    { label: "Cash",    color: "#94A3B8", pct: 7  },
    { label: "Comm",    color: "#CBD5E1", pct: 7  },
    { label: "Alt",     color: "#E2E8F0", pct: 6  },
  ],
  aggressive: [
    { label: "Equity",  color: "#0F172B", pct: 75 },
    { label: "Debt",    color: "#475569", pct: 10 },
    { label: "Cash",    color: "#94A3B8", pct: 5  },
    { label: "Comm",    color: "#CBD5E1", pct: 5  },
    { label: "Alt",     color: "#E2E8F0", pct: 5  },
  ],
};

const RISK_METER: Record<RiskProfileType, { dots: number; color: string; accent: string }> = {
  conservative: { dots: 3, color: "#3B82F6", accent: "#EFF6FF" },
  balanced:     { dots: 6, color: "#10B981", accent: "#ECFDF5" },
  aggressive:   { dots: 9, color: "#EF4444", accent: "#FEF2F2" },
};

function RiskMeter({ type }: { type: RiskProfileType }) {
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
            background: i < dots ? color : "#E2E2E2",
          }}
        />
      ))}
    </div>
  );
}

function AllocBar({ type }: { type: RiskProfileType }) {
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
            <span className="text-[10px]" style={{ color: "#888888" }}>{b.label} {b.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1({
  riskProfile,
  setRiskProfile,
  capital,
  capitalRaw,
  setCapitalRaw,
  onCapitalChip,
  portfolioName,
  setPortfolioName,
}: {
  riskProfile: RiskProfileType;
  setRiskProfile: (p: RiskProfileType) => void;
  capital: number | null;
  capitalRaw: string;
  setCapitalRaw: (s: string) => void;
  onCapitalChip: (v: number) => void;
  portfolioName: string;
  setPortfolioName: (s: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Risk Profile */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Risk Profile</p>
        <div className="grid grid-cols-3 gap-3">
          {RISK_PROFILES.map((profile) => {
            const active = profile.type === riskProfile;
            const meter  = RISK_METER[profile.type];
            return (
              <motion.button
                key={profile.type}
                type="button"
                onClick={() => setRiskProfile(profile.type)}
                className="rounded-xl text-left flex flex-col"
                animate={{
                  borderColor: active ? "#0F172B" : "#E2E2E2",
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
                {/* Top row: label + risk meter */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-bold leading-tight" style={{ color: "#0F172B" }}>{profile.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#888888" }}>{profile.description}</p>
                  </div>
                  <div
                    className="rounded-md px-2 py-1 shrink-0 ml-2"
                    style={{ background: meter.accent }}
                  >
                    <RiskMeter type={profile.type} />
                  </div>
                </div>

                {/* Risk badge */}
                <span
                  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 self-start"
                  style={{
                    background: meter.accent,
                    color:      meter.color,
                  }}
                >
                  {profile.riskLabel}
                </span>

                {/* Allocation bar */}
                <div className="mt-auto">
                  <AllocBar type={profile.type} />
                </div>
              </motion.button>
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

      {/* Portfolio Name */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Portfolio Name</p>
        <input
          type="text"
          value={portfolioName}
          onChange={(e) => setPortfolioName(e.target.value)}
          placeholder='e.g. "Aggressive Growth — HNI Tier 1" or "Conservative Income — Retiree"'
          className="w-full rounded-xl border border-[#E2E2E2] px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#0F172B] focus:ring-1 focus:ring-[#0F172B] transition-all placeholder:text-zinc-300"
          style={{ color: portfolioName ? "#0F172B" : undefined }}
        />
      </div>
    </div>
  );
}

// ── Step 2: Asset Class Selection ─────────────────────────────────────────────

function Step2({
  capital,
  assetAllocs,
  setAssetAllocs,
}: {
  capital: number;
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>;
  setAssetAllocs: (a: Record<AssetClassKey, AssetClassAlloc>) => void;
}) {
  return (
    <AssetClassForm
      capital={capital}
      items={assetAllocsToItems(assetAllocs)}
      onChange={(next) => setAssetAllocs(itemsToAssetAllocs(next))}
    />
  );
}

// ── Step 3: Sub-class Instruments ─────────────────────────────────────────────

function Step3({
  riskProfile,
  capital,
  assetAllocs,
  subAllocsMap,
  setSubAllocsMap,
  activeClasses,
}: {
  riskProfile: RiskProfileType;
  capital: number;
  assetAllocs: Record<AssetClassKey, AssetClassAlloc>;
  subAllocsMap: Record<AssetClassKey, Record<string, SubClassAlloc>>;
  setSubAllocsMap: (m: Record<AssetClassKey, Record<string, SubClassAlloc>>) => void;
  activeClasses: AssetClassKey[];
}) {
  const riskLabel = RISK_PROFILES.find((p) => p.type === riskProfile)?.label ?? riskProfile;
  const summaryTiles = [
    { label: "Profile",        value: riskLabel },
    { label: "Capital",        value: formatCapital(capital) },
    { label: "Active classes", value: String(activeClasses.length) },
    { label: "Total alloc",    value: "100%", highlight: true },
  ];

  const subItemsMap = subAllocsMapToItemsMap(subAllocsMap);
  const assetPcts = Object.fromEntries(
    activeClasses.map((k) => [k, assetAllocs[k].pct])
  ) as Record<AssetClassKey, number>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 pb-2">
        {summaryTiles.map(({ label, value, highlight }) => (
          <div key={label} className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "#888888" }}>{label}</p>
            <p className="text-sm font-semibold" style={{ color: highlight ? "#166534" : "#0F172B" }}>{value}</p>
          </div>
        ))}
      </div>

      <SubClassForm
        capital={capital}
        activeAssetKeys={activeClasses}
        assetPcts={assetPcts}
        subItemsMap={subItemsMap}
        onChange={(key, nextItems) =>
          setSubAllocsMap({ ...subAllocsMap, [key]: itemsToSubAllocs(nextItems) })
        }
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
  const [riskProfile, setRiskProfile]     = useState<RiskProfileType>("aggressive");
  const [capitalRaw, setCapitalRaw]       = useState("");
  const [capital, setCapital]             = useState<number | null>(null);
  const [portfolioName, setPortfolioName] = useState("");

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
        name: portfolioName,
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

  const step2Total = Object.values(assetAllocs).reduce((s, a) => s + (a.enabled ? a.pct : 0), 0);

  const goBack = (toStep: number, fromStep: number) => {
    setCompletedSteps((prev) => prev.filter((s) => s !== fromStep));
    setStep(toStep);
  };

  const footerBack = step === 2 ? () => goBack(1, 2) : step === 3 ? () => goBack(2, 3) : undefined;
  const footerNext = step === 1 ? () => goToStep(2, 1) : step === 2 ? () => goToStep(3, 2) : handleSave;
  const footerNextLabel = step === 1 ? "Continue →" : step === 2 ? "Configure sub-classes →" : saving ? "Saving..." : "Save to library →";
  const footerNextDisabled = step === 1 ? !capital || !portfolioName.trim() : step === 2 ? Math.round(step2Total) !== 100 : saving;

  const prevStepRef = useRef(step);
  const direction = step > prevStepRef.current ? 1 : -1;
  prevStepRef.current = step;

  const slideVariants = {
    enter:  (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir * -40, opacity: 0 }),
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StepperHeader step={step} completedSteps={completedSteps} />

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
              <Step1
                riskProfile={riskProfile}
                setRiskProfile={handleSetRiskProfile}
                capital={capital}
                capitalRaw={capitalRaw}
                setCapitalRaw={handleCapitalRawChange}
                onCapitalChip={handleCapitalChip}
                portfolioName={portfolioName}
                setPortfolioName={setPortfolioName}
              />
            )}

            {step === 2 && (
              <Step2
                capital={capital!}
                assetAllocs={assetAllocs}
                setAssetAllocs={setAssetAllocs}
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
              />
            )}

            {error && <p className="text-sm text-red-600 text-center pt-4">{error}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — back/continue + cancel */}
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
              style={{ color: "#0F172B" }}
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
              style={{ color: "#888888" }}
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
            style={{ background: "#0F172B" }}
          >
            {footerNextLabel}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}
