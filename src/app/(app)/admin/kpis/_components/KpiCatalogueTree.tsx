"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { KpiGroupNode } from "../../kpi-groups/_components/types";

interface TreeProps {
  nodes: KpiGroupNode[];
  onSelectLeaf: (abbr: string) => void;
  fetchingAbbr: string | null;
}

// Read-only browse tree for the KPI catalogue — clicking a leaf (kpi_abbr set) opens that KPI's
// detail. Distinct from KpiGroupTree (admin/kpi-groups), which edits the tree structure itself;
// this one only navigates it.
export function KpiCatalogueTree({ nodes, onSelectLeaf, fetchingAbbr }: TreeProps) {
  const sorted = [...nodes].sort((a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label));
  return (
    <div className="rounded-[10px] border border-hair bg-card overflow-hidden">
      {sorted.map((n, i) => (
        <TreeRow key={n.id} node={n} depth={0} isLast={i === sorted.length - 1} onSelectLeaf={onSelectLeaf} fetchingAbbr={fetchingAbbr} />
      ))}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  isLast,
  onSelectLeaf,
  fetchingAbbr,
}: {
  node: KpiGroupNode;
  depth: number;
  isLast: boolean;
  onSelectLeaf: (abbr: string) => void;
  fetchingAbbr: string | null;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = !!node.children && node.children.length > 0;
  const isLeaf = !!node.kpi_abbr;
  const children = node.children
    ? [...node.children].sort((a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label))
    : [];

  return (
    <div className={!isLast ? "border-b border-hair" : ""}>
      <div
        className={`flex items-center gap-2 px-3 py-2 transition-colors ${isLeaf ? "hover:bg-secondary cursor-pointer" : ""}`}
        style={{ paddingLeft: 12 + depth * 20 }}
        onClick={isLeaf ? () => onSelectLeaf(node.kpi_abbr!) : undefined}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className={`flex items-center justify-center size-4 shrink-0 text-ink-3 ${hasChildren ? "hover:text-ink" : "opacity-0 pointer-events-none"}`}
        >
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>

        <span className="text-[13px] font-medium text-ink truncate">{node.label}</span>

        {isLeaf && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue-soft rounded-sm px-1.5 py-0.5 shrink-0 font-mono">
            {node.kpi_abbr}
          </span>
        )}
        {fetchingAbbr === node.kpi_abbr && <Loader2 className="size-3 animate-spin text-ink-3 shrink-0" />}
      </div>

      {expanded && hasChildren && (
        <div>
          {children.map((c, i) => (
            <TreeRow key={c.id} node={c} depth={depth + 1} isLast={i === children.length - 1} onSelectLeaf={onSelectLeaf} fetchingAbbr={fetchingAbbr} />
          ))}
        </div>
      )}
    </div>
  );
}
