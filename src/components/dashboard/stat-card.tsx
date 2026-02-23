import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatCardProps) {
  return (
    <Card className={cn("px-5 py-5 gap-0", className)}>
      <CardContent className="px-0 flex flex-col gap-2">
        <div>{icon}</div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
