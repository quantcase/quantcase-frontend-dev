"use client";

import { useState } from "react";
import { QualityOfEarnings } from "@/components/deal/quality-of-earnings";
import { ValuationVsPeers } from "@/components/deal/valuation-vs-peers";
import { ExpandToggle } from "@/components/molecules/expand-toggle";
import type { DetailedAnalysisSection } from "@/types/deal";

interface DetailedAnalysisProps {
  data?: DetailedAnalysisSection;
}

export function DetailedAnalysis({ data }: DetailedAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <ExpandToggle
        expanded={isOpen}
        onToggle={() => setIsOpen((v) => !v)}
        label="Show Full Analysis"
        collapseLabel="Hide Full Analysis"
      />

      {isOpen && (
        <div className="space-y-6">
          <div className="pt-2 border-t border-hair space-y-4">
            <QualityOfEarnings data={data?.quality_of_earnings} />
          </div>
          <div className="pt-2 border-t border-hair space-y-4">
            <ValuationVsPeers data={data?.valuation_vs_peers} />
          </div>
        </div>
      )}
    </div>
  );
}
