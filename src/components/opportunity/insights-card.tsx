import { Badge } from "@/components/ui/badge";

interface InsightsCardProps {
  title: string;
  text: string | null | undefined;
}

export function InsightsCard({ title, text }: InsightsCardProps) {
  return (
    <div className="rounded-lg bg-[#D9D9D9] dark:bg-zinc-950 px-4 py-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <Badge className="bg-black text-white uppercase tracking-wider shrink-0">{title}</Badge>
      <p className="text-[#121212] leading-relaxed">{text ?? "N/A"}</p>
    </div>
  );
}
