"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface LandingNavbarProps {
  ctaText?: string;
  ctaHref?: string;
}

const navLinks = [
  { label: "Framework", href: "/#framework" },
  { label: "Essays", href: "/essays" },
];

export default function LandingNavbar({
  ctaText = "Early Access",
  ctaHref = "/register",
}: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on pathname change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled || mobileMenuOpen
          ? "border-b backdrop-blur-xl"
          : "bg-transparent"
      }`}
      style={
        scrolled || mobileMenuOpen
          ? {
              background: "rgba(245,240,230,0.92)",
              borderColor: "rgba(14,26,43,0.08)",
            }
          : {}
      }
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3.5 sm:px-8 sm:py-4 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-none"
          style={{ textDecoration: "none" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Image
            src="/logos/logo-text-dark.png"
            alt="Quantcase"
            width={169}
            height={39}
            className="h-[26px] sm:h-[30px] w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((l) => {
            const isActive =
              l.href === "/essays"
                ? pathname.startsWith("/essays")
                : pathname === "/" && l.href.includes("#framework");
            return (
              <Link
                key={l.label}
                href={l.href}
                className="nav-link text-sm transition-colors"
                style={{
                  color: isActive ? "#0E1A2B" : "rgba(14,26,43,0.80)",
                  fontFamily: "'Geist', system-ui, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center">
          <Link
            href={ctaHref}
            className="lp-cta-btn group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
            style={{ textDecoration: "none" }}
          >
            {ctaText}
            <span className="inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {/* Mobile Actions: CTA + Hamburger button */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href={ctaHref}
            className="lp-cta-btn inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ textDecoration: "none" }}
          >
            {ctaText}
            <span>→</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#0E1A2B] transition-colors hover:bg-[rgba(14,26,43,0.06)]"
            style={{ minWidth: 40, minHeight: 40 }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[rgba(14,26,43,0.08)] bg-[rgba(245,240,230,0.98)] shadow-lg backdrop-blur-2xl md:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <nav className="flex flex-col space-y-1">
                <Link
                  href="/#framework"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-[#0E1A2B] transition-colors hover:bg-[rgba(14,26,43,0.05)] hover:text-[#B98A3E]"
                  style={{ textDecoration: "none", fontFamily: "'Geist', system-ui, sans-serif" }}
                >
                  <span>Framework</span>
                  <span className="text-xs uppercase tracking-widest text-[#B98A3E]">MOD</span>
                </Link>

                <Link
                  href="/essays"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-[#0E1A2B] transition-colors hover:bg-[rgba(14,26,43,0.05)] hover:text-[#B98A3E]"
                  style={{ textDecoration: "none", fontFamily: "'Geist', system-ui, sans-serif" }}
                >
                  <span>Essays</span>
                  <span className="text-xs text-[rgba(14,26,43,0.45)]">Case Studies</span>
                </Link>
              </nav>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
