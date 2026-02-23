"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Calendar, Target } from "lucide-react";
import { EntryPointCallout } from "@/components/deal/entry-point-callout";
import { ScenarioFramework } from "@/components/deal/scenario-framework";
import { TargetPriceMatrix } from "@/components/deal/target-price-matrix";

function DealContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Confidential Banner */}
      <div className="sticky top-0 z-10 w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 py-2 px-4 text-center text-xs font-semibold text-red-600 dark:text-red-400 mb-4">
        ⚠️ HIGHLY CONFIDENTIAL — FOR INVESTMENT COMMITTEE USE ONLY
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
              <Button variant="outline" size="sm" className="font-semibold">
                FULL IM
              </Button>
              <Badge className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-0">
                ⊙ DATA CONFIDENCE: HIGH
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                Dec 17, 2024
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Page Title */}
      <div className="container mx-auto max-w-7xl mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Target className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Deal Factor</h2>
      </div>

      {/* Page Content */}
      <div className="container mx-auto max-w-7xl space-y-6">
        <EntryPointCallout />
        <ScenarioFramework />
        <TargetPriceMatrix />
      </div>
    </div>
  );
}

export default function DealFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <DealContent />
    </Suspense>
  );
}
