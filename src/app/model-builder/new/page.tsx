"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search, Check } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { useWealthClients } from "@/hooks/useWealthClients";
import type { RiskProfileType } from "@/types/portfolio";
import type { WealthClient } from "@/types/wealthos";

const INVESTMENT_STYLES = [
  "Growth & Stability",
  "Quality Compounder",
  "Aggressive Growth",
  "Capital Preservation",
  "Balanced Income",
  "Value Investing",
  "Dividend Yield",
  "Sector Focused",
  "Momentum",
  "ESG Focused",
];

const RISK_PROFILES: { type: RiskProfileType; label: string; description: string; detail?: string }[] = [
  { type: "conservative", label: "Conservative", description: "Capital preservation, steady income" },
  { type: "balanced",     label: "Balanced",     description: "Mix of growth and stability", detail: "40% Quality · 35% Growth · 25% Value" },
  { type: "aggressive",   label: "Aggressive",   description: "High growth, higher volatility" },
];

const SEGMENT_LABELS: Record<string, string> = {
  HNI: "HNI", UHNI: "Ultra HNI", Retail: "Retail", Institutional: "Institutional", Private: "Private",
};

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#888888" }}>
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ── FormSelect ────────────────────────────────────────────────────────────────
interface SelectOption { label: string; value: string }

