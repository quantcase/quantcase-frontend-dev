import { AlertCircle } from "lucide-react";

export function ConfidentialBanner() {
  return (
    <div className="w-full bg-down-soft border border-down-soft py-2 px-4 text-center">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-down uppercase">
        <AlertCircle className="h-3.5 w-3.5" />
        Highly Confidential — For Investment Committee Use Only
      </span>
    </div>
  );
}
