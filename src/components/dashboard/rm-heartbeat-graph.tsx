"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Sliders,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Layers
} from "lucide-react";
import { MonoLabel } from "@/components/ds";
import type { HeartbeatGraphData } from "@/types/wealthos";

// ── Types ─────────────────────────────────────────────────────────────────────

export type HoldingCategory =
  | "super_admin"
  | "cio"
  | "rm"
  | "equity"
  | "debt"
  | "mutual_fund"
  | "reit"
  | "intl"
  | "alts";

export type HealthSeverity = "critical" | "warning" | "moderate" | "clean";

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  category: HoldingCategory;
  kind: "super_admin" | "cio" | "rm" | "client" | "asset_class" | "holding";
  stage?: number;
  role?: string;
  severity: HealthSeverity;
  aum?: string;
  weight?: string;
  signal?: string;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  renderX?: number;
  renderY?: number;
  virtualZ?: number;
  parentId?: string;
  clientId?: string;
  rawId?: string;
  alertCount?: number;
  holdingCount?: number;
  details?: {
    allocation?: string;
    riskScore?: number;
    driftPct?: string;
    rebalanceDue?: boolean;
    holdingCount?: number;
    team?: string;
    title?: string;
  };
}

export interface GraphLink {
  source: string;
  target: string;
  category: HoldingCategory;
  severity: HealthSeverity;
  distance: number;
}

// ── Color Schemes (Harmonized for Solid Navy Background #210B2C) ──────────────

const NAVY_BG = "#210B2C";

const CATEGORY_COLORS: Record<HoldingCategory, { main: string; glow: string; label: string; text: string }> = {
  super_admin: {
    main: "#E11D48",
    glow: "rgba(225, 29, 72, 0.5)",
    label: "Super Admin / Owner",
    text: "#FFE4E6",
  },
  cio: {
    main: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.5)",
    label: "Chief Investment Officer",
    text: "#EDE9FE",
  },
  rm: {
    main: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.45)",
    label: "Relationship Manager",
    text: "#FEF3C7"
  },
  equity: {
    main: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.4)",
    label: "Equity",
    text: "#E0F2FE"
  },
  debt: {
    main: "#34D399",
    glow: "rgba(52, 211, 153, 0.4)",
    label: "Debt & Fixed Income",
    text: "#D1FAE5"
  },
  mutual_fund: {
    main: "#C084FC",
    glow: "rgba(192, 132, 252, 0.4)",
    label: "Mutual Funds",
    text: "#F3E8FF"
  },
  reit: {
    main: "#FBBF24",
    glow: "rgba(251, 191, 36, 0.4)",
    label: "Real Estate & REITs",
    text: "#FEF3C7"
  },
  intl: {
    main: "#2DD4BF",
    glow: "rgba(45, 212, 191, 0.4)",
    label: "International Funds",
    text: "#CCFBF1"
  },
  alts: {
    main: "#FB7185",
    glow: "rgba(251, 113, 133, 0.4)",
    label: "Private Equity & Alts",
    text: "#FFE4E6"
  }
};

const SEVERITY_COLORS: Record<HealthSeverity, { main: string; glow: string; label: string }> = {
  critical: { main: "#F87171", glow: "rgba(248, 113, 113, 0.55)", label: "Critical Drift" },
  warning:  { main: "#FBBF24", glow: "rgba(251, 191, 36, 0.45)", label: "Warning" },
  moderate: { main: "#60A5FA", glow: "rgba(96, 165, 250, 0.4)", label: "Watch" },
  clean:    { main: "#34D399", glow: "rgba(52, 211, 153, 0.4)", label: "On Track" }
};

// ── Graph Data Definition ─────────────────────────────────────────────────────

function mapAssetClass(assetClass?: string): HoldingCategory {
  if (!assetClass) return "equity";
  const ac = assetClass.toLowerCase();
  if (ac.includes("debt") || ac.includes("liquid") || ac.includes("bond")) return "debt";
  if (ac.includes("mutual") || ac.includes("mf")) return "mutual_fund";
  if (ac.includes("reit") || ac.includes("real_estate")) return "reit";
  if (ac.includes("intl") || ac.includes("global")) return "intl";
  if (ac.includes("alt") || ac.includes("pms") || ac.includes("aif") || ac.includes("private")) return "alts";
  return "equity";
}

