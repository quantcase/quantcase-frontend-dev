"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { Network, ChevronRight, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SignalSeverity = "critical" | "warning" | "moderate" | "clean";

export interface AssetSubclass {
  id: string;
  label: string;
  severity: SignalSeverity;
  signal?: string;
}

export interface AssetClass {
  id: string;
  label: string;
  severity: SignalSeverity;
  subclasses: AssetSubclass[];
}

export interface RMClient {
  id: string;
  name: string;
  aum: string;
  severity: SignalSeverity;
  assetClasses: AssetClass[];
}

export interface RMNode {
  id: string;
  name: string;
  initials: string;
  severity: SignalSeverity;
  clients: RMClient[];
}

// ── Severity config ───────────────────────────────────────────────────────────

const SEV: Record<SignalSeverity, {
  bg: string; border: string; text: string; edge: string; glow: string; label: string;
}> = {
  critical: { bg: "#FEF2F2", border: "#ef4444", text: "#dc2626", edge: "#fca5a5", glow: "rgba(239,68,68,0.20)", label: "Critical" },
  warning:  { bg: "#FFFBEB", border: "#f59e0b", text: "#d97706", edge: "#fde68a", glow: "rgba(245,158,11,0.20)", label: "Warning"  },
  moderate: { bg: "#EFF6FF", border: "#3b82f6", text: "#2563eb", edge: "#bfdbfe", glow: "rgba(59,130,246,0.20)", label: "Moderate" },
  clean:    { bg: "#F0FDF4", border: "#10b981", text: "#059669", edge: "#a7f3d0", glow: "rgba(16,185,129,0.20)", label: "Clean"    },
};

// Radius by severity (RM nodes — bigger = worse)
const RM_RADIUS: Record<SignalSeverity, number> = {
  critical: 44,
  warning:  38,
  moderate: 33,
  clean:    30,
};

const TIER_RADIUS: Record<string, number> = { rm: 0, client: 26, asset: 20, sub: 14 };

// ── Node data shapes ──────────────────────────────────────────────────────────

type NodeKind = "rm" | "client" | "asset" | "sub";

interface SignalNodeData extends Record<string, unknown> {
  label: string;
  initials: string;
  sublabel?: string;
  severity: SignalSeverity;
  kind: NodeKind;
  rmId: string;
  signal?: string;
  hasChildren: boolean;
  expanded: boolean;
  // RM-only enrichment
  rmStats?: {
    clientCount: number;
    totalAum: string;
    criticalCount: number;
    warningCount: number;
    cleanCount: number;
  };
}

// ── RM Card Node ──────────────────────────────────────────────────────────────

