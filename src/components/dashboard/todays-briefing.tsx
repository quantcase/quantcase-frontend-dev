export function TodaysBriefing() {
  return (
    <div
      className="rounded-xl px-7 py-6 flex flex-col relative overflow-hidden"
      style={{ background: "var(--qc-text-heading)", color: "#FCFCFA", minHeight: 360 }}
    >
      {/* Subtle radial accent */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: 220, height: "100%",
          background: "radial-gradient(circle at top right, rgba(194,65,12,0.18), transparent 70%)",
        }}
      />

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3 relative" style={{ color: "rgba(255,255,255,0.5)" }}>
        Today&apos;s Brief · 09:42 IST
      </p>

      <p className="text-[22px] font-normal leading-[1.25] tracking-[-0.01em] mb-auto pb-5 relative" style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)" }}>
        Three clients need a conversation before market open.{" "}
        <em className="not-italic" style={{ color: "#F59E0B" }}>Rahul</em> first — small-cap drift +6%.
      </p>

      <div className="flex gap-2 flex-wrap relative">
        {[
          { dot: "#EF4444", label: "Call Rahul" },
          { dot: "#F59E0B", label: "EV report → Anita" },
          { dot: "#EF4444", label: "Rebalance Varun" },
        ].map(({ dot, label }) => (
          <button
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#FCFCFA",
            }}
          >
            <span className="size-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
