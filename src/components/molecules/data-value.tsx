import { cn } from "@/lib/utils";

interface DataValueProps {
  value: string | number | null | undefined;
  className?: string;
  fallback?: string;
}

export function DataValue({ value, className, fallback = "N/A" }: DataValueProps) {
  const isEmpty = value === null || value === undefined || value === "" || value === "N/A";

  return (
    <span className={cn(
      isEmpty && "text-red-600 dark:text-red-400",
      className
    )}>
      {isEmpty ? fallback : value}
    </span>
  );
}
