"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface OfsDonutProps {
  ofsCr: number;
  freshIssueCr: number;
  ofsPct: number;
}

export function OfsDonut({ ofsCr, freshIssueCr, ofsPct }: OfsDonutProps) {
  const data = [
    { name: "OFS", value: ofsCr, color: "#dc2626" },
    { name: "Fresh", value: freshIssueCr, color: "var(--qc-text-heading)" },
  ];

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
        <PieChart width={100} height={100}>
          <Pie data={data} cx={50} cy={50} innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={0}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            formatter={(val: number) => [`₹${val.toLocaleString("en-IN")} Cr`]}
            contentStyle={{ fontSize: 11, border: "1px solid #E2E2E2", borderRadius: 6 }}
          />
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[14px] font-bold" style={{ color: "#dc2626" }}>{Number(ofsPct).toFixed(0)}%</span>
          <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>OFS</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>{d.name}</span>
              <span className="text-[13px] font-semibold ml-2" style={{ color: "var(--qc-text-heading)" }}>
                ₹{d.value.toLocaleString("en-IN")} Cr
              </span>
            </div>
          </div>
        ))}
        <p className="text-[11px] leading-relaxed mt-1" style={{ color: "var(--qc-text-muted)" }}>
          Typical healthy IPO has &lt;40% OFS.
        </p>
      </div>
    </div>
  );
}
