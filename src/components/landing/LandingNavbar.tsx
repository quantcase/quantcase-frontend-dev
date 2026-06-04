"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "Framework", href: "#framework" },
  { label: "Essays", href: "/essays" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b backdrop-blur-xl" : "bg-transparent"
      }`}
      style={scrolled ? { background: "rgba(245,240,230,0.70)", borderColor: "rgba(14,26,43,0.08)" } : {}}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4 md:px-12">
        <a
          href="#top"
          className="text-xl tracking-tight"
          style={{ fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)", color: "#0E1A2B", textDecoration: "none" }}
        >
          Quantcase
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="nav-link text-sm"
              style={{ color: "rgba(14,26,43,0.80)", fontFamily: "'Geist', system-ui, sans-serif", textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a href="/signin" className="lp-cta-btn group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium">
          Start free
          <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </div>
    </header>
  );
}
