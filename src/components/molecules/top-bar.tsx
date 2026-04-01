"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, Search, ChevronDown } from "lucide-react";
import { Suspense } from "react";
import { DropdownMenu } from "radix-ui";
import { cn } from "@/lib/utils";

const quickSymbols = ["HDFC", "TCS", "INFY", "ICICI"];

const QUANTCASE_FACTOR_PATHS = ["/screener/management", "/screener/opportunity", "/screener/deal"];

function SearchZone() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
        <Search className="size-3.5 shrink-0 text-gray-400" />
        <input
          type="text"
          placeholder="Search Indian companies (e.g. HDFC, Reliance)..."
          className="w-72 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder:text-gray-500"
        />
      </div>
      <div className="flex items-center gap-2">
        {quickSymbols.map((sym) => (
          <span
            key={sym}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
          >
            {sym}
          </span>
        ))}
      </div>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-full items-center px-3 text-sm whitespace-nowrap transition-colors",
        active
          ? "text-[#0F172B] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0F172B]"
          : "text-[#888888] hover:text-[#0F172B]"
      )}
    >
      {children}
    </Link>
  );
}

function TopBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");
  const rmId = searchParams.get("rm_id");

  const isHome = pathname === "/";
  const isTerminal = pathname.startsWith("/screener");
  const isWealthOS = pathname.startsWith("/wealthos");
  const isModels =
    pathname === "/model-builder" ||
    pathname.startsWith("/model-builder/") ||
    pathname === "/model-analytics";

  const isScreenerHome = pathname === "/screener/home";
  const hasAssetSelected = isTerminal && !isScreenerHome;

  const withSymbol = (href: string) =>
    symbol ? `${href}?symbol=${encodeURIComponent(symbol)}` : href;

  const withRmId = (href: string) =>
    rmId ? `${href}?rm_id=${encodeURIComponent(rmId)}` : href;

  const isFactorActive = QUANTCASE_FACTOR_PATHS.includes(pathname);

  let leftZone: React.ReactNode = null;

  if (isHome || (isTerminal && !hasAssetSelected)) {
    leftZone = <SearchZone />;
  } else if (hasAssetSelected) {
    const terminalTabs = [
      { label: "Overview",     href: "/screener/overview" },
      { label: "Technicals",   href: "/screener/technicals" },
      { label: "Fundamentals", href: "/screener/fundamentals" },
    ];
    leftZone = (
      <div className="flex h-full items-end gap-1">
        {terminalTabs.map((tab) => (
          <TabLink key={tab.href} href={withSymbol(tab.href)} active={pathname === tab.href}>
            {tab.label}
          </TabLink>
        ))}
        {/* QuantCase Factors dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "relative flex h-full items-center gap-1 px-3 text-sm whitespace-nowrap transition-colors focus:outline-none",
                isFactorActive
                  ? "text-[#0F172B] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0F172B]"
                  : "text-[#888888] hover:text-[#0F172B]"
              )}
            >
              QuantCase Factors
              <ChevronDown className="size-3.5 shrink-0" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={0}
              align="start"
              className="z-50 min-w-[160px] rounded-md border border-[#E2E2E2] bg-white shadow-md"
            >
              {[
                { label: "Management", href: "/screener/management" },
                { label: "Opportunity", href: "/screener/opportunity" },
                { label: "Deal",        href: "/screener/deal" },
              ].map((item) => (
                <DropdownMenu.Item key={item.href} asChild>
                  <Link
                    href={withSymbol(item.href)}
                    className={cn(
                      "block px-4 py-2 text-sm cursor-pointer select-none outline-none transition-colors",
                      pathname === item.href
                        ? "text-[#0F172B] font-medium"
                        : "text-[#888888] hover:text-[#0F172B] hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    );
  } else if (isWealthOS) {
    const wealthTabs = [
      { label: "Dashboard", href: "/wealthos/dashboard" },
      { label: "Clients",   href: "/wealthos/clients" },
      { label: "RMs",       href: "/wealthos/rms" },
      { label: "Models",    href: "/wealthos/models" },
      { label: "Analytics", href: "/wealthos/analytics" },
    ];
    leftZone = (
      <div className="flex h-full items-end gap-1">
        {wealthTabs.map((tab) => (
          <TabLink
            key={tab.href}
            href={withRmId(tab.href)}
            active={pathname.startsWith(tab.href)}
          >
            {tab.label}
          </TabLink>
        ))}
      </div>
    );
  } else if (isModels) {
    const modelTabs = [
      { label: "Model Builder",   href: "/model-builder" },
      { label: "Model Analytics", href: "/model-analytics" },
    ];
    leftZone = (
      <div className="flex h-full items-end gap-1">
        {modelTabs.map((tab) => (
          <TabLink key={tab.href} href={tab.href} active={pathname === tab.href || (tab.href === "/model-builder" && pathname.startsWith("/model-builder/"))}>
            {tab.label}
          </TabLink>
        ))}
      </div>
    );
  }

  return (
    <header className="fixed left-14 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2E2E2] bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-full items-center">{leftZone}</div>

      {/* Right: notification + user */}
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Bell className="size-5" />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
              Alex Morgan
            </p>
            <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">
              Relationship Manager
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            AM
          </div>
        </div>
      </div>
    </header>
  );
}

export function TopBar() {
  return (
    <Suspense
      fallback={
        <header className="fixed left-14 right-0 top-0 z-30 h-14 border-b border-[#E2E2E2] bg-white" />
      }
    >
      <TopBarInner />
    </Suspense>
  );
}
