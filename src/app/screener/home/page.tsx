"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";
import { useBaskets } from "@/hooks/useBaskets";
import { useMutualFunds } from "@/hooks/useMutualFunds";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";
import type { Basket } from "@/types/screener";
import Link from "next/link";

const ASSET_TABS = ["Indian Stocks", "Mutual Funds", "US Stocks", "Private Equity"] as const;
type AssetTab = typeof ASSET_TABS[number];

function BasketRow({ basket }: { basket: Basket }) {
  return (
    <Link
      href={`/screener/basket?id=${encodeURIComponent(basket.id)}`}
      className="group flex items-start justify-between gap-3 px-4 py-3 transition-colors"
      onMouseEnter={e => (e.currentTarget.style.background = "var(--qc-surface-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "")}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-snug truncate" style={{ color: "var(--qc-text-heading)" }}>
          {basket.title}
        </p>
        <p className="text-[11px] mt-0.5 line-clamp-1 leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>
          {basket.description}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
        <span
          className="text-[10px] font-medium rounded-sm px-1.5 py-0.5 tabular-nums"
          style={{ background: "var(--qc-accent-lime-bg)", color: "var(--qc-text-heading)" }}
        >
          {basket.conditions.length}
        </span>
        <ArrowRight className="size-3 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: "var(--qc-text-heading)" }} />
      </div>
    </Link>
  );
}

export default function ScreenerHomePage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [mfQuery, setMfQuery] = useState("");
  const [stockOptions, setStockOptions] = useState<AutocompleteOption[]>([]);
  const [activeTab, setActiveTab] = useState<AssetTab>("Indian Stocks");

  const { schemes: mfSchemes } = useMutualFunds();

  const mfOptions: AutocompleteOption[] = mfSchemes.map((s) => ({
    value: s.amfi_code,
    label: s.name,
    subtitle: [s.amc_name, s.category].filter(Boolean).join(" · "),
  }));

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (response) => {
        setStockOptions(
          response.data.map((s) => ({
            value: s.company,
            label: s.company_name,
            subtitle: s.basic_industry,
          }))
        );
      },
      onError: (err) => console.error("Failed to fetch stocks:", err),
    });
  }, []);

  const handleSearch = (symbol: string) => {
    if (symbol) router.push(`/screener/overview?symbol=${encodeURIComponent(symbol)}`);
  };

  const handleMfSelect = (amfiCode: string) => {
    if (amfiCode) router.push(`/screener/mutual-fund/${encodeURIComponent(amfiCode)}`);
  };

  const { data: basketsData, loading: basketsLoading, error: basketsError } = useBaskets();

  return (
    <div className="min-h-screen" style={{ background: "var(--qc-surface-base)" }}>
      {/* Hero search section */}
      <div className="relative" style={{ background: "var(--qc-surface-base)" }}>
        {/* Lime radial bloom behind headline — clipped separately so dropdown can escape */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--qc-accent-lime-bg) 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-14 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <h2 className="text-[32px] font-medium leading-tight" style={{ color: "var(--qc-text-heading)" }}>
              What would you like to research today?
            </h2>
            <p className="text-sm" style={{ color: "var(--qc-text-muted)" }}>
              Search a company to open its screener, or pick a research basket below.
            </p>
          </div>

          {/* Asset class tab selector */}
          <div className="flex items-center gap-1 rounded-full border p-1" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
            {ASSET_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={
                  activeTab === tab
                    ? { background: "var(--qc-accent-lime)", color: "var(--qc-text-heading)" }
                    : { color: "var(--qc-text-muted)" }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search input or Private Equity cards */}
          {activeTab === "Mutual Funds" ? (
            <div className="w-full">
              <AutocompleteInput
                placeholder="Search by fund name or AMC…"
                value={mfQuery}
                onChange={setMfQuery}
                onSubmit={handleMfSelect}
                options={mfOptions}
                maxSuggestions={8}
              />
            </div>
          ) : activeTab === "Private Equity" ? (
            <div className="w-full grid grid-cols-3 gap-4">
              {[
                {
                  key: "vc",
                  label: "VC Deals",
                  description: "Analyse venture capital deal memos, term sheets, and cap tables.",
                  icon: "💼",
                  comingSoon: true,
                },
                {
                  key: "aif",
                  label: "AIFs",
                  description: "Evaluate Alternative Investment Fund documents and PPMs.",
                  icon: "📊",
                  comingSoon: true,
                },
                {
                  key: "pre-ipo",
                  label: "Pre-IPO",
                  description: "Deep-dive DRHP analysis — business quality, red flags & verdict.",
                  icon: "🏦",
                  comingSoon: false,
                },
              ].map((item) => (
                <button
                  key={item.key}
                  disabled={item.comingSoon}
                  onClick={() => {
                    if (!item.comingSoon) router.push("/private-equity/pre-ipo");
                  }}
                  className="group relative flex flex-col items-start gap-3 rounded-[10px] border px-5 py-5 text-left transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
                >
                  {item.comingSoon && (
                    <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5" style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-muted)" }}>
                      Soon
                    </span>
                  )}
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-[14px] font-semibold" style={{ color: "var(--qc-text-heading)" }}>{item.label}</p>
                    <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--qc-text-muted)" }}>{item.description}</p>
                  </div>
                  {!item.comingSoon && (
                    <ArrowRight className="size-4 mt-auto self-end opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-text-heading)" }} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full">
              <AutocompleteInput
                placeholder="Search by company name or ticker…"
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearch}
                options={stockOptions}
                maxSuggestions={8}
              />
            </div>
          )}
        </div>
      </div>

      {/* Research Baskets */}
      <div className={activeTab === "Private Equity" || activeTab === "Mutual Funds" ? "hidden" : ""}>
        {/* Section divider */}
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex-1 h-px" style={{ background: "var(--qc-border-default)" }} />
          <div className="flex flex-col items-center gap-0.5 px-1">
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--qc-text-heading)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Research Baskets
            </span>
            <span style={{ fontSize: 10, color: "var(--qc-text-muted)", letterSpacing: "0.02em" }}>
              Pre-built screening strategies
            </span>
          </div>
          <div className="flex-1 h-px" style={{ background: "var(--qc-border-default)" }} />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 pb-12">
          {basketsError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{basketsError}</p>
            </div>
          )}

          {basketsLoading && (
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[10px] border h-[320px] animate-pulse"
                  style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
                />
              ))}
            </div>
          )}

          {!basketsLoading && !basketsError && basketsData && (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${Object.keys(basketsData.grouped).length}, 1fr)` }}
            >
              {Object.entries(basketsData.grouped).map(([category, baskets]) => (
                <div
                  key={category}
                  className="relative rounded-[10px] border overflow-hidden"
                  style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-white)" }}
                >
                  {/* Column header */}
                  <div className="px-4 py-4 border-b" style={{ borderColor: "var(--qc-border-default)", background: "var(--qc-surface-panel)" }}>
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.10em] leading-tight"
                      style={{ color: "var(--qc-text-heading)" }}
                    >
                      {category}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--qc-text-muted)" }}>
                      {baskets.length} basket{baskets.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Basket rows with dividers */}
                  <div className="divide-y divide-[#EFEDE7]">
                    {baskets.map((basket) => (
                      <BasketRow key={basket.id} basket={basket} />
                    ))}
                  </div>

                  {/* Lime gradient fade at bottom */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
                    style={{
                      background: "linear-gradient(180deg, transparent 0%, rgba(233,244,196,0.6) 100%)",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
