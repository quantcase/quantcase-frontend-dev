interface SegmentedBarProps {
  /** Fill percentage 0–100 */
  pct: number;
  /** Tailwind bg class for filled segments, e.g. "bg-up". Ignored if hexColor is set. */
  color?: string;
  /** Hex color string for filled segments (arbitrary runtime value) */
  hexColor?: string;
  /** Total number of tick segments (default 40) */
  segments?: number;
  /** Height of each tick in pixels (default 10) */
  height?: number;
}

export function SegmentedBar({ pct, color, hexColor, segments = 40, height = 22 }: SegmentedBarProps) {
  const filled = Math.round((Math.min(Math.max(pct, 0), 100) / 100) * segments);
  return (
    <div className="flex items-center gap-[6px] w-full">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded-[1px] ${i < filled && !hexColor ? (color ?? "") : i >= filled ? "bg-secondary" : ""}`}
          style={{
            height,
            ...(i < filled && hexColor ? { backgroundColor: hexColor } : {}),
          }}
        />
      ))}
    </div>
  );
}
