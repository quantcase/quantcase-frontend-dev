"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";
import { MilestonesCard } from "@/components/forward-trajectory/milestones-card";
import { ReratingRisksGrid } from "@/components/forward-trajectory/rerating-risks-grid";

function ForwardTrajectoryContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "—";

  return (
    <div className="min-h-screen bg-background p-4">
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
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Dec 17, 2024
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    High Confidence
                  </div>
                  <span>•</span>
                  <span>Infrastructure Conglomerate</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge className="px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                ⚠ CONFIDENTIAL · IC USE ONLY
              </Badge>
              <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 font-semibold">
                <FileText className="h-4 w-4 mr-1.5" />
                FULL IM
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Section Title */}
      <div className="container mx-auto max-w-7xl mb-5">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
          §8 Forward Trajectory
        </h2>
      </div>

      {/* Page Content */}
      <div className="container mx-auto max-w-7xl space-y-6">
        <MilestonesCard />
        <ReratingRisksGrid />
      </div>
    </div>
  );
}

export default function ForwardTrajectoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm">Loading...</div>
      </div>
    }>
      <ForwardTrajectoryContent />
    </Suspense>
  );
}
