"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface TabularCardProps {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  /** When provided, renders a Quarterly/Annual toggle and calls children as a render function with the active tab */
  tabs?: string[];
  defaultTab?: string;
  children: ReactNode | ((activeTab: string) => ReactNode);
  className?: string;
}

function OutlineToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: 6,
            border: `1px solid ${value === option ? "#0F172B" : "#E2E2E2"}`,
            background: value === option ? "#0F172B" : "transparent",
            color: value === option ? "#ffffff" : "#888888",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function TabularCard({
  title,
  subtitle,
  headerAction,
  tabs,
  defaultTab,
  children,
  className,
}: TabularCardProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab ?? tabs?.[0] ?? "");

  const resolvedContent =
    typeof children === "function" ? children(activeTab) : children;

  return (
    <div
      className={className}
      style={{
        borderRadius: 10,
        border: "1px solid #E2E2E2",
        background: "#F5F5F5",
        padding: 8,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ paddingTop: 4, paddingBottom: 12, paddingLeft: 8, paddingRight: 8 }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0F172B",
              textTransform: "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {tabs && (
            <OutlineToggle options={tabs} value={activeTab} onChange={setActiveTab} />
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid rgba(226, 226, 226, 0.10)",
          background: "#FFF",
          padding: 16,
        }}
      >
        {resolvedContent}
      </div>
    </div>
  );
}
