"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { CreateClientForm } from "@/components/wealthos/create-client-form";

export default function NewClientPage() {
  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/wealthos/clients"
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="size-4" /> Back to Clients
        </Link>
      </div>

      <SectionPanel title="Create New Client" contentClassName="px-6 pb-6">
        <CreateClientForm />
      </SectionPanel>
    </div>
  );
}
