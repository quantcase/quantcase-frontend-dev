"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Monitor, Briefcase, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Home",     href: "/",                  icon: Home,       isActive: (p: string) => p === "/" },
  { label: "Terminal", href: "/screener/home",      icon: Monitor,    isActive: (p: string) => p.startsWith("/screener") },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase,  isActive: (p: string) => p.startsWith("/wealthos") },
  { label: "Models",   href: "/model-builder",      icon: TrendingUp, isActive: (p: string) => p === "/model-builder" || p.startsWith("/model-builder/") || p === "/model-analytics" },
  { label: "Settings", href: "/settings",           icon: Settings,   isActive: (p: string) => p.startsWith("/settings") },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col border-r border-[#E2E2E2] bg-white">
      {/* Logo */}
      <div className="flex h-12 items-center justify-center border-b border-[#E2E2E2]">
        <span className="text-base font-bold text-blue-600">Q</span>
      </div>

      {/* Nav icons */}
      <TooltipProvider delayDuration={300}>
        <nav className="flex flex-1 flex-col gap-1 py-3 px-2">
          {navItems.map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <TooltipRoot key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex w-full items-center justify-center rounded-md p-2 transition-colors",
                      active
                        ? "bg-gray-100 text-[#0F172B]"
                        : "text-[#888888] hover:bg-gray-50 hover:text-[#0F172B]"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </TooltipRoot>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* Footer */}
      <div className="border-t border-[#E2E2E2] py-3 flex justify-center">
        <p className="text-[8px] text-[#888888]">v2.4</p>
      </div>
    </aside>
  );
}
