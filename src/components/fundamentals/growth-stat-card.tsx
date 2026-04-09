export function GrowthStatCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number | null | undefined }[];
}) {
  return (
    <div className="rounded-[10px] border border-[#E2E2E2] bg-white p-5">
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172B", marginBottom: 16 }}>{title}</div>
      <div className="space-y-0">
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            className="flex items-center justify-between py-2"
            style={{ borderTop: i > 0 ? "1px solid #F5F5F5" : undefined }}
          >
            <span style={{ fontSize: 13, color: "#888888" }}>{label}</span>
            <span
              style={{ fontSize: 13, fontWeight: 600 }}
              className={value === null || value === undefined ? "text-zinc-400" : "text-[#0F172B]"}
            >
              {value === null || value === undefined ? "%" : `${parseFloat(value.toFixed(1))}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