function FormSelect({ label, required, placeholder, options, value, onChange }: {
  label: string; required?: boolean; placeholder: string;
  options: SelectOption[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm text-left transition-colors bg-white focus:outline-none ${
            open ? "border-[#0F172B] ring-1 ring-[#0F172B]" : "border-[#E2E2E2] hover:border-zinc-300"
          }`}
        >
          <span style={{ color: selected ? "#0F172B" : "#a1a1aa" }}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "#888888" }} />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-[#E2E2E2] bg-white shadow-md overflow-hidden">
            <div className="max-h-48 overflow-y-auto py-0.5">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-left hover:bg-zinc-50 transition-colors"
                  style={{ color: "#0F172B" }}
                >
                  {opt.label}
                  {opt.value === value && <Check className="h-3 w-3 text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ClientSelect ──────────────────────────────────────────────────────────────
function ClientSelect({ value, onChange }: { value: string; onChange: (c: WealthClient | null) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { data, loading } = useWealthClients({ size: 100, search: search || undefined });
  const clients = data?.items ?? [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      <FieldLabel>Client</FieldLabel>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm text-left transition-colors bg-white focus:outline-none ${
            open ? "border-[#0F172B] ring-1 ring-[#0F172B]" : "border-[#E2E2E2] hover:border-zinc-300"
          }`}
        >
          <span style={{ color: value ? "#0F172B" : "#a1a1aa" }}>
            {value || "Select a client (optional)"}
          </span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "#888888" }} />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-[#E2E2E2] bg-white shadow-md overflow-hidden">
            <div className="p-1.5 border-b border-zinc-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: "#888888" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-6 pr-3 py-1.5 text-xs rounded border border-[#E2E2E2] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172B] placeholder:text-zinc-400"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-44 overflow-y-auto py-0.5">
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); setSearch(""); }}
                className="w-full flex items-center px-3 py-1.5 text-xs text-left hover:bg-zinc-50 transition-colors"
                style={{ color: "#888888" }}
              >
                — No client
              </button>
              {loading && <p className="px-3 py-1.5 text-xs" style={{ color: "#888888" }}>Loading...</p>}
              {!loading && clients.length === 0 && <p className="px-3 py-1.5 text-xs" style={{ color: "#888888" }}>No clients found</p>}
              {clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => { onChange(client); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-left hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#0F172B", fontWeight: 500 }}>{client.name}</span>
                    {client.segment && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F5F5F5", color: "#888888" }}>
                        {SEGMENT_LABELS[client.segment] ?? client.segment}
                      </span>
                    )}
                  </div>
                  {client.name === value && <Check className="h-3 w-3 text-emerald-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NewModelPage() {
  const router = useRouter();
  const { createModel } = useModels();

  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [selectedClient, setSelectedClient] = useState<WealthClient | null>(null);
  const [activeProfile, setActiveProfile] = useState<RiskProfileType>("balanced");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Model name is required."); return; }
    if (!style) { setError("Please select an investment style."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const newModel = await createModel({
        name: name.trim(),
        style,
        activeProfile,
        client: {
          clientName: selectedClient?.name ?? "—",
          aum: "—",
          latestUpdate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        },
        positions: [],
        whyThisPortfolio: [],
      });
      router.push(`/model-builder/${newModel.id}`);
    } catch {
      setError("Failed to create model. Please try again.");
      setSubmitting(false);
    }
  };

  const styleOptions = INVESTMENT_STYLES.map((s) => ({ label: s, value: s }));
  const inputClass = "w-full rounded-md border border-[#E2E2E2] px-3 py-2 text-sm bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#0F172B] hover:border-zinc-300 transition-colors";

  return (
    <div className="min-h-screen bg-white mb-8 px-4">
      <div className="container mx-auto max-w-3xl space-y-5">

        {/* Back */}
        <Link href="/model-builder" className="text-xs hover:text-zinc-700 transition-colors" style={{ color: "#888888" }}>
          ← Models
        </Link>

        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#888888" }}>Model Builder</p>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: "#0F172B", lineHeight: 1.2 }}>New Portfolio Model</h1>
          <p className="mt-0.5 text-sm" style={{ color: "#888888" }}>Configure the model and add positions after creation.</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit}>
          <div style={{ borderRadius: 10, border: "1px solid #E2E2E2", background: "#F5F5F5", padding: 8 }}>
            <div style={{ borderRadius: 10, background: "#fff", border: "1px solid rgba(226,226,226,0.10)", padding: "20px 24px 24px" }} className="space-y-0">

              {/* ── Row 1: Model Name + Investment Style ── */}
              <div className="grid grid-cols-2 gap-4 pb-5 border-b" style={{ borderColor: "#E2E2E2" }}>
                <div>
                  <FieldLabel required>Model Name</FieldLabel>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Growth Alpha Fund"
                    className={inputClass}
                  />
                </div>
                <FormSelect
                  label="Investment Style"
                  required
                  placeholder="Select a style"
                  options={styleOptions}
                  value={style}
                  onChange={setStyle}
                />
              </div>

              {/* ── Row 2: Client + Segment ── */}
              <div className="grid grid-cols-2 gap-4 py-5 border-b" style={{ borderColor: "#E2E2E2" }}>
                <ClientSelect value={selectedClient?.name ?? ""} onChange={setSelectedClient} />
                <div>
                  <FieldLabel>Client Segment</FieldLabel>
                  <div
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ border: "1px solid #E2E2E2", background: "#FAFAFA", color: selectedClient?.segment ? "#0F172B" : "#a1a1aa" }}
                  >
                    {selectedClient?.segment ? (SEGMENT_LABELS[selectedClient.segment] ?? selectedClient.segment) : "Auto-filled on selection"}
                  </div>
                  {selectedClient && (
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-[11px]" style={{ color: "#888888" }}>
                        Risk: <span style={{ color: "#0F172B", fontWeight: 500 }}>
                          {selectedClient.risk_profile.charAt(0).toUpperCase() + selectedClient.risk_profile.slice(1)}
                        </span>
                      </span>
                      <span className="text-[11px]" style={{ color: "#888888" }}>
                        Engagement: <span style={{ color: "#0F172B", fontWeight: 500 }}>{selectedClient.engagement_score ?? "—"}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Row 3: Risk Profile — inline 3-col ── */}
              <div className="pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#888888" }}>Risk Profile</p>
                <div className="grid grid-cols-3 gap-3">
                  {RISK_PROFILES.map((profile) => {
                    const isActive = profile.type === activeProfile;
                    return (
                      <button
                        key={profile.type}
                        type="button"
                        onClick={() => setActiveProfile(profile.type)}
                        className="rounded-lg border p-3 text-left transition-all"
                        style={{
                          border: isActive ? "1px solid #0F172B" : "1px solid #E2E2E2",
                          background: isActive ? "#0F172B" : "#FAFAFA",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold" style={{ color: isActive ? "#fff" : "#0F172B" }}>
                            {profile.label}
                          </span>
                          <div
                            className="h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isActive ? "#fff" : "#d4d4d8" }}
                          >
                            {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-xs leading-snug" style={{ color: isActive ? "rgba(255,255,255,0.65)" : "#888888" }}>
                          {profile.description}
                        </p>
                        {isActive && profile.detail && (
                          <p className="text-[10px] mt-1.5 font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>
                            {profile.detail}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Error */}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <Link href="/model-builder" className="text-sm hover:text-zinc-700 transition-colors" style={{ color: "#888888" }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ background: "#0F172B" }}
            >
              {submitting ? "Creating..." : "Create Model →"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
