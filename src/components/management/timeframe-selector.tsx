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
          className="text-xs"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
