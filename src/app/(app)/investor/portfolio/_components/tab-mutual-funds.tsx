import type { MutualFund } from "./portfolio-data";
import { fmtLakhs } from "./portfolio-data";

export function MutualFundsTab({ funds }: { funds: MutualFund[] }) {
  return (
    <div style={{ background: "var(--qc-card)", border: "1px solid var(--qc-hair)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--qc-hair)", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--qc-ink-2)" }}>Mutual Funds</span>
        <span style={{ background: "var(--qc-bg)", padding: "2px 8px", borderRadius: 999, fontSize: 11, color: "var(--qc-ink-2)", fontFamily: "var(--qc-font-mono)" }}>{funds.length}</span>
        <span style={{ fontSize: 11, color: "var(--qc-ink-3)", marginLeft: 4 }}>folio-linked</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--qc-bg)" }}>
              {["Fund", "Units · NAV", "Current Value", "P&L", "XIRR", "Day"].map((h, i) => (
                <th key={h} style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--qc-ink-3)", fontWeight: 600, padding: "10px 20px", textAlign: i === 0 ? "left" : "right", borderBottom: "1px solid var(--qc-hair)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funds.map((f, i) => (
              <tr key={f.name} style={{ borderBottom: i < funds.length - 1 ? "1px solid var(--qc-hair)" : "none", cursor: "pointer" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-ink)" }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: "var(--qc-ink-3)", marginTop: 2, fontWeight: 500 }}>{f.type}</div>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "var(--qc-font-mono)", fontSize: 12, color: "var(--qc-ink)" }}>
                  {f.units} @ ₹{f.nav}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "var(--qc-font-mono)", fontSize: 12, fontWeight: 600, color: "var(--qc-ink)" }}>
                  {fmtLakhs(f.currentValue)}
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "var(--qc-font-mono)", fontSize: 11, color: f.pnl >= 0 ? "var(--qc-up)" : "#B91C1C" }}>
                  {f.pnl >= 0 ? "+" : ""}{fmtLakhs(f.pnl)}<br />
                  <span style={{ fontSize: 10 }}>{f.pnl >= 0 ? "+" : ""}{f.pnlPct.toFixed(1)}%</span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "var(--qc-font-mono)", fontSize: 11, fontWeight: 600, color: "var(--qc-up)" }}>
                  {f.xirr.toFixed(1)}%
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "var(--qc-font-mono)", fontSize: 11, color: f.dayChangePct >= 0 ? "var(--qc-up)" : "#B91C1C" }}>
                  {f.dayChangePct >= 0 ? "+" : ""}{f.dayChangePct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
