import { SectionPanel } from "@/components/molecules/section-panel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { InvestmentThesis } from "@/types/management";

interface InvestmentThesisSectionProps {
  thesis: InvestmentThesis;
}

function BullBearSplit({ bullCase, bearCase }: { bullCase: string[]; bearCase: string[] }) {
  return (
    <div className="flex" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--qc-border-default)" }}>
      {/* Bull */}
      <div className="flex-1 min-w-0" style={{ borderRight: "1px solid var(--qc-border-default)" }}>
        <div style={{ background: "var(--qc-up-soft)", borderLeft: "4px solid var(--qc-up)", padding: "10px 14px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-up)" }}>
            Bull Case (Management Lens)
          </span>
        </div>
        <div style={{ borderLeft: "4px solid var(--qc-up)", padding: "14px 14px", minHeight: 120 }}>
          <ul className="space-y-2">
            {bullCase.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "var(--qc-up)", flexShrink: 0, marginTop: 2, fontSize: 10 }}>●</span>
                <span style={{ fontSize: 13, color: "var(--qc-text-body)", lineHeight: 1.6 }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bear */}
      <div className="flex-1 min-w-0">
        <div style={{ background: "var(--qc-down-soft)", borderLeft: "4px solid var(--qc-down)", padding: "10px 14px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-down)" }}>
            Bear Case (Management Lens)
          </span>
        </div>
        <div style={{ borderLeft: "4px solid var(--qc-down)", padding: "14px 14px", minHeight: 120 }}>
          <ul className="space-y-2">
            {bearCase.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "var(--qc-down)", flexShrink: 0, marginTop: 2, fontSize: 10 }}>●</span>
                <span style={{ fontSize: 13, color: "var(--qc-text-body)", lineHeight: 1.6 }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WatchlistTable({ items }: { items: InvestmentThesis["next_concall_watchlist"] }) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed w-full">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "26%" }} />
        </colgroup>
        <TableHeader>
          <TableRow style={{ borderColor: "var(--qc-border-default)" }}>
            {["#", "What to Listen For", "Why It Matters", "Green Signal", "Red Signal"].map((h) => (
              <TableHead
                key={h}
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: "var(--qc-text-muted)" }}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.number} className="align-top" style={{ borderColor: "var(--qc-border-inner)" }}>
              <TableCell className="text-xs font-semibold pt-4" style={{ color: "var(--qc-text-muted)" }}>
                {item.number}
              </TableCell>
              <TableCell className="text-xs break-words whitespace-normal py-4" style={{ color: "var(--qc-text-body)" }}>
                {item.what_to_listen_for}
              </TableCell>
              <TableCell className="text-xs break-words whitespace-normal py-4" style={{ color: "var(--qc-text-muted)" }}>
                {item.why_it_matters}
              </TableCell>
              <TableCell className="text-xs break-words whitespace-normal py-4" style={{ color: "var(--qc-up)" }}>
                {item.green_signal}
              </TableCell>
              <TableCell className="text-xs break-words whitespace-normal py-4" style={{ color: "var(--qc-down)" }}>
                {item.red_signal}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function InvestmentThesisSection({ thesis }: InvestmentThesisSectionProps) {
  const { bull_case, bear_case, next_concall_watchlist } = thesis;

  const headerAction = next_concall_watchlist.length > 0 ? (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--qc-text-heading)",
        background: "var(--qc-surface-panel)",
        border: "1px solid var(--qc-border-default)",
        borderRadius: 4,
        padding: "3px 10px",
        letterSpacing: "0.05em",
      }}
    >
      {next_concall_watchlist.length} Watchlist Items
    </div>
  ) : undefined;

  return (
    <SectionPanel title="Investment Thesis + Next Concall Watchlist" headerAction={headerAction}>
      <div className="flex flex-col gap-5">
        {(bull_case.length > 0 || bear_case.length > 0) && (
          <BullBearSplit bullCase={bull_case} bearCase={bear_case} />
        )}

        {next_concall_watchlist.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--qc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Next Concall Watchlist
            </p>
            <WatchlistTable items={next_concall_watchlist} />
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
