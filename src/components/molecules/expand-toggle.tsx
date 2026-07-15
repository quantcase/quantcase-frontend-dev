import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
  label?: string;
  collapseLabel?: string;
}

export function ExpandToggle({
  expanded,
  onToggle,
  label = "Show Detailed Analysis",
  collapseLabel = "Hide Detailed Analysis",
}: ExpandToggleProps) {
  return (
    <div className="flex justify-center">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 rounded-full border border-hair px-4 py-1.5 text-xs text-ink-2 hover:bg-secondary transition-colors"
      >
        {expanded ? collapseLabel : label}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
    </div>
  );
}
