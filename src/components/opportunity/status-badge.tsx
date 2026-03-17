const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  green: {
    badge: "text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  yellow: {
    badge: "text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700",
    dot: "bg-yellow-500",
  },
  red: {
    badge: "text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700",
    dot: "bg-red-500",
  },
};

interface StatusBadgeProps {
  label: string;
  color?: string;
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const c = STATUS_COLORS[color ?? "green"] ?? STATUS_COLORS.green;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${c.badge}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
}
