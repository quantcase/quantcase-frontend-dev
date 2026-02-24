import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ICAlignmentCardProps {
  title: string;
  description: string;
}

export function ICAlignmentCard({ title, description }: ICAlignmentCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          IC Alignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
