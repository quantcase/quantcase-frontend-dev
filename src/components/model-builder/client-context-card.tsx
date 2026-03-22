"use client";

import { User, ChevronDown } from "lucide-react";
import type { ClientContext } from "@/types/portfolio";

interface ClientContextCardProps {
  client: ClientContext;
}

export function ClientContextCard({ client }: ClientContextCardProps) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="px-2 pt-1 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1.5" style={{ color: "rgba(18,18,18,0.50)" }}>
          <User className="h-3 w-3" />
          Client Context
        </p>
      </div>
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] p-4 space-y-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "#888888" }}>Client Name</p>
          <button className="w-full flex items-center justify-between rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100" style={{ color: "#0F172B" }}>
            {client.clientName}
            <ChevronDown className="h-4 w-4" style={{ color: "#888888" }} />
          </button>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "#888888" }}>AUM</p>
          <p className="text-sm font-semibold" style={{ color: client.aum === "—" ? "#888888" : "#0F172B" }}>{client.aum}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "#888888" }}>Latest Updates</p>
          <button className="w-full flex items-center justify-between rounded-md border border-[#E2E2E2] bg-[#F5F5F5] px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-100" style={{ color: "#0F172B" }}>
            {client.latestUpdate}
            <ChevronDown className="h-4 w-4" style={{ color: "#888888" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
