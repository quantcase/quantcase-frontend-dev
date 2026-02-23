"use client";

import { usePathname } from "next/navigation";
import { ScreenerSubpageNav } from "@/components/molecules/screener-subpage-nav";

export default function ScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSubnav = pathname !== "/screener/home";

  return (
    <>
      {showSubnav && <ScreenerSubpageNav />}
      <div className={showSubnav ? "pt-11" : undefined}>{children}</div>
    </>
  );
}
