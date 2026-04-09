import ApexChart from "@/components/molecules/apex-chart";
import type { ShareholdingSection } from "@/hooks/useShareholding";

const SHAREHOLDING_COLORS = ["#0F172B", "#71717a", "#a1a1aa", "#d4d4d8", "#52525b", "#3f3f46", "#27272a"];

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
    chart: { type: "donut", toolbar: { show: false }, animations: { enabled: false } },
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
              fontSize: "12px",
              fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
              color: "#888888",
              formatter: () => "100%",
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(1)}%` },
    },
    stroke: { width: 2, colors: ["#ffffff"] },
  };

  return (
    <div className="grid grid-cols-2 gap-8" style={{ alignItems: "start" }}>
      {/* Left — horizontal bar chart */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#888888",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          Latest Quarter · {period}
        </div>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.label}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172B", marginBottom: 6 }}>
                {item.label}
              </div>
              <div className="flex items-center gap-3">
                <div
                  style={{ flex: 1, height: 28, background: "#F5F5F5", borderRadius: 4, overflow: "hidden" }}
                >
                  <div
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      height: "100%",
                      background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#0F172B", minWidth: 52, textAlign: "right" }}
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
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#888888",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          Shareholding Summary
        </div>
        <ApexChart
          type="donut"
          series={items.map((i) => i.value)}
          options={donutOptions}
          height={300}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: SHAREHOLDING_COLORS[i % SHAREHOLDING_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "#888888" }}>
                {item.label}:{" "}
                <strong style={{ color: "#0F172B" }}>{item.value.toFixed(1)}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
