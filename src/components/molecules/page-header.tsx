import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn("text-center space-y-3", className)}>
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
