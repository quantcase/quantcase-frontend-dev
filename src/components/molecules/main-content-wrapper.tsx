"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


const HIDE_TOPBAR_PATHS = ["/dashboard", "/screener/home", "/screener/basket", "/investor/dashboard", "/diary"];
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

  const hasAssetSelected = pathname.startsWith("/screener/") && !HIDE_TOPBAR_PATHS.includes(pathname);

  return (
    <div
      className={cn(
        "md:ml-[72px] min-h-screen pb-[60px] md:pb-0",
        !hideTopBar && (hasAssetSelected ? "pt-[104px] md:pt-[60px]" : "pt-[60px]")
      )}
      style={{ background: "var(--qc-bg)" }}
    >
      {children}
    </div>
  );
}
