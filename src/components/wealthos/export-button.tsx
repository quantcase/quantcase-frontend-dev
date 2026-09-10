"use client";

import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { authFetch, authHeaders } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  entityType?: "clients" | "holdings";
  label?: string;
}

export function ExportButton({ entityType = "clients", label = "Export" }: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleDownload = async (format: "csv" | "xlsx") => {
    try {
      setDownloading(true);
      setOpenDropdown(false);

      const endpoint = `${BACKEND_URL}/api/wealthos/export/${entityType}?format=${format}`;
      const res = await authFetch(endpoint, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Export failed: ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entityType}_export_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Download error:", err);
      alert(err.message || "Failed to download export file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        size="sm"
        disabled={downloading}
        onClick={() => setOpenDropdown(!openDropdown)}
        className="h-9 border-hair gap-1.5 text-xs text-ink hover:text-ink"
      >
        {downloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 text-ink-2" />
        )}
        <span>{label}</span>
        <ChevronDown className="w-3 h-3 text-ink-3 ml-0.5" />
      </Button>

      {openDropdown && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpenDropdown(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-hair bg-card shadow-lg z-30 py-1 text-xs">
            <button
              onClick={() => handleDownload("csv")}
              className="w-full text-left px-3 py-2 text-ink hover:bg-secondary flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-ink-2" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => handleDownload("xlsx")}
              className="w-full text-left px-3 py-2 text-ink hover:bg-secondary flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