function createInitialGraphData(externalData?: HeartbeatGraphData | null): { nodes: GraphNode[]; links: GraphLink[] } {
  if (externalData && externalData.nodes && externalData.nodes.length > 0) {
    const dynNodes: GraphNode[] = [];
    const dynLinks: GraphLink[] = [];
    const addedLinks = new Set<string>();

    const alertsByHolding = new Map<string, any[]>();
    for (const a of externalData.alerts || []) {
      const list = alertsByHolding.get(a.holding_id) || [];
      list.push(a);
      alertsByHolding.set(a.holding_id, list);
    }

    // 1. Identify Center Node (Stage 0)
    const centerRaw =
      externalData.nodes.find((n) => n.stage === 0) ||
      externalData.nodes.find((n) => n.id === externalData.meta?.center_id) ||
      externalData.nodes.find((n) => n.type === "super_admin" || n.type === "cio" || n.type === "rm") ||
      externalData.nodes[0];

    const centerKind: "super_admin" | "cio" | "rm" =
      centerRaw.type === "super_admin"
        ? "super_admin"
        : centerRaw.type === "cio"
        ? "cio"
        : "rm";

    const centerCategory: HoldingCategory = centerKind;
    const isExecutive = centerKind === "super_admin";
    const isCio = centerKind === "cio";

    dynNodes.push({
      id: centerRaw.id,
      label: centerRaw.label,
      sublabel: `${
        isExecutive
          ? "Firm Owner"
          : isCio
          ? "Chief Investment Officer"
          : centerRaw.title || "Relationship Manager"
      } · ₹${centerRaw.aum_cr || externalData.meta?.total_aum_cr || 0} Cr`,
      category: centerCategory,
      kind: centerKind,
      stage: 0,
      role: centerRaw.role,
      severity: (centerRaw.alert_count || 0) > 0 ? "critical" : "clean",
      radius: isExecutive ? 30 : 28,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rawId: centerRaw.raw_id,
      details: {
        allocation: "100%",
        holdingCount: externalData.nodes.filter((n) => n.type === "holding").length,
        team: centerRaw.team,
        title: centerRaw.title,
      },
    });

    const addLink = (
      src: string,
      tgt: string,
      cat: HoldingCategory,
      sev: HealthSeverity,
      dist: number
    ) => {
      const key = `${src}->${tgt}`;
      if (!addedLinks.has(key)) {
        addedLinks.add(key);
        dynLinks.push({
          source: src,
          target: tgt,
          category: cat,
          severity: sev,
          distance: dist,
        });
      }
    };

    // 2. Identify remaining tiers
    const cioNodes = externalData.nodes.filter((n) => n.type === "cio" && n.id !== centerRaw.id);
    const rmNodes = externalData.nodes.filter((n) => n.type === "rm" && n.id !== centerRaw.id);
    const clientNodes = externalData.nodes.filter((n) => n.type === "client");
    const holdingNodes = externalData.nodes.filter((n) => n.type === "holding");

    // Connected holdings map
    const holdingByParent = new Map<string, typeof holdingNodes>();
    holdingNodes.forEach((h) => {
      const pid = h.parent_id || (externalData.edges || []).find((e) => e.target === h.id)?.source || "";
      if (pid) {
        const list = holdingByParent.get(pid) || [];
        list.push(h);
        holdingByParent.set(pid, list);
      }
    });

    if (isExecutive) {
      // ── Stage 1: CIO Desk(s) ──
      cioNodes.forEach((cio, idx) => {
        const angle = (idx / Math.max(1, cioNodes.length)) * Math.PI * 2 - Math.PI / 2;
        const dist = 180;
        const cx = Math.cos(angle) * dist;
        const cy = Math.sin(angle) * dist;
        dynNodes.push({
          id: cio.id,
          label: cio.label,
          sublabel: `CIO Desk · ₹${cio.aum_cr || externalData.meta?.total_aum_cr || 0} Cr`,
          category: "cio",
          kind: "cio",
          stage: 1,
          parentId: centerRaw.id,
          rawId: cio.raw_id,
          severity: (cio.alert_count || 0) > 0 ? "critical" : "clean",
          radius: 24,
          x: cx,
          y: cy,
          vx: 0,
          vy: 0,
          details: { team: cio.team, title: cio.title },
        });
        addLink(centerRaw.id, cio.id, "cio", (cio.alert_count || 0) > 0 ? "critical" : "clean", 180);
      });

      // ── Stage 2: RMs ──
      const rmsByCio = new Map<string, typeof rmNodes>();
      rmNodes.forEach((rm, idx) => {
        const pId = rm.parent_id || (cioNodes.length > 0 ? cioNodes[idx % cioNodes.length].id : centerRaw.id);
        const list = rmsByCio.get(pId) || [];
        list.push(rm);
        rmsByCio.set(pId, list);
      });

      const rmCount = rmNodes.length;
      rmNodes.forEach((rm, rmIdx) => {
        const parentId = rm.parent_id || (cioNodes.length > 0 ? cioNodes[rmIdx % cioNodes.length].id : centerRaw.id);
        const parentCioIdx = cioNodes.findIndex((c) => c.id === parentId);

        let angle: number;
        if (parentCioIdx !== -1 && cioNodes.length > 0) {
          const cioAngle = (parentCioIdx / cioNodes.length) * Math.PI * 2 - Math.PI / 2;
          const siblings = rmsByCio.get(parentId) || [rm];
          const subIdx = Math.max(0, siblings.findIndex((s) => s.id === rm.id));
          const subCount = siblings.length;
          const spread = Math.min(Math.PI * 0.85, 0.65 * Math.max(1, subCount - 1));
          const offset = subCount > 1 ? (subIdx - (subCount - 1) / 2) * (spread / Math.max(1, subCount - 1)) : 0;
          angle = cioAngle + offset;
        } else {
          angle = (rmIdx / Math.max(1, rmCount)) * Math.PI * 2 - Math.PI / 2;
        }

        const dist = 340;
        const rx = Math.cos(angle) * dist;
        const ry = Math.sin(angle) * dist;

        dynNodes.push({
          id: rm.id,
          label: rm.label,
          sublabel: `RM · ₹${rm.aum_cr || 0} Cr`,
          category: "rm",
          kind: "rm",
          stage: 2,
          parentId,
          rawId: rm.raw_id,
          severity: (rm.alert_count || 0) > 0 ? "critical" : "clean",
          radius: 20,
          x: rx,
          y: ry,
          vx: 0,
          vy: 0,
          details: { team: rm.team, title: rm.title },
        });
        addLink(parentId, rm.id, "rm", (rm.alert_count || 0) > 0 ? "critical" : "clean", 160);

        // ── Stage 3: Clients under this RM ──
        const rmClients = clientNodes.filter(
          (c) => c.parent_id === rm.id || (c as any).rm_id === rm.raw_id
        );
        const cCount = rmClients.length;
        const sectorSpan = Math.min(Math.PI * 0.78, (Math.PI * 2 / Math.max(1, rmCount)) * 0.85);

        rmClients.forEach((c, cIdx) => {
          const cOffset = cCount > 1 ? (cIdx - (cCount - 1) / 2) * (sectorSpan / Math.max(1, cCount - 1)) : 0;
          const cAngle = angle + cOffset;
          const cDist = 175;
          const cx = rx + Math.cos(cAngle) * cDist;
          const cy = ry + Math.sin(cAngle) * cDist;

          let severity: HealthSeverity = "clean";
          if ((c.alert_count || 0) > 0) severity = "critical";
          else if ((c.churn_probability || 0) > 0.4) severity = "warning";

          dynNodes.push({
            id: c.id,
            label: c.label,
            sublabel: `₹${c.aum_cr || 0} Cr · ${c.segment || "HNI"}`,
            category: "rm",
            kind: "client",
            stage: 3,
            parentId: rm.id,
            clientId: c.raw_id,
            rawId: c.raw_id,
            severity,
            aum: `₹${c.aum_cr || 0} Cr`,
            radius: 14,
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            details: {
              allocation: `${c.segment || "HNI"}`,
              holdingCount: c.holding_count,
            },
          });
          addLink(rm.id, c.id, "rm", severity, 175);

          // ── Stage 4: Holdings under Client ──
          const cHolds = holdingByParent.get(c.id) || [];
          const hCount = cHolds.length;
          const cRadAngle = Math.atan2(cy, cx);
          const hSpread = Math.min(Math.PI * 0.9, 0.32 * hCount);

          cHolds.forEach((h, hIdx) => {
            const hOffset = hCount > 1 ? (hIdx - (hCount - 1) / 2) * (hSpread / Math.max(1, hCount - 1)) : 0;
            const hAngle = cRadAngle + hOffset;
            const hDist = 80;
            const hx = cx + Math.cos(hAngle) * hDist;
            const hy = cy + Math.sin(hAngle) * hDist;

            const holdingAlerts = alertsByHolding.get(h.id) || [];
            const hasAlert = holdingAlerts.length > 0 || h.has_alert;
            const hSeverity: HealthSeverity = hasAlert ? "critical" : "clean";
            const cat = mapAssetClass(h.asset_class);

            dynNodes.push({
              id: h.id,
              label: h.label,
              sublabel: h.weight_pct ? `${h.weight_pct}%` : undefined,
              category: cat,
              kind: "holding",
              stage: 4,
              parentId: c.id,
              clientId: c.raw_id,
              rawId: h.raw_id,
              severity: hSeverity,
              weight: h.weight_pct ? `${h.weight_pct}%` : undefined,
              radius: 6,
              x: hx,
              y: hy,
              vx: 0,
              vy: 0,
              details: {
                allocation: h.weight_pct ? `${h.weight_pct}%` : undefined,
              },
            });
            addLink(c.id, h.id, cat, hSeverity, 80);
          });
        });
      });
    } else if (isCio) {
      // ── Stage 1: RMs around CIO ──
      const rmCount = rmNodes.length;
      rmNodes.forEach((rm, rmIdx) => {
        const angle = (rmIdx / Math.max(1, rmCount)) * Math.PI * 2 - Math.PI / 2;
        const dist = 225;
        const rx = Math.cos(angle) * dist;
        const ry = Math.sin(angle) * dist;

        dynNodes.push({
          id: rm.id,
          label: rm.label,
          sublabel: `RM · ₹${rm.aum_cr || 0} Cr`,
          category: "rm",
          kind: "rm",
          stage: 1,
          parentId: centerRaw.id,
          rawId: rm.raw_id,
          severity: (rm.alert_count || 0) > 0 ? "critical" : "clean",
          radius: 22,
          x: rx,
          y: ry,
          vx: 0,
          vy: 0,
          details: { team: rm.team, title: rm.title },
        });
        addLink(centerRaw.id, rm.id, "rm", (rm.alert_count || 0) > 0 ? "critical" : "clean", 225);

        // ── Stage 2: Clients under this RM ──
        const rmClients = clientNodes.filter(
          (c) => c.parent_id === rm.id || (c as any).rm_id === rm.raw_id
        );
        const cCount = rmClients.length;
        const sectorSpan = (Math.PI * 2 / Math.max(1, rmCount)) * 0.78;

        rmClients.forEach((c, cIdx) => {
          const cOffset = cCount > 1 ? (cIdx - (cCount - 1) / 2) * (sectorSpan / Math.max(1, cCount - 1)) : 0;
          const cAngle = angle + cOffset;
          const cDist = 180;
          const cx = rx + Math.cos(cAngle) * cDist;
          const cy = ry + Math.sin(cAngle) * cDist;

          let severity: HealthSeverity = "clean";
          if ((c.alert_count || 0) > 0) severity = "critical";
          else if ((c.churn_probability || 0) > 0.4) severity = "warning";

          dynNodes.push({
            id: c.id,
            label: c.label,
            sublabel: `₹${c.aum_cr || 0} Cr · ${c.segment || "HNI"}`,
            category: "rm",
            kind: "client",
            stage: 2,
            parentId: rm.id,
            clientId: c.raw_id,
            rawId: c.raw_id,
            severity,
            aum: `₹${c.aum_cr || 0} Cr`,
            radius: 15,
            x: cx,
            y: cy,
            vx: 0,
            vy: 0,
            details: {
              allocation: `${c.segment || "HNI"}`,
              holdingCount: c.holding_count,
            },
          });
          addLink(rm.id, c.id, "rm", severity, 180);

          // ── Stage 3: Holdings under Client ──
          const cHolds = holdingByParent.get(c.id) || [];
          const hCount = cHolds.length;
          const cRadAngle = Math.atan2(cy, cx);
          const hSpread = Math.min(Math.PI * 0.88, 0.30 * hCount);

          cHolds.forEach((h, hIdx) => {
            const hOffset = hCount > 1 ? (hIdx - (hCount - 1) / 2) * (hSpread / Math.max(1, hCount - 1)) : 0;
            const hAngle = cRadAngle + hOffset;
            const hDist = 80;
            const hx = cx + Math.cos(hAngle) * hDist;
            const hy = cy + Math.sin(hAngle) * hDist;

            const holdingAlerts = alertsByHolding.get(h.id) || [];
            const hasAlert = holdingAlerts.length > 0 || h.has_alert;
            const hSeverity: HealthSeverity = hasAlert ? "critical" : "clean";
            const cat = mapAssetClass(h.asset_class);

            dynNodes.push({
              id: h.id,
              label: h.label,
              sublabel: h.weight_pct ? `${h.weight_pct}%` : undefined,
              category: cat,
              kind: "holding",
              stage: 3,
              parentId: c.id,
              clientId: c.raw_id,
              rawId: h.raw_id,
              severity: hSeverity,
              weight: h.weight_pct ? `${h.weight_pct}%` : undefined,
              radius: 6.5,
              x: hx,
              y: hy,
              vx: 0,
              vy: 0,
              details: {
                allocation: h.weight_pct ? `${h.weight_pct}%` : undefined,
              },
            });
            addLink(c.id, h.id, cat, hSeverity, 80);
          });
        });
      });
    } else {
      // ── Case C: RM Mode (3-Stage: RM Center -> Clients -> Holdings) ──
      const clientCount = clientNodes.length;
      clientNodes.forEach((c, idx) => {
        const angle = (idx / Math.max(1, clientCount)) * Math.PI * 2 - Math.PI / 2;
        const clientDist = 260 + (idx % 2 === 0 ? 0 : 35);
        const cx = Math.cos(angle) * clientDist;
        const cy = Math.sin(angle) * clientDist;

        let severity: HealthSeverity = "clean";
        if ((c.alert_count || 0) > 0) severity = "critical";
        else if ((c.churn_probability || 0) > 0.4) severity = "warning";

        dynNodes.push({
          id: c.id,
          label: c.label,
          sublabel: `₹${c.aum_cr || 0} Cr · ${c.segment || "HNI"}`,
          category: "rm",
          kind: "client",
          stage: 1,
          parentId: centerRaw.id,
          clientId: c.raw_id,
          rawId: c.raw_id,
          severity,
          aum: `₹${c.aum_cr || 0} Cr`,
          radius: 16,
          x: cx + (Math.random() - 0.5) * 8,
          y: cy + (Math.random() - 0.5) * 8,
          vx: 0,
          vy: 0,
          details: {
            allocation: `${c.segment || "HNI"}`,
            holdingCount: c.holding_count,
          },
        });
        addLink(centerRaw.id, c.id, "rm", severity, clientDist);

        const cHolds = holdingByParent.get(c.id) || [];
        const hCount = cHolds.length;
        const cRadAngle = Math.atan2(cy, cx);
        const hSpread = Math.min(Math.PI * 0.88, 0.30 * hCount);

        cHolds.forEach((h, hIdx) => {
          const hOffset = hCount > 1 ? (hIdx - (hCount - 1) / 2) * (hSpread / Math.max(1, hCount - 1)) : 0;
          const hAngle = cRadAngle + hOffset;
          const hDist = 85 + (hIdx % 2 === 0 ? 0 : 18);
          const hx = cx + Math.cos(hAngle) * hDist;
          const hy = cy + Math.sin(hAngle) * hDist;

          const holdingAlerts = alertsByHolding.get(h.id) || [];
          const hasAlert = holdingAlerts.length > 0 || h.has_alert;
          const hSeverity: HealthSeverity = hasAlert ? "critical" : "clean";
          const cat = mapAssetClass(h.asset_class);

          dynNodes.push({
            id: h.id,
            label: h.label,
            sublabel: h.weight_pct ? `${h.weight_pct}%` : undefined,
            category: cat,
            kind: "holding",
            stage: 2,
            parentId: c.id,
            clientId: c.raw_id,
            rawId: h.raw_id,
            severity: hSeverity,
            weight: h.weight_pct ? `${h.weight_pct}%` : undefined,
            radius: 7,
            x: hx + (Math.random() - 0.5) * 6,
            y: hy + (Math.random() - 0.5) * 6,
            vx: 0,
            vy: 0,
            details: {
              allocation: h.weight_pct ? `${h.weight_pct}%` : undefined,
            },
          });
          addLink(c.id, h.id, cat, hSeverity, hDist);
        });
      });
    }

    // Also include any extra edges from externalData.edges that might not have been added
    (externalData.edges || []).forEach((edge) => {
      const srcNode = dynNodes.find((n) => n.id === edge.source);
      const tgtNode = dynNodes.find((n) => n.id === edge.target);
      if (srcNode && tgtNode) {
        addLink(
          edge.source,
          edge.target,
          tgtNode.category || "equity",
          tgtNode.severity || "clean",
          tgtNode.kind === "holding" ? 52 : 130
        );
      }
    });

    return { nodes: dynNodes, links: dynLinks };
  }

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Center RM Node
  nodes.push({
    id: "rm-center",
    label: "Palash Jain",
    sublabel: "Lead RM · ₹796 Cr Book",
    category: "rm",
    kind: "rm",
    severity: "moderate",
    radius: 26,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    details: {
      allocation: "100%",
      holdingCount: 52
    }
  });

  interface ClientRaw {
    id: string;
    name: string;
    aum: string;
    severity: HealthSeverity;
    signal?: string;
    assetClasses: {
      id: string;
      label: string;
      category: HoldingCategory;
      severity: HealthSeverity;
      weight: string;
      holdings: {
        id: string;
        label: string;
        weight: string;
        severity: HealthSeverity;
        signal?: string;
      }[];
    }[];
  }

  const CLIENTS_TREE: ClientRaw[] = [
    {
      id: "cli-rahul",
      name: "Rahul Mehta",
      aum: "₹3.2 Cr",
      severity: "critical",
      signal: "Drift +6% Midcap",
      assetClasses: [
        {
          id: "ac-rahul-eq",
          label: "Equity",
          category: "equity",
          severity: "critical",
          weight: "68%",
          holdings: [
            { id: "h-r-hdfc", label: "HDFCBANK", weight: "18%", severity: "clean", signal: "Core compounder" },
            { id: "h-r-jwl", label: "JWL", weight: "12%", severity: "critical", signal: "Drift +6%" },
            { id: "h-r-tatamotors", label: "TATAMOTORS", weight: "15%", severity: "warning", signal: "Watch" },
            { id: "h-r-dixon", label: "DIXON", weight: "11%", severity: "critical", signal: "Overweight" },
            { id: "h-r-tcs", label: "TCS", weight: "12%", severity: "clean" }
          ]
        },
        {
          id: "ac-rahul-mf",
          label: "Mutual Funds",
          category: "mutual_fund",
          severity: "moderate",
          weight: "22%",
          holdings: [
            { id: "h-r-hdfc-bal", label: "HDFC Balanced Adv", weight: "12%", severity: "moderate", signal: "Rebalance due" },
            { id: "h-r-ppfas", label: "Parag Parikh Flexi", weight: "10%", severity: "clean" }
          ]
        },
        {
          id: "ac-rahul-debt",
          label: "Debt & Cash",
          category: "debt",
          severity: "clean",
          weight: "10%",
          holdings: [
            { id: "h-r-gsec", label: "G-Sec 2034 7.18%", weight: "10%", severity: "clean" }
          ]
        }
      ]
    },
    {
      id: "cli-varun",
      name: "Varun Kapoor",
      aum: "₹7.1 Cr",
      severity: "critical",
      signal: "Overweight +9%",
      assetClasses: [
        {
          id: "ac-varun-eq",
          label: "Equity",
          category: "equity",
          severity: "critical",
          weight: "72%",
          holdings: [
            { id: "h-v-reliance", label: "RELIANCE", weight: "22%", severity: "clean" },
            { id: "h-v-lt", label: "L&T", weight: "18%", severity: "warning", signal: "Near cap" },
            { id: "h-v-icici", label: "ICICIBANK", weight: "16%", severity: "clean" },
            { id: "h-v-ntpc", label: "NTPC", weight: "16%", severity: "critical", signal: "Overweight +9%" }
          ]
        },
        {
          id: "ac-varun-bonds",
          label: "Bonds & G-Sec",
          category: "debt",
          severity: "clean",
          weight: "18%",
          holdings: [
            { id: "h-v-gsec", label: "G-Sec 7.38%", weight: "10%", severity: "clean" },
            { id: "h-v-corp", label: "HDFC Corp Bond", weight: "8%", severity: "clean" }
          ]
        },
        {
          id: "ac-varun-reit",
          label: "REITs",
          category: "reit",
          severity: "clean",
          weight: "10%",
          holdings: [
            { id: "h-v-embassy", label: "Embassy REIT", weight: "10%", severity: "clean" }
          ]
        }
      ]
    },
    {
      id: "cli-priya",
      name: "Priya Venkat",
      aum: "₹4.6 Cr",
      severity: "moderate",
      signal: "NPS Review Pending",
      assetClasses: [
        {
          id: "ac-priya-eq",
          label: "Equity Direct",
          category: "equity",
          severity: "moderate",
          weight: "61%",
          holdings: [
            { id: "h-p-infy", label: "INFY", weight: "16%", severity: "clean" },
            { id: "h-p-sunpharma", label: "SUNPHARMA", weight: "14%", severity: "clean" },
            { id: "h-p-lt", label: "L&T Infra", weight: "15%", severity: "moderate", signal: "Pending review" },
            { id: "h-p-bharti", label: "BHARTIARTL", weight: "16%", severity: "clean" }
          ]
        },
        {
          id: "ac-priya-intl",
          label: "International",
          category: "intl",
          severity: "warning",
          weight: "15%",
          holdings: [
            { id: "h-p-nasdaq", label: "Nasdaq 100 ETF", weight: "15%", severity: "warning", signal: "FX Exposure" }
          ]
        },
        {
          id: "ac-priya-debt",
          label: "Debt & Liquid",
          category: "debt",
          severity: "clean",
          weight: "24%",
          holdings: [
            { id: "h-p-gsec", label: "G-Sec 2030", weight: "14%", severity: "clean" },
            { id: "h-p-liquid", label: "Liquid Fund", weight: "10%", severity: "clean" }
          ]
        }
      ]
    },
    {
      id: "cli-anita",
      name: "Anita Shah",
      aum: "₹5.8 Cr",
      severity: "warning",
      signal: "EV Report Pending",
      assetClasses: [
        {
          id: "ac-anita-eq",
          label: "Equity",
          category: "equity",
          severity: "warning",
          weight: "58%",
          holdings: [
            { id: "h-a-tata", label: "TATAPOWER", weight: "18%", severity: "warning", signal: "EV Watch" },
            { id: "h-a-maruti", label: "MARUTI", weight: "14%", severity: "clean" },
            { id: "h-a-itc", label: "ITC", weight: "16%", severity: "clean" },
            { id: "h-a-polycab", label: "POLYCAB", weight: "10%", severity: "moderate" }
          ]
        },
        {
          id: "ac-anita-mf",
          label: "Mutual Funds",
          category: "mutual_fund",
          severity: "clean",
          weight: "28%",
          holdings: [
            { id: "h-a-mirae", label: "Mirae Asset Large", weight: "15%", severity: "clean" },
            { id: "h-a-sbi", label: "SBI Bluechip", weight: "13%", severity: "clean" }
          ]
        },
        {
          id: "ac-anita-reit",
          label: "Real Estate",
          category: "reit",
          severity: "clean",
          weight: "14%",
          holdings: [
            { id: "h-a-mindspace", label: "Mindspace REIT", weight: "14%", severity: "clean" }
          ]
        }
      ]
    },
    {
      id: "cli-suresh",
      name: "Suresh Nair",
      aum: "₹2.4 Cr",
      severity: "clean",
      signal: "Conservative",
      assetClasses: [
        {
          id: "ac-suresh-debt",
          label: "Debt & Liquid",
          category: "debt",
          severity: "clean",
          weight: "55%",
          holdings: [
            { id: "h-s-nabard", label: "NABARD AAA", weight: "25%", severity: "clean" },
            { id: "h-s-treasury", label: "Treasury 91D", weight: "30%", severity: "clean", signal: "Idle Cash" }
          ]
        },
        {
          id: "ac-suresh-mf",
          label: "Mutual Funds",
          category: "mutual_fund",
          severity: "clean",
          weight: "45%",
          holdings: [
            { id: "h-s-icici-bal", label: "ICICI Prudential Bal", weight: "25%", severity: "clean" },
            { id: "h-s-hdfc-short", label: "HDFC Short Term", weight: "20%", severity: "clean" }
          ]
        }
      ]
    },
    {
      id: "cli-vikram",
      name: "Vikram Malhotra",
      aum: "₹12.5 Cr",
      severity: "clean",
      signal: "UHNI Multi-Asset",
      assetClasses: [
        {
          id: "ac-vikram-eq",
          label: "Equity Core",
          category: "equity",
          severity: "clean",
          weight: "50%",
          holdings: [
            { id: "h-vk-reliance", label: "RELIANCE", weight: "15%", severity: "clean" },
            { id: "h-vk-hdfc", label: "HDFCBANK", weight: "15%", severity: "clean" },
            { id: "h-vk-bharti", label: "BHARTIARTL", weight: "10%", severity: "clean" },
            { id: "h-vk-lnt", label: "L&T", weight: "10%", severity: "clean" }
          ]
        },
        {
          id: "ac-vikram-alts",
          label: "Private Equity / Alts",
          category: "alts",
          severity: "clean",
          weight: "25%",
          holdings: [
            { id: "h-vk-pe", label: "PE Growth IV", weight: "15%", severity: "clean" },
            { id: "h-vk-struct", label: "Structured Debt", weight: "10%", severity: "clean" }
          ]
        },
        {
          id: "ac-vikram-reit",
          label: "Real Estate REITs",
          category: "reit",
          severity: "clean",
          weight: "15%",
          holdings: [
            { id: "h-vk-brook", label: "Brookfield REIT", weight: "15%", severity: "clean" }
          ]
        },
        {
          id: "ac-vikram-intl",
          label: "Global Funds",
          category: "intl",
          severity: "clean",
          weight: "10%",
          holdings: [
            { id: "h-vk-sp500", label: "S&P 500 Index", weight: "10%", severity: "clean" }
          ]
        }
      ]
    },
    {
      id: "cli-kabir",
      name: "Kabir Singhania",
      aum: "₹8.0 Cr",
      severity: "clean",
      signal: "Growth Portfolio",
      assetClasses: [
        {
          id: "ac-kabir-eq",
          label: "Direct Equity",
          category: "equity",
          severity: "clean",
          weight: "65%",
          holdings: [
            { id: "h-k-tcs", label: "TCS", weight: "20%", severity: "clean" },
            { id: "h-k-hcl", label: "HCLTECH", weight: "15%", severity: "clean" },
            { id: "h-k-titan", label: "TITAN", weight: "15%", severity: "clean" },
            { id: "h-k-bajaj", label: "BAJFINANCE", weight: "15%", severity: "clean" }
          ]
        },
        {
          id: "ac-kabir-mf",
          label: "Mutual Funds",
          category: "mutual_fund",
          severity: "clean",
          weight: "35%",
          holdings: [
            { id: "h-k-sbi-sm", label: "SBI Small Cap", weight: "20%", severity: "clean" },
            { id: "h-k-nippon", label: "Nippon Multi Cap", weight: "15%", severity: "clean" }
          ]
        }
      ]
    }
  ];

  const clientCount = CLIENTS_TREE.length;
  const clientAngleStep = (Math.PI * 2) / clientCount;

  CLIENTS_TREE.forEach((client, clientIndex) => {
    const angle = clientIndex * clientAngleStep - Math.PI / 2;
    const clientDist = 240;
    const cx = Math.cos(angle) * clientDist;
    const cy = Math.sin(angle) * clientDist;

    // Client Node
    nodes.push({
      id: client.id,
      label: client.name,
      sublabel: client.aum,
      category: client.assetClasses[0]?.category || "equity",
      kind: "client",
      severity: client.severity,
      aum: client.aum,
      signal: client.signal,
      radius: 17,
      x: cx + (Math.random() - 0.5) * 8,
      y: cy + (Math.random() - 0.5) * 8,
      vx: 0,
      vy: 0,
      parentId: "rm-center",
      clientId: client.id,
      details: {
        allocation: client.aum,
        holdingCount: client.assetClasses.reduce((acc, ac) => acc + ac.holdings.length, 0)
      }
    });

    // Link RM -> Client
    links.push({
      source: "rm-center",
      target: client.id,
      category: client.assetClasses[0]?.category || "equity",
      severity: client.severity,
      distance: clientDist
    });

    // Asset Classes
    const acCount = client.assetClasses.length;
    client.assetClasses.forEach((ac, acIdx) => {
      const acSpread = 0.75;
      const acAngle = angle + (acIdx - (acCount - 1) / 2) * (acSpread / Math.max(1, acCount - 1));
      const acDist = 95;
      const acx = cx + Math.cos(acAngle) * acDist;
      const acy = cy + Math.sin(acAngle) * acDist;

      nodes.push({
        id: ac.id,
        label: ac.label,
        sublabel: ac.weight,
        category: ac.category,
        kind: "asset_class",
        severity: ac.severity,
        weight: ac.weight,
        radius: 11,
        x: acx + (Math.random() - 0.5) * 6,
        y: acy + (Math.random() - 0.5) * 6,
        vx: 0,
        vy: 0,
        parentId: client.id,
        clientId: client.id,
        details: {
          allocation: ac.weight,
          holdingCount: ac.holdings.length
        }
      });

      // Link Client -> Asset Class
      links.push({
        source: client.id,
        target: ac.id,
        category: ac.category,
        severity: ac.severity,
        distance: acDist
      });

      // Specific Holdings
      const hCount = ac.holdings.length;
      ac.holdings.forEach((h, hIdx) => {
        const hSpread = 0.95;
        const hAngle = acAngle + (hIdx - (hCount - 1) / 2) * (hSpread / Math.max(1, hCount - 1));
        const hDist = 65;
        const hx = acx + Math.cos(hAngle) * hDist;
        const hy = acy + Math.sin(hAngle) * hDist;

        nodes.push({
          id: h.id,
          label: h.label,
          sublabel: h.weight,
          category: ac.category,
          kind: "holding",
          severity: h.severity,
          weight: h.weight,
          signal: h.signal,
          radius: 6.5,
          x: hx + (Math.random() - 0.5) * 8,
          y: hy + (Math.random() - 0.5) * 8,
          vx: 0,
          vy: 0,
          parentId: ac.id,
          clientId: client.id,
          details: {
            allocation: h.weight
          }
        });

        // Link Asset Class -> Holding
        links.push({
          source: ac.id,
          target: h.id,
          category: ac.category,
          severity: h.severity,
          distance: hDist
        });
      });
    });
  });

  return { nodes, links };
}

