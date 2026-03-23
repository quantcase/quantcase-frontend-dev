"use client";

import type { ReactNode } from "react";

interface BentoSectionGridProps {
  col1?: ReactNode;     // Stacked metric tiles (narrow)
  col2?: ReactNode;     // Chart panel (wide, span 2)
  col3?: ReactNode;     // Info/signal cards (narrow)
  takeaway?: ReactNode; // Full-width bottom row
}

export function BentoSectionGrid({ col1, col2, col3, takeaway }: BentoSectionGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        <div className="col-span-1 flex flex-col gap-4">{col1}</div>
        <div className="lg:col-span-2 flex flex-col">{col2}</div>
        <div className="col-span-1 flex flex-col gap-4">{col3}</div>
      </div>
      {takeaway && <div>{takeaway}</div>}
    </div>
  );
}
