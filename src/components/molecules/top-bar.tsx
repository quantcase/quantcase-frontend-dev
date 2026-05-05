"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Eye, CandlestickChart, BookOpen, Sparkles, LayoutDashboard, Users, PieChart, Wrench, LineChart } from "lucide-react";
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

/* Pill-style tab button matching design-sample */
function PillTab({
  href,
  active,
  icon,
  children,
  className,
  style,
  onClick,
}: {
  href?: string;
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const base: React.CSSProperties = active
    ? { background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
    : { background: "transparent", color: "var(--qc-ink-2)" };

  const content = (
    <span
      className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] transition-colors whitespace-nowrap", className)}
      style={{ ...base, ...style }}
    >
      {icon}
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="flex">
      {content}
    </button>
  );
}

function SearchZone() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center gap-2 rounded-full px-3 py-1.5"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--qc-ink-2)" }}>
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          placeholder="Search Indian companies (e.g. HDFC, Reliance)..."
          className="w-72 bg-transparent text-[13px] focus:outline-none"
          style={{ color: "var(--qc-ink)" }}
        />
      </div>
      <div className="flex items-center gap-2">
        {quickSymbols.map((sym) => (
          <span
            key={sym}
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "var(--qc-chip)", border: "1px solid var(--qc-hair)", color: "var(--qc-ink-2)" }}
          >
            {sym}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");
  const rmId = searchParams.get("rm_id");

  const isHome = pathname === "/dashboard";
  const isScreenerHomePage = pathname === "/screener/home";
  const isBasketPage = pathname === "/screener/basket";

  const isMutualFundPage = pathname.startsWith("/screener/mutual-fund/");
  const isTerminal = pathname.startsWith("/screener") && !isMutualFundPage;
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

  const isAdmin = pathname.startsWith("/admin");

  if (isHome || isScreenerHomePage || isBasketPage || isMutualFundPage || isAdmin) return null;

  let leftZone: React.ReactNode = null;

  if (isHome || (isTerminal && !hasAssetSelected)) {
    leftZone = <SearchZone />;
  } else if (hasAssetSelected) {
    const terminalTabs = [
      { label: "Overview",     href: "/screener/overview",     icon: <Eye size={13} strokeWidth={1.8} /> },
      { label: "Technicals",   href: "/screener/technicals",   icon: <CandlestickChart size={13} strokeWidth={1.8} /> },
      { label: "Fundamentals", href: "/screener/fundamentals", icon: <BookOpen size={13} strokeWidth={1.8} /> },
    ];

    const showFactorItems = isFactorActive || factorOpen;

    leftZone = (
      /* pill-tabs container — card bg, border, rounded-full pill, small gap */
      <div
        className="flex items-center gap-0.5 rounded-full p-1"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        {terminalTabs.map((tab) => (
          <PillTab key={tab.href} href={withSymbol(tab.href)} active={pathname === tab.href} icon={tab.icon}>
            {tab.label}
          </PillTab>
        ))}

        {/* QuantCase pill (lime gradient when inactive, solid when active) */}
        <div ref={factorRef} className="flex items-center">
          <button
            onClick={() => !isFactorActive && setFactorOpen((v) => !v)}
            className={cn("flex", !isFactorActive ? "cursor-pointer" : "cursor-default")}
          >
            <span
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium overflow-hidden transition-colors whitespace-nowrap"
              style={
                isFactorActive
                  ? { background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
                  : {
                      background: "var(--qc-section)",
                      border: "1px solid var(--qc-hair)",
                      color: "var(--qc-ink)",
                    }
              }
            >
              {!isFactorActive && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.65) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.65) 52%, transparent 60%)",
                    backgroundSize: "220% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                />
              )}
              <Sparkles size={12} />
              <span style={{ position: "relative", zIndex: 1 }}>QuantCase</span>
              <ChevronRight
                size={12}
                className={cn("transition-transform duration-200", showFactorItems ? "rotate-90" : "rotate-0")}
                style={{ position: "relative", zIndex: 1, color: "var(--qc-ink-2)" }}
              />
            </span>
          </button>

          {showFactorItems && (
            <>
              <span className="px-1 select-none text-sm" style={{ color: "var(--qc-hair)" }}>·</span>
              {FACTOR_ITEMS.map((item) => (
                <PillTab key={item.href} href={withSymbol(item.href)} active={pathname === item.href}>
                  {item.label}
                </PillTab>
              ))}
            </>
          )}
        </div>
      </div>
    );
  } else if (isWealthOS) {
    const wealthTabs = [
      { label: "Dashboard", href: "/wealthos/dashboard", icon: <LayoutDashboard size={13} strokeWidth={1.8} /> },
      { label: "Clients",   href: "/wealthos/clients",   icon: <Users size={13} strokeWidth={1.8} /> },
      { label: "RMs",       href: "/wealthos/rms",       icon: <Users size={13} strokeWidth={1.8} /> },
      { label: "Models",    href: "/wealthos/models",    icon: <PieChart size={13} strokeWidth={1.8} /> },
      { label: "Analytics", href: "/wealthos/analytics", icon: <LineChart size={13} strokeWidth={1.8} /> },
    ];
    leftZone = (
      <div
        className="flex items-center gap-0.5 rounded-full p-1"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        {wealthTabs.map((tab) => (
          <PillTab key={tab.href} href={withRmId(tab.href)} active={pathname.startsWith(tab.href)} icon={tab.icon}>
            {tab.label}
          </PillTab>
        ))}
      </div>
    );
  } else if (isModels) {
    const modelTabs = [
      { label: "Model Builder",   href: "/model-builder",   icon: <Wrench size={13} strokeWidth={1.8} /> },
      { label: "Model Analytics", href: "/model-analytics", icon: <LineChart size={13} strokeWidth={1.8} /> },
    ];
    leftZone = (
      <div
        className="flex items-center gap-0.5 rounded-full p-1"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        {modelTabs.map((tab) => (
          <PillTab
            key={tab.href}
            href={tab.href}
            active={pathname === tab.href || (tab.href === "/model-builder" && pathname.startsWith("/model-builder/"))}
            icon={tab.icon}
          >
            {tab.label}
          </PillTab>
        ))}
      </div>
    );
  }

  return (
    <header
      className="fixed left-[72px] right-0 top-0 z-30 flex h-[60px] items-center justify-between px-6 pt-[22px]"
      style={{ background: "var(--qc-card)" }}
    >
      <div className="flex h-full items-center">{leftZone}</div>

      {/* Right: user avatar */}
      <div className="flex items-center gap-4">
        <div
          className="flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: "var(--qc-ink)" }}
        >
          PJ
        </div>
      </div>
    </header>
  );
}

function TopBarGuard() {
  const pathname = usePathname();
  if (pathname === "/signin") return null;
  return (
    <Suspense
      fallback={
        <header
          className="fixed left-[72px] right-0 top-0 z-30 h-14 border-b"
          style={{ background: "var(--qc-card)", borderColor: "var(--qc-hair)" }}
        />
      }
    >
      <TopBarInner />
    </Suspense>
  );
}

export function TopBar() {
  return (
    <Suspense fallback={null}>
      <TopBarGuard />
    </Suspense>
  );
}
