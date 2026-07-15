"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

type HelpTab = "admins" | "faq" | "developers";

const TABS: { id: HelpTab; label: string }[] = [
  { id: "admins", label: "For Admins" },
  { id: "faq", label: "FAQ" },
  { id: "developers", label: "For Developers" },
];

export function HelpModal({ onClose }: Props) {
  const [tab, setTab] = useState<HelpTab>("admins");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex flex-col w-full max-w-[760px] max-h-[85vh] rounded-[10px] border border-[var(--qc-border-default)] bg-card shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--qc-border-default)] px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-[var(--qc-ink)]">Help — HTML Incremental Skills</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-ink-3 hover:text-[var(--qc-ink)] hover:border-[var(--qc-border-default)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-[var(--qc-border-default)] px-5 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[var(--qc-ink)] text-[var(--qc-ink)]"
                  : "border-transparent text-ink-3 hover:text-[var(--qc-ink)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-[13px] leading-relaxed text-ink-3">
          {/* ── For Admins ── */}
          {tab === "admins" && (
            <section className="space-y-3">
              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Historic vs Incremental</p>
                <p><span className="font-medium text-[var(--qc-ink)]">Historic</span> — &ldquo;what would this skill conclude using everything known up to this point?&rdquo; Use it to build a clean baseline at a fixed period, or reproduce what a ticker&rsquo;s analysis looked like historically.</p>
                <p><span className="font-medium text-[var(--qc-ink)]">Incremental</span> — &ldquo;what&rsquo;s changed since the base?&rdquo; Cheaper and faster, since the model only sees new signals plus its own prior conclusion. This is the steady-state mode once a ticker has a base.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">First run for a ticker</p>
                <p>A ticker needs one Historic run before Incremental will work. If you see &ldquo;no base yet,&rdquo; run Historic first — the toggle will lock to Historic automatically until that exists.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Global Base Pin</p>
                <p>Locks <span className="font-medium text-[var(--qc-ink)]">every ticker&rsquo;s</span> Incremental baseline to one exact period (e.g. FY2025 Q3), so results are comparable across the whole universe. Without a pin, each ticker just uses its own latest run as base — which drifts, since tickers get analyzed at different times.</p>
                <p>If a ticker doesn&rsquo;t have an output at the exact pinned period, it has no base at all — not a fallback to its own latest — and will need a Historic run at that period before it can run Incremental. Clear the pin to revert everyone to their own &ldquo;most recent output&rdquo; fallback.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Signal Windows</p>
                <p>How many past quarters/years of data to pull. Historic and Incremental keep separate values — Historic is usually set wider, since it has no prior run to lean on.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Strip Base HTML / Max Base Analyses</p>
                <p>Leave Strip Base HTML on — it sends the prior analysis as plain text instead of raw HTML, cheaper with no loss of information. Max Base Analyses only matters when no pin is set — it&rsquo;s how many of a ticker&rsquo;s own past outputs get stitched together as its base.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Saved Configs</p>
                <p>A skill can have named, alternate settings bundles — e.g. one tuned for tickers that only have PPT data, another for annual-report-only. Manage them via the <span className="font-medium text-[var(--qc-ink)]">Configs</span> button (highlighted in blue on the run screen). Nothing changes unless you pick one from the <span className="font-medium text-[var(--qc-ink)]">Use config</span> dropdown next to it — leaving it on &ldquo;Default config&rdquo; runs the skill exactly as its own top-level settings define it.</p>
                <p>Each config is a full, independent bundle — its signal windows and type filters don&rsquo;t inherit from the skill&rsquo;s own settings, so leave a field unset only if you actually want &ldquo;no cap&rdquo; for that source. Only Model, Max Tokens, and Strip HTML fall back to the skill&rsquo;s defaults when left blank.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">From one config to bulk L2 runs</p>
                <p>This page is where you build and try a config — pick it from the <span className="font-medium text-[var(--qc-ink)]">Use config</span> dropdown and Run it against a handful of representative tickers until you&rsquo;re happy with the output.</p>
                <p>Once it&rsquo;s ready, go to <span className="font-medium text-[var(--qc-ink)]">Coverage → L2</span> and pin that config&rsquo;s key to a Company Group (create one first if the tickers you want aren&rsquo;t grouped yet). From then on, every L2 bulk dispatch run resolves each ticker&rsquo;s config automatically from whichever tagged group covers it — no per-ticker setup needed. A ticker that isn&rsquo;t covered by any tagged group hard-fails L2 with a 400, so tag groups before relying on them for bulk runs.</p>
              </div>
            </section>
          )}

          {/* ── FAQ ── */}
          {tab === "faq" && (
            <section className="space-y-4">
              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Q: A ticker is in two Company Groups, tagged with different configs. Which one applies?</p>
                <p>Whichever group the L2 run is actually scoped to. When you pick <span className="font-medium text-[var(--qc-ink)]">Saved group</span> as the ticker source in Coverage → L2, you&rsquo;re selecting one specific group for that run, and every ticker in it uses that group&rsquo;s tagged config — full stop, regardless of what other groups that same ticker also happens to belong to. The other group and its tag simply aren&rsquo;t in play for that run. To avoid confusion, avoid tagging the same ticker into multiple groups with different configs if you&rsquo;ll ever run against a broader source (Default list / All companies) where the group scoping the ticker isn&rsquo;t explicit.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Q: I have &ldquo;Use config&rdquo; set to something specific on this page — does that affect L2 bulk dispatch?</p>
                <p>No. The config picker on this page only affects the one-off preview/run you trigger right here — it&rsquo;s local, per-session state and is never sent to or read by Coverage → L2. Bulk L2 runs always resolve their config from the Company Group tag, independent of anything selected on this page. Treat this page&rsquo;s config picker purely as a way to build and sanity-check a config before you go tag a group with it.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Q: Can an L2 bulk run fall back to the skill&rsquo;s own default settings, the way &ldquo;Default config&rdquo; does here?</p>
                <p>No — that&rsquo;s the one place the two flows diverge. Here, leaving the picker on &ldquo;Default config&rdquo; is a fully valid choice (it just uses the skill&rsquo;s own top-level fields). L2 bulk dispatch has no such fallback: every ticker in the run must resolve to a tagged config via its Company Group, or it hard-fails with a 400. There&rsquo;s no untagged/default path for bulk runs.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Q: If I edit a config after it&rsquo;s already been used in past runs, do old outputs change?</p>
                <p>No. Editing a config only changes what future runs do with it. Every output row records the <span className="font-medium text-[var(--qc-ink)]">config_key</span> that produced it, but not a frozen copy of the config&rsquo;s settings at that time — so past outputs stay exactly as generated, and you won&rsquo;t see them silently regenerate or change.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Q: Do I need to tag tickers one by one, or does tagging a group cover all of them at once?</p>
                <p>One tag on the group covers every ticker it resolves to — you never tag individual tickers. For a group built from a live/dynamic filter, this also covers tickers that start matching later: the tag lives on the group, not on a frozen membership snapshot, so newly-matched tickers inherit it automatically at run time.</p>
              </div>

              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-0.5">Q: What happens if I delete a config that&rsquo;s still tagged to a Company Group?</p>
                <p>The group is left pointing at a config key that no longer exists. Since a missing/soft-deleted <code>configKey</code> 404s on run (same as it would here), any L2 dispatch relying on that group will start failing for its tickers. Retag or clear the group&rsquo;s config before deleting a config that&rsquo;s still in use.</p>
              </div>
            </section>
          )}

          {/* ── For Developers ── */}
          {tab === "developers" && (
            <section className="space-y-3">
              <div>
                <p className="text-[var(--qc-ink)] font-medium mb-1">Mode semantics</p>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--qc-border-default)]">
                      <th className="text-left py-1 pr-2 font-semibold text-ink-3"></th>
                      <th className="text-left py-1 pr-2 font-semibold text-ink-3">Historic</th>
                      <th className="text-left py-1 font-semibold text-ink-3">Incremental</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--qc-border-default)]">
                    <tr>
                      <td className="py-1 pr-2 text-[var(--qc-ink)]">Requires a base?</td>
                      <td className="py-1 pr-2">No</td>
                      <td className="py-1">Yes — 400 if none</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[var(--qc-ink)]">Lower bound</td>
                      <td className="py-1 pr-2">None (everything up to target)</td>
                      <td className="py-1">Base&rsquo;s own period (exclusive)</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[var(--qc-ink)]">Upper bound</td>
                      <td className="py-1 pr-2" colSpan={2}>Target period (<code>callId</code>) — same in both modes</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[var(--qc-ink)]">Prior analysis in prompt?</td>
                      <td className="py-1 pr-2">No</td>
                      <td className="py-1">Yes — prepended as <code>PRIOR ANALYSIS</code></td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[var(--qc-ink)]">Recency caps used</td>
                      <td className="py-1 pr-2"><code>historic_max_*</code> (falls back to <code>max_*</code>)</td>
                      <td className="py-1"><code>max_*</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
