"use client";

import { useState } from "react";
import { ActionButton, GoldenCard, MonoLabel } from "@/components/ds";
import { LayoutGrid } from "lucide-react";

const SEGMENTS = [
  { id: "1", label: "Needs immediate action", count: 3  },
  { id: "2", label: "Portfolio drift alerts", count: 5  },
  { id: "3", label: "High AUM (₹5Cr+)",       count: 7  },
  { id: "4", label: "EV / Green Energy interest", count: 4 },
  { id: "5", label: "Conservative",           count: 6  },
  { id: "6", label: "Inactive > 30 days",     count: 2  },
  { id: "7", label: "KYC expiring",           count: 1  },
];

export function SmartSegmentsPills() {
  const [active, setActive] = useState("1");

  return (
    <section style={{ marginBottom: 22 }}>
      <div
        className="rounded-[10px] p-2"
        style={{ border: "1px solid var(--qc-hair)", background: "var(--qc-section)" }}
      >
        {/* Header */}
        <div className="px-2 pt-1 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-3.5" style={{ color: "var(--qc-ink-2)" }} />
            <MonoLabel size={11} tracking="0.16em" color="var(--qc-ink)">Smart segments</MonoLabel>
          </div>
          <MonoLabel tracking="0.04em" color="var(--qc-ink-3)" style={{ cursor: "pointer" }}>
            Create segment →
          </MonoLabel>
        </div>

        {/* Pills */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: "var(--qc-card)", padding: "14px 16px", display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
        >
          {SEGMENTS.map((seg) => {
            const isActive = active === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActive(seg.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: isActive ? "var(--primary)" : "var(--qc-section)",
                  border: isActive ? "1px solid var(--qc-lime-edge)" : "1px solid var(--qc-hair)",
                  fontSize: 12.5,
                  color: isActive ? "var(--qc-on-dark)" : "var(--qc-ink-2)",
                  cursor: "pointer",
                  fontFamily: "var(--qc-font-sans)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {seg.label}
                <span
                  style={{
                    fontFamily: "var(--qc-font-mono)",
                    fontSize: 10.5,
                    color: isActive ? "var(--qc-lime-ink)" : "var(--qc-ink-3)",
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: isActive ? "rgba(255,255,255,0.6)" : "var(--qc-chip)",
                    border: isActive ? "1px solid rgba(46,74,10,0.18)" : "1px solid var(--qc-hair)",
                  }}
                >
                  {seg.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Research Terminal */}
        <GoldenCard
          radius={10}
          columns="28px minmax(0,1fr) auto"
          rail={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{ width: 20, height: 20, color: "var(--qc-lime-ink)" }}
            >
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
            </svg>
          }
          entity={
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3, color: "var(--qc-lime-ink)" }}>
                Research Terminal
              </div>
              <MonoLabel size={10.5} tracking="0.04em" color="var(--qc-lime-ink-2)">
                3 thesis updates · 5 catalysts in next 30 days · IC drafts, watchlists &amp; signal changes
              </MonoLabel>
            </div>
          }
          actions={
            <ActionButton
              noWrap
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.7)",
                color: "var(--qc-lime-ink)",
                borderRadius: 999,
              }}
            >
              Open Research →
            </ActionButton>
          }
          style={{ padding: "14px 18px" }}
        />
      </div>
    </section>
  );
}
