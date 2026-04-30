"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const HIDE_TOPBAR_PATHS = ["/", "/screener/home", "/screener/basket", "/screener/industry-intelligence"];

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTopBar =
    HIDE_TOPBAR_PATHS.includes(pathname) || pathname.startsWith("/screener/mutual-fund/");

  return (
    <div
      className={cn("ml-[72px] min-h-screen", !hideTopBar && "pt-14")}
      style={{ background: "var(--qc-surface-base)", paddingTop: !hideTopBar ? 56 : undefined }}
    >
      {children}
    </div>
  );
}
