import { Briefcase, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClientAccount {
  id: string;
  name: string;
  aum: string;
  pnlPercent: number;
  tag: string;
  lastContact: string;
  actionLabel?: string;
}

interface ClientPortfolioOverviewProps {
  clients: ClientAccount[];
  totalAUM: string;
  totalClients: number;
  activeAlerts: number;
  className?: string;
}

function fmtPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

export function ClientPortfolioOverview({
  clients,
  totalAUM,
  totalClients,
  activeAlerts,
  className,
}: ClientPortfolioOverviewProps) {
  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col", className)}>
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            Client Portfolio Overview
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
          style={{ color: "#888888" }}
        >
          View All <ArrowRight className="size-3 ml-0.5" />
        </button>
      </div>

      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] overflow-hidden">
        {/* Summary bar */}
        <div className="grid grid-cols-3 divide-x divide-[#E2E2E2] border-b border-[#E2E2E2]">
          <div className="flex flex-col gap-0.5 px-4 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#888888" }}>Total AUM</p>
            <p className="text-[18px] font-semibold leading-none" style={{ color: "#0F172B" }}>{totalAUM}</p>
          </div>
          <div className="flex flex-col gap-0.5 px-4 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#888888" }}>Clients</p>
            <p className="text-[18px] font-semibold leading-none" style={{ color: "#0F172B" }}>{totalClients}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#888888" }}>Active Alerts</p>
              <p className="text-[18px] font-semibold leading-none" style={{ color: activeAlerts > 0 ? "#dc2626" : "#0F172B" }}>{activeAlerts}</p>
            </div>
            {activeAlerts > 0 && <AlertCircle className="size-4 text-red-400 flex-shrink-0" />}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_72px_60px_90px] px-4 py-2 border-b border-[#E2E2E2]">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#888888" }}>Client</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: "#888888" }}>AUM</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: "#888888" }}>Return</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: "#888888" }}>Action</p>
        </div>

        {/* Client rows */}
        <div className="divide-y divide-[#E2E2E2]">
          {clients.map((client) => {
            const isUp = client.pnlPercent >= 0;
            const pnlColor = isUp ? "#059669" : "#dc2626";
            const initials = client.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div
                key={client.id}
                className="grid grid-cols-[1fr_72px_60px_90px] items-center px-4 py-2.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors"
              >
                {/* Name + last contact */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex-shrink-0 size-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "#F5F5F5", color: "#888888", border: "1px solid #E2E2E2" }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "#0F172B" }}>{client.name}</p>
                    <p className="text-[11px]" style={{ color: "rgba(18,18,18,0.40)" }}>{client.lastContact}</p>
                  </div>
                </div>

                {/* AUM */}
                <p className="text-[12px] font-medium text-right tabular-nums" style={{ color: "#0F172B" }}>{client.aum}</p>

                {/* Return */}
                <p
                  className="text-[12px] font-semibold text-right tabular-nums"
                  style={{ color: pnlColor }}
                >
                  {fmtPct(client.pnlPercent)}
                </p>

                {/* Action */}
                <div className="flex justify-end">
                  {client.actionLabel ? (
                    <button
                      className="text-[11px] font-semibold rounded-md px-2 py-0.5 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
                      style={{ color: "#0F172B" }}
                    >
                      {client.actionLabel}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
