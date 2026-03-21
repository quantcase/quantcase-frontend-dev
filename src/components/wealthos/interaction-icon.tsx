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

const colorMap: Record<InteractionType, string> = {
  call: "text-blue-500",
  email: "text-gray-500",
  whatsapp: "text-green-500",
  meeting: "text-purple-500",
  sms: "text-amber-500",
};

export function InteractionIcon({ type, className }: InteractionIconProps) {
  const Icon = iconMap[type];
  return <Icon className={cn("size-4", colorMap[type], className)} />;
}