// ── Layer Hierarchy Helpers ──────────────────────────────────────────────────

function getInitialExpandedNodeIds(graphData?: HeartbeatGraphData | null): Set<string> {
  const set = new Set<string>();
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    set.add("rm-center");
    set.add("cli-rahul");
    set.add("cli-anita");
    set.add("cli-suresh");
    set.add("cli-vikram");
    set.add("cli-kabir");
    return set;
  }

  // Find center node (Stage 0)
  const centerNode =
    graphData.nodes.find((n) => n.stage === 0) ||
    graphData.nodes.find((n) => n.id === graphData.meta?.center_id) ||
    graphData.nodes.find((n) => n.type === "super_admin" || n.type === "cio" || n.type === "rm") ||
    graphData.nodes[0];

  if (centerNode) {
    set.add(centerNode.id);
  }

  // Direct children of center node (Stage 1)
  const stage1Nodes = graphData.nodes.filter(
    (n) => n.stage === 1 || (centerNode && n.parent_id === centerNode.id && n.id !== centerNode.id)
  );

  // Expanding Stage 0 (center) and Stage 1 nodes caps the initial view at EXACTLY 3 layers:
  // - Stage 0 (Center) is expanded -> Stage 1 nodes are visible
  // - Stage 1 nodes are expanded -> Stage 2 nodes are visible
  // - Stage 2 nodes are NOT expanded -> Stage 3 (and beyond) start hidden!
  // Edge nodes can then be clicked to expand deeper layers on demand.
  stage1Nodes.forEach((n) => {
    set.add(n.id);
  });

  return set;
}

