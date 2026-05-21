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
  /** Override the default uppercase title transform */
  titleCase?: boolean;
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
            border: `1px solid ${value === option ? "var(--qc-ink)" : "var(--qc-hair)"}`,
            background: value === option ? "var(--qc-ink)" : "transparent",
            color: value === option ? "var(--qc-on-dark)" : "var(--qc-ink-2)",
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
  titleCase,
}: TabularCardProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab ?? tabs?.[0] ?? "");

  const resolvedContent =
    typeof children === "function" ? children(activeTab) : children;

  return (
    <div
      className={className}
      style={{
        borderRadius: 10,
        border: "1px solid var(--qc-hair)",
        background: "var(--qc-section)",
        padding: 8,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ paddingBottom: 8, paddingLeft: 8, paddingRight: 8 }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--qc-ink)",
              textTransform: titleCase ? "none" : "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 12, color: "var(--qc-ink-2)", marginTop: 2 }}>{subtitle}</div>
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
          border: "1px solid var(--qc-hair-2)",
          background: "var(--qc-card)",
          padding: 8,
        }}
      >
        {resolvedContent}
      </div>
    </div>
  );
}
