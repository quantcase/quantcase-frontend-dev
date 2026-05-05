"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";
import { MfScreenerSection } from "./_components/mf-screener-section";
import { StockBasketsSection } from "./_components/stock-baskets-section";
import { SectionDivider } from "./_components/section-divider";

const ASSET_TABS = ["Indian Stocks", "Mutual Funds", "US Stocks", "PE / Pre-IPO"] as const;
type AssetTab = (typeof ASSET_TABS)[number];

const PE_CARDS = [
  { key: "vc",      label: "VC Deals",    description: "Analyse venture capital deal memos, term sheets, and cap tables.", icon: "💼", comingSoon: true,  href: "" },
  { key: "aif",     label: "AIFs",        description: "Evaluate Alternative Investment Fund documents and PPMs.",          icon: "📊", comingSoon: true,  href: "" },
  { key: "pre-ipo", label: "Pre-IPO",     description: "Deep-dive DRHP analysis — business quality, red flags & verdict.", icon: "🏦", comingSoon: false, href: "/private-equity/pre-ipo" },
] as const;

export default function ScreenerHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockOptions, setStockOptions] = useState<AutocompleteOption[]>([]);
  const [activeTab, setActiveTab] = useState<AssetTab>("Indian Stocks");

  useEffect(() => {
    apiCall<StocksApiResponse>(`${BACKEND_URL}/api/transcript/stocks`, {
      onSuccess: (response) =>
        setStockOptions(
          response.data.map((s) => ({ value: s.company, label: s.company_name, subtitle: s.basic_industry }))
        ),
      onError: (err) => console.error("Failed to fetch stocks:", err),
    });
  }, []);

  return (
    <div style={{ background: "var(--qc-bg)", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-14 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-[32px] font-medium leading-tight" style={{ color: "var(--qc-ink)" }}>
            What would you like to research today?
          </h2>
          <p className="text-sm" style={{ color: "var(--qc-ink-2)" }}>
            Search a company to open its screener, or pick a research basket below.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 rounded-full border p-1" style={{ borderColor: "var(--qc-hair)", background: "var(--qc-section)" }}>
          {ASSET_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={activeTab === tab ? { background: "var(--qc-ink)", color: "var(--qc-on-dark)" } : { color: "var(--qc-ink-2)" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search / hero content per tab */}
        {activeTab === "PE / Pre-IPO" && (
          <div className="w-full grid grid-cols-3 gap-4">
            {PE_CARDS.map((item) => (
              <button
                key={item.key}
                disabled={item.comingSoon}
                onClick={() => { if (!item.comingSoon) router.push(item.href); }}
                className="group relative flex flex-col items-start gap-3 rounded-[10px] border px-5 py-5 text-left transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderColor: "var(--qc-hair)", background: "var(--qc-card)" }}
              >
                {item.comingSoon && (
                  <span className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5" style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)" }}>
                    Soon
                  </span>
                )}
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--qc-ink)" }}>{item.label}</p>
                  <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--qc-ink-2)" }}>{item.description}</p>
                </div>
                {!item.comingSoon && (
                  <ArrowRight className="size-4 mt-auto self-end opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "var(--qc-ink)" }} />
                )}
              </button>
            ))}
          </div>
        )}

        {activeTab === "US Stocks" && (
          <div className="w-full flex flex-col items-center gap-3 py-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ background: "var(--qc-section)", border: "1px solid var(--qc-hair)" }}>
              <span className="text-2xl">🇺🇸</span>
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "var(--qc-ink)" }}>US Stocks — Coming Soon</p>
            <p className="text-[13px] text-center max-w-sm" style={{ color: "var(--qc-ink-2)" }}>
              Earnings call analysis and management quality scoring for US-listed companies is on the way.
            </p>
          </div>
        )}

        {activeTab === "Indian Stocks" && (
          <div className="w-full">
            <AutocompleteInput
              placeholder="Search by company name or ticker…"
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={(symbol) => { if (symbol) router.push(`/screener/overview?symbol=${encodeURIComponent(symbol)}`); }}
              options={stockOptions}
              maxSuggestions={8}
            />
          </div>
        )}
      </div>

      {/* ── MF Screener ── */}
      {activeTab === "Mutual Funds" && <MfScreenerSection />}

      {/* ── Stock Baskets ── */}
      {activeTab === "Indian Stocks" && (
        <>
          <SectionDivider title="Research Baskets" subtitle="Pre-built screening strategies" />
          <StockBasketsSection />
        </>
      )}
    </div>
  );
}
