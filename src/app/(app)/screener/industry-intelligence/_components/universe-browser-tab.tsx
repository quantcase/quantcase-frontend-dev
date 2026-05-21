"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { IIUniverseBrowser, IIMacroSector } from "@/types/industry-intelligence";

// ── Sector identity colors — categorical, not semantic ────────────────────────

const SECTOR_COLORS: Record<string, { color: string; bg: string }> = {
  CD: { color: "#E57373", bg: "rgba(229,115,115,0.14)" },
  FS: { color: "#4DB6AC", bg: "rgba(77,182,172,0.14)" },
  IN: { color: "#5C85D6", bg: "rgba(92,133,214,0.14)" },
  HC: { color: "#66BB6A", bg: "rgba(102,187,106,0.14)" },
  CM: { color: "#FFA726", bg: "rgba(255,167,38,0.14)" },
  FG: { color: "#AB47BC", bg: "rgba(171,71,188,0.14)" },
  IT: { color: "#42A5F5", bg: "rgba(66,165,245,0.14)" },
  SV: { color: "#7E57C2", bg: "rgba(126,87,194,0.14)" },
  EN: { color: "#FF8F00", bg: "rgba(255,143,0,0.14)" },
  UT: { color: "#26C6DA", bg: "rgba(38,198,218,0.14)" },
  TL: { color: "#EF5350", bg: "rgba(239,83,80,0.14)" },
  DV: { color: "#78909C", bg: "rgba(120,144,156,0.14)" },
};

const FALLBACK_COLORS = { color: "#888888", bg: "rgba(136,136,136,0.14)" };

// ── Sector card ───────────────────────────────────────────────────────────────

function SectorCard({ sector }: { sector: IIMacroSector }) {
  const { color, bg } = SECTOR_COLORS[sector.code] ?? FALLBACK_COLORS;
  return (
    <Card
      className="rounded-[10px] shadow-none p-4 gap-3 cursor-pointer transition-opacity hover:opacity-80"
      style={{ borderColor: "var(--qc-border-default)" }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-[8px] text-[11px] font-bold shrink-0"
        style={{ background: bg, color }}
      >
        {sector.code}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-semibold leading-snug" style={{ color: "var(--qc-text-heading)" }}>{sector.name}</p>
        <p className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>{sector.stock_count.toLocaleString()} stocks</p>
      </div>
    </Card>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function UniverseBrowserTab({ data }: { data: IIUniverseBrowser }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? data.macro_sectors.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.code.toLowerCase().includes(query.toLowerCase())
      )
    : data.macro_sectors;

  const { total_stocks, total_macro_sectors, hierarchy_levels } = data.stats;

  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* Stats bar + search */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--qc-text-muted)" }}>
          {total_stocks.toLocaleString()} Stocks · {total_macro_sectors} Macro Sectors · {hierarchy_levels}-Level Hierarchy
        </span>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--qc-text-muted)" }} />
          <Input
            placeholder="Search stock name or symbol..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none h-auto p-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-0 w-56 text-[13px]"
            style={{ color: "var(--qc-text-body)" }}
          />
        </div>
      </div>

      {/* Sector grid */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px]" style={{ color: "var(--qc-text-body)" }}>All macro sectors</span>
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((s) => <SectorCard key={s.code} sector={s} />)}
        </div>
      </div>

    </div>
  );
}
