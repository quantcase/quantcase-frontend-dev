"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ds";

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
      <SectionHeader label="Smart segments" linkLabel="Create segment →" />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                background: isActive ? "var(--qc-lime)" : "#fff",
                border: isActive ? "1px solid var(--qc-lime-edge)" : "1px solid var(--qc-hair)",
                fontSize: 12.5,
                color: isActive ? "var(--qc-lime-ink)" : "var(--qc-ink-2)",
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
    </section>
  );
}
