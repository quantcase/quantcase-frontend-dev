import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#E2E2E2] bg-white px-4 py-4 flex flex-col gap-2",
        className
      )}
    >
      <div
        style={{
          padding: 4,
          borderRadius: 6,
          border: "1px solid rgba(18,18,18,0.10)",
          background: "rgba(18,18,18,0.03)",
          width: "fit-content",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 400, color: "#0F172B", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 400, color: "#888888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}
