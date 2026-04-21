import ApexChart from "@/components/molecules/apex-chart";
import type { ShareholdingSection } from "@/hooks/useShareholding";
import { MonoEyebrow } from "@/components/overview/primitives";

// Ink-family palette: heading → body → muted → ink-3 variants
const SHAREHOLDING_COLORS = ["#0E0E0C", "#5A5A54", "#9A9A92", "#C8C6C0", "#3A3A38", "#2A2A28", "#1A1A18"];

export function ShareholdingCharts({
  sections,
  quarters,
}: {
  sections: ShareholdingSection[];
  quarters: string[];
}) {
  const period =
    [...quarters].reverse().find((q) =>
      sections.some((s) => {
        const dp = s.data.find((d) => d.quarter === q);
        return dp?.value !== null && dp?.value !== undefined;
      })
    ) ?? quarters[quarters.length - 1];

  const items = sections
    .map((s) => {
      const dp = s.data.find((d) => d.quarter === period);
      return { label: s.label, value: dp?.value ?? null };
    })
    .filter((item): item is { label: string; value: number } => item.value !== null && item.value > 0);

  const maxValue = Math.max(...items.map((i) => i.value));

  const donutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
      animations: { enabled: false },
      background: "transparent",
    },
    labels: items.map((i) => i.label),
    colors: SHAREHOLDING_COLORS,
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "58%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "11px",
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#9A9A92",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val: number) => `${val.toFixed(1)}%` },
    },
    stroke: { width: 2, colors: ["var(--qc-surface-white, #FBFAF7)"] },
  };

  return (
    <div className="grid grid-cols-2 gap-8" style={{ alignItems: "start" }}>
      {/* Left — horizontal bar chart */}
      <div>
        <MonoEyebrow style={{ marginBottom: 14 }}>Latest Quarter · {period}</MonoEyebrow>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.label}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--qc-text-body)",
                  marginBottom: 6,
                }}
              >
                {item.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    height: 24,
                    background: "var(--qc-surface-panel)",
                    borderRadius: 6,
                    overflow: "hidden",
                    border: "1px solid var(--qc-border-inner)",
                  }}
                >
                  <div
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: "100%",
                      background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
                      borderRadius: 6,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--qc-text-heading)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    letterSpacing: "0.02em",
                    minWidth: 52,
                    textAlign: "right",
                  }}
                >
                  {item.value.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — donut chart */}
      <div>
        <MonoEyebrow style={{ marginBottom: 14 }}>Shareholding Summary</MonoEyebrow>
        <ApexChart
          type="donut"
          series={items.map((i) => i.value)}
          options={donutOptions}
          height={280}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12, justifyContent: "center" }}>
          {items.map((item, i) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--qc-text-body)", fontFamily: "'IBM Plex Mono', monospace" }}>
                {item.label}:{" "}
                <strong style={{ color: "var(--qc-text-heading)" }}>{item.value.toFixed(1)}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
