interface SubsectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SubsectionHeader({ title, subtitle }: SubsectionHeaderProps) {
  return (
    <div>
      <h6 className="uppercase tracking-wide mb-0.5">{title}</h6>
    </div>
  );
}
