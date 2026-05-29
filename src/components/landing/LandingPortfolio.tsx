"use client";

import { motion } from "framer-motion";

const serif: React.CSSProperties = { fontFamily: "var(--font-instrument-serif, 'Instrument Serif', serif)" };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace" };
const sans: React.CSSProperties = { fontFamily: "'Geist', system-ui, sans-serif" };

const holdings = [
  { rank: 1, ticker: "HDFCBANK", name: "HDFC Bank", score: 84, signal: "▲" },
  { rank: 2, ticker: "INFY", name: "Infosys", score: 77, signal: "▲" },
  { rank: 3, ticker: "TATAMOTORS", name: "Tata Motors", score: 62, signal: "—" },
  { rank: 4, ticker: "ZOMATO", name: "Zomato", score: 51, signal: "▽" },
];

const integrations = [
  { code: "CD", title: "CDSL", subtitle: "Central Depository Services Ltd." },
  { code: "NS", title: "NSDL", subtitle: "National Securities Depository Ltd." },
  { code: "+", title: "Add manually", subtitle: "Enter tickers yourself" },
];

function scoreColor(score: number) {
  if (score >= 75) return "#D4A95F";
  if (score >= 60) return "#F5F0E6";
  return "rgba(245,240,230,0.55)";
}

export default function LandingPortfolio() {
  return (
    <section id="portfolio" className="relative py-24 md:py-44" style={{ background: "#F5F0E6" }}>
      <div className="mx-auto max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          {/* Left: copy + integrations */}
          <div className="lg:col-span-6">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12" style={{ background: "rgba(185,138,62,0.7)" }} />
              <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.28em", color: "#B98A3E" }}>
                Connect your portfolio
              </span>
            </div>
            <h2
              style={{
                ...serif,
                color: "#0E1A2B",
                fontSize: "clamp(2rem, 4.5vw, 4.25rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontWeight: 400,
                margin: 0,
              }}
            >
              See your holdings{" "}
              <span className="serif-italic" style={{ color: "rgba(14,26,43,0.80)" }}>through a sharper lens.</span>
            </h2>
            <p className="mt-6 max-w-md text-base" style={{ ...sans, color: "#3A4B61" }}>
              Link your demat account. Every stock you own, ranked by MOD conviction — instantly.
            </p>

            <div className="mt-10 space-y-3">
              {integrations.map((it, i) => (
                <motion.button
                  key={it.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="lp-integration-btn group flex w-full items-center justify-between gap-6 rounded-2xl px-6 py-5 text-left"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold"
                      style={{ ...mono, background: "#0E1A2B", color: "#F5F0E6" }}
                    >
                      {it.code}
                    </div>
                    <div>
                      <div className="text-base font-medium" style={{ ...sans, color: "#0E1A2B" }}>{it.title}</div>
                      <div className="text-xs" style={{ ...sans, color: "#3A4B61" }}>{it.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-lg transition-all group-hover:translate-x-1" style={{ ...mono, color: "rgba(14,26,43,0.40)" }}>
                    →
                  </span>
                </motion.button>
              ))}
            </div>

            <p className="mt-8 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.45)" }}>
              Read-only access · SOC 2 certified · Your holdings are never sold or shared.
            </p>
          </div>

          {/* Right: ranked portfolio preview */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="overflow-hidden rounded-3xl"
              style={{
                border: "1px solid rgba(14,26,43,0.08)",
                background: "#0E1A2B",
                color: "#F5F0E6",
                boxShadow: "0 30px 80px rgba(14,26,43,0.18)",
              }}
            >
              <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(245,240,230,0.10)" }}>
                <div>
                  <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(245,240,230,0.55)" }}>
                    Your portfolio · MOD ranked
                  </div>
                  <div className="mt-1 text-2xl" style={{ ...serif, color: "#F5F0E6", fontWeight: 400 }}>Preview</div>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[10px] uppercase"
                  style={{ ...mono, letterSpacing: "0.2em", background: "rgba(185,138,62,0.15)", color: "#B98A3E" }}
                >
                  4 holdings
                </span>
              </div>

              <ul style={{ margin: 0, padding: 0 }}>
                {holdings.map((h) => (
                  <li
                    key={h.ticker}
                    className="grid grid-cols-12 items-center gap-4 px-8 py-5 transition-colors hover:bg-white/[0.03]"
                    style={{ borderBottom: "1px solid rgba(245,240,230,0.10)", listStyleType: "none", marginLeft: 0 }}
                  >
                    <span className="col-span-1 text-xs" style={{ ...mono, color: "rgba(245,240,230,0.40)" }}>
                      #{h.rank}
                    </span>
                    <div className="col-span-5">
                      <div className="text-sm" style={{ ...mono, letterSpacing: "0.05em", color: "#F5F0E6" }}>{h.ticker}</div>
                      <div className="text-xs" style={{ ...sans, color: "rgba(245,240,230,0.55)" }}>{h.name}</div>
                    </div>
                    <div className="col-span-3 text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.18em", color: "rgba(245,240,230,0.45)" }}>
                      M · O · D
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-3xl" style={{ ...serif, color: scoreColor(h.score), fontWeight: 400 }}>{h.score}</span>
                    </div>
                    <span className="col-span-1 text-right text-sm" style={{ ...mono, color: "rgba(245,240,230,0.60)" }}>
                      {h.signal}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between px-8 py-5" style={{ borderTop: "1px solid rgba(245,240,230,0.10)" }}>
                <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(245,240,230,0.55)" }}>
                  2 holdings need review
                </span>
                <a href="#cta" className="text-sm underline-offset-4 hover:underline" style={{ ...sans, color: "#B98A3E" }}>
                  View full report →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
