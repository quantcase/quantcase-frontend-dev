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
      <div className="flex items-center gap-2 rounded-md border px-3 py-1.5" style={{ background: "var(--qc-topbar-search-bg)", borderColor: "var(--qc-topbar-search-border)" }}>
        <Search className="size-3.5 shrink-0" style={{ color: "var(--qc-text-muted)" }} />
        <input
          type="text"
          placeholder="Search Indian companies (e.g. HDFC, Reliance)..."
          className="w-72 bg-transparent text-sm focus:outline-none"
          style={{ color: "var(--qc-text-body)" }}
        />
      </div>
      <div className="flex items-center gap-2">
        {quickSymbols.map((sym) => (
          <span
            key={sym}
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{ borderColor: "var(--qc-border-default)", color: "var(--qc-text-muted)" }}
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
          ? "font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5"
          : ""
      )}
      style={active
        ? { color: "var(--qc-topbar-tab-active-fg)", ["--tw-after-bg" as string]: "var(--qc-topbar-tab-active-fg)" }
        : { color: "var(--qc-topbar-tab-idle-fg)" }
      }
    >
      {icon}
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--qc-topbar-tab-active-fg)" }} />
      )}
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

    const showFactorItems = isFactorActive || factorOpen;

    leftZone = (
      <div className="flex h-full items-end gap-1">
        {terminalTabs.map((tab) => (
          <TabLink key={tab.href} href={withSymbol(tab.href)} active={pathname === tab.href} icon={tab.icon}>
            {tab.label}
          </TabLink>
        ))}

        <div ref={factorRef} className="flex h-full items-end">
          <button
            onClick={() => !isFactorActive && setFactorOpen((v) => !v)}
            className={cn(
              "relative flex h-full items-center gap-0 px-1 focus:outline-none",
              isFactorActive ? "cursor-default" : ""
            )}
          >
            <span
              className={cn(
                "relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium overflow-hidden border transition-colors duration-200"
              )}
              style={isFactorActive
                ? { background: "var(--qc-accent-primary)", color: "var(--qc-accent-primary-fg)", borderColor: "var(--qc-accent-primary)" }
                : { background: "var(--qc-surface-white)", color: "var(--qc-accent-primary)", borderColor: "var(--qc-border-active)" }
              }
            >
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

          {showFactorItems && (
            <>
              <span className="flex h-full items-center px-1 select-none text-base" style={{ color: "var(--qc-topbar-separator)" }}>·</span>
              {FACTOR_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={withSymbol(item.href)}
                  className={cn(
                    "relative flex h-full items-center px-3 text-sm whitespace-nowrap transition-colors",
                    pathname === item.href ? "font-medium" : ""
                  )}
                  style={{ color: pathname === item.href ? "var(--qc-topbar-tab-active-fg)" : "var(--qc-topbar-tab-idle-fg)" }}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "var(--qc-topbar-tab-active-fg)" }} />
                  )}
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
    <header className="fixed left-14 right-0 top-0 z-30 flex h-12 items-center justify-between border-b px-6" style={{ background: "var(--qc-topbar-bg)", borderColor: "var(--qc-topbar-border)" }}>
      <div className="flex h-full items-center">{leftZone}</div>

      {/* Right: user avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: "var(--qc-topbar-avatar-bg)" }}>
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
        <header className="fixed left-14 right-0 top-0 z-30 h-14 border-b" style={{ background: "var(--qc-topbar-bg)", borderColor: "var(--qc-topbar-border)" }} />
      }
    >
      <TopBarInner />
    </Suspense>
  );
}
