"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Calendar, Plug, FileDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FinancialPerformanceCard } from "@/components/overview/financial-performance-card";
import { IMScoreCard } from "@/components/overview/im-score-card";
import { ValuationCard } from "@/components/overview/valuation-card";
import { EfficiencyCard } from "@/components/overview/efficiency-card";
import { KeyThesisCard } from "@/components/overview/key-thesis-card";

function OverviewContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 py-2 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 mb-4 rounded">
        ⏱ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
      </div>

      {/* Company Header */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Adani Enterprises</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                    NSE: {symbol}
                  </span>
                  <span>•</span>
                  <span>Infrastructure Conglomerate</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-zinc-600 gap-1.5">
                <Plug className="h-3.5 w-3.5" />
                AI Plugins
              </Button>
              <Button variant="outline" size="sm" className="text-zinc-600 gap-1.5">
                <FileDown className="h-3.5 w-3.5" />
                Export PDF
              </Button>
              <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Widget
              </Button>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500 ml-2">
                <Calendar className="h-4 w-4" />
                <span>Dec 17, 2024</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Layout */}
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Row 1: Financial Performance (2/3) + IM Score (1/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FinancialPerformanceCard />
          </div>
          <div className="lg:col-span-1">
            <IMScoreCard />
          </div>
        </div>

        {/* Row 2: Valuation + Efficiency + Key Thesis */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ValuationCard />
          <EfficiencyCard />
          <KeyThesisCard />
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <OverviewContent />
    </Suspense>
  );
}
