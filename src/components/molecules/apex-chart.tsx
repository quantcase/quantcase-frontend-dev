"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

type ApexChartProps = ComponentProps<typeof import("react-apexcharts").default>;

// Dynamically required only on the client to avoid SSR issues with ApexCharts.
// The mount guard prevents the flicker caused by the dynamic import resolving
// after the first render and immediately unmounting/remounting the chart.
export default function ApexChart(props: ApexChartProps) {
  const [Chart, setChart] = useState<React.ComponentType<ApexChartProps> | null>(null);

  useEffect(() => {
    import("react-apexcharts").then((mod) => {
      setChart(() => mod.default);
    });
  }, []);

  if (!Chart) return <div style={{ height: props.height ?? 300 }} />;
  return <Chart {...props} />;
}
