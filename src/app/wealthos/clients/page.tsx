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
    <div className="p-6 space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          {SEGMENTS.map(s => (
            <button
              key={s.value}
              onClick={() => { setSegment(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                segment === s.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <select
          value={rmFilter}
          onChange={e => { setRmFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <div key={i} className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-20 animate-pulse" />
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-500 py-4 text-center">{error}</p>}
        {!loading && (clientsData?.items?.length ?? 0) === 0 && !error && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">No clients found</p>
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
            <span className="text-xs text-zinc-500">Page {page} of {totalPages}</span>
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
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
