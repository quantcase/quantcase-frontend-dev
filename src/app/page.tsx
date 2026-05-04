import Link from "next/link";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0d0e1a 0%, #111827 50%, #0d1525 100%)",
        fontFamily: "var(--font-ibm-plex-sans, sans-serif)",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 34, height: 34, background: "linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", letterSpacing: "-0.01em" }}>
            Quantcase
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Product", "Research", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href="#"
              style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 400 }}
              className="hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/signin"
            style={{ fontSize: 14, color: "rgba(255,255,255,0.70)", fontWeight: 400 }}
            className="hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signin"
            className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "#ffffff", color: "#0d0e1a", fontSize: 14, fontWeight: 500 }}
          >
            Request access
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6" style={{ paddingTop: 80, paddingBottom: 120 }}>
        {/* Status pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", fontSize: 13, color: "rgba(255,255,255,0.65)" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          Now onboarding institutional allocators · Q2 2026
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            maxWidth: 900,
            marginBottom: 16,
          }}
        >
          Enterprise-grade
          <br />
          research{" "}
          <span style={{ fontStyle: "italic", color: "#d4b483", fontWeight: 400 }}>
            across
          </span>
        </h1>
        <h1
          style={{
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            fontStyle: "italic",
            color: "#d4b483",
            maxWidth: 900,
            marginBottom: 40,
          }}
        >
          Private Markets.
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 560,
            lineHeight: 1.65,
            fontWeight: 400,
            marginBottom: 52,
          }}
        >
          Quantcase brings the rigor of a quant desk to pre-IPO and growth-stage
          investing — earnings intelligence, real-time screening, and deep
          management diligence in one workspace.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/signin"
            className="rounded-full px-7 py-3.5 font-medium transition-all hover:opacity-90"
            style={{ background: "#ffffff", color: "#0d0e1a", fontSize: 15, fontWeight: 500 }}
          >
            Request access →
          </Link>
          <Link
            href="/screener/home"
            className="rounded-full px-7 py-3.5 font-medium transition-all"
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.80)",
              fontSize: 15,
              fontWeight: 400,
              border: "1px solid rgba(255,255,255,0.20)",
            }}
          >
            See a live deal
          </Link>
        </div>
      </main>
    </div>
  );
}
