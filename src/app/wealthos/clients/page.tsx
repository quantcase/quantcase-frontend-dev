"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useWealthClients } from "@/hooks/useWealthClients";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { ClientCard } from "@/components/wealthos/client-card";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Segment } from "@/types/wealthos";

const SEGMENTS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "UHNI", value: "UHNI" },
  { label: "HNI", value: "HNI" },
  { label: "Retail", value: "Retail" },
  { label: "Institutional", value: "Institutional" },
  { label: "Private", value: "Private" },
];

const selectStyle: React.CSSProperties = {
  borderRadius: 6,
  border: "1px solid var(--qc-border-default)",
  background: "var(--qc-surface-card)",
  color: "var(--qc-text-heading)",
  fontSize: 13,
  padding: "6px 10px",
  outline: "none",
};

function ClientsContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [rmFilter, setRmFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: rms } = useWealthRMList();
  const { data: clientsData, loading, error } = useWealthClients({
    page,
    size: 20,
    segment: segment as Segment | undefined,
    rm_id: rmFilter || undefined,
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const totalPages = clientsData ? Math.ceil(clientsData.total / 20) : 0;

  return (
    <div className="p-6 space-y-5" style={{ background: "var(--qc-surface-base)", minHeight: "100vh" }}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5" style={{ color: "var(--qc-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            style={{
              width: "100%",
              borderRadius: 6,
              border: "1px solid var(--qc-border-default)",
              background: "var(--qc-surface-card)",
              color: "var(--qc-text-heading)",
              fontSize: 13,
              padding: "6px 10px 6px 32px",
              outline: "none",
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          {SEGMENTS.map(s => (
            <button
              key={s.value}
              onClick={() => { setSegment(s.value); setPage(1); }}
              className="transition-colors"
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                border: segment === s.value ? "1px solid var(--qc-border-active)" : "1px solid var(--qc-border-default)",
                background: segment === s.value ? "var(--qc-accent-primary)" : "var(--qc-surface-card)",
                color: segment === s.value ? "var(--qc-accent-primary-fg)" : "var(--qc-text-muted)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={rmFilter}
          onChange={e => { setRmFilter(e.target.value); setPage(1); }}
          style={selectStyle}
        >
          <option value="">All RMs</option>
          {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
        </select>
        <Button size="sm" onClick={() => router.push("/wealthos/clients/new")} className="ml-auto">
          + New Client
        </Button>
      </div>

      <SectionPanel
        title="Clients"
        subtitle={clientsData ? `${clientsData.total} total clients` : undefined}
        contentClassName="px-6 pb-6 space-y-3"
      >
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="rounded-xl h-20 animate-pulse"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)" }}
              />
            ))}
          </div>
        )}
        {error && <p className="py-4 text-center" style={{ fontSize: 13, color: "var(--qc-down)" }}>{error}</p>}
        {!loading && (clientsData?.items?.length ?? 0) === 0 && !error && (
          <p className="py-8 text-center" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>No clients found</p>
        )}
        {clientsData?.items?.map(client => (
          <ClientCard key={client.id} mode="list" item={client} />
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-3.5 mr-1" /> Prev
            </Button>
            <span style={{ fontSize: 12, color: "var(--qc-text-muted)" }}>Page {page} of {totalPages}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}

export default function WealthOSClientsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
