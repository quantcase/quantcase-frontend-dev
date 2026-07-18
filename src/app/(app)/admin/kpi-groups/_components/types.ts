// ── KPI display grouping — parent/child tree, per "/admin/kpi-groups" ────────

export interface KpiGroupNode {
  id: string;
  slug: string;
  label: string;
  parent_id: string | null;
  /** Set = this node IS that KPI (leaf). Omit/null = container. */
  kpi_abbr?: string | null;
  /** Optional — branch only shown for that company group. */
  company_group_slug?: string | null;
  display_order: number;
  /** Present (possibly empty) on /tree responses; absent on flat list/search responses. */
  children?: KpiGroupNode[];
}

export interface KpiGroupTreeResponse {
  success: boolean;
  data: KpiGroupNode[];
}

export interface KpiGroupListResponse {
  success: boolean;
  data: KpiGroupNode[];
}

export interface KpiGroupResponse {
  success: boolean;
  data: KpiGroupNode;
}

export interface CompanyGroupOption {
  slug: string;
  name: string;
}

/** Depth-first flatten, root-first, preserving tree order. */
export function flattenTree(nodes: KpiGroupNode[]): KpiGroupNode[] {
  const out: KpiGroupNode[] = [];
  function walk(list: KpiGroupNode[]) {
    for (const n of list) {
      out.push(n);
      if (n.children && n.children.length > 0) walk(n.children);
    }
  }
  walk(nodes);
  return out;
}

export function collectDescendantIds(node: KpiGroupNode): Set<string> {
  const ids = new Set<string>();
  function walk(list: KpiGroupNode[] | undefined) {
    for (const n of list ?? []) {
      ids.add(n.id);
      walk(n.children);
    }
  }
  walk(node.children);
  return ids;
}

/** Ancestor chain (root-first, exclusive of the node itself) for a given slug, or null if not found. */
export function findAncestorPath(nodes: KpiGroupNode[], slug: string): KpiGroupNode[] | null {
  function walk(list: KpiGroupNode[], trail: KpiGroupNode[]): KpiGroupNode[] | null {
    for (const n of list) {
      if (n.slug === slug) return trail;
      if (n.children && n.children.length > 0) {
        const found = walk(n.children, [...trail, n]);
        if (found) return found;
      }
    }
    return null;
  }
  return walk(nodes, []);
}
