import { Button } from "@/components/ui/button";
import type { TimeframeOption } from "@/types/management";

interface TimeframeSelectorProps {
  selected: TimeframeOption;
  onChange: (timeframe: TimeframeOption) => void;
}

const timeframeOptions: { value: TimeframeOption; label: string }[] = [
  { value: "current_quarter", label: "Current Quarter" },
  { value: "rolling_3_year", label: "Rolling 3-Year Analysis" },
  { value: "full_history", label: "Full History" },
];

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-2">
      {timeframeOptions.map((option) => (
        <Button
          key={option.value}
          variant={selected === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className={`text-sm font-semibold ${
            selected === option.value
              ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
