import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoItemProps {
  icon: LucideIcon;
  text: string;
  className?: string;
}

export function InfoItem({ icon: Icon, text, className }: InfoItemProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400", className)}>
      <Icon className="size-4" />
      <span>{text}</span>
    </div>
  );
}
