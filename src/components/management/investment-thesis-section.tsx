import { SectionPanel } from "@/components/molecules/section-panel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { InvestmentThesis } from "@/types/management";

interface InvestmentThesisSectionProps {
  thesis: InvestmentThesis;
}

function BullBearSplit({ bullCase, bearCase }: { bullCase: string[]; bearCase: string[] }) {
  return (
    <div className="flex" style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #E2E2E2" }}>
      {/* Bull */}
      <div className="flex-1 min-w-0" style={{ borderRight: "1px solid #E2E2E2" }}>
        <div
          style={{
            background: "#f0fdf4",
            borderLeft: "4px solid #16a34a",
            padding: "10px 14px",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
            Bull Case (Management Lens)
          </span>
        </div>
        <div
          style={{
            borderLeft: "4px solid #16a34a",
            padding: "14px 14px",
            minHeight: 120,
          }}
        >
          <ul className="space-y-2">
            {bullCase.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "#16a34a", flexShrink: 0, marginTop: 2, fontSize: 10 }}>●</span>
                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bear */}
      <div className="flex-1 min-w-0">
        <div
          style={{
            background: "#fef2f2",
            borderLeft: "4px solid #dc2626",
            padding: "10px 14px",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#b91c1c" }}>
            Bear Case (Management Lens)
          </span>
        </div>
        <div
          style={{
            borderLeft: "4px solid #dc2626",
            padding: "14px 14px",
            minHeight: 120,
          }}
        >
          <ul className="space-y-2">
            {bearCase.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "#dc2626", flexShrink: 0, marginTop: 2, fontSize: 10 }}>●</span>
                <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{point}</span>
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
          <TableRow className="border-zinc-200">
            {[
              "#",
              "What to Listen For",
              "Why It Matters",
              "Green Signal",
              "Red Signal",
            ].map((h) => (
              <TableHead
                key={h}
                className="text-[10px] font-medium uppercase tracking-wider text-zinc-500"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.number} className="border-zinc-100 align-top">
              <TableCell className="text-xs font-semibold text-zinc-400 pt-4">
                {item.number}
              </TableCell>
              <TableCell className="text-xs text-zinc-700 break-words whitespace-normal py-4">
                {item.what_to_listen_for}
              </TableCell>
              <TableCell className="text-xs text-zinc-500 break-words whitespace-normal py-4">
                {item.why_it_matters}
              </TableCell>
              <TableCell className="text-xs break-words whitespace-normal py-4" style={{ color: "#15803d" }}>
                {item.green_signal}
              </TableCell>
              <TableCell className="text-xs break-words whitespace-normal py-4" style={{ color: "#b91c1c" }}>
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
        color: "#0F172B",
        background: "#F5F5F5",
        border: "1px solid #E2E2E2",
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
        {/* Bull / Bear split */}
        {(bull_case.length > 0 || bear_case.length > 0) && (
          <BullBearSplit bullCase={bull_case} bearCase={bear_case} />
        )}

        {/* Watchlist table */}
        {next_concall_watchlist.length > 0 && (
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#888888",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              Next Concall Watchlist
            </p>
            <WatchlistTable items={next_concall_watchlist} />
          </div>
        )}
      </div>
    </SectionPanel>
  );
}
