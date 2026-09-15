"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Sparkles, Users, PieChart, Wrench, LineChart } from "lucide-react";
import { Suspense, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StockSearch } from "@/components/molecules/stock-search";
import { useOverviewFetch } from "@/hooks/useOverviewAnalysis";

/** Terminal tabs that carry a stock search in the top-bar's right rail. */
const HEADER_SEARCH_PATHS = ["/screener/fundamentals", "/screener/technicals", "/screener/management", "/screener/opportunity", "/screener/deal", "/screener/overview"];

const INDUSTRY_TABS = [
  { id: "dashboard",         label: "Dashboard" },
  { id: "industry-ranking",  label: "Industry ranking" },
  { id: "deep-dive",         label: "Deep-dive" },
  { id: "stock-ranking",     label: "Stock ranking" },
  { id: "rotation-alerts",   label: "Rotation & alerts" },
  { id: "universe-browser",  label: "Universe browser" },
  { id: "news-intelligence", label: "News intelligence" },
] as const;

const quickSymbols = ["HDFC", "TCS", "INFY", "ICICI"];

const QUANTCASE_FACTOR_PATHS = ["/screener/management", "/screener/opportunity", "/screener/deal"];

const FACTOR_ITEMS = [
  { label: "Management", href: "/screener/management" },
  { label: "Opportunity", href: "/screener/opportunity" },
  { label: "Deal",        href: "/screener/deal" },
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
  grow,
}: {
  href?: string;
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** Stretch to fill available width on mobile (MOD factor tabs). */
  grow?: boolean;
}) {
  const base: React.CSSProperties = active
    ? { background: "var(--qc-ink)", color: "var(--qc-on-dark)" }
    : { background: "transparent", color: "var(--qc-ink-2)" };

  const content = (
    <span
      className={cn(
        "flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1.5 md:py-2 rounded-full text-[13px] md:text-sm transition-colors whitespace-nowrap",
        grow && "w-full justify-center",
        className,
      )}
      style={{ ...base, ...style }}
    >
      {icon}
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex min-w-0 w-full", grow && "flex-1 md:flex-none")}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn("flex min-w-0 w-full", grow && "flex-1 md:flex-none")}>
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

function useScrolled(threshold = 4) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}
function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down">("up");
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const update = () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScrollY) < 5) return;
      setDirection(scrollY > lastScrollY ? "down" : "up");
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return direction;
}

function TopBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const symbol = searchParams.get("symbol");
  const rmId = searchParams.get("rm_id");
  const scrolled = useScrolled();
  const scrollDirection = useScrollDirection();

  const { data: overviewData } = useOverviewFetch(symbol || "");

  const getScore = (type: string) => {
    if (!overviewData) return null;
    const dim = overviewData.dimensions.find((d) => d.type === type.toLowerCase());
    return dim ? Math.round(dim.score) : null;
  };
  
  const getScoreColor = (score: number | null) => {
    if (score === null) return "var(--qc-ink-3)";
    if (score >= 75) return "var(--qc-up)";
    if (score >= 60) return "var(--qc-warn)";
    return "var(--qc-down)";
  };

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

  const isIndustryTerminal = pathname === "/screener/industry-intelligence";
  const isAdmin = pathname.startsWith("/admin");
  const isInvestorDashboard = pathname === "/investor/dashboard";

  const activeIndustryTab = searchParams.get("tab") ?? "dashboard";

  const isDiary = pathname === "/diary";

  if (isHome || isScreenerHomePage || isBasketPage || isMutualFundPage || isAdmin || isInvestorDashboard || isDiary) return null;

  // Right rail: stock search on the terminal pages that opt in (desktop only —
  // mobile asset pages use the dedicated logo+search chrome below).
  const rightZone: React.ReactNode = HEADER_SEARCH_PATHS.includes(pathname) ? <StockSearch /> : null;

  let leftZone: React.ReactNode = null;

  // Normal tabs for asset view
  const terminalTabs = [
    { label: "View",         href: "/screener/overview" },
    { label: "Fundamentals", href: "/screener/fundamentals" },
    { label: "Technicals",   href: "/screener/technicals" },
  ];

  const factorTabs = (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-0.5 md:flex-none md:justify-start md:gap-0.5">
      {FACTOR_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const score = getScore(item.label);
        return (
          <PillTab
            key={item.href}
            href={withSymbol(item.href)}
            active={isActive}
            grow
            className="!px-1.5 md:!px-4 !py-1 md:!py-2 !text-[10px] md:!text-sm !gap-0.5 md:!gap-1.5"
          >
            <div className="flex min-w-0 items-center gap-0.5 md:gap-1.5">
              <span className="truncate">{item.label}</span>
              {score !== null && (
                <span
                  className="shrink-0 tabular-nums text-[10px] md:text-sm"
                  style={{ color: getScoreColor(score), fontWeight: isActive ? 600 : 500 }}
                >
                  {score}
                </span>
              )}
            </div>
          </PillTab>
        );
      })}
    </div>
  );

  if (isIndustryTerminal) {
    leftZone = (
      <div
        className="flex items-center gap-0.5 rounded-full p-1"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        {INDUSTRY_TABS.map((tab) => (
          <PillTab
            key={tab.id}
            active={activeIndustryTab === tab.id}
            onClick={() => router.push(`/screener/industry-intelligence?tab=${tab.id}`)}
          >
            {tab.label}
          </PillTab>
        ))}
      </div>
    );
  } else if (isHome || (isTerminal && !hasAssetSelected)) {
    leftZone = <SearchZone />;
  } else if (hasAssetSelected) {
    leftZone = (
      /* Desktop-only capsule: M.O.D + View/Fundamentals/Technicals */
      <div
        className="hidden md:flex items-center gap-2 rounded-full p-1"
        style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)" }}
      >
        <div
          className="flex items-center gap-0.5 rounded-full p-0.5"
          style={{ border: "1px solid var(--qc-hair)" }}
        >
          <span
            className="flex shrink-0 items-center whitespace-nowrap px-3 text-sm font-medium"
            style={{ color: "var(--qc-ink-2)", letterSpacing: "0.05em" }}
          >
            M·O·D
          </span>
          {factorTabs}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 pr-1">
          {terminalTabs.map((tab) => (
            <PillTab key={tab.href} href={withSymbol(tab.href)} active={pathname === tab.href}>
              {tab.label}
            </PillTab>
          ))}
        </div>
      </div>
    );
  } else if (isWealthOS) {
    const wealthTabs = [
      { label: "Opportunities", href: "/wealthos/opportunities", icon: <Sparkles size={13} strokeWidth={1.8} /> },
      { label: "Clients",       href: "/wealthos/clients",       icon: <Users size={13} strokeWidth={1.8} /> },
      { label: "RMs",           href: "/wealthos/rms",           icon: <Users size={13} strokeWidth={1.8} /> },
      { label: "Models",        href: "/wealthos/models",        icon: <PieChart size={13} strokeWidth={1.8} /> },
      { label: "Analytics",     href: "/wealthos/analytics",     icon: <LineChart size={13} strokeWidth={1.8} /> },
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

  const showMobileAssetChrome = hasAssetSelected;
  const headerSearch = HEADER_SEARCH_PATHS.includes(pathname);

  return (
    <>
    <motion.header
      className={cn(
        "fixed left-0 md:left-[72px] right-0 top-0 z-30 flex flex-col md:h-[60px] md:flex-row md:items-center md:px-6",
        showMobileAssetChrome ? "px-0" : "h-[60px] items-center px-2",
      )}
      animate={scrolled ? "scrolled" : "top"}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants={({
        top: {
          background: "rgba(255,255,255,0)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          borderBottom: "1px solid rgba(226,226,226,0)",
          boxShadow: "0 1px 8px rgba(0,0,0,0)",
        },
        scrolled: {
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226,226,226,0.6)",
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        },
      }) as any}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* Mobile asset chrome: logo + search + menu (screenshot match) */}
      {showMobileAssetChrome && (
        <div
          className="flex h-14 items-center gap-2.5 px-3 md:hidden"
          style={{ background: "var(--qc-bg)" }}
        >
          <Link
            href="/screener/home"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px]"
            aria-label="QuantCase home"
          >
            <Image
              src="/logos/logo-dark.png"
              alt="QuantCase"
              width={36}
              height={36}
              priority
              className="h-full w-full object-cover"
            />
          </Link>
          {headerSearch ? (
            <StockSearch className="min-w-0 flex-1 !w-auto sm:!w-auto" iconSide="right" />
          ) : (
            <div className="min-w-0 flex-1" />
          )}
        </div>
      )}

      {/* Desktop left + right; also used for non-asset mobile pages */}
      <div
        className={cn(
          "h-full min-w-0 w-full items-center",
          showMobileAssetChrome ? "hidden md:flex" : "flex",
        )}
      >
        <div className="flex h-full min-w-0 w-full items-center justify-center overflow-x-auto scrollbar-none md:w-auto md:flex-1 md:justify-start">
          {leftZone}
        </div>
        {rightZone && (
          <div className="ml-auto hidden w-[200px] shrink-0 pl-3 sm:w-[300px] md:block">
            {rightZone}
          </div>
        )}
      </div>

      {/* Mobile MOD factor row — equal slots + matching L/R padding */}
      {showMobileAssetChrome && (
        <div
          className="grid h-11 grid-cols-4 items-center gap-1 px-3 md:hidden"
          style={{ background: "var(--qc-bg)", borderBottom: "1px solid var(--qc-hair)" }}
        >
          <span
            className="flex items-center justify-center text-center text-[11px] font-medium tracking-[0.06em]"
            style={{ color: "var(--qc-ink-2)" }}
          >
            M-O-D
          </span>
          {FACTOR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const score = getScore(item.label);
            return (
              <PillTab
                key={item.href}
                href={withSymbol(item.href)}
                active={isActive}
                className="!w-full !justify-center !gap-0.5 !px-1 !py-1.5 !text-[11px]"
              >
                <div className="flex min-w-0 items-center justify-center gap-0.5">
                  <span className="truncate">{item.label}</span>
                  {score !== null && (
                    <span
                      className="shrink-0 text-[10px] font-semibold tabular-nums"
                      style={{
                        color: isActive ? "var(--qc-up)" : getScoreColor(score),
                      }}
                    >
                      {score}
                    </span>
                  )}
                </div>
              </PillTab>
            );
          })}
        </div>
      )}
    </motion.header>

      {/* Mobile-only Terminal Sub-nav (View / Fundamentals / Technicals) */}
      {hasAssetSelected && (
        <motion.div 
          initial={false}
          animate={{ y: scrolled && scrollDirection === "down" ? "-100%" : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed left-0 right-0 top-[100px] z-20 flex h-[44px] items-center overflow-x-auto scrollbar-none px-4 md:hidden"
          style={{ background: "var(--qc-bg)", borderBottom: "1px solid var(--qc-hair)" }}
        >
          <div className="mx-auto flex items-center gap-1">
            {terminalTabs.map((item) => (
              <PillTab key={item.href} href={withSymbol(item.href)} active={pathname === item.href}>
                {item.label}
              </PillTab>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}

function TopBarGuard() {
  const pathname = usePathname();
  if (pathname === "/signin") return null;
  return (
    <Suspense
      fallback={
        <header
          className="fixed left-0 top-0 z-30 h-[60px] md:left-[72px] right-0"
          style={{ background: "transparent" }}
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
