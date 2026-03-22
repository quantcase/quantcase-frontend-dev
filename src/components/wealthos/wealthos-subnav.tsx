"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

interface NavTab {
  label: string;
  href: string;
}

const NAV_TABS: NavTab[] = [
  { label: "Dashboard", href: "/wealthos/dashboard" },
  { label: "Clients", href: "/wealthos/clients" },
  { label: "RMs", href: "/wealthos/rms" },
  { label: "Models", href: "/wealthos/models" },
  { label: "Analytics", href: "/wealthos/analytics" },
];

function WealthOSSubnavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rmId = searchParams.get("rm_id");

  return (
    <nav className="fixed left-56 right-0 top-14 z-20 h-11 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-full items-end px-6 gap-1">
        {NAV_TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const href = rmId
            ? `${tab.href}?rm_id=${encodeURIComponent(rmId)}`
            : tab.href;

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "relative flex h-full items-center px-3 text-sm transition-colors whitespace-nowrap",
                isActive
                  ? "text-gray-900 dark:text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900 after:dark:bg-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function WealthOSSubnav() {
  return (
    <Suspense fallback={
      <nav className="fixed left-56 right-0 top-14 z-20 h-11 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950" />
    }>
      <WealthOSSubnavInner />
    </Suspense>
  );
}
