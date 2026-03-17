interface TakeawayBoxProps {
  title: string;
  text: string | null | undefined;
  color?: string; // kept for API compatibility, unused in new design
  inline?: boolean;
}

export function TakeawayBox({ title, text, inline = false }: TakeawayBoxProps) {
  return (
    <div className="bg-zinc-900 dark:bg-zinc-950 -mx-6 px-6 py-3 rounded-b-lg">
      {inline ? (
        <p className="text-xs font-light text-zinc-200 leading-relaxed">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mr-1.5">{title}:</span>
          {text ?? "N/A"}
        </p>
      ) : (
        <>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">{title}</p>
          <p className="text-xs font-light text-zinc-200 leading-relaxed">{text ?? "N/A"}</p>
        </>
      )}
    </div>
  );
}
