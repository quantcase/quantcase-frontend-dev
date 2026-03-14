const COLOR_CONFIG = {
  blue: {
    wrapper: "border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20",
    title: "text-blue-700 dark:text-blue-400",
  },
  emerald: {
    wrapper: "border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20",
    title: "text-emerald-700 dark:text-emerald-400",
  },
  purple: {
    wrapper: "border-purple-100 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-900/20",
    title: "text-purple-700 dark:text-purple-400",
  },
} as const;

interface TakeawayBoxProps {
  title: string;
  text: string | null | undefined;
  /** Background/border color theme. Defaults to "blue". */
  color?: keyof typeof COLOR_CONFIG;
  /**
   * When true, the title and text are rendered inline on one line
   * (e.g. "COMPETITION TAKEAWAY: some text here").
   * When false (default), title sits above the text on its own line.
   */
  inline?: boolean;
}

export function TakeawayBox({ title, text, color = "blue", inline = false }: TakeawayBoxProps) {
  const c = COLOR_CONFIG[color];
  return (
    <div className={`border-t ${c.wrapper} -mx-6 px-6 py-3 rounded-b-lg`}>
      {inline ? (
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <span className={`font-bold ${c.title} uppercase tracking-wide`}>{title}: </span>
          {text ?? "N/A"}
        </p>
      ) : (
        <>
          <p className={`text-xs font-bold ${c.title} uppercase tracking-wide mb-1`}>{title}</p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{text ?? "N/A"}</p>
        </>
      )}
    </div>
  );
}
