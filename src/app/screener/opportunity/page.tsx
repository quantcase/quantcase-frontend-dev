"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";
import { IndustryOverviewCard } from "@/components/opportunity/industry-overview-card";
import { OperatingMetrics } from "@/components/opportunity/operating-metrics";
import { TrendCharts } from "@/components/opportunity/trend-charts";
import { GrowthRisks } from "@/components/opportunity/growth-risks";

function OpportunityContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-zinc-900 dark:bg-zinc-700 py-2 px-4 text-center text-sm font-semibold text-white mb-4">
        ⚠️ CONFIDENTIAL — INVESTMENT COMMITTEE USE ONLY
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
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 font-semibold">
                <FileText className="h-4 w-4 mr-1.5" />
                FULL IM
              </Button>
              <Badge className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                HIGH CONFIDENCE
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                Dec 17, 2024
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Score Banner */}
      <div className="container mx-auto max-w-7xl mb-5 flex items-center gap-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
          2.1 Opportunity Factor Score
        </h2>
        <Badge className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm px-3 py-1">
          35/40
        </Badge>
      </div>

      {/* Page Content */}
      <div className="container mx-auto max-w-7xl space-y-6">
        <IndustryOverviewCard />
        <OperatingMetrics />
        <TrendCharts />
        <GrowthRisks />
      </div>
    </div>
  );
}

export default function OpportunityFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <OpportunityContent />
    </Suspense>
  );
}
