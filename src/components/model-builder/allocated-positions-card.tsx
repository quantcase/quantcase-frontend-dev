"use client";

import { Minus, Plus, Trash2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Position, AssetClass } from "@/types/portfolio";

interface AllocatedPositionsCardProps {
  positions: Position[];
  totalAllocation: number;
  onRemovePosition?: (id: string) => void;
  onUpdateAllocation?: (id: string, allocation: number) => void;
}

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  growth: "Growth",
  quality_compounder: "Quality",
  value: "Value",
  income: "Income",
};

export function AllocatedPositionsCard({
  positions,
  totalAllocation,
  onRemovePosition,
  onUpdateAllocation,
}: AllocatedPositionsCardProps) {
  const remaining = 100 - totalAllocation;
  const isEditing = !!onRemovePosition;

  const handleDecrement = (pos: Position) => {
    if (pos.allocation > 1) onUpdateAllocation?.(pos.id, pos.allocation - 1);
  };

  const handleIncrement = (pos: Position) => {
    if (totalAllocation < 100) onUpdateAllocation?.(pos.id, pos.allocation + 1);
  };

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "rgba(18,18,18,0.50)" }}>
          <Layers className="h-3 w-3" />
          Allocated Positions
        </p>
        <span className="text-[11px] font-semibold" style={{ color: "rgba(18,18,18,0.50)" }}>
          TOTAL{" "}
          <span
            className="text-sm font-bold"
            style={{ color: totalAllocation > 100 ? "#dc2626" : "#0F172B" }}
          >
            {totalAllocation}%
          </span>
        </span>
      </div>

      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 space-y-4">
        {/* Allocation bar */}
        <div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#F5F5F5" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(totalAllocation, 100)}%`,
                background: totalAllocation > 100 ? "#dc2626" : totalAllocation > 85 ? "#d97706" : "#0F172B",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: "#888888" }}>0%</span>
            {remaining > 0 && (
              <span className="text-[10px]" style={{ color: "#888888" }}>{remaining}% remaining</span>
            )}
            {remaining < 0 && (
              <span className="text-[10px] text-red-600">{Math.abs(remaining)}% over</span>
            )}
            <span className="text-[10px]" style={{ color: "#888888" }}>100%</span>
          </div>
        </div>

        {/* Empty state */}
        {positions.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "#888888" }}>
            No positions added yet. Use the screener below to add assets.
          </p>
        )}

        {/* Position rows */}
        <div className="space-y-2">
          {positions.map((position) => (
            <div
              key={position.id}
              className="flex items-center gap-3 rounded-lg border border-[#E2E2E2] px-3 py-2.5"
              style={{ background: "#FAFAFA" }}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate" style={{ color: "#0F172B" }}>
                    {position.company}
                  </span>
                  <span className="text-[11px] font-mono flex-shrink-0" style={{ color: "#888888" }}>
                    {position.ticker}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-medium uppercase tracking-wide rounded-sm px-1.5 py-0.5"
                    style={{ background: "#F5F5F5", color: "#888888" }}
                  >
                    {ASSET_CLASS_LABELS[position.assetClass]}
                  </span>
                  <span className="text-[11px]" style={{ color: "#888888" }}>
                    Score {position.score}
                  </span>
                </div>
              </div>

              {/* Weight stepper */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleDecrement(position)}
                      className="h-6 w-6 rounded border border-[#E2E2E2] flex items-center justify-center hover:bg-zinc-100 transition-colors"
                      style={{ color: "#0F172B" }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span
                      className="text-sm font-bold tabular-nums w-10 text-center"
                      style={{ color: "#0F172B" }}
                    >
                      {position.allocation}%
                    </span>
                    <button
                      onClick={() => handleIncrement(position)}
                      className={cn(
                        "h-6 w-6 rounded border border-[#E2E2E2] flex items-center justify-center transition-colors",
                        totalAllocation >= 100 ? "opacity-30 cursor-not-allowed" : "hover:bg-zinc-100"
                      )}
                      style={{ color: "#0F172B" }}
                      disabled={totalAllocation >= 100}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onRemovePosition?.(position.id)}
                      className="ml-1 h-6 w-6 flex items-center justify-center rounded transition-colors hover:text-red-600"
                      style={{ color: "#888888" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <span
                    className="text-sm font-bold tabular-nums w-10 text-right"
                    style={{ color: "#0F172B" }}
                  >
                    {position.allocation}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
