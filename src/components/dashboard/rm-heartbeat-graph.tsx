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
  ChevronRight
} from "lucide-react";
import { MonoLabel } from "@/components/ds";

// ── Types ─────────────────────────────────────────────────────────────────────

export type HoldingCategory =
  | "equity"
  | "debt"
  | "mutual_fund"
  | "reit"
  | "intl"
  | "alts"
  | "rm";

export type HealthSeverity = "critical" | "warning" | "moderate" | "clean";

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  category: HoldingCategory;
  kind: "rm" | "client" | "asset_class" | "holding";
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
  parentId?: string;
  clientId?: string;
  details?: {
    allocation?: string;
    riskScore?: number;
    driftPct?: string;
    rebalanceDue?: boolean;
    holdingCount?: number;
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

function createInitialGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
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
    const clientDist = 170;
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
      x: cx + (Math.random() - 0.5) * 15,
      y: cy + (Math.random() - 0.5) * 15,
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
      const acSpread = 0.7;
      const acAngle = angle + (acIdx - (acCount - 1) / 2) * (acSpread / Math.max(1, acCount - 1));
      const acDist = 78;
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
        x: acx + (Math.random() - 0.5) * 12,
        y: acy + (Math.random() - 0.5) * 12,
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
        const hSpread = 0.9;
        const hAngle = acAngle + (hIdx - (hCount - 1) / 2) * (hSpread / Math.max(1, hCount - 1));
        const hDist = 50;
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

// ── RM Heartbeat Graph Component ──────────────────────────────────────────────

export function RMHeartbeatGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState<HoldingCategory | "all" | "alerts">("all");
  const [colorMode, setColorMode] = useState<"category" | "severity">("category");
  const [searchQuery, setSearchQuery] = useState("");

  // Transform / Camera
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Hover & Active Inspection
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Physics data
  const graphDataRef = useRef(createInitialGraphData());
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Connected nodes lookup for hover highlight
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNode && !selectedNode) return null;
    const target = (hoveredNode || selectedNode)!;
    const ids = new Set<string>([target.id]);

    // Add ancestors
    let curr = target;
    const allNodes = graphDataRef.current.nodes;
    while (curr.parentId) {
      ids.add(curr.parentId);
      const parent = allNodes.find((n) => n.id === curr.parentId);
      if (!parent) break;
      curr = parent;
    }

    // Add descendants
    const addDescendants = (parentId: string) => {
      allNodes.forEach((n) => {
        if (n.parentId === parentId) {
          ids.add(n.id);
          addDescendants(n.id);
        }
      });
    };
    addDescendants(target.id);

    return ids;
  }, [hoveredNode, selectedNode]);

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

  // Center graph in canvas
  const centerGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    transformRef.current = {
      x: rect.width / 2,
      y: rect.height / 2,
      k: 0.95
    };
    setZoomLevel(0.95);
  }, []);

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

  // Physics Simulation Step
  const runPhysicsStep = useCallback(() => {
    const { nodes, links } = graphDataRef.current;
    const nodeMap = new Map<string, GraphNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const DAMPING = 0.88;
    const CENTER_GRAVITY = 0.0018;
    const REPULSION = 1400;

    // Center Gravity
    nodes.forEach((n) => {
      if (n.kind === "rm") {
        n.vx -= n.x * 0.02;
        n.vy -= n.y * 0.02;
      } else {
        n.vx -= n.x * CENTER_GRAVITY;
        n.vy -= n.y * CENTER_GRAVITY;
      }
    });

    // Many-Body Coulomb Repulsion
    const len = nodes.length;
    for (let i = 0; i < len; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < len; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        const minDist = a.radius + b.radius + 12;
        let force = REPULSION / (distSq + 200);
        if (dist < minDist) {
          force += (minDist - dist) * 0.08;
        }

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Link Spring Attraction
    links.forEach((link) => {
      const a = nodeMap.get(link.source);
      const b = nodeMap.get(link.target);
      if (!a || !b) return;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = dist - link.distance;
      const strength = 0.045;

      const fx = (dx / dist) * diff * strength;
      const fy = (dy / dist) * diff * strength;

      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    });

    // Position updates
    nodes.forEach((n) => {
      if (n.fx != null && n.fy != null) {
        n.x = n.fx;
        n.y = n.fy;
        n.vx = 0;
        n.vy = 0;
      } else {
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
      }
    });
  }, []);

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

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Flat solid navy background matching Today's Brief box
      ctx.fillStyle = NAVY_BG;
      ctx.fillRect(0, 0, width, height);

      // Subtle micro-dots grid for coordinate depth
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      const gridSize = 36;
      const offsetX = transformRef.current.x % (gridSize * transformRef.current.k);
      const offsetY = transformRef.current.y % (gridSize * transformRef.current.k);
      const step = gridSize * transformRef.current.k;
      for (let x = offsetX; x < width; x += step) {
        for (let y = offsetY; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Apply camera transform
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      const { nodes, links } = graphDataRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach((n) => nodeMap.set(n.id, n));

      // ── Draw Links ──────────────────────────────────────────────────────────
      links.forEach((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return;

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

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

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
          ctx.lineWidth = source.kind === "rm" ? 1.5 : source.kind === "client" ? 1.1 : 0.8;
          ctx.globalAlpha = source.kind === "rm" ? 0.38 : source.kind === "client" ? 0.28 : 0.20;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // ── Draw Nodes ──────────────────────────────────────────────────────────
      nodes.forEach((node) => {
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

        // Outer pulsing aura
        if ((node.severity === "critical" || isHovered || isSelected || isSearchMatched) && !isDimmed) {
          const pulse = Math.sin(pulseAngle + node.x * 0.05) * 4;
          const auraRadius = node.radius + 6 + (node.severity === "critical" ? pulse : 2);
          ctx.beginPath();
          ctx.arc(node.x, node.y, auraRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.severity === "critical" ? "rgba(248, 113, 113, 0.25)" : glowColor;
          ctx.fill();

          if (node.severity === "critical") {
            ctx.beginPath();
            ctx.arc(node.x, node.y, auraRadius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(248, 113, 113, 0.7)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = mainColor;

        if (isHovered || isSelected || isSearchMatched) {
          ctx.shadowColor = mainColor;
          ctx.shadowBlur = 18;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Border / Ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle =
          node.kind === "rm"
            ? "#FFFFFF"
            : isHovered || isSelected
            ? "#FFFFFF"
            : "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = node.kind === "rm" ? 2.4 : 1.2;
        ctx.stroke();

        // Node Center Glyph
        if (node.kind === "rm") {
          ctx.fillStyle = "#210B2C";
          ctx.font = "bold 11px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("RM", node.x, node.y);
        } else if (node.kind === "client") {
          const initials = node.label.split(" ").map((w) => w[0]).join("").slice(0, 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 9.5px IBM Plex Sans, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(initials, node.x, node.y);
        }

        // Labels
        const shouldShowLabel =
          node.kind === "rm" ||
          node.kind === "client" ||
          node.kind === "asset_class" ||
          transformRef.current.k > 0.85 ||
          isHovered ||
          isSelected ||
          isSearchMatched;

        if (shouldShowLabel && !isDimmed) {
          const fontSize = node.kind === "rm" ? 11 : node.kind === "client" ? 10 : 8.5;
          ctx.font = `${node.kind === "rm" || node.kind === "client" ? "600" : "500"} ${fontSize}px IBM Plex Sans, sans-serif`;
          ctx.fillStyle = isHovered || isSelected ? "#FFFFFF" : "rgba(255, 255, 255, 0.9)";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(node.label, node.x, node.y + node.radius + 3.5);

          if (node.sublabel && (node.kind === "client" || isHovered || isSelected)) {
            ctx.font = "400 8.5px IBM Plex Mono, monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillText(node.sublabel, node.x, node.y + node.radius + fontSize + 4);
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
  }, [activeFilter, colorMode, connectedNodeIds, searchMatchedIds, hoveredNode, selectedNode, centerGraph, runPhysicsStep]);

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
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = n.x - x;
        const dy = n.y - y;
        const hitRadius = Math.max(n.radius, 14);
        if (dx * dx + dy * dy <= hitRadius * hitRadius) {
          return n;
        }
      }
      return null;
    },
    [screenToWorld]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const node = findNodeAt(e.clientX, e.clientY);
    if (node) {
      isDraggingRef.current = true;
      draggedNodeRef.current = node;
      const w = screenToWorld(e.clientX, e.clientY);
      node.fx = w.x;
      node.fy = w.y;
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
    if (isDraggingRef.current && draggedNodeRef.current) {
      const w = screenToWorld(e.clientX, e.clientY);
      draggedNodeRef.current.fx = w.x;
      draggedNodeRef.current.fy = w.y;
    } else if (isPanningRef.current) {
      transformRef.current.x = e.clientX - panStartRef.current.x;
      transformRef.current.y = e.clientY - panStartRef.current.y;
    } else {
      const node = findNodeAt(e.clientX, e.clientY);
      setHoveredNode(node);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      isDraggingRef.current = false;

      const dist = Math.hypot(
        e.clientX - dragStartPosRef.current.x,
        e.clientY - dragStartPosRef.current.y
      );
      if (dist < 4) {
        setSelectedNode((prev) => (prev?.id === draggedNodeRef.current?.id ? null : draggedNodeRef.current));
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
      className="rounded-[10px] flex flex-col transition-all overflow-hidden relative w-full min-w-0"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.12)",
        background: NAVY_BG,
        minHeight: 520
      }}
    >
      {/* ── Top Header Section: Number of Clients (Top-Left) & AUM Metric (Top-Right) ── */}
      <div
        className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-4 border-b shrink-0 z-10"
        style={{
          borderColor: "rgba(255, 255, 255, 0.1)",
          background: NAVY_BG
        }}
      >
        {/* Top-Left: Number of Clients & RM Heartbeat Branding */}
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
                RM HEARTBEAT
              </span>
              <span
                className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold"
                style={{
                  background: "rgba(255, 245, 202, 0.15)",
                  color: "var(--qc-lime)",
                  border: "1px solid rgba(255, 245, 202, 0.3)"
                }}
              >
                Active Book
              </span>
            </div>
            <div
              className="text-[11.5px] text-white/70 flex items-center gap-2 mt-0.5"
              style={{ fontFamily: "var(--qc-font-mono)" }}
            >
              <span className="font-semibold text-white">18 CLIENTS</span>
              <span>·</span>
              <span>52 HOLDINGS</span>
              <span>·</span>
              <span className="text-amber-300">3 FLAGGED</span>
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
                ₹796 Cr
              </span>
              <span
                className="text-[11px] font-mono text-white/60 uppercase tracking-wider"
              >
                Total AUM
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

        {/* Right Tools (Search, Color Mode, Zoom, Fullscreen) */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex items-center">
            <Search className="size-3.5 absolute left-2 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker or client..."
              className="pl-7 pr-2.5 py-1 rounded-md text-[11px] bg-white/[0.08] border border-white/[0.14] text-white placeholder-white/40 focus:outline-none focus:border-white/40 w-36 transition-all focus:w-44"
            />
          </div>

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
                  {activeInspection.kind.replace("_", " ")} · {CATEGORY_COLORS[activeInspection.category]?.label}
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
                  <span className="text-white/60 block text-[9.5px]">Client AUM</span>
                  <span className="text-white font-mono font-medium">{activeInspection.aum}</span>
                </div>
              )}
              {activeInspection.weight && (
                <div>
                  <span className="text-white/60 block text-[9.5px]">Portfolio Weight</span>
                  <span className="text-white font-mono font-medium">{activeInspection.weight}</span>
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

            {/* Contextual Action CTA */}
            {activeInspection.kind === "client" && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-white/60">Explore client holdings</span>
                <Link
                  href="/brief/priya-venkat"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--qc-lime)] hover:underline transition-colors"
                >
                  <span>View Brief</span>
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
            <span>Assets:</span>
          </div>
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
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.intl.main }} />
            <span>Intl</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS.alts.main }} />
            <span>Alts</span>
          </div>
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/[0.14]">
            <span className="size-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 font-medium">Critical Drift</span>
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
