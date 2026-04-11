"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";
import { BasketCard } from "@/components/molecules/basket-card";
import { useBaskets } from "@/hooks/useBaskets";
import { apiCall } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import type { StocksApiResponse } from "@/types/screener";

export default function ScreenerHomePage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [stockOptions, setStockOptions] = useState<AutocompleteOption[]>([]);

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

  const { data: basketsData, loading: basketsLoading, error: basketsError } = useBaskets();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

      {/* Search */}
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h2 className="text-[28px] font-medium" style={{ color: "#0F172B" }}>
          What would you like to research today?
        </h2>
        <p className="text-sm" style={{ color: "#888888" }}>
          Search a company to open its screener, or pick a research basket below.
        </p>
        <AutocompleteInput
          placeholder="Search by company name or ticker…"
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearch}
          options={stockOptions}
          maxSuggestions={8}
        />
      </div>

      {/* Research Baskets */}
      <div>
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-6"
          style={{ color: "rgba(18,18,18,0.50)" }}
        >
          Research Baskets
        </h3>

        {basketsError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{basketsError}</p>
          </div>
        )}

        {basketsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[10px] border border-[#E2E2E2] h-[148px] animate-pulse"
                style={{ background: "#F5F5F5" }}
              />
            ))}
          </div>
        )}

        {!basketsLoading && !basketsError && basketsData && (
          <div className="space-y-8">
            {Object.entries(basketsData.grouped).map(([category, baskets]) => (
              <section key={category} className="space-y-3">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "#888888" }}
                >
                  {category}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {baskets.map((basket) => (
                    <BasketCard key={basket.id} basket={basket} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
