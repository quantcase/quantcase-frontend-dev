import { AlertCircle } from "lucide-react";

export function ConfidentialBanner() {
  return (
    <div className="w-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 py-2 px-4 text-center">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-red-600 dark:text-red-400 uppercase">
        <AlertCircle className="h-3.5 w-3.5" />
        Highly Confidential — For Investment Committee Use Only
      </span>
    </div>
  );
}
