import { Badge } from "@/components/ui/badge";

interface InsightsCardProps {
  title: string;
  text: string | null | undefined;
}

export function InsightsCard({ title, text }: InsightsCardProps) {
  return (
    <div className="rounded-lg bg-secondary px-4 py-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <Badge className="bg-ink text-[var(--qc-on-dark)] uppercase tracking-wider shrink-0">{title}</Badge>
      <p className="text-ink leading-relaxed">{text ?? "N/A"}</p>
    </div>
  );
}
