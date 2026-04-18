"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import type { PortfolioData } from "@/types/portfolio";
import { riskColor, riskLabel } from "./portfolio-data";

interface Props {
  portfolios: PortfolioData[];
  selected: PortfolioData;
  onChange: (p: PortfolioData) => void;
}

export function PortfolioDropdown({ portfolios, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-[10px] border border-[#E2E2E2] bg-white px-4 py-3 hover:bg-[#F5F5F5] transition-colors"
        style={{ minWidth: 280 }}
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14, fontWeight: 500, color: "#0F172B" }}>{selected.name}</span>
            <span
              className="rounded-sm px-1.5 py-0.5"
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                background: riskColor(selected.riskProfile) + "18",
                color: riskColor(selected.riskProfile),
              }}
            >
              {riskLabel(selected.riskProfile)}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#888888", marginTop: 1 }}>
            {selected.client.clientName} · {selected.client.aum}
          </div>
        </div>
        <ChevronDown
          className="size-4 text-zinc-400 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-[10px] border border-[#E2E2E2] bg-white shadow-lg overflow-hidden"
          style={{ minWidth: 280 }}
        >
          {portfolios.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F5] transition-colors text-left border-b border-[#E2E2E2] last:border-0"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: riskColor(p.riskProfile) }} />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#888888", marginTop: 1 }}>
                  {p.client.clientName} · {p.client.aum}
                </div>
              </div>
              {p.id === selected.id && (
                <ShieldCheck className="size-4 text-emerald-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
