import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  appName?: string;
  appSubtitle?: string;
  frameworkInfo?: string;
  className?: string;
}

export function AppHeader({
  appName = "Diligence Assistant",
  appSubtitle = "Restricted Internal Use Only",
  frameworkInfo = "Firm Framework v4.2 Active",
  className,
}: AppHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between py-4 px-8 border-b border-gray-200 dark:border-gray-800", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-gray-900 dark:bg-white">
          <Sparkles className="size-5 text-white dark:text-gray-900" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {appName}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {appSubtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{frameworkInfo}</span>
      </div>
    </header>
  );
}
