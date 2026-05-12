import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { WealthAction } from "@/types/wealthos";

interface ActionLogTableProps {
  actions: WealthAction[];
}

export function ActionLogTable({ actions }: ActionLogTableProps) {
  if (!actions?.length) {
    return (
      <p className="py-6 text-center" style={{ fontSize: 13, color: "var(--qc-ink-2)" }}>
        No actions logged
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Type</TableHead>
          <TableHead style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Content</TableHead>
          <TableHead style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Outcome</TableHead>
          <TableHead style={{ fontSize: 10, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actions.map((action) => (
          <TableRow key={action.id}>
            <TableCell className="capitalize" style={{ fontSize: 13, fontWeight: 500, color: "var(--qc-ink)" }}>
              {action.action_type}
            </TableCell>
            <TableCell className="max-w-xs truncate" style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
              {action.content || "—"}
            </TableCell>
            <TableCell style={{ fontSize: 12, color: "var(--qc-ink-2)" }}>
              {action.outcome || "—"}
            </TableCell>
            <TableCell className="whitespace-nowrap" style={{ fontSize: 11, fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-ink-2)" }}>
              {formatDate(action.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
