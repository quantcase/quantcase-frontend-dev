"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


const HIDE_TOPBAR_PATHS = ["/dashboard", "/screener/home", "/screener/basket", "/investor/dashboard", "/investor/portfolio"];
const HIDE_CHROME_PATHS = ["/signin"];
const HIDE_TOPBAR_PREFIXES = ["/admin"];

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PATHS.includes(pathname);
  const hideTopBar =
    hideChrome ||
    HIDE_TOPBAR_PATHS.includes(pathname) ||
    pathname.startsWith("/screener/mutual-fund/") ||
    HIDE_TOPBAR_PREFIXES.some((p) => pathname.startsWith(p));

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("ml-[72px] min-h-screen")}
      style={{ background: "var(--qc-bg)", paddingTop: !hideTopBar ? 60 : undefined }}
    >
      {children}
    </div>
  );
}
