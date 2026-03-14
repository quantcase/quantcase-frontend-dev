interface SubsectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SubsectionHeader({ title, subtitle }: SubsectionHeaderProps) {
  return (
    <div>
      <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-0.5">
        {title}
      </h3>
      {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
    </div>
  );
}
