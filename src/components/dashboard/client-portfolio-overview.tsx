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
    <div
      className={cn("rounded-[10px] p-2 flex flex-col", className)}
      style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
    >
      {/* Panel header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-ink)", textTransform: "uppercase", letterSpacing: "0.01em", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
            Client Portfolio Overview
          </span>
        </div>
        <button
          className="flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 transition-colors"
          style={{ color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}
        >
          View All <ArrowRight className="size-3 ml-0.5" />
        </button>
      </div>

      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair-2)" }}
      >
        {/* Summary bar */}
        <div
          className="grid grid-cols-3"
          style={{ borderBottom: "1px solid var(--qc-hair)" }}
        >
          {[
            { label: "Total AUM", value: totalAUM, valueColor: "var(--qc-ink)" },
            { label: "Clients", value: String(totalClients), valueColor: "var(--qc-ink)" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5 px-4 py-2.5" style={{ borderRight: "1px solid var(--qc-hair)" }}>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>{item.label}</p>
              <p className="text-[18px] font-semibold leading-none" style={{ color: item.valueColor, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{item.value}</p>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--qc-ink-2)" }}>Active Alerts</p>
              <p className="text-[18px] font-semibold leading-none" style={{ color: activeAlerts > 0 ? "var(--qc-down)" : "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{activeAlerts}</p>
            </div>
            {activeAlerts > 0 && <AlertCircle className="size-4 flex-shrink-0" style={{ color: "var(--qc-down)" }} />}
          </div>
        </div>

        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_72px_60px_90px] px-4 py-2"
          style={{ borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
        >
          {["Client", "AUM", "Return", "Action"].map((col, i) => (
            <p key={col} className={`text-[10px] font-semibold uppercase tracking-wider ${i > 0 ? "text-right" : ""}`} style={{ color: "var(--qc-ink-2)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{col}</p>
          ))}
        </div>

        {/* Client rows */}
        <div className="divide-y" style={{ borderColor: "var(--qc-hair-2)" }}>
          {clients.map((client) => {
            const isUp = client.pnlPercent >= 0;
            const pnlColor = isUp ? "var(--qc-up)" : "var(--qc-down)";
            const initials = client.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div
                key={client.id}
                className="grid grid-cols-[1fr_72px_60px_90px] items-center px-4 py-2.5 cursor-pointer transition-colors hover:bg-[var(--qc-section)]"
                style={{ borderTopColor: "var(--qc-hair-2)" }}
              >
                {/* Name + last contact */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex-shrink-0 size-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "var(--qc-section)", color: "var(--qc-ink-2)", border: "1px solid var(--qc-hair)" }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: "var(--qc-ink)" }}>{client.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--qc-ink-3)" }}>{client.lastContact}</p>
                  </div>
                </div>

                {/* AUM */}
                <p className="text-[12px] font-medium text-right tabular-nums" style={{ color: "var(--qc-ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{client.aum}</p>

                {/* Return */}
                <p
                  className="text-[12px] font-semibold text-right tabular-nums"
                  style={{ color: pnlColor, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                >
                  {fmtPct(client.pnlPercent)}
                </p>

                {/* Action */}
                <div className="flex justify-end">
                  {client.actionLabel ? (
                    <button
                      className="text-[11px] font-semibold rounded-md px-2 py-0.5 transition-colors"
                      style={{ color: "var(--qc-ink)", border: "1px solid var(--qc-hair)", background: "var(--qc-card)" }}
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
