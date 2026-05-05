"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { CreateClientForm } from "@/components/wealthos/create-client-form";

export default function NewClientPage() {
  return (
    <div className="p-6 max-w-3xl space-y-5" style={{ background: "var(--qc-surface-base)", minHeight: "100vh" }}>
      <div className="flex items-center gap-2">
        <Link
          href="/wealthos/clients"
          className="flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ fontSize: 13, color: "var(--qc-text-muted)" }}
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
