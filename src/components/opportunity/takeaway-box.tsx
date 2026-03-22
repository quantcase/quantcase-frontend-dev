import { Badge } from "@/components/ui/badge";
import { BoldText } from "@/components/opportunity/bold-text";

interface TakeawayBoxProps {
  title: string;
  text: string | null | undefined;
  color?: string; // kept for API compatibility, unused in new design
  inline?: boolean;
  noBleed?: boolean; // omits -mx-6, uses rounded-lg (for use outside px-6 containers)
}

export function TakeawayBox({ title, text, inline = false, noBleed = false }: TakeawayBoxProps) {
  return (
    <div className={`bg-zinc-900 dark:bg-zinc-950 ${noBleed ? "rounded-lg" : "-mx-4 rounded-b-lg"} p-[20px]`}>
      {inline ? (
        <p className="text-xs font-light text-zinc-200 leading-relaxed">
          <Badge variant="destructive" className="mr-1.5">{title}</Badge>
          <h4 className="text-[#FAFAFAE5]"><BoldText text={text ?? "N/A"} /></h4>
        </p>
      ) : (
        <>
          <Badge variant="destructive">{title}</Badge>
          <h4 className="text-[#FAFAFAE5] pt-4 line-clamp-2 text-truncate"><BoldText text={text ?? "N/A"} /></h4>
        </>
      )}
    </div>
  );
}
