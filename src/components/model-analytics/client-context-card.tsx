import { Users } from "lucide-react";
import type { PortfolioData } from "@/types/portfolio";

export function ClientContextCard({ portfolio }: { portfolio: PortfolioData }) {
  const { client } = portfolio;

  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2">
      <div className="rounded-[10px] bg-white p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-4 text-zinc-400" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--qc-text-heading)" }}>Client Context</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Client",       value: client.clientName },
            { label: "AUM",          value: client.aum        },
            { label: "Last Updated", value: client.latestUpdate },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--qc-text-heading)" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
