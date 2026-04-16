import { SubsectionHeader } from "./subsection-header";

interface FinancialSubsectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  paddingBottom?: boolean;
}

export function FinancialSubsection({ title, subtitle, children, paddingBottom = true }: FinancialSubsectionProps) {
  return (
    <div className={`pt-4 ${paddingBottom ? "pb-6" : "pb-4"} border-t border-zinc-100 dark:border-zinc-800 space-y-4`}>
      <SubsectionHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}
