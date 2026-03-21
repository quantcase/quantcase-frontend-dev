import { Badge } from "@/components/ui/badge";

interface TakeawayBoxProps {
  title: string;
  text: string | null | undefined;
  color?: string; // kept for API compatibility, unused in new design
  inline?: boolean;
}

export function TakeawayBox({ title, text, inline = false }: TakeawayBoxProps) {
  return (
    <div className="bg-zinc-900 dark:bg-zinc-950 -mx-6 p-[20px] rounded-b-lg">
      {inline ? (
        <p className="text-xs font-light text-zinc-200 leading-relaxed">
          <Badge variant="destructive" className="mr-1.5">{title}</Badge>
          <h4 className="text-[#FAFAFAE5]">{text ?? "N/A"}</h4>
        </p>
      ) : (
        <>
          <Badge variant="destructive">{title}</Badge>
          <h4 className="text-[#FAFAFAE5] pt-4 line-clamp-2 text-truncate">{text ?? "N/A"}</h4>
        </>
      )}
    </div>
  );
}
