"use client";

import { ChevronDown } from "lucide-react";
import type { GoalType } from "@/types/portfolio";
import type { PassiveIncomeState, RetirementIncomeState, ChildEducationState } from "./stepper-types";
import { GOALS, MILESTONE_DEFS } from "./stepper-constants";

// ── Shared primitives ──────────────────────────────────────────────────────────

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--qc-ink-2)" }}>
      {children}
    </p>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#E2E2E2] px-3 py-2 bg-white focus-within:border-[#0F172B] transition-all">
      {prefix && <span className="text-sm shrink-0" style={{ color: "var(--qc-ink-2)" }}>{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-zinc-300"
        style={{ color: value ? "var(--qc-ink)" : undefined }}
      />
      {suffix && <span className="text-sm shrink-0" style={{ color: "var(--qc-ink-2)" }}>{suffix}</span>}
    </div>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-[#E2E2E2] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#0F172B] transition-all pr-8"
        style={{ color: value ? "var(--qc-ink)" : "var(--qc-ink-2)" }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--qc-ink-2)" }} />
    </div>
  );
}

export function TogglePill({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-full border border-[#E2E2E2] bg-[#F5F5F5] w-fit">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className="rounded-full px-3 py-1 text-xs font-medium transition-all"
          style={{
            background: value === o.value ? "var(--qc-ink)" : "transparent",
            color:      value === o.value ? "#fff" : "var(--qc-ink-2)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SectionBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider px-2 pt-1 pb-3" style={{ color: "var(--qc-ink-2)" }}>{title}</p>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function MethodCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-lg border p-3 text-left transition-all"
      style={{
        borderColor: active ? "var(--qc-ink)" : "var(--qc-hair)",
        borderWidth:  active ? 2 : 1,
        background:  active ? "#F8F9FB" : "#fff",
      }}
    >
      <p className="text-[12px] font-bold mb-1" style={{ color: "var(--qc-ink)" }}>{label}</p>
      <p className="text-[11px] leading-snug" style={{ color: "var(--qc-ink-2)" }}>{description}</p>
    </button>
  );
}

function ZoneLegend({ zones }: { zones: { label: string; condition: string; bg: string; color: string }[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${zones.length}, 1fr)` }}>
      {zones.map((z) => (
        <div key={z.label} className="rounded-lg px-3 py-2" style={{ background: z.bg }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: z.color }}>{z.label} zone</p>
          <p className="text-[11px]" style={{ color: z.color }}>{z.condition}</p>
        </div>
      ))}
    </div>
  );
}

// ── Passive Income SWP ────────────────────────────────────────────────────────

const FREQ_OPTIONS = [
  { value: "monthly",     label: "Monthly"     },
  { value: "quarterly",   label: "Quarterly"   },
  { value: "half-yearly", label: "Half-yearly" },
  { value: "annual",      label: "Annual"      },
];

export function SwpPassiveIncomeForm({
  value,
  onChange,
}: {
  value: PassiveIncomeState;
  onChange: (v: PassiveIncomeState) => void;
}) {
  const set = (key: keyof PassiveIncomeState) => (v: string) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <SectionBox title="Inputs — what RM provides">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Start date">
            <TextInput type="date" value={value.startDate} onChange={set("startDate")} />
          </FormField>
          <FormField label="End date">
            <TextInput type="date" value={value.endDate} onChange={set("endDate")} placeholder="Open-ended" />
          </FormField>
          <FormField label="Portfolio growth rate">
            <TextInput value={value.cagr} onChange={set("cagr")} placeholder="8% CAGR (default)" suffix="%" />
          </FormField>
        </div>
      </SectionBox>

      <SectionBox title="Withdrawal method — RM picks one">
        <div className="flex gap-3">
          <MethodCard
            label="Method A"
            description="Fixed amount. Client wants ₹X per period. Amount stays constant unless RM edits. Simple and predictable."
            active={value.withdrawalMethod === "fixed"}
            onClick={() => onChange({ ...value, withdrawalMethod: "fixed" })}
          />
          <MethodCard
            label="Method B"
            description="% of corpus. e.g. 6% p.a. System computes payout each period based on current corpus value. Amount fluctuates."
            active={value.withdrawalMethod === "percentage"}
            onClick={() => onChange({ ...value, withdrawalMethod: "percentage" })}
          />
        </div>

        {value.withdrawalMethod === "fixed" ? (
          <FormField label="Fixed amount per period">
            <TextInput value={value.fixedAmount} onChange={set("fixedAmount")} placeholder="Enter ₹ amount" prefix="₹" />
          </FormField>
        ) : (
          <FormField label="Annual withdrawal rate">
            <TextInput value={value.withdrawalRate} onChange={set("withdrawalRate")} placeholder="e.g. 6" prefix="%" />
          </FormField>
        )}

        <ZoneLegend zones={[
          { label: "Green", condition: "Rate ≤ CAGR",            bg: "#F0FDF4", color: "#166534" },
          { label: "Amber", condition: "Rate 1–3% above CAGR",   bg: "#FFFBEB", color: "#92400E" },
          { label: "Red",   condition: "Rate >3% above CAGR",    bg: "#FEF2F2", color: "#991B1B" },
        ]} />
      </SectionBox>

      <SectionBox title="Payout frequency — RM chooses">
        <div className="space-y-4">
          <TogglePill options={FREQ_OPTIONS} value={value.frequency} onChange={set("frequency")} />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Payout date">
              <SelectInput
                value={value.payoutDate}
                onChange={set("payoutDate")}
                options={[{ value: "1", label: "1st of month" }, { value: "15", label: "15th of month" }]}
                placeholder="Select date"
              />
            </FormField>
            <FormField label="Step-up rate (optional)">
              <TextInput value={value.stepUpRate} onChange={set("stepUpRate")} placeholder="e.g. 5% per year" prefix="%" />
            </FormField>
          </div>
        </div>
      </SectionBox>
    </div>
  );
}

// ── Retirement Income SWP ─────────────────────────────────────────────────────

export function SwpRetirementIncomeForm({
  value,
  onChange,
}: {
  value: RetirementIncomeState;
  onChange: (v: RetirementIncomeState) => void;
}) {
  const set = (key: keyof RetirementIncomeState) => (v: string) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <SectionBox title="Inputs — what RM provides">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Client DOB">
            <TextInput type="date" value={value.clientDob} onChange={set("clientDob")} />
          </FormField>
          <FormField label="Retirement age">
            <TextInput value={value.retirementAge} onChange={set("retirementAge")} placeholder="RM enters" />
          </FormField>
          <FormField label="Target longevity age">
            <TextInput value={value.targetLongevityAge} onChange={set("targetLongevityAge")} placeholder="e.g. 85, 90" />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Portfolio CAGR assumed">
            <TextInput value={value.cagr} onChange={set("cagr")} placeholder="7% (conservative)" prefix="%" />
          </FormField>
          <FormField label="Step-up rate (optional)">
            <TextInput value={value.stepUpRate} onChange={set("stepUpRate")} placeholder="Optional" prefix="%" />
          </FormField>
        </div>
      </SectionBox>

      <SectionBox title="Withdrawal method — RM picks one">
        <div className="flex gap-3">
          <MethodCard
            label="Method A"
            description="Fixed pension-style. ₹X per month. Predictable. Client knows exactly what hits their account. System checks if corpus lasts to target age."
            active={value.withdrawalMethod === "fixed"}
            onClick={() => onChange({ ...value, withdrawalMethod: "fixed" })}
          />
          <MethodCard
            label="Method B"
            description="% of corpus. e.g. 5% p.a. Payout adjusts with corpus value. Self-correcting — corpus shrinks → payout shrinks too."
            active={value.withdrawalMethod === "percentage"}
            onClick={() => onChange({ ...value, withdrawalMethod: "percentage" })}
          />
        </div>

        {value.withdrawalMethod === "fixed" ? (
          <FormField label="Fixed monthly amount">
            <TextInput value={value.fixedAmount} onChange={set("fixedAmount")} placeholder="Enter ₹ amount" prefix="₹" />
          </FormField>
        ) : (
          <FormField label="Annual withdrawal rate">
            <TextInput value={value.withdrawalRate} onChange={set("withdrawalRate")} placeholder="4–6% recommended" prefix="%" />
          </FormField>
        )}
      </SectionBox>

      <SectionBox title="Longevity engine — core of this goal">
        <ZoneLegend zones={[
          { label: "Safe",   condition: "Corpus >20% at target age",    bg: "#F0FDF4", color: "#166534" },
          { label: "Tight",  condition: "Corpus 0–20% at target age",   bg: "#FFFBEB", color: "#92400E" },
          { label: "Breach", condition: "Corpus depletes before target", bg: "#FEF2F2", color: "#991B1B" },
        ]} />
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>
          If corpus runs out before target age — a <span className="font-semibold text-red-600">soft block</span> triggers. Plan cannot be saved without senior RM approval.
        </p>
      </SectionBox>

      <SectionBox title="Payout frequency">
        <TogglePill options={FREQ_OPTIONS} value={value.frequency} onChange={set("frequency")} />
      </SectionBox>

      <SectionBox title="Nominee details — mandatory">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Name">
            <TextInput value={value.nomineeName} onChange={set("nomineeName")} placeholder="Full name" />
          </FormField>
          <FormField label="Relation">
            <TextInput value={value.nomineeRelation} onChange={set("nomineeRelation")} placeholder="e.g. Spouse" />
          </FormField>
          <FormField label="Contact">
            <TextInput value={value.nomineeContact} onChange={set("nomineeContact")} placeholder="Phone / email" />
          </FormField>
        </div>
      </SectionBox>
    </div>
  );
}

// ── Child Education SWP ───────────────────────────────────────────────────────

export function SwpChildEducationForm({
  value,
  onChange,
}: {
  value: ChildEducationState;
  onChange: (v: ChildEducationState) => void;
}) {
  const set = (key: keyof ChildEducationState) => (v: string | boolean) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <SectionBox title="Inputs — what RM provides">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Child's DOB">
            <TextInput type="date" value={value.childDob} onChange={set("childDob") as (v: string) => void} />
          </FormField>
          <FormField label="Inflation rate">
            <TextInput value={value.inflationRate} onChange={set("inflationRate") as (v: string) => void} placeholder="6% (default)" prefix="%" />
          </FormField>
          <FormField label="Portfolio CAGR">
            <TextInput value={value.cagr} onChange={set("cagr") as (v: string) => void} placeholder="8% (default)" prefix="%" />
          </FormField>
        </div>
      </SectionBox>

      <SectionBox title="Milestone toggles — RM activates / deactivates">
        <div className="space-y-3">
          {MILESTONE_DEFS.map((m) => {
            const active = value[m.key] as boolean;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3 transition-all"
                style={{
                  borderColor: active ? m.color : "var(--qc-hair)",
                  background:  active ? m.bg : "#fff",
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: m.color, color: "#fff" }}
                    >
                      {m.label}
                    </span>
                    {m.tag && (
                      <span className="text-[11px] font-semibold" style={{ color: "var(--qc-ink)" }}>{m.tag}</span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--qc-ink-2)" }}>{m.age}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, [m.key]: !active })}
                  className="relative rounded-full transition-all"
                  style={{ width: 40, height: 22, background: active ? m.color : "var(--qc-hair)" }}
                >
                  <span
                    className="absolute top-1 rounded-full bg-white transition-all shadow-sm"
                    style={{ width: 14, height: 14, left: active ? 22 : 4 }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </SectionBox>

      <SectionBox title="Age → phase engine">
        <div className="space-y-2">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div style={{ flex: 14, background: "#CBD5E1" }} title="0–13: Accumulation" />
            <div style={{ flex: 4,  background: "#3B82F6" }} title="14–17: School" />
            <div style={{ flex: 4,  background: "#10B981" }} title="18–21: UG" />
            <div style={{ flex: 4,  background: "#F59E0B" }} title="22–25: PG/Pro" />
          </div>
          <div className="flex text-[9px] justify-between" style={{ color: "var(--qc-ink-2)" }}>
            <span>0 — Accumulation</span>
            <span>14 — School</span>
            <span>18 — UG</span>
            <span>22 — PG/Pro</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { phase: "Phase 1 — Accumulation",      age: "Age 0–13",  desc: "No SWP. Corpus grows. RM alert at age 12 to review plan." },
            { phase: "Phase 2 — School withdrawals", age: "Age 14–17", desc: "Semi-annual payouts at Class 9 and Class 11 transitions." },
            { phase: "Phase 3 — UG withdrawals",     age: "Age 18–21", desc: "8 payouts over 4 years. Larger amount in Year 1 June (admission + first-semester fees)." },
            { phase: "Phase 4 — PG / Higher",        age: "Age 22–25", desc: "RM activates if applicable. Duration and amount RM-defined." },
          ].map((p) => (
            <div key={p.phase} className="rounded-lg border border-[#E2E2E2] p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-semibold" style={{ color: "var(--qc-ink)" }}>{p.phase}</p>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F5F5F5]" style={{ color: "var(--qc-ink-2)" }}>{p.age}</span>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: "var(--qc-ink-2)" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </SectionBox>
    </div>
  );
}

// ── Step 4 container ──────────────────────────────────────────────────────────

interface Step4Props {
  goalType: GoalType;
  passiveIncomeState: PassiveIncomeState;
  setPassiveIncomeState: (v: PassiveIncomeState) => void;
  retirementIncomeState: RetirementIncomeState;
  setRetirementIncomeState: (v: RetirementIncomeState) => void;
  childEducationState: ChildEducationState;
  setChildEducationState: (v: ChildEducationState) => void;
}

export function Step4SWP({
  goalType,
  passiveIncomeState,
  setPassiveIncomeState,
  retirementIncomeState,
  setRetirementIncomeState,
  childEducationState,
  setChildEducationState,
}: Step4Props) {
  const goalLabel = GOALS.find((g) => g.type === goalType)?.label ?? goalType;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#E2E2E2] bg-[#F5F5F5] px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "var(--qc-ink-2)" }}>Configuring SWP for goal</p>
        <p className="text-sm font-semibold" style={{ color: "var(--qc-ink)" }}>{goalLabel}</p>
      </div>

      {goalType === "passive_income" && (
        <SwpPassiveIncomeForm value={passiveIncomeState} onChange={setPassiveIncomeState} />
      )}
      {goalType === "retirement_income" && (
        <SwpRetirementIncomeForm value={retirementIncomeState} onChange={setRetirementIncomeState} />
      )}
      {goalType === "child_education" && (
        <SwpChildEducationForm value={childEducationState} onChange={setChildEducationState} />
      )}
    </div>
  );
}
