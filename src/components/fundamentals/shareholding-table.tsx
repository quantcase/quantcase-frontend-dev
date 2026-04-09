"use client";

import { useState } from "react";
import type { ShareholdingSection } from "@/hooks/useShareholding";

function fmtPctVal(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `${parseFloat(v.toFixed(1)).toLocaleString("en-IN")}%`;
}

export function ShareholdingTable({
  sections,
  quarters,
  mode = "Quarterly",
}: {
  sections: ShareholdingSection[];
  quarters: string[];
  mode?: string;
}) {
  const filteredIndices =
    mode === "Annual"
      ? quarters.reduce<number[]>((acc, q, i) => {
          if (q.startsWith("MAR") || q.startsWith("Mar")) acc.push(i);
          return acc;
        }, [])
      : quarters.map((_, i) => i);
  const filteredQuarters = filteredIndices.map((i) => quarters[i]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const rows: {
    key: string;
    label: string;
    depth: number;
    isParent: boolean;
    isExpandable: boolean;
    parentId?: string;
    values: (number | null)[];
  }[] = [];

  for (const section of sections) {
    rows.push({
      key: section.id,
      label: section.label,
      depth: 0,
      isParent: section.isExpandable,
      isExpandable: section.isExpandable,
      values: filteredIndices.map((i) => section.data[i]?.value ?? null),
    });
    if (section.isExpandable && expanded.has(section.id)) {
      for (const child of section.children) {
        rows.push({
          key: child.id,
          label: child.label,
          depth: 1,
          isParent: false,
          isExpandable: false,
          parentId: section.id,
          values: filteredIndices.map((i) => child.data[i]?.value ?? null),
        });
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              className="sticky left-0 bg-white"
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#888888",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "8px 12px 8px 0",
                whiteSpace: "nowrap",
                minWidth: 200,
              }}
            >
              Category
            </th>
            {filteredQuarters.map((q) => (
              <th
                key={q}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "#888888",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                {q}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const bg = row.depth === 1 ? "#ffffff" : idx % 2 === 0 ? "#ffffff" : "#fafafa";
            return (
              <tr
                key={row.key}
                style={{
                  background: bg,
                  borderTop:
                    row.depth === 0 && row.isParent ? "1px solid #F0F0F0" : "1px solid transparent",
                }}
              >
                <td
                  className="sticky left-0"
                  style={{
                    background: bg,
                    fontSize: 13,
                    fontWeight: row.depth === 0 ? 600 : 400,
                    color: row.depth === 0 ? "#0F172B" : "#888888",
                    padding: "8px 12px 8px 0",
                    whiteSpace: "nowrap",
                    paddingLeft: row.depth === 1 ? 20 : 0,
                  }}
                >
                  {row.isExpandable ? (
                    <button
                      onClick={() => toggle(row.key)}
                      className="flex items-center gap-1.5 text-left"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        font: "inherit",
                        color: "inherit",
                        fontWeight: "inherit",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: "1px solid #E2E2E2",
                          background: "#F5F5F5",
                          fontSize: 10,
                          color: "#888888",
                          flexShrink: 0,
                          transition: "transform 0.15s",
                          transform: expanded.has(row.key) ? "rotate(90deg)" : "none",
                        }}
                      >
                        ›
                      </span>
                      {row.label}
                    </button>
                  ) : (
                    row.label
                  )}
                </td>
                {row.values.map((val, vi) => (
                  <td
                    key={vi}
                    style={{
                      fontSize: 13,
                      fontWeight: row.depth === 0 ? 600 : 400,
                      color:
                        val === null || val === undefined
                          ? "#888888"
                          : row.depth === 0
                          ? "#0F172B"
                          : "#121212",
                      padding: "8px 12px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtPctVal(val)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
