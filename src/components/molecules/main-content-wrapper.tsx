"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const HIDE_TOPBAR_PATHS = ["/", "/screener/home", "/screener/basket"];
const HIDE_CHROME_PATHS = ["/signin"];

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PATHS.includes(pathname);
  const hideTopBar =
    hideChrome ||
    HIDE_TOPBAR_PATHS.includes(pathname) ||
    pathname.startsWith("/screener/mutual-fund/");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("ml-[72px] min-h-screen", !hideTopBar && "pt-14")}
      style={{ background: "var(--qc-surface-base)", paddingTop: !hideTopBar ? 56 : undefined }}
    >
      {children}
    </div>
  );
}
