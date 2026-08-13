"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";
import { authFetch } from "@/lib/api";

interface Props {
  slug: string;
  ticker: string;
}

function stripHtmlFences(raw: string): string {
  return raw.replace(/^```html\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export function LensHtmlPreview({ slug, ticker }: Props) {
  // The backend has deprecated pe-rerating-potential and merged its logic into earning-quality.
  // We map any legacy or alternative aliases to this new consolidated slug.
  let apiSlug = slug === "pe-rerating-potential" || slug === "earnings-quality" || slug === "earnings_quality" ? "earning-quality" : slug;

  // Normalize all other slugs to kebab-case (dashes instead of underscores) because
  // the HTML incremental skills API strictly expects kebab-case.
  apiSlug = apiSlug.replace(/_/g, "-");

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setHtml(null);
      setError(null);
      setLoading(true);
      try {
        const res = await authFetch(`${BACKEND_URL}/api/html-incremental-skills/${apiSlug}/outputs/${ticker}`);
        if (cancelled) return;
        if (res.status === 404) { setError("No output available yet for this lens."); return; }
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(json?.error ?? `${res.status}`);
        const raw: string | null = json?.raw_html ?? json?.output?.raw_html ?? null;
        if (!raw) { setError("No output available yet for this lens."); return; }
        setHtml(stripHtmlFences(raw));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load lens output.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug, ticker]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--qc-ink-3)" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "var(--qc-fz-13)", fontFamily: "var(--qc-font-sans)" }}>Loading lens output…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
        <span style={{ fontSize: "var(--qc-fz-13)", color: "var(--qc-ink-3)", fontFamily: "var(--qc-font-sans)" }}>{error}</span>
      </div>
    );
  }

  if (!html) return null;

  return (
    <iframe
      srcDoc={html}
      style={{ flex: 1, width: "100%", border: "none", minHeight: 0 }}
      sandbox="allow-scripts allow-same-origin"
      title={`${slug} / ${ticker}`}
    />
  );
}
