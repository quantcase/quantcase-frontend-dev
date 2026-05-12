import { Phone, Mail, MessageSquare, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InteractionType } from "@/types/wealthos";

interface InteractionIconProps {
  type: InteractionType;
  className?: string;
}

const iconMap: Record<InteractionType, React.ElementType> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Users,
  sms: MessageCircle,
};

export function InteractionIcon({ type, className }: InteractionIconProps) {
  const Icon = iconMap[type];
  return <Icon className={cn("size-4", className)} style={{ color: "var(--qc-ink-2)" }} />;
}
