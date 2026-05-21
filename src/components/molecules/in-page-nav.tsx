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
  /** When provided, the nav operates as a controlled tab switcher (no scroll-spy). */
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export function InPageNav({ items, className, activeTab, onTabChange }: InPageNavProps) {
  const tabMode = activeTab !== undefined && onTabChange !== undefined;

  const [scrollActiveId, setScrollActiveId] = useState<string>(items[0]?.id ?? "");
  const activeId = tabMode ? activeTab : scrollActiveId;

  const navRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorStyle = useRef<{ left: number; width: number }>({ left: 0, width: 0 });
  const isScrollingRef = useRef(false);

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
    const indicator = nav.querySelector<HTMLElement>("[data-indicator]");
    if (indicator) {
      indicator.style.left = `${indicatorStyle.current.left}px`;
      indicator.style.width = `${indicatorStyle.current.width}px`;
    }
  }

  // Scroll-spy — only active when not in tab mode
  useEffect(() => {
    if (tabMode) return;

    function onScroll() {
      if (isScrollingRef.current) return;

      const viewportMid = window.innerHeight / 2;
      let closestId = items[0]?.id ?? "";
      let closestDist = Infinity;

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const sectionMid = rect.top + rect.height / 2;
        const dist = Math.abs(sectionMid - viewportMid);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = item.id;
        }
      }

      if (closestId !== scrollActiveId) {
        setScrollActiveId(closestId);
        moveIndicator(closestId);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, scrollActiveId, tabMode]);

  useEffect(() => {
    moveIndicator(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    const t = setTimeout(() => moveIndicator(activeId), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(id: string) {
    if (tabMode) {
      onTabChange(id);
      moveIndicator(id);
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    setScrollActiveId(id);
    moveIndicator(id);

    isScrollingRef.current = true;

    const rect = el.getBoundingClientRect();
    const sectionMid = rect.top + window.scrollY + rect.height / 2;
    const targetScrollY = sectionMid - window.innerHeight / 2;

    window.scrollTo({ top: Math.max(0, targetScrollY), behavior: "smooth" });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 900);
  }

  return (
    <div
      className={cn("sticky z-20", className)}
      style={{ top: 56, background: "var(--qc-card)", borderBottom: "1px solid var(--qc-hair)" }}
    >
      <nav
        ref={navRef}
        className="relative flex items-center overflow-x-auto scrollbar-none"
        style={{ height: 50, gap: 22, paddingLeft: 24, paddingRight: 24, paddingTop: 8, paddingBottom: 8 }}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => { buttonRefs.current[item.id] = el; }}
              onClick={() => handleClick(item.id)}
              className="relative flex h-full items-center text-[13px] whitespace-nowrap transition-colors duration-150 focus:outline-none"
              style={{
                color: isActive ? "var(--qc-ink)" : "var(--qc-ink-2)",
                fontWeight: isActive ? 500 : 400,
                borderBottom: `1.5px solid ${isActive ? "var(--qc-ink)" : "transparent"}`,
                marginBottom: -1,
                padding: "10px 0",
              }}
            >
              {item.label}
            </button>
          );
        })}

        {/* Hidden motion indicator removed — border-bottom on button handles it */}
        <motion.span
          data-indicator
          aria-hidden
          layout
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="pointer-events-none absolute bottom-0 h-[1.5px] opacity-0"
          style={{ left: indicatorStyle.current.left, width: indicatorStyle.current.width, background: "var(--qc-ink)" }}
        />
      </nav>
    </div>
  );
}
