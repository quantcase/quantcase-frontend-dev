"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X } from "lucide-react";

interface Props {
  title: string;
  data: unknown;
  onClose: () => void;
}

/**
 * Full-screen portal showing a payload as formatted JSON. Rendered into
 * `document.body` so it escapes the sticky rail's stacking/overflow context.
 */
export function RawDataDialog({ title, data, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const json = JSON.stringify(data, null, 2);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset the confirmation so a second copy still reads as an action.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
    } catch {
      // Clipboard is unavailable outside a secure context — leave the button idle.
    }
  }, [json]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--qc-card)",
          border: "1px solid var(--qc-hair)",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}>
          <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-10)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--qc-ink-2)" }}>
            {title}
          </span>

          <button
            onClick={copy}
            style={{
              marginLeft: "auto",
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 8,
              border: "1px solid var(--qc-hair)", background: "var(--qc-card)",
              cursor: "pointer",
            }}
          >
            {copied
              ? <Check style={{ width: 11, height: 11, color: "var(--qc-up)" }} />
              : <Copy style={{ width: 11, height: 11, color: "var(--qc-ink-2)" }} />}
            <span style={{ fontFamily: "var(--qc-font-mono)", fontSize: "var(--qc-fz-9)", textTransform: "uppercase", letterSpacing: "0.1em", color: copied ? "var(--qc-up)" : "var(--qc-ink-2)" }}>
              {copied ? "Copied" : "Copy"}
            </span>
          </button>

          <button onClick={onClose} aria-label="Close" style={{ display: "grid", placeItems: "center", padding: 5, borderRadius: 8, border: "1px solid var(--qc-hair)", background: "var(--qc-card)", cursor: "pointer" }}>
            <X style={{ width: 12, height: 12, color: "var(--qc-ink-2)" }} />
          </button>
        </div>

        <pre
          style={{
            margin: 0,
            padding: "12px 14px",
            overflow: "auto",
            fontFamily: "var(--qc-font-mono)",
            fontSize: "var(--qc-fz-11)",
            lineHeight: 1.6,
            color: "var(--qc-ink)",
            whiteSpace: "pre",
            tabSize: 2,
          }}
        >
          {json}
        </pre>
      </div>
    </div>,
    document.body,
  );
}