function RMCardNode({ data }: NodeProps) {
  const d = data as SignalNodeData;
  const cfg = SEV[d.severity];
  const r = RM_RADIUS[d.severity];
  const showPulse = d.severity === "critical" || d.severity === "warning";
  const stats = d.rmStats;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 24 }}
      style={{ pointerEvents: "all", cursor: "pointer" }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      {/* Outer card */}
      <motion.div
        className="rounded-2xl flex flex-col items-center"
        style={{
          background: "#fff",
          border: `1.5px solid ${cfg.border}`,
          boxShadow: `0 4px 24px ${cfg.glow}, 0 1px 4px rgba(0,0,0,0.06)`,
          padding: "14px 18px 12px",
          minWidth: 160,
          position: "relative",
        }}
        whileHover={{ scale: 1.03, boxShadow: `0 8px 32px ${cfg.glow}` }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Severity badge top-right */}
        <div
          className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
          style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}33` }}
        >
          {cfg.label}
        </div>

        {/* Avatar circle */}
        <div className="relative mb-2">
          {showPulse && (
            <motion.div
              className="absolute rounded-full"
              style={{
                width: r * 2 + 10, height: r * 2 + 10,
                border: `1.5px dashed ${cfg.border}`,
                top: -5, left: -5,
                opacity: 0.6,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
          )}
          {(d.severity === "critical" || d.severity === "warning") && (
            <motion.div
              className="absolute rounded-full"
              style={{ width: r * 2 + 6, height: r * 2 + 6, top: -3, left: -3, background: cfg.glow }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
          )}
          <div
            className="rounded-full flex items-center justify-center relative z-10"
            style={{
              width: r * 2,
              height: r * 2,
              background: cfg.bg,
              border: `2px solid ${cfg.border}`,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 800, color: cfg.text, fontFamily: "IBM Plex Sans, sans-serif", letterSpacing: "-0.02em" }}>
              {d.initials}
            </span>
          </div>
          {/* Expand chevron */}
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 z-20 rounded-full flex items-center justify-center"
            style={{ width: 16, height: 16, background: cfg.border, border: "2px solid white" }}
            animate={{ rotate: d.expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
              <path d="M1 2.5L3.5 5L6 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>

        {/* Name */}
        <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172B", fontFamily: "IBM Plex Sans, sans-serif", textAlign: "center", marginBottom: 6 }}>
          {d.label}
        </p>

        {/* Stats row */}
        {stats && (
          <div className="w-full flex flex-col gap-1.5">
            {/* Divider */}
            <div style={{ height: 1, background: "#F0F0F0", marginBottom: 2 }} />

            {/* Clients + AUM */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <Users style={{ width: 10, height: 10, color: "#888" }} />
                <span style={{ fontSize: 10, color: "#888", fontFamily: "IBM Plex Sans, sans-serif" }}>
                  {stats.clientCount} clients
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp style={{ width: 10, height: 10, color: "#888" }} />
                <span style={{ fontSize: 10, color: "#888", fontFamily: "IBM Plex Sans, sans-serif" }}>
                  {stats.totalAum}
                </span>
              </div>
            </div>

            {/* Signal breakdown */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {stats.criticalCount > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="rounded-full inline-block" style={{ width: 6, height: 6, background: SEV.critical.border }} />
                  <span style={{ fontSize: 9, color: SEV.critical.text, fontWeight: 600, fontFamily: "IBM Plex Sans, sans-serif" }}>
                    {stats.criticalCount}
                  </span>
                </div>
              )}
              {stats.warningCount > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="rounded-full inline-block" style={{ width: 6, height: 6, background: SEV.warning.border }} />
                  <span style={{ fontSize: 9, color: SEV.warning.text, fontWeight: 600, fontFamily: "IBM Plex Sans, sans-serif" }}>
                    {stats.warningCount}
                  </span>
                </div>
              )}
              {stats.cleanCount > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="rounded-full inline-block" style={{ width: 6, height: 6, background: SEV.clean.border }} />
                  <span style={{ fontSize: 9, color: SEV.clean.text, fontWeight: 600, fontFamily: "IBM Plex Sans, sans-serif" }}>
                    {stats.cleanCount} ok
                  </span>
                </div>
              )}
              {stats.criticalCount === 0 && stats.warningCount === 0 && (
                <span style={{ fontSize: 9, color: SEV.clean.text, fontWeight: 600, fontFamily: "IBM Plex Sans, sans-serif" }}>
                  All clear
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Standard Signal Node (client / asset / sub) ───────────────────────────────

function SignalNode({ data }: NodeProps) {
  const d = data as SignalNodeData;
  const cfg = SEV[d.severity];
  const r = TIER_RADIUS[d.kind] ?? 16;
  const size = r * 2;

  const fontSize = d.kind === "client" ? 10 : d.kind === "asset" ? 9 : 8;
  const labelSize = d.kind === "client" ? 11 : 10;
  const showPulse = d.severity === "critical" || d.severity === "warning";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 22, mass: 0.8 }}
      className="flex flex-col items-center"
      style={{ cursor: d.hasChildren ? "pointer" : "default", pointerEvents: "all" }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {showPulse && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: size + 10, height: size + 10, border: `1.5px dashed ${cfg.border}`, top: -5, left: -5, opacity: 0.5 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        )}
        {showPulse && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: size + 6, height: size + 6, top: -3, left: -3, background: cfg.glow }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.div
          className="rounded-full flex items-center justify-center relative z-10"
          style={{ width: size, height: size, background: cfg.bg, border: `2px solid ${cfg.border}`, boxShadow: `0 2px 8px ${cfg.glow}` }}
          whileHover={{ scale: 1.12 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <span style={{ fontSize, fontWeight: 700, color: cfg.text, fontFamily: "IBM Plex Sans, sans-serif" }}>
            {d.initials}
          </span>
        </motion.div>
        {d.hasChildren && (
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 z-20 rounded-full flex items-center justify-center"
            style={{ width: 13, height: 13, background: cfg.border, border: "1.5px solid white" }}
            animate={{ rotate: d.expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <svg width="6" height="6" viewBox="0 0 7 7" fill="none">
              <path d="M1 2.5L3.5 5L6 2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
      </div>

      <div className="mt-1.5 text-center" style={{ maxWidth: size + 40 }}>
        <p style={{ fontSize: labelSize, fontWeight: d.kind === "client" ? 600 : 500, color: "#0F172B", fontFamily: "IBM Plex Sans, sans-serif", whiteSpace: "nowrap" }}>
          {d.label}
        </p>
        {d.sublabel && (
          <p style={{ fontSize: 9, color: "#888888", fontFamily: "IBM Plex Sans, sans-serif" }}>{d.sublabel}</p>
        )}
        {d.signal && (
          <p style={{ fontSize: 8, color: cfg.text, fontFamily: "IBM Plex Sans, sans-serif", fontWeight: 600 }}>{d.signal}</p>
        )}
      </div>
    </motion.div>
  );
}

const nodeTypes = { rmCard: RMCardNode, signal: SignalNode };

// ── Graph builder ─────────────────────────────────────────────────────────────

const Y_TIERS: Record<string, number> = { rm: 0, client: 220, asset: 380, sub: 510 };
const X_GAPS:  Record<string, number> = { rm: 200, client: 120, asset: 84, sub: 60 };

// Parse AUM strings like "₹3.2 Cr" → number in Cr
function parseAum(aum: string): number {
  const m = aum.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function formatAum(cr: number): string {
  if (cr >= 100) return `₹${(cr / 100).toFixed(1)}k Cr`;
  return `₹${cr.toFixed(1)} Cr`;
}

function buildNodesEdges(
  rms: RMNode[],
  expandedIds: Set<string>,
  containerWidth: number,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const abbrev   = (label: string, chars = 3) => label.split(" ")[0].slice(0, chars).toUpperCase();

  interface TreeNode {
    id: string;
    kind: NodeKind;
    label: string;
    initials: string;
    sublabel?: string;
    severity: SignalSeverity;
    signal?: string;
    rmId: string;
    children: TreeNode[];
    rmStats?: SignalNodeData["rmStats"];
  }

  const buildTree = (rm: RMNode): TreeNode => {
    const allSubclasses = rm.clients.flatMap((c) => c.assetClasses.flatMap((a) => a.subclasses));
    const totalAumCr = rm.clients.reduce((s, c) => s + parseAum(c.aum), 0);
    return {
      id: rm.id,
      kind: "rm",
      label: rm.name,
      initials: initials(rm.name),
      severity: rm.severity,
      rmId: rm.id,
      rmStats: {
        clientCount: rm.clients.length,
        totalAum: formatAum(totalAumCr),
        criticalCount: allSubclasses.filter((s) => s.severity === "critical").length,
        warningCount:  allSubclasses.filter((s) => s.severity === "warning").length,
        cleanCount:    allSubclasses.filter((s) => s.severity === "clean").length,
      },
      children: rm.clients.map((c) => ({
        id: c.id, kind: "client" as NodeKind,
        label: c.name, initials: initials(c.name), sublabel: c.aum,
        severity: c.severity, rmId: rm.id,
        children: c.assetClasses.map((ac) => ({
          id: ac.id, kind: "asset" as NodeKind,
          label: ac.label, initials: abbrev(ac.label),
          severity: ac.severity, rmId: rm.id,
          children: ac.subclasses.map((s) => ({
            id: s.id, kind: "sub" as NodeKind,
            label: s.label, initials: abbrev(s.label),
            severity: s.severity, signal: s.signal, rmId: rm.id,
            children: [],
          })),
        })),
      })),
    };
  };

  const subtreeWidth = (node: TreeNode): number => {
    const visible = expandedIds.has(node.id) ? node.children : [];
    if (visible.length === 0) return X_GAPS[node.kind];
    return visible.reduce((s, c) => s + subtreeWidth(c), 0);
  };

  const placeNode = (node: TreeNode, cx: number, parentId: string | null, parentSev: SignalSeverity | null) => {
    const isExpanded = expandedIds.has(node.id);
    const visible = isExpanded ? node.children : [];
    const hasChildren = node.children.length > 0;
    const isRM = node.kind === "rm";

    const r = isRM ? RM_RADIUS[node.severity] : TIER_RADIUS[node.kind];
    // RM card is wider
    const nodeW = isRM ? 180 : r * 2 + 48;
    const nodeH = isRM ? 180 : r * 2 + 44;

    nodes.push({
      id: node.id,
      type: isRM ? "rmCard" : "signal",
      position: { x: cx - nodeW / 2, y: Y_TIERS[node.kind] },
      data: {
        label: node.label, initials: node.initials,
        sublabel: node.sublabel, severity: node.severity,
        kind: node.kind, rmId: node.rmId, signal: node.signal,
        hasChildren, expanded: isExpanded,
        rmStats: node.rmStats,
      } satisfies SignalNodeData,
      style: { width: nodeW, height: nodeH },
    });

    if (parentId && parentSev) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId, target: node.id,
        type: "smoothstep",
        style: { stroke: SEV[parentSev].edge, strokeWidth: 2, strokeOpacity: 0.8 },
        animated: parentSev === "critical",
      });
    }

    if (visible.length > 0) {
      const totalW = visible.reduce((s, c) => s + subtreeWidth(c), 0);
      let ox = cx - totalW / 2;
      for (const child of visible) {
        const cw = subtreeWidth(child);
        placeNode(child, ox + cw / 2, node.id, node.severity);
        ox += cw;
      }
    }
  };

  const trees = rms.map(buildTree);
  const totalW = trees.reduce((s, t) => s + subtreeWidth(t), 0);
  let ox = containerWidth > 0 ? (containerWidth - totalW) / 2 : 0;
  for (const tree of trees) {
    const tw = subtreeWidth(tree);
    placeNode(tree, ox + tw / 2, null, null);
    ox += tw;
  }

  return { nodes, edges };
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center gap-4">
      {(["critical", "warning", "moderate", "clean"] as SignalSeverity[]).map((sev) => (
        <div key={sev} className="flex items-center gap-1.5">
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: SEV[sev].border }} />
          <span className="text-[10px] font-medium" style={{ color: "#888888" }}>{SEV[sev].label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Inner graph (needs ReactFlow context) ─────────────────────────────────────

interface InnerGraphProps {
  rms: RMNode[];
  expandedIds: Set<string>;
  handleToggle: (id: string) => void;
  isFullyExpanded: boolean;
  setExpandedIds: (fn: (prev: Set<string>) => Set<string>) => void;
  critCount: number;
  warnCount: number;
  className?: string;
}

function InnerGraph({ rms, expandedIds, handleToggle, isFullyExpanded, setExpandedIds, critCount, warnCount, className }: InnerGraphProps) {
  const { fitView } = useReactFlow();
  const CONTAINER_W = 760;

  const { nodes, edges } = useMemo(
    () => buildNodesEdges(rms, expandedIds, CONTAINER_W),
    [rms, expandedIds],
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const d = node.data as SignalNodeData;
    if (!d.hasChildren) return;

    handleToggle(node.id);

    // After state update, fit to the clicked node's children
    setTimeout(() => {
      fitView({ padding: 0.3, duration: 500, minZoom: 0.4, maxZoom: 1.2 });
    }, 80);
  }, [handleToggle, fitView]);

  return (
    <div className={cn("rounded-[10px] border border-[#E2E2E2] bg-[#F5F5F5] p-2 flex flex-col", className)}>
      {/* Header */}
      <div className="px-2 pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="size-3.5 text-[#888888]" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", textTransform: "uppercase", letterSpacing: "0.01em" }}>
            RM Portfolio Signal Map
          </span>
          {critCount > 0 && (
            <span className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
              style={{ background: "#FEF2F2", color: "#dc2626", border: "1px solid #fca5a533" }}>
              {critCount} Critical
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[9px] font-semibold uppercase tracking-wider rounded-sm px-1.5 py-0.5"
              style={{ background: "#FFFBEB", color: "#d97706", border: "1px solid #fde68a33" }}>
              {warnCount} Warning
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Legend />
          <button
            onClick={() => {
              if (isFullyExpanded) {
                setExpandedIds(() => new Set());
                setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 80);
              } else {
                const all = new Set<string>();
                rms.forEach((rm) => {
                  all.add(rm.id);
                  rm.clients.forEach((c) => { all.add(c.id); c.assetClasses.forEach((a) => all.add(a.id)); });
                });
                setExpandedIds(() => all);
                setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 80);
              }
            }}
            className="flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-1 border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] transition-colors"
            style={{ color: "#888888" }}
          >
            {isFullyExpanded ? "Collapse" : "Full View"} <ChevronRight className="size-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="rounded-[10px] bg-white border border-[rgba(226,226,226,0.10)] overflow-hidden flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.4, maxZoom: 1.4 }}
          minZoom={0.25}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          selectNodesOnDrag={false}
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
          onNodeClick={onNodeClick}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E8E8E8" />
        </ReactFlow>
      </div>

      <p className="text-center text-[10px] mt-1.5" style={{ color: "rgba(18,18,18,0.28)" }}>
        Click any node to expand · scroll to zoom · drag to pan
      </p>
    </div>
  );
}

// ── Main component (wraps with ReactFlowProvider) ─────────────────────────────

interface RMPortfolioSignalGraphProps {
  rms: RMNode[];
  className?: string;
}

export function RMPortfolioSignalGraph({ rms, className }: RMPortfolioSignalGraphProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        const toCollapse = new Set<string>();
        const collect = (nodeId: string) => {
          toCollapse.add(nodeId);
          for (const rm of rms) {
            if (rm.id === nodeId) rm.clients.forEach((c) => collect(c.id));
            else for (const c of rm.clients) {
              if (c.id === nodeId) c.assetClasses.forEach((a) => collect(a.id));
              else for (const a of c.assetClasses) {
                if (a.id === nodeId) a.subclasses.forEach((s) => collect(s.id));
              }
            }
          }
        };
        collect(id);
        toCollapse.forEach((i) => next.delete(i));
      } else {
        next.add(id);
      }
      return next;
    });
  }, [rms]);

  const critCount = rms.flatMap((r) => r.clients).filter((c) => c.severity === "critical").length
    + rms.filter((r) => r.severity === "critical").length;
  const warnCount = rms.flatMap((r) => r.clients).filter((c) => c.severity === "warning").length
    + rms.filter((r) => r.severity === "warning").length;

  return (
    <ReactFlowProvider>
      <InnerGraph
        rms={rms}
        expandedIds={expandedIds}
        handleToggle={handleToggle}
        isFullyExpanded={expandedIds.size > 0}
        setExpandedIds={setExpandedIds}
        critCount={critCount}
        warnCount={warnCount}
        className={className}
      />
    </ReactFlowProvider>
  );
}
