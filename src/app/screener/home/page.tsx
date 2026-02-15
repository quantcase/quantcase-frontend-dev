"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldAlert, FileText } from "lucide-react";
import { AppHeader } from "@/components/molecules/app-header";
import { PageHeader } from "@/components/molecules/page-header";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { AutocompleteInput, AutocompleteOption } from "@/components/molecules/autocomplete-input";
import { ResearchCard } from "@/components/molecules/research-card";
import { InfoItem } from "@/components/molecules/info-item";
import { apiCall } from "@/lib/api";
import { StocksApiResponse } from "@/types/screener";

export default function ScreenerHomePage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("Equity");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockOptions, setStockOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch stock data on mount
  useEffect(() => {
    apiCall<StocksApiResponse>("http://localhost:8000/api/transcript-stocks", {
      onStart: () => setIsLoading(true),
      onSuccess: (response) => {
        const options: AutocompleteOption[] = response.data.map((stock) => ({
          value: stock.company,
          label: stock.company_name,
          subtitle: stock.basic_industry,
        }));
        setStockOptions(options);
      },
      onError: (error) => {
        console.error("Failed to fetch stocks:", error);
      },
      onComplete: () => setIsLoading(false),
    });
  }, []);

  const researchStarters = [
    "Screen industrial companies suitable for a conservative portfolio",
    "Show assets with strong cash flows and low leverage",
    "Identify businesses with improving ROCE and stable management",
    "Help draft a balanced model portfolio using approved assets",
  ];

  const handleSearch = (stockSymbol: string) => {
    // Navigate to management page with stock symbol as query parameter
    if (stockSymbol) {
      router.push(`/screener/management?symbol=${encodeURIComponent(stockSymbol)}`);
    }
  };

  const handleResearchClick = (starter: string) => {
    console.log("Research starter clicked:", starter);
    // Implement research starter logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="space-y-12">
          {/* Header Section */}
          <PageHeader
            title="What would you like to research today?"
            subtitle="Explore assets within the firm's investment framework."
          />

          {/* Tab Toggle */}
          <div className="flex justify-center">
            <TabToggle
              options={["Equity", "Mutual Funds"]}
              value={selectedTab}
              onChange={setSelectedTab}
            />
          </div>

          {/* Search Input with Autocomplete */}
          <AutocompleteInput
            placeholder="Describe your research criteria..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            options={stockOptions}
            maxSuggestions={8}
          />

          {/* Research Starters Section */}
          <div className="space-y-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">
              Structured Research Starters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchStarters.map((starter, index) => (
                <ResearchCard
                  key={index}
                  title={starter}
                  onClick={() => handleResearchClick(starter)}
                />
              ))}
            </div>
          </div>

          {/* Info Footer */}
          <div className="flex items-center justify-center gap-8 pt-8">
            <InfoItem icon={CheckCircle2} text="Uses firm-approved frameworks" />
            <InfoItem icon={ShieldAlert} text="Excludes unverified data" />
            <InfoItem icon={FileText} text="Outputs are non-advisory drafts" />
          </div>
        </div>
      </main>
    </div>
  );
}
