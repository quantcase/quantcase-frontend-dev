"use client";

import { ReactNode } from "react";

interface Props {
  active: boolean;
  onClick: () => void;
  /** Leading marker — an active-state dot (Configs) or a flow icon (Dispatch). */
  marker: ReactNode;
  name: string;
  sublabel: string;
}

/**
 * RailRow — one row in the shared 220px left rail used by both the Dispatch and
 * Configs panels. Keeping the row markup here guarantees the two rails stay
 * visually identical ("pick a target on the left, work on the right").
 */
export function RailRow({ active, onClick, marker, name, sublabel }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-3 text-left border-b border-hair transition-colors ${
        active ? "bg-secondary" : "hover:bg-secondary"
      }`}
    >
      {marker}
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-ink truncate">{name}</p>
        <p className="text-[10px] text-ink-3 uppercase tracking-wide">{sublabel}</p>
      </div>
    </button>
  );
}