function isNodeVisible(node: GraphNode, expandedIds: Set<string>, nodeMap: Map<string, GraphNode>): boolean {
  if (node.stage === 0 || !node.parentId) return true;

  let curr = node;
  while (curr.parentId) {
    const parent = nodeMap.get(curr.parentId);
    if (!parent) return false;
    if (!expandedIds.has(parent.id)) {
      return false;
    }
    curr = parent;
    if (curr.stage === 0 || !curr.parentId) break;
  }
  return true;
}

function getNodeVirtualDepth(node: GraphNode): number {
  if (node.stage === 0 || !node.parentId) return 0;
  if (node.stage === 1) return 0.55;
  if (node.stage === 2) return 1.1;
  if (node.stage === 3) return 1.7;
  if (node.stage === 4) return 2.3;
  return node.kind === "holding" ? 2.1 : node.kind === "client" ? 1.4 : 0.7;
}

interface RMHeartbeatGraphProps {
  data?: HeartbeatGraphData | null;
  loading?: boolean;
}

export function RMHeartbeatGraph({ data, loading }: RMHeartbeatGraphProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState<HoldingCategory | "all" | "alerts">("all");
  const [colorMode, setColorMode] = useState<"category" | "severity">("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [tiltEnabled, setTiltEnabled] = useState(true);

  // Holographic 3D tilt tracking
  const pointerPosRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isInside: false,
  });

  // Default: Capped at 3 layers for everyone at start
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => getInitialExpandedNodeIds(data));

  // Transform / Camera
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Hover & Active Inspection
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Physics data & simulation cooling energy
  const graphDataRef = useRef(createInitialGraphData(data));
  const isDraggingRef = useRef(false);
  const simAlphaRef = useRef(1.0);

  useEffect(() => {
    if (data && data.nodes && data.nodes.length > 0) {
      graphDataRef.current = createInitialGraphData(data);
      setExpandedNodeIds(getInitialExpandedNodeIds(data));
      simAlphaRef.current = 1.0;
    }
  }, [data]);

  const draggedNodeRef = useRef<GraphNode | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  // Stable star field — generated once, reused every frame
  const starFieldRef = useRef<Array<{ nx: number; ny: number; r: number; depth: number; alpha: number }> | null>(null);

  const role = data?.meta?.role;
  const isSuperAdmin = role === "super_admin" || role === "admin";
  const isCio = role === "cio";
  const isFirmView = isSuperAdmin || isCio || (data?.meta?.stageCount ?? 3) > 3;

  // Toggle expansion of an edge node to expand/collapse its child layer
  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      const { nodes } = graphDataRef.current;
      const isCurrentlyExpanded = next.has(nodeId);

      if (isCurrentlyExpanded) {
        // Collapse: remove nodeId and all its descendants
        const removeDescendants = (id: string) => {
          next.delete(id);
          nodes.forEach((n) => {
            if (n.parentId === id) {
              removeDescendants(n.id);
            }
          });
        };
        removeDescendants(nodeId);
        simAlphaRef.current = Math.max(simAlphaRef.current, 0.4);
      } else {
        // Expand: add nodeId
        next.add(nodeId);

        // Smooth blossom outward glide for newly visible children
        const parent = nodes.find((n) => n.id === nodeId);
        if (parent) {
          const children = nodes.filter((n) => n.parentId === nodeId);
          const cCount = children.length;
          const parentRad = Math.atan2(parent.y, parent.x) || -Math.PI / 2;
          const spread = Math.min(Math.PI * 1.05, 0.36 * Math.max(1, cCount));

          children.forEach((c, idx) => {
            const offset = cCount > 1 ? (idx - (cCount - 1) / 2) * (spread / Math.max(1, cCount - 1)) : 0;
            const angle = parentRad + offset;
            const dist = c.kind === "holding" ? 80 : (c.kind === "client" ? 175 : 180);

            c.x = parent.x + Math.cos(angle) * (dist * 0.88);
            c.y = parent.y + Math.sin(angle) * (dist * 0.88);
            c.vx = Math.cos(angle) * 1.2;
            c.vy = Math.sin(angle) * 1.2;
          });
          simAlphaRef.current = 0.85;
        }
      }
      return next;
    });
  }, []);

  // Search match set
  const searchMatchedIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const set = new Set<string>();
    graphDataRef.current.nodes.forEach((n) => {
      if (
        n.label.toLowerCase().includes(q) ||
        (n.sublabel && n.sublabel.toLowerCase().includes(q)) ||
        (n.signal && n.signal.toLowerCase().includes(q))
      ) {
        set.add(n.id);
        if (n.parentId) set.add(n.parentId);
        if (n.clientId) set.add(n.clientId);
      }
    });
    return set;
  }, [searchQuery]);

  // Connected nodes lookup for hover highlight
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode && !selectedNode) return null;
    const target = (hoveredNode || selectedNode)!;
    const ids = new Set<string>([target.id]);
    const allNodes = graphDataRef.current.nodes;
    const nodeMap = new Map<string, GraphNode>();
    allNodes.forEach((n) => nodeMap.set(n.id, n));

    // Add ancestors
    let curr = target;
    while (curr.parentId) {
      ids.add(curr.parentId);
      const parent = nodeMap.get(curr.parentId);
      if (!parent) break;
      curr = parent;
    }

    // Add descendants (only visible ones)
    const addDescendants = (parentId: string) => {
      allNodes.forEach((n) => {
        if (n.parentId === parentId && isNodeVisible(n, expandedNodeIds, nodeMap)) {
          ids.add(n.id);
          addDescendants(n.id);
        }
      });
    };
    addDescendants(target.id);

    return ids;
  }, [hoveredNode, selectedNode, expandedNodeIds]);

  // Center graph in canvas with adaptive initial zoom
  const centerGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const initK = isSuperAdmin ? 0.80 : isCio ? 0.86 : 0.90;
    transformRef.current = {
      x: rect.width / 2,
      y: rect.height / 2,
      k: initK
    };
    setZoomLevel(initK);
  }, [isSuperAdmin, isCio]);

  // Zoom handler
  const handleZoom = useCallback((factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const t = transformRef.current;
    const newK = Math.max(0.35, Math.min(2.8, t.k * factor));

    t.x = cx - (cx - t.x) * (newK / t.k);
    t.y = cy - (cy - t.y) * (newK / t.k);
    t.k = newK;
    setZoomLevel(newK);
  }, []);

  // Smooth zoom to specific node
  const zoomToNode = useCallback((node: GraphNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetK = 1.65;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    transformRef.current = {
      x: cx - node.x * targetK,
      y: cy - node.y * targetK,
      k: targetK,
    };
    setZoomLevel(targetK);
    setSelectedNode(node);
  }, []);

  // Physics Simulation Step with Cooling Energy & Smooth Settlement
  const runPhysicsStep = useCallback(() => {
    if (simAlphaRef.current < 0.002) return;

    const alpha = simAlphaRef.current;
    simAlphaRef.current *= 0.982; // Gradual cooling decay over ~150 frames

    const { nodes, links } = graphDataRef.current;
    const nodeMap = new Map<string, GraphNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const DAMPING = 0.82;
    const CENTER_GRAVITY = 0.0012;
    const REPULSION = 2200;
    const MAX_SPEED = 3.8;

    // Center Gravity for non-root nodes; root node is firmly pinned at center (0,0)
    nodes.forEach((n) => {
      const isRoot = n.stage === 0 || !n.parentId;
      if (isRoot) {
        n.x = 0;
        n.y = 0;
        n.vx = 0;
        n.vy = 0;
      } else {
        n.vx -= n.x * CENTER_GRAVITY * alpha;
        n.vy -= n.y * CENTER_GRAVITY * alpha;
      }
    });

    // Softened Many-Body Coulomb Repulsion between visible nodes
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      const a = nodes[i];
      if (!isNodeVisible(a, expandedNodeIds, nodeMap)) continue;
      for (let j = i + 1; j < len; j++) {
        const b = nodes[j];
        if (!isNodeVisible(b, expandedNodeIds, nodeMap)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        const minDist = a.radius + b.radius + 24;
        let force = (REPULSION * alpha) / (distSq + 800);
        if (dist < minDist) {
          force += Math.min(1.2, (minDist - dist) * 0.04 * alpha);
        }
        force = Math.min(force, 1.8);

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (a.stage !== 0 && a.parentId) {
          a.vx -= fx;
          a.vy -= fy;
        }
        if (b.stage !== 0 && b.parentId) {
          b.vx += fx;
          b.vy += fy;
        }
      }
    }

    // Link Spring Attraction for visible links only
    links.forEach((link) => {
      const a = nodeMap.get(link.source);
      const b = nodeMap.get(link.target);
      if (!a || !b) return;
      if (!isNodeVisible(a, expandedNodeIds, nodeMap) || !isNodeVisible(b, expandedNodeIds, nodeMap)) return;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = dist - link.distance;
      const strength = 0.035 * alpha;

      const fx = (dx / dist) * diff * strength;
      const fy = (dy / dist) * diff * strength;

      if (a.stage !== 0 && a.parentId) {
        a.vx += fx;
        a.vy += fy;
      }
      if (b.stage !== 0 && b.parentId) {
        b.vx -= fx;
        b.vy -= fy;
      }
    });

    // Position updates with friction damping and max speed cap
    nodes.forEach((n) => {
      if (n.fx != null && n.fy != null) {
        n.x = n.fx;
        n.y = n.fy;
        n.vx = 0;
        n.vy = 0;
      } else if (n.stage === 0 || !n.parentId) {
        n.x = 0;
        n.y = 0;
        n.vx = 0;
        n.vy = 0;
      } else {
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > MAX_SPEED) {
          n.vx = (n.vx / speed) * MAX_SPEED;
          n.vy = (n.vy / speed) * MAX_SPEED;
        }
        n.x += n.vx;
        n.y += n.vy;
      }
    });
  }, [expandedNodeIds]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pulseAngle = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      if (transformRef.current.x === 0 && transformRef.current.y === 0) {
        centerGraph();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      pulseAngle += 0.04;
      runPhysicsStep();

      // Smooth pointer easing for holographic parallax tilt
      const ptr = pointerPosRef.current;
      ptr.currentX += (ptr.targetX - ptr.currentX) * 0.08;
      ptr.currentY += (ptr.targetY - ptr.currentY) * 0.08;
      const tiltX = tiltEnabled ? ptr.currentX : 0;
      const tiltY = tiltEnabled ? ptr.currentY : 0;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // ── Background: deep plum base (Today's Brief palette) ──────────────────
      ctx.fillStyle = NAVY_BG;
      ctx.fillRect(0, 0, width, height);

      // ── Vanishing point — shifts with tilt for true 3D feel ──────────────────
      const vpX = width  * 0.5 + tiltX * width  * 0.15;
      const vpY = height * 0.5 + tiltY * height * 0.12;

      // ── Background glow: blue-indigo from VP center outward ──────────────────
      const coreGlow = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, Math.max(width, height) * 0.6);
      coreGlow.addColorStop(0,    "rgba(35, 22, 120, 0.55)");
      coreGlow.addColorStop(0.35, "rgba(23, 15,  88, 0.30)");
      coreGlow.addColorStop(0.70, "rgba( 8,  8,  40, 0.15)");
      coreGlow.addColorStop(1,    "rgba( 0,  0,   0, 0.00)");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, width, height);

      // Corner vignettes to frame the space
      const vigBR = ctx.createRadialGradient(
        width * (1.05 + tiltX * 0.05), height * (1.05 + tiltY * 0.05), 0,
        width * (1.05 + tiltX * 0.05), height * (1.05 + tiltY * 0.05), Math.max(width, height) * 0.60
      );
      vigBR.addColorStop(0,   "rgba(23, 47, 112, 0.65)");
      vigBR.addColorStop(0.3, "rgba(25, 18, 101, 0.30)");
      vigBR.addColorStop(0.6, "rgba( 0,  0,   0, 0.00)");
      ctx.fillStyle = vigBR;
      ctx.fillRect(0, 0, width, height);

      const vigTL = ctx.createRadialGradient(
        width * (-0.05 + tiltX * 0.03), height * (-0.05 + tiltY * 0.03), 0,
        width * (-0.05 + tiltX * 0.03), height * (-0.05 + tiltY * 0.03), Math.max(width, height) * 0.55
      );
      vigTL.addColorStop(0,   "rgba(0, 0, 0, 0.60)");
      vigTL.addColorStop(0.3, "rgba(0, 0, 0, 0.22)");
      vigTL.addColorStop(0.6, "rgba(0, 0, 0, 0.00)");
      ctx.fillStyle = vigTL;
      ctx.fillRect(0, 0, width, height);

      // ── STAR FIELD: 3 depth layers, generated once ────────────────────────────
      if (!starFieldRef.current) {
        const stars: Array<{ nx: number; ny: number; r: number; depth: number; alpha: number }> = [];
        const rng = (seed: number) => { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); };
        for (let i = 0; i < 140; i++) {
          stars.push({
            nx:    rng(i * 3.71),
            ny:    rng(i * 5.33 + 1),
            r:     0.4 + rng(i * 2.13) * 1.1,
            depth: Math.floor(rng(i * 4.07) * 3),    // 0=far  1=mid  2=near
            alpha: 0.12 + rng(i * 1.91) * 0.42,
          });
        }
        starFieldRef.current = stars;
      }
      starFieldRef.current.forEach((s) => {
        const shift = [3, 8, 16][s.depth];            // near stars parallax more
        const sx = s.nx * width  + tiltX * shift;
        const sy = s.ny * height + tiltY * shift;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 215, 255, ${s.alpha})`;
        ctx.fill();
      });

      ctx.save();
      ctx.globalCompositeOperation = "lighter";      // additive blending for grid glow

      // ── LAYER 1: 32 Radial spokes VP → all 4 canvas edges (full 360°) ────────
      const SPOKE_COUNT = 32;
      for (let i = 0; i < SPOKE_COUNT; i++) {
        const angle = (i / SPOKE_COUNT) * Math.PI * 2 - Math.PI / 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        // Intersect ray from VP with canvas bounding box
        let t = Infinity;
        if (cos >  0.00001) t = Math.min(t, (width  - vpX) / cos);
        if (cos < -0.00001) t = Math.min(t, (0      - vpX) / cos);
        if (sin >  0.00001) t = Math.min(t, (height - vpY) / sin);
        if (sin < -0.00001) t = Math.min(t, (0      - vpY) / sin);
        const ex = vpX + cos * t;
        const ey = vpY + sin * t;

        const grd = ctx.createLinearGradient(vpX, vpY, ex, ey);
        grd.addColorStop(0,    "rgba(110, 140, 255, 0.24)");
        grd.addColorStop(0.25, "rgba( 90, 120, 230, 0.09)");
        grd.addColorStop(1,    "rgba( 60,  80, 200, 0.00)");
        ctx.beginPath();
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }

      // ── LAYER 2: 4-directional perspective parallels (full 3D box/room) ───────
      // These are lines that converge toward the VP from all 4 sides simultaneously,
      // creating the look of being inside an infinite 3D grid room.
      const P_COUNT = 14;
      for (let j = 1; j <= P_COUNT; j++) {
        const tNorm = j / P_COUNT;
        // Non-linear distribution: lines bunch near VP (depth compression)
        const pf    = Math.pow(tNorm, 0.55);
        const alpha = 0.018 + tNorm * 0.068;
        const lw    = 0.45 + tNorm * 0.25;
        const col   = `rgba(130, 170, 255, ${alpha})`;

        // ── Horizontal line: above VP ──
        ctx.beginPath();
        ctx.moveTo(vpX + (0     - vpX) * pf, vpY + (0       - vpY) * pf);
        ctx.lineTo(vpX + (width - vpX) * pf, vpY + (0       - vpY) * pf);
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();

        // ── Horizontal line: below VP ──
        ctx.beginPath();
        ctx.moveTo(vpX + (0     - vpX) * pf, vpY + (height - vpY) * pf);
        ctx.lineTo(vpX + (width - vpX) * pf, vpY + (height - vpY) * pf);
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();

        // ── Vertical line: left of VP ──
        ctx.beginPath();
        ctx.moveTo(vpX + (0 - vpX) * pf, vpY + (0      - vpY) * pf);
        ctx.lineTo(vpX + (0 - vpX) * pf, vpY + (height - vpY) * pf);
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();

        // ── Vertical line: right of VP ──
        ctx.beginPath();
        ctx.moveTo(vpX + (width - vpX) * pf, vpY + (0      - vpY) * pf);
        ctx.lineTo(vpX + (width - vpX) * pf, vpY + (height - vpY) * pf);
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
      }

      // ── LAYER 3: Concentric elliptical depth rings around VP ─────────────────
      // Simulate looking through orbital shells — rings squish with vertical tilt
      const RING_COUNT = 10;
      const squishY = 0.52 + Math.abs(tiltY) * 0.12;
      for (let r = 1; r <= RING_COUNT; r++) {
        const norm   = r / RING_COUNT;
        const radius = Math.max(width, height) * 0.92 * Math.pow(norm, 0.60);
        const alpha  = (1 - norm) * 0.11 + 0.012;
        ctx.beginPath();
        ctx.ellipse(vpX, vpY, radius, radius * squishY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 155, 255, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // ── LAYER 4: Nebula / core glow at VP (additive, so it blooms brightly) ──
      const nebulaR = Math.min(width, height) * 0.18;
      const ng = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, nebulaR);
      ng.addColorStop(0,   "rgba(80, 60, 255, 0.18)");
      ng.addColorStop(0.5, "rgba(50, 40, 200, 0.06)");
      ng.addColorStop(1,   "rgba( 0,  0,   0, 0.00)");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(vpX, vpY, nebulaR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // back to normal composite mode

      // Apply camera transform
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      const { nodes, links } = graphDataRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => {
        const depth = getNodeVirtualDepth(n);
        n.virtualZ = depth;
        n.renderX = n.x + tiltX * depth * 20;
        n.renderY = n.y + tiltY * depth * 15;
        nodeMap.set(n.id, n);
      });

      // ── Draw Links ──────────────────────────────────────────────────────────
      links.forEach((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return;
        if (!isNodeVisible(source, expandedNodeIds, nodeMap) || !isNodeVisible(target, expandedNodeIds, nodeMap)) return;

        const isFilterActive =
          activeFilter === "all" ||
          (activeFilter === "alerts" &&
            (source.severity === "critical" ||
              target.severity === "critical" ||
              source.severity === "warning" ||
              target.severity === "warning")) ||
          source.category === activeFilter ||
          target.category === activeFilter;

        const isHighlighted =
          connectedNodeIds ? connectedNodeIds.has(source.id) && connectedNodeIds.has(target.id) : false;
        const isDimmed = connectedNodeIds ? !isHighlighted : !isFilterActive;

        const isSearchHighlighted = searchMatchedIds
          ? searchMatchedIds.has(source.id) && searchMatchedIds.has(target.id)
          : false;

        const colorCfg =
          colorMode === "category" ? CATEGORY_COLORS[link.category] : SEVERITY_COLORS[link.severity];
        const baseColor = colorCfg?.main || "#38BDF8";

        const sx = source.renderX ?? source.x;
        const sy = source.renderY ?? source.y;
        const tx = target.renderX ?? target.x;
        const ty = target.renderY ?? target.y;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);

        if (isHighlighted || isSearchHighlighted) {
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 2.0;
          ctx.globalAlpha = 0.95;
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = 10;
        } else if (isDimmed) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = 0.07;
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = baseColor;
          const isSourceCenter = source.kind === "super_admin" || source.kind === "cio" || (source.kind === "rm" && !source.parentId);
          ctx.lineWidth = isSourceCenter ? 1.6 : source.kind === "rm" ? 1.3 : source.kind === "client" ? 1.1 : 0.8;
          ctx.globalAlpha = isSourceCenter ? 0.40 : source.kind === "rm" ? 0.32 : source.kind === "client" ? 0.28 : 0.20;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // ── Draw Nodes ──────────────────────────────────────────────────────────
      nodes.forEach((node) => {
        if (!isNodeVisible(node, expandedNodeIds, nodeMap)) return;

        const isFilterActive =
          activeFilter === "all" ||
          (activeFilter === "alerts" && (node.severity === "critical" || node.severity === "warning")) ||
          node.category === activeFilter;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const isConnected = connectedNodeIds ? connectedNodeIds.has(node.id) : false;
        const isSearchMatched = searchMatchedIds ? searchMatchedIds.has(node.id) : false;
        const isDimmed = connectedNodeIds ? !isConnected : !isFilterActive;

        const colorCfg =
          colorMode === "category" ? CATEGORY_COLORS[node.category] : SEVERITY_COLORS[node.severity];
        const mainColor = colorCfg?.main || "#38BDF8";
        const glowColor = colorCfg?.glow || "rgba(56, 189, 248, 0.35)";

        const alpha = isDimmed && !isSearchMatched ? 0.12 : 1;
        ctx.globalAlpha = alpha;

        const nx = node.renderX ?? node.x;
        const ny = node.renderY ?? node.y;
        const depth = node.virtualZ ?? getNodeVirtualDepth(node);

        // Ambient holographic depth shadow cast opposite to tilt angle
        if (tiltEnabled && depth > 0 && !isDimmed) {
          const shadowDist = depth * 5.5;
          const shadowX = nx - tiltX * shadowDist;
          const shadowY = ny - tiltY * shadowDist + depth * 1.5;
          ctx.beginPath();
          ctx.arc(shadowX, shadowY, node.radius * 0.95, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 7 * depth;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Outer pulsing aura
        if ((node.severity === "critical" || isHovered || isSelected || isSearchMatched) && !isDimmed) {
          const pulse = Math.sin(pulseAngle + node.x * 0.05) * 4;
          const auraRadius = node.radius + 6 + (node.severity === "critical" ? pulse : 2);
          ctx.beginPath();
          ctx.arc(nx, ny, auraRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.severity === "critical" ? "rgba(248, 113, 113, 0.25)" : glowColor;
          ctx.fill();

          if (node.severity === "critical") {
            ctx.beginPath();
            ctx.arc(nx, ny, auraRadius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(248, 113, 113, 0.7)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = mainColor;

        if (isHovered || isSelected || isSearchMatched) {
          ctx.shadowColor = mainColor;
          ctx.shadowBlur = 18;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Border / Ring
        const isCenterNode = node.kind === "super_admin" || node.kind === "cio" || (node.kind === "rm" && !node.parentId);
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle =
          isCenterNode
            ? "#FFFFFF"
            : isHovered || isSelected
            ? "#FFFFFF"
            : "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = node.kind === "super_admin" ? 2.8 : node.kind === "cio" ? 2.4 : node.kind === "rm" ? 2.0 : 1.2;
        ctx.stroke();

        // Node Center Glyph
        if (node.kind === "super_admin") {
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 9.5px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("HQ", nx, ny);
        } else if (node.kind === "cio") {
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 9.5px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("CIO", nx, ny);
        } else if (node.kind === "rm") {
          ctx.fillStyle = "#210B2C";
          ctx.font = "bold 10px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("RM", nx, ny);
        } else if (node.kind === "client") {
          const initials = (node.label || "CL").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 9px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(initials, nx, ny);
        }

        // ── Draw Expand / Collapse Badge for Nodes with Children ──
        const hasChildren = nodes.some((c) => c.parentId === node.id);
        if (hasChildren) {
          const isExpanded = expandedNodeIds.has(node.id);
          const badgeAngle = -Math.PI / 4; // Top-right corner
          const bx = nx + Math.cos(badgeAngle) * (node.radius + 3);
          const by = ny + Math.sin(badgeAngle) * (node.radius + 3);
          const badgeR = 6.5;

          ctx.beginPath();
          ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
          ctx.fillStyle = isExpanded ? "rgba(255, 255, 255, 0.25)" : "var(--qc-lime, #DFFF00)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
          ctx.strokeStyle = "#210B2C";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = isExpanded ? "#FFFFFF" : "#1A0B2E";
          ctx.font = "bold 9px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(isExpanded ? "−" : "+", bx, by);

          // If node has hidden children (unexpanded edge node), draw a dashed orbit ring
          if (!isExpanded) {
            ctx.beginPath();
            ctx.arc(nx, ny, node.radius + 4.5, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(223, 255, 0, 0.65)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([2.5, 2.5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Labels
        const shouldShowLabel =
          node.kind === "super_admin" ||
          node.kind === "cio" ||
          node.kind === "rm" ||
          node.kind === "client" ||
          node.kind === "asset_class" ||
          transformRef.current.k > 0.85 ||
          isHovered ||
          isSelected ||
          isSearchMatched;

        if (shouldShowLabel && !isDimmed) {
          const fontSize = node.kind === "super_admin" || node.kind === "cio" || node.kind === "rm" ? 11 : node.kind === "client" ? 10 : 8.5;
          ctx.font = `${node.kind === "super_admin" || node.kind === "cio" || node.kind === "rm" || node.kind === "client" ? "600" : "500"} ${fontSize}px IBM Plex Sans, sans-serif`;
          ctx.fillStyle = isHovered || isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.9)";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(node.label, nx, ny + node.radius + 3.5);

          if (node.sublabel && (node.kind === "super_admin" || node.kind === "cio" || node.kind === "rm" || node.kind === "client" || isHovered || isSelected)) {
            ctx.font = "400 8.5px IBM Plex Mono, monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillText(node.sublabel, nx, ny + node.radius + fontSize + 4);
          }
        }

        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeFilter, colorMode, connectedNodeIds, searchMatchedIds, hoveredNode, selectedNode, centerGraph, runPhysicsStep, expandedNodeIds, tiltEnabled]);

  // Pointer Handlers
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (sx - rect.left - transformRef.current.x) / transformRef.current.k;
    const y = (sy - rect.top - transformRef.current.y) / transformRef.current.k;
    return { x, y };
  }, []);

  const findNodeAt = useCallback(
    (sx: number, sy: number): GraphNode | null => {
      const { x, y } = screenToWorld(sx, sy);
      const { nodes } = graphDataRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (!isNodeVisible(n, expandedNodeIds, nodeMap)) continue;
        const nx = n.renderX ?? n.x;
        const ny = n.renderY ?? n.y;
        const dx = nx - x;
        const dy = ny - y;
        const hitRadius = Math.max(n.radius, 14);
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return n;
        }
      }
      return null;
    },
    [screenToWorld, expandedNodeIds]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const node = findNodeAt(e.clientX, e.clientY);
    if (node) {
      isDraggingRef.current = true;
      draggedNodeRef.current = node;
      const w = screenToWorld(e.clientX, e.clientY);
      const depth = getNodeVirtualDepth(node);
      const tiltOffsetX = tiltEnabled ? pointerPosRef.current.currentX * depth * 20 : 0;
      const tiltOffsetY = tiltEnabled ? pointerPosRef.current.currentY * depth * 15 : 0;
      node.fx = w.x - tiltOffsetX;
      node.fy = w.y - tiltOffsetY;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - transformRef.current.x,
        y: e.clientY - transformRef.current.y
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      pointerPosRef.current.targetX = Math.max(-1, Math.min(1, normX));
      pointerPosRef.current.targetY = Math.max(-1, Math.min(1, normY));
      pointerPosRef.current.isInside = true;
    }

    if (isDraggingRef.current && draggedNodeRef.current) {
      const w = screenToWorld(e.clientX, e.clientY);
      const depth = getNodeVirtualDepth(draggedNodeRef.current);
      const tiltOffsetX = tiltEnabled ? pointerPosRef.current.currentX * depth * 20 : 0;
      const tiltOffsetY = tiltEnabled ? pointerPosRef.current.currentY * depth * 15 : 0;
      draggedNodeRef.current.fx = w.x - tiltOffsetX;
      draggedNodeRef.current.fy = w.y - tiltOffsetY;
      simAlphaRef.current = Math.max(simAlphaRef.current, 0.45);
    } else if (isPanningRef.current) {
      transformRef.current.x = e.clientX - panStartRef.current.x;
      transformRef.current.y = e.clientY - panStartRef.current.y;
    } else {
      const node = findNodeAt(e.clientX, e.clientY);
      setHoveredNode(node);
      if (canvasRef.current) {
        if (node) {
          const hasChildren = graphDataRef.current.nodes.some((c) => c.parentId === node.id);
          canvasRef.current.style.cursor = hasChildren ? "pointer" : "grab";
        } else {
          canvasRef.current.style.cursor = isPanningRef.current ? "grabbing" : "default";
        }
      }
    }
  };

  const handlePointerLeave = () => {
    pointerPosRef.current.targetX = 0;
    pointerPosRef.current.targetY = 0;
    pointerPosRef.current.isInside = false;
    setHoveredNode(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && draggedNodeRef.current) {
      const clickedNode = draggedNodeRef.current;
      clickedNode.fx = null;
      clickedNode.fy = null;
      isDraggingRef.current = false;
      simAlphaRef.current = Math.max(simAlphaRef.current, 0.5);

      const dist = Math.hypot(
        e.clientX - dragStartPosRef.current.x,
        e.clientY - dragStartPosRef.current.y
      );
      if (dist < 5) {
        // Toggle expansion if node has children
        const { nodes } = graphDataRef.current;
        const hasChildren = nodes.some((n) => n.parentId === clickedNode.id);
        if (hasChildren) {
          toggleNodeExpansion(clickedNode.id);
        }
        setSelectedNode((prev) => (prev?.id === clickedNode.id ? null : clickedNode));
      }
      draggedNodeRef.current = null;
    }
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const t = transformRef.current;
    const newK = Math.max(0.35, Math.min(2.8, t.k * zoomFactor));

    t.x = mouseX - (mouseX - t.x) * (newK / t.k);
    t.y = mouseY - (mouseY - t.y) * (newK / t.k);
    t.k = newK;
    setZoomLevel(newK);
  };

  const activeInspection = selectedNode || hoveredNode;

  return (
    <div
      ref={containerRef}
      className="qc-dark-gradient-card rounded-[10px] flex flex-col transition-all overflow-hidden relative w-full min-w-0"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.12)",
        minHeight: 520
      }}
    >
      {/* ── Top Header Section: Perspectives (RM / CIO / Super Admin), Counts & AUM ── */}
      <div
        className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-4 border-b shrink-0 z-10"
        style={{
          borderColor: "rgba(255, 255, 255, 0.1)",
          background: "rgba(33, 11, 44, 0.82)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Top-Left: Dynamic Heartbeat Role Branding & Node Counts */}
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.16)" }}
          >
            <Activity className="size-4 text-[var(--qc-lime)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[15px] font-semibold text-white tracking-tight uppercase"
                style={{ fontFamily: "var(--qc-font-sans)" }}
              >
                {isSuperAdmin
                  ? "EXECUTIVE HEARTBEAT"
                  : isCio
                  ? "CIO FIRM HEARTBEAT"
                  : "RM HEARTBEAT"}
              </span>
              <span
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold"
                style={{
                  background: "rgba(255, 245, 202, 0.15)",
                  color: "var(--qc-lime)",
                  border: "1px solid rgba(255, 245, 202, 0.3)"
                }}
              >
                {isSuperAdmin
                  ? "Firm Radar"
                  : isCio
                  ? "Macro Radar"
                  : "Active Book"}
              </span>
            </div>
            <div
              className="text-[11.5px] text-white/70 flex items-center gap-2 mt-0.5"
              style={{ fontFamily: "var(--qc-font-mono)" }}
            >
              {isFirmView ? (
                <>
                  <span className="font-semibold text-white">
                    {data?.meta?.total_rms ?? 2} RMS
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-white">
                    {data?.meta?.total_clients ?? 18} CLIENTS
                  </span>
                  <span>·</span>
                  <span className={(data?.meta?.total_alerts ?? 0) > 0 ? "text-amber-300" : "text-emerald-300"}>
                    {data?.meta?.total_alerts ?? 0} FLAGGED
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-white">
                    {data?.meta?.total_clients ?? 18} CLIENTS
                  </span>
                  <span>·</span>
                  <span>
                    {graphDataRef.current.nodes.filter((n) => n.kind === "holding").length || 52} HOLDINGS
                  </span>
                  <span>·</span>
                  <span className={(data?.meta?.total_alerts ?? 3) > 0 ? "text-amber-300" : "text-emerald-300"}>
                    {data?.meta?.total_alerts ?? 3} FLAGGED
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right: Big AUM Value + Increase/Decrease Indicator */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="flex items-baseline justify-end gap-2">
              <span
                className="text-[28px] font-semibold text-white tracking-tight leading-none"
                style={{ fontFamily: "var(--qc-font-sans)" }}
              >
                ₹{data?.meta?.total_aum_cr ?? 796} Cr
              </span>
              <span
                className="text-[11px] font-mono text-white/60 uppercase tracking-wider"
              >
                {isSuperAdmin ? "Firm AUM" : isCio ? "CIO Book AUM" : "Total RM AUM"}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10.5px] font-medium font-mono"
                style={{
                  background: "rgba(52, 211, 153, 0.16)",
                  color: "#34D399",
                  border: "1px solid rgba(52, 211, 153, 0.3)"
                }}
              >
                <ArrowUpRight className="size-3" />
                <span>+₹14 Cr · +3.2%</span>
              </span>
              <span className="text-[10px] font-mono text-white/50">vs 7d ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Filter Categories, Search, Zoom & Display Controls ──────── */}
      <div
        className="px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 border-b shrink-0 z-10 text-[11.5px]"
        style={{
          borderColor: "rgba(255, 255, 255, 0.08)",
          background: "rgba(33, 11, 44, 0.95)"
        }}
      >
        {/* Filter Categories */}
        <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-lg border border-white/[0.1] overflow-x-auto max-w-full">
          {(
            [
              { key: "all", label: "All" },
              { key: "equity", label: "Equity" },
              { key: "debt", label: "Debt" },
              { key: "mutual_fund", label: "Mutual Funds" },
              { key: "reit", label: "REITs" },
              { key: "alerts", label: "Alerts Only" }
            ] as const
          ).map(({ key, label }) => {
            const active = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-white text-[var(--qc-ink)] font-semibold shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right Tools (Search, Holdings LOD, Color Mode, Zoom, Reset) */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <Search className="size-3.5 absolute left-2 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, RM, client..."
              className="pl-7 pr-2.5 py-1 rounded-md text-[11px] bg-white/[0.08] border border-white/[0.14] text-white placeholder-white/40 focus:outline-none focus:border-white/40 w-36 transition-all focus:w-44"
            />
          </div>

          {/* Layer Expansion Controls (Default: Capped at 3 layers, expandable on click) */}
          <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg border border-white/[0.1]">
            <button
              onClick={() => {
                setExpandedNodeIds(getInitialExpandedNodeIds(data));
                simAlphaRef.current = 1.0;
              }}
              title="Reset graph to default 3 layers"
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>3 Layers (Default)</span>
            </button>
            <button
              onClick={() => {
                const allWithChildren = new Set<string>();
                graphDataRef.current.nodes.forEach((n) => {
                  if (graphDataRef.current.nodes.some((c) => c.parentId === n.id)) {
                    allWithChildren.add(n.id);
                  }
                });
                setExpandedNodeIds(allWithChildren);
                simAlphaRef.current = 1.0;
              }}
              title="Expand all layers and holdings"
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer border-l border-white/[0.1] flex items-center gap-1"
            >
              <span>Expand All</span>
            </button>
          </div>

          {/* 3D Holographic Parallax Depth Toggle */}
          <button
            onClick={() => setTiltEnabled((v) => !v)}
            title={`3D Hologram Depth: ${tiltEnabled ? "Enabled (Interactive gyro tilt)" : "Disabled (Flat 2D)"}`}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
              tiltEnabled
                ? "bg-white/[0.14] text-[var(--qc-lime)] border-[var(--qc-lime)]/40 shadow-sm"
                : "bg-white/[0.08] text-white/60 border-white/[0.14] hover:bg-white/[0.12] hover:text-white"
            }`}
          >
            <Layers className="size-3" />
            <span className="hidden sm:inline">3D Depth {tiltEnabled ? "ON" : "OFF"}</span>
          </button>

          {/* Color Mode Toggle */}
          <button
            onClick={() => setColorMode((m) => (m === "category" ? "severity" : "category"))}
            title={`Color Mode: ${colorMode === "category" ? "By Asset Class" : "By Alert Status"}`}
            className="px-2 py-1 rounded-md text-[11px] font-medium text-white/80 bg-white/[0.08] border border-white/[0.14] hover:bg-white/[0.14] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="size-3" />
            <span className="hidden sm:inline">{colorMode === "category" ? "Asset Types" : "Alert Health"}</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-md border border-white/[0.14] bg-white/[0.08] overflow-hidden">
            <button
              onClick={() => handleZoom(1.18)}
              title="Zoom In"
              className="p-1.5 text-white/80 hover:bg-white/[0.15] transition-colors cursor-pointer"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.82)}
              title="Zoom Out"
              className="p-1.5 text-white/80 hover:bg-white/[0.15] transition-colors cursor-pointer border-l border-white/[0.1]"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              onClick={centerGraph}
              title="Reset View"
              className="p-1.5 text-white/80 hover:bg-white/[0.15] transition-colors cursor-pointer border-l border-white/[0.1]"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive Canvas ─────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-[440px] cursor-grab active:cursor-grabbing overflow-hidden w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* ── Floating Node Inspector Card (Hover or Click) ────────────────── */}
        {activeInspection && (
          <div
            className="absolute top-3 left-3 z-20 w-72 rounded-[10px] p-3.5 shadow-2xl transition-all pointer-events-auto border"
            style={{
              background: "rgba(24, 10, 36, 0.96)",
              borderColor: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(16px)"
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full inline-block"
                    style={{
                      background:
                        colorMode === "category"
                          ? CATEGORY_COLORS[activeInspection.category]?.main
                          : SEVERITY_COLORS[activeInspection.severity]?.main
                    }}
                  />
                  <span className="text-[13.5px] font-semibold text-white">
                    {activeInspection.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider block mt-0.5">
                  {activeInspection.kind.replace("_", " ")} · {CATEGORY_COLORS[activeInspection.category]?.label || activeInspection.kind}
                </span>
              </div>

              {activeInspection.severity === "critical" && (
                <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-800">
                  Critical
                </span>
              )}
              {activeInspection.severity === "warning" && (
                <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800">
                  Warning
                </span>
              )}
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-white/[0.1] my-2 text-[11px]">
              {activeInspection.aum && (
                <div>
                  <span className="text-white/60 block text-[9.5px]">AUM</span>
                  <span className="text-white font-mono font-medium">{activeInspection.aum}</span>
                </div>
              )}
              {activeInspection.weight && (
                <div>
                  <span className="text-white/60 block text-[9.5px]">Portfolio Weight</span>
                  <span className="text-white font-mono font-medium">{activeInspection.weight}</span>
                </div>
              )}
              {activeInspection.details?.team && (
                <div className="col-span-2">
                  <span className="text-white/60 block text-[9.5px]">Division / Desk</span>
                  <span className="text-white font-medium">{activeInspection.details.team}</span>
                </div>
              )}
              {activeInspection.signal && (
                <div className="col-span-2">
                  <span className="text-white/60 block text-[9.5px]">Signal Alert</span>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        activeInspection.severity === "critical"
                          ? "#F87171"
                          : activeInspection.severity === "warning"
                          ? "#FBBF24"
                          : "#34D399"
                    }}
                  >
                    {activeInspection.signal}
                  </span>
                </div>
              )}
            </div>

            {/* Expand / Collapse Action for any node with child layers */}
            {(() => {
              const children = graphDataRef.current.nodes.filter((n) => n.parentId === activeInspection.id);
              if (children.length === 0) return null;

              const isExpanded = expandedNodeIds.has(activeInspection.id);
              const childType =
                activeInspection.kind === "super_admin"
                  ? "CIO Desk"
                  : activeInspection.kind === "cio"
                  ? "RMs"
                  : activeInspection.kind === "rm"
                  ? "Clients"
                  : activeInspection.kind === "client"
                  ? "Holdings"
                  : "Sub-nodes";

              return (
                <div className="pt-2 border-t border-white/[0.1] mt-2">
                  <button
                    onClick={() => toggleNodeExpansion(activeInspection.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-[11px] font-semibold transition-all cursor-pointer shadow-sm"
                    style={{
                      background: isExpanded ? "rgba(255, 255, 255, 0.12)" : "var(--qc-lime, #DFFF00)",
                      color: isExpanded ? "#FFFFFF" : "#1A0B2E",
                      border: isExpanded ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <span>Collapse {childType}</span>
                        <span className="text-[10px] opacity-75">(-)</span>
                      </>
                    ) : (
                      <>
                        <span>Expand {childType} ({children.length})</span>
                        <span className="text-[10px] font-bold">(+)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {/* Contextual Action CTA */}
            {activeInspection.kind === "client" && (
              <div className="pt-2 flex flex-col gap-2 border-t border-white/[0.1] mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">
                    {activeInspection.details?.holdingCount
                      ? `${activeInspection.details.holdingCount} holdings in book`
                      : "Inspect holdings"}
                  </span>
                  <button
                    onClick={() => zoomToNode(activeInspection)}
                    className="inline-flex items-center gap-1 text-[10.5px] font-mono font-medium text-[var(--qc-lime)] hover:underline cursor-pointer"
                    title="Zoom camera directly into this client's holdings"
                  >
                    <ZoomIn className="size-3" />
                    <span>Zoom to Node</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                  <span className="text-[10px] text-white/60">CRM 360° Profile</span>
                  <Link
                    href={`/wealthos/clients/${activeInspection.clientId || activeInspection.rawId || activeInspection.id.replace("client-", "")}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-white hover:text-[var(--qc-lime)] transition-colors"
                  >
                    <span>View Client</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            {activeInspection.kind === "rm" && activeInspection.id !== "rm-center" && (
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.1] mt-2">
                <span className="text-[10px] text-white/60">RM Desk & Book</span>
                <Link
                  href={`/wealthos/rms/${activeInspection.rawId || activeInspection.id.replace("rm-", "")}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--qc-lime)] hover:underline transition-colors"
                >
                  <span>View RM Desk</span>
                  <ChevronRight className="size-3" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── Visual Legend (Bottom Left) ──────────────────────────────────── */}
        <div
          className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg border flex flex-wrap items-center gap-3 text-[10px] text-white/80"
          style={{
            background: "rgba(24, 10, 36, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)"
          }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-white/60 uppercase tracking-wider text-[9px]">
            <span>Nodes:</span>
          </div>
          {isFirmView && (
            <>
              {isSuperAdmin && (
                <div className="flex items-center gap-1">
                  <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.super_admin.main }} />
                  <span>Admin</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.cio.main }} />
                <span>CIO</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.rm.main }} />
                <span>RMs</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.equity.main }} />
            <span>Equity</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.debt.main }} />
            <span>Debt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.mutual_fund.main }} />
            <span>Mutual Funds</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.reit.main }} />
            <span>REITs</span>
          </div>
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/[0.14]">
            <span className="size-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 font-medium">Alert</span>
          </div>
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/[0.14] text-[9.5px] text-[var(--qc-lime)]">
            <span>Click (+) to expand</span>
          </div>
        </div>

        {/* Zoom badge (Bottom Right) */}
        <div
          className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded text-[10px] font-mono text-white/60 bg-white/[0.06] border border-white/[0.1]"
        >
          Zoom: {(zoomLevel * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
