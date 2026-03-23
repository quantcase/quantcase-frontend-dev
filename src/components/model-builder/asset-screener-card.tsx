"use client";

import { StockSearchPanel, StockOption } from "@/components/molecules/stock-search-panel";

interface AssetScreenerCardProps {
  addedTickers?: string[];
  onAddStock?: (stock: StockOption) => void;
}

export function AssetScreenerCard({ addedTickers = [], onAddStock }: AssetScreenerCardProps) {
  return (
    <StockSearchPanel
      variant="panel"
      addedTickers={addedTickers}
      onAddStock={onAddStock}
    />
  );
}

export type { StockOption };
