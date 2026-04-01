"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InPageNavItem {
  id: string;
  label: string;
}

interface InPageNavProps {
  items: InPageNavItem[];
  className?: string;
}

export function InPageNav({ items, className }: InPageNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorStyle = useRef<{ left: number; width: number }>({ left: 0, width: 0 });
  const isScrollingRef = useRef(false);

  // ── indicator positioning (direct DOM, no React re-render) ──────────────
  function moveIndicator(id: string) {
    const btn = buttonRefs.current[id];
    const nav = navRef.current;
    if (!btn || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    indicatorStyle.current = {
      left: btnRect.left - navRect.left,
      width: btnRect.width,
    };
    // Write directly so framer-motion picks it up via layout animation
    const indicator = nav.querySelector<HTMLElement>("[data-indicator]");
    if (indicator) {
      indicator.style.left = `${indicatorStyle.current.left}px`;
      indicator.style.width = `${indicatorStyle.current.width}px`;
    }
  }

  // ── scroll spy: activate the section whose centre is closest to viewport centre ──
  useEffect(() => {
    function onScroll() {
      if (isScrollingRef.current) return;

      const viewportMid = window.innerHeight / 2;
      let closestId = items[0]?.id ?? "";
      let closestDist = Infinity;

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // midpoint of the section relative to viewport
        const sectionMid = rect.top + rect.height / 2;
        const dist = Math.abs(sectionMid - viewportMid);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = item.id;
        }
      }

      if (closestId !== activeId) {
        setActiveId(closestId);
        moveIndicator(closestId);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, activeId]);

  // reposition indicator when activeId changes (e.g. window resize / initial)
  useEffect(() => {
    moveIndicator(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // initial position after layout settles
  useEffect(() => {
    const t = setTimeout(() => moveIndicator(activeId), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── click: scroll so section sits in the centre of the viewport ──────────
  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveId(id);
    moveIndicator(id);

    isScrollingRef.current = true;

    const rect = el.getBoundingClientRect();
    const sectionMid = rect.top + window.scrollY + rect.height / 2;
    const targetScrollY = sectionMid - window.innerHeight / 2;

    window.scrollTo({ top: Math.max(0, targetScrollY), behavior: "smooth" });

    // re-enable spy after smooth scroll finishes (~800 ms)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 900);
  }

  return (
    <div
      className={cn("sticky z-20 bg-white border-b border-[#E2E2E2]", className)}
      style={{ top: 48 }}
    >
      <nav
        ref={navRef}
        className="relative flex items-center gap-0 px-4 overflow-x-auto scrollbar-none"
        style={{ height: 44 }}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => { buttonRefs.current[item.id] = el; }}
              onClick={() => handleClick(item.id)}
              className={cn(
                "relative flex h-full items-center px-4 text-sm whitespace-nowrap transition-colors duration-150 focus:outline-none",
                isActive ? "text-[#0F172B] font-medium" : "text-[#888888] hover:text-[#0F172B]"
              )}
            >
              {item.label}
            </button>
          );
        })}

        {/* Animated underline — framer-motion layout drives the spring */}
        <motion.span
          data-indicator
          layout
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="pointer-events-none absolute bottom-0 h-0.5 bg-[#0F172B]"
          style={{ left: indicatorStyle.current.left, width: indicatorStyle.current.width }}
        />
      </nav>
    </div>
  );
}
