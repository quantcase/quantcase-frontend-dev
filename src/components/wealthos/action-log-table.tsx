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
      <p className="text-sm text-zinc-400 dark:text-zinc-500 py-6 text-center">No actions logged</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actions.map((action) => (
          <TableRow key={action.id}>
            <TableCell className="font-medium capitalize">{action.action_type}</TableCell>
            <TableCell className="max-w-xs truncate text-zinc-500 dark:text-zinc-400">{action.content || "—"}</TableCell>
            <TableCell className="text-zinc-500 dark:text-zinc-400">{action.outcome || "—"}</TableCell>
            <TableCell className="text-zinc-400 dark:text-zinc-500 whitespace-nowrap">{formatDate(action.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
