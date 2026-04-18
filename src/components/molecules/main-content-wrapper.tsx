"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const HIDE_TOPBAR_PATHS = ["/", "/screener/home", "/screener/basket"];

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTopBar = HIDE_TOPBAR_PATHS.includes(pathname);

  return (
    <div className={cn("ml-14 min-h-screen bg-gray-50 dark:bg-black", !hideTopBar && "pt-14")}>
      {children}
    </div>
  );
}
