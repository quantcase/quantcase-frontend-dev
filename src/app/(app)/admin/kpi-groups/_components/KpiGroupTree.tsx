"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { KpiGroupNode, collectDescendantIds } from "./types";

interface TreeProps {
  nodes: KpiGroupNode[];
  onAddChild: (parentId: string) => void;
  onEdit: (node: KpiGroupNode) => void;
  onDelete: (node: KpiGroupNode) => void;
}

export function KpiGroupTree({ nodes, onAddChild, onEdit, onDelete }: TreeProps) {
  const sorted = [...nodes].sort((a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label));
  return (
    <div className="rounded-[10px] border border-hair bg-card overflow-hidden">
      {sorted.map((n, i) => (
        <TreeRow key={n.id} node={n} depth={0} isLast={i === sorted.length - 1} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  isLast,
  onAddChild,
  onEdit,
  onDelete,
}: {
  node: KpiGroupNode;
  depth: number;
  isLast: boolean;
  onAddChild: (parentId: string) => void;
  onEdit: (node: KpiGroupNode) => void;
  onDelete: (node: KpiGroupNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasChildren = !!node.children && node.children.length > 0;
  const isLeaf = !!node.kpi_abbr;
  const descendantCount = confirmDelete ? collectDescendantIds(node).size : 0;

  const children = node.children ? [...node.children].sort((a, b) => a.display_order - b.display_order || a.label.localeCompare(b.label)) : [];

  return (
    <div className={!isLast ? "border-b border-hair" : ""}>
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors group" style={{ paddingLeft: 12 + depth * 20 }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`flex items-center justify-center size-4 shrink-0 text-ink-3 ${hasChildren ? "hover:text-ink" : "opacity-0 pointer-events-none"}`}
        >
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink truncate">{node.label}</span>
          <span className="text-[10px] font-mono text-ink-3 truncate">{node.slug}</span>
          {isLeaf && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-blue bg-blue-soft rounded-sm px-1.5 py-0.5 shrink-0 font-mono">
              leaf: {node.kpi_abbr}
            </span>
          )}
          {node.company_group_slug && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-secondary rounded-sm px-1.5 py-0.5 shrink-0">
              scoped: {node.company_group_slug}
            </span>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node.id)}
            title="Add child"
            className="flex size-6 items-center justify-center rounded text-ink-3 hover:text-ink hover:bg-card transition-colors"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            onClick={() => onEdit(node)}
            title="Edit"
            className="flex size-6 items-center justify-center rounded text-ink-3 hover:text-ink hover:bg-card transition-colors"
          >
            <Pencil className="size-3.5" />
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              className="flex size-6 items-center justify-center rounded text-ink-3 hover:text-down hover:bg-down-soft transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] text-down">
                {descendantCount > 0 ? `+${descendantCount} nested` : "delete"}?
              </span>
              <button onClick={() => onDelete(node)} className="text-[11px] font-medium text-down hover:underline">
                Confirm
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-ink-3 hover:text-ink">
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {children.map((c, i) => (
            <TreeRow key={c.id} node={c} depth={depth + 1} isLast={i === children.length - 1} onAddChild={onAddChild} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
