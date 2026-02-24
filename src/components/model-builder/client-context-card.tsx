"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ChevronDown } from "lucide-react";
import type { ClientContext } from "@/types/portfolio";

interface ClientContextCardProps {
  client: ClientContext;
}

export function ClientContextCard({ client }: ClientContextCardProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          Client Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client name */}
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Client Name</p>
          <button className="w-full flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {client.clientName}
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {/* AUM */}
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">AUM</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{client.aum}</p>
        </div>

        {/* Latest Updates */}
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Latest Updates</p>
          <button className="w-full flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {client.latestUpdate}
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
