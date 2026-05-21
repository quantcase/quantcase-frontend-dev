export function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2">
      <p className="text-[15px] font-medium" style={{ color: "var(--qc-text-heading)" }}>
        {title}
      </p>
      <p className="text-[12px]" style={{ color: "var(--qc-text-muted)" }}>
        Coming soon
      </p>
    </div>
  );
}
