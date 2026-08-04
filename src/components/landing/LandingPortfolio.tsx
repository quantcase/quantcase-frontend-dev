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

const brokers = [
  { name: "Zerodha", domain: "zerodha.com" },
  { name: "Groww", domain: "groww.in" },
  { name: "Upstox", domain: "upstox.com" },
  { name: "Angel One", domain: "angelone.in" },
  { name: "5paisa", domain: "5paisa.com" },
  { name: "ICICI Direct", domain: "icicidirect.com" },
  { name: "HDFC Sky", domain: "hdfcsky.com" },
  { name: "Kotak Securities", domain: "kotaksecurities.com" },
  { name: "Paytm Money", domain: "paytmmoney.com" },
  { name: "Sharekhan", domain: "sharekhan.com" },
  { name: "Dhan", domain: "dhan.co" },
  { name: "Motilal Oswal", domain: "motilaloswal.com" },
  { name: "IIFL Securities", domain: "iifl.com" },
  { name: "Axis Direct", domain: "axisdirect.in" },
  { name: "SBI Securities", domain: "sbisecurities.in" },
];

// Three rows, each looping at its own speed — a field of logos rather than one
// thin ticker. Every row renders its slice twice; the keyframe translates -50%,
// so the second copy lands exactly where the first began (seamless loop).
const brokerRows = [brokers.slice(0, 5), brokers.slice(5, 10), brokers.slice(10)];

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
          {/* Left: copy + broker coverage */}
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

            {/* Broker coverage — a panel, not a strip. Mirrors the header/badge/footer
                anatomy of the portfolio card opposite it so the two columns rhyme. */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mt-10 overflow-hidden rounded-3xl"
              style={{ border: "1px solid rgba(14,26,43,0.08)", background: "rgba(255,255,255,0.45)" }}
            >
              <div
                className="flex items-center justify-between gap-4 px-6 py-4"
                style={{ borderBottom: "1px solid rgba(14,26,43,0.08)" }}
              >
                <span className="text-[11px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(14,26,43,0.55)" }}>
                  Connect with your major broker
                </span>
              </div>

              <div className="space-y-3 py-7">
                {brokerRows.map((row, r) => (
                  <div
                    key={r}
                    className="marquee-row relative overflow-hidden"
                    style={{
                      maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
                    }}
                  >
                    <div
                      className={`marquee-track gap-3 ${r % 2 === 1 ? "marquee-track--reverse" : ""}`}
                      style={{ animationDuration: `${34 + r * 7}s` }}
                    >
                      {[...row, ...row].map((b, i) => (
                        <span
                          key={`${b.name}-${i}`}
                          className="inline-flex shrink-0 items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-5"
                          style={{
                            border: "1px solid rgba(14,26,43,0.08)",
                            background: "#F5F0E6",
                          }}
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{ background: "#FFFFFF", border: "1px solid rgba(14,26,43,0.06)" }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`}
                              alt=""
                              width={18}
                              height={18}
                              className="h-[18px] w-[18px] rounded-sm"
                            />
                          </span>
                          <span className="whitespace-nowrap text-[13px] font-medium" style={{ ...sans, color: "#0E1A2B" }}>
                            {b.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(14,26,43,0.08)" }}>
                <span className="text-xs" style={{ ...sans, color: "rgba(14,26,43,0.55)" }}>
                  Once linked, act on every signal without leaving your broker — buy, sell, or set alerts directly.
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right: ranked portfolio preview. Self-centred rather than stretched —
              the taller left column sets the row height, so the card sits on its
              optical midline instead of hanging from the top. */}
          <div className="lg:col-span-6 lg:self-center">
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
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(245,240,230,0.10)" }}>
                <div>
                  <div className="text-[10px] uppercase" style={{ ...mono, letterSpacing: "0.22em", color: "rgba(245,240,230,0.55)" }}>
                    Your portfolio · MOD ranked
                  </div>
                  <div className="mt-1 text-xl" style={{ ...serif, color: "#F5F0E6", fontWeight: 400 }}>Preview</div>
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
                    className="grid grid-cols-12 items-center gap-4 px-6 py-3 transition-colors hover:bg-white/[0.03]"
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
                      <span className="text-2xl" style={{ ...serif, color: scoreColor(h.score), fontWeight: 400 }}>{h.score}</span>
                    </div>
                    <span className="col-span-1 text-right text-sm" style={{ ...mono, color: "rgba(245,240,230,0.60)" }}>
                      {h.signal}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid rgba(245,240,230,0.10)" }}>
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
