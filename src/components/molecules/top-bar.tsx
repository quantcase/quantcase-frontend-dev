"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronRight, Eye, CandlestickChart, BookOpen, Sparkles, LayoutDashboard, Users, PieChart, Wrench, LineChart } from "lucide-react";
import { Suspense, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const quickSymbols = ["HDFC", "TCS", "INFY", "ICICI"];

const QUANTCASE_FACTOR_PATHS = ["/screener/management", "/screener/opportunity", "/screener/deal"];

const FACTOR_ITEMS = [
  { label: "Management Factor", href: "/screener/management" },
  { label: "Opportunity Factor", href: "/screener/opportunity" },
  { label: "Deal Factor",        href: "/screener/deal" },
];

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
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-full items-center gap-1.5 px-3 text-sm whitespace-nowrap transition-colors",
        active
          ? "text-[#0F172B] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0F172B]"
          : "text-[#888888] hover:text-[#0F172B]"
      )}
    >
      {icon}
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
  const isScreenerHomePage = pathname === "/screener/home";
  const isBasketPage = pathname === "/screener/basket";

  const isTerminal = pathname.startsWith("/screener");
  const isWealthOS = pathname.startsWith("/wealthos");
  const isModels =
    pathname === "/model-builder" ||
    pathname.startsWith("/model-builder/") ||
    pathname === "/model-analytics";

  const hasAssetSelected = isTerminal && !isScreenerHomePage && !isBasketPage;

  const withSymbol = (href: string) =>
    symbol ? `${href}?symbol=${encodeURIComponent(symbol)}` : href;

  const withRmId = (href: string) =>
    rmId ? `${href}?rm_id=${encodeURIComponent(rmId)}` : href;

  const isFactorActive = QUANTCASE_FACTOR_PATHS.includes(pathname);

  const [factorOpen, setFactorOpen] = useState(false);
  const factorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!factorOpen) return;
    function handleClick(e: MouseEvent) {
      if (factorRef.current && !factorRef.current.contains(e.target as Node)) {
        setFactorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [factorOpen]);

  // Close the popover when navigating away from factor pages
  useEffect(() => {
    if (!isFactorActive) setFactorOpen(false);
  }, [isFactorActive]);

  if (isHome || isScreenerHomePage || isBasketPage) return null;

  let leftZone: React.ReactNode = null;

  if (isHome || (isTerminal && !hasAssetSelected)) {
    leftZone = <SearchZone />;
  } else if (hasAssetSelected) {
    const terminalTabs = [
      { label: "Overview",     href: "/screener/overview",     icon: <Eye className="size-3.5 shrink-0" /> },
      { label: "Technicals",   href: "/screener/technicals",   icon: <CandlestickChart className="size-3.5 shrink-0" /> },
      { label: "Fundamentals", href: "/screener/fundamentals", icon: <BookOpen className="size-3.5 shrink-0" /> },
    ];

    // Expanded: factor active — show items inline
    // Collapsed: not active — show trigger button, clicking expands inline
    const showFactorItems = isFactorActive || factorOpen;

    leftZone = (
      <div className="flex h-full items-end gap-1">
        {terminalTabs.map((tab) => (
          <TabLink key={tab.href} href={withSymbol(tab.href)} active={pathname === tab.href} icon={tab.icon}>
            {tab.label}
          </TabLink>
        ))}

        {/* QuantCase — trigger + inline sub-items, all inside factorRef */}
        <div ref={factorRef} className="flex h-full items-end">
          <button
            onClick={() => !isFactorActive && setFactorOpen((v) => !v)}
            className={cn(
              "relative flex h-full items-center gap-0 px-1 focus:outline-none",
              isFactorActive ? "cursor-default" : ""
            )}
          >
            {/* Pill badge with shimmer */}
            <span className={cn(
              "relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium overflow-hidden",
              "border transition-colors duration-200",
              isFactorActive
                ? "bg-[#0F172B] text-white border-[#0F172B]"
                : "bg-white text-[#0F172B] border-[#0F172B]/30 hover:border-[#0F172B]/60"
            )}>
              {/* Shimmer sweep — only when not active */}
              {!isFactorActive && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(15,23,43,0.08) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}
                />
              )}
              <Sparkles className="size-3 shrink-0" />
              QuantCase
              <ChevronRight
                className={cn(
                  "size-3 shrink-0 transition-transform duration-200",
                  showFactorItems ? "rotate-90" : "rotate-0"
                )}
              />
            </span>
          </button>

          {/* Factor sub-items — shown inline when expanded */}
          {showFactorItems && (
            <>
              <span className="flex h-full items-center px-1 text-[#C8C8C8] select-none text-base">·</span>
              {FACTOR_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={withSymbol(item.href)}
                  className={cn(
                    "relative flex h-full items-center px-3 text-sm whitespace-nowrap transition-colors",
                    pathname === item.href
                      ? "text-[#0F172B] font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0F172B]"
                      : "text-[#888888] hover:text-[#0F172B]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    );
  } else if (isWealthOS) {
    const wealthTabs = [
      { label: "Dashboard", href: "/wealthos/dashboard", icon: <LayoutDashboard className="size-3.5 shrink-0" /> },
      { label: "Clients",   href: "/wealthos/clients",   icon: <Users className="size-3.5 shrink-0" /> },
      { label: "RMs",       href: "/wealthos/rms",       icon: <Users className="size-3.5 shrink-0" /> },
      { label: "Models",    href: "/wealthos/models",    icon: <PieChart className="size-3.5 shrink-0" /> },
      { label: "Analytics", href: "/wealthos/analytics", icon: <LineChart className="size-3.5 shrink-0" /> },
    ];
    leftZone = (
      <div className="flex h-full items-end gap-1">
        {wealthTabs.map((tab) => (
          <TabLink
            key={tab.href}
            href={withRmId(tab.href)}
            active={pathname.startsWith(tab.href)}
            icon={tab.icon}
          >
            {tab.label}
          </TabLink>
        ))}
      </div>
    );
  } else if (isModels) {
    const modelTabs = [
      { label: "Model Builder",   href: "/model-builder",   icon: <Wrench className="size-3.5 shrink-0" /> },
      { label: "Model Analytics", href: "/model-analytics", icon: <LineChart className="size-3.5 shrink-0" /> },
    ];
    leftZone = (
      <div className="flex h-full items-end gap-1">
        {modelTabs.map((tab) => (
          <TabLink key={tab.href} href={tab.href} active={pathname === tab.href || (tab.href === "/model-builder" && pathname.startsWith("/model-builder/"))} icon={tab.icon}>
            {tab.label}
          </TabLink>
        ))}
      </div>
    );
  }

  return (
    <header className="fixed left-14 right-0 top-0 z-30 flex h-12 items-center justify-between border-b border-[#E2E2E2] bg-[#F5F5F5] px-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-full items-center">{leftZone}</div>

      {/* Right: user avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            PJ
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
        <header className="fixed left-14 right-0 top-0 z-30 h-14 border-b border-[#E2E2E2] bg-[#F5F5F5]" />
      }
    >
      <TopBarInner />
    </Suspense>
  );
}
