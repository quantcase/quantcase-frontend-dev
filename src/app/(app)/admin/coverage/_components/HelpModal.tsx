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
      <div className="flex flex-col w-full max-w-[760px] max-h-[85vh] rounded-[10px] border border-[#E2E2E2] bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E2E2] px-5 py-3 shrink-0">
          <h3 className="text-[14px] font-medium text-[#0F172B]">Help — Pipeline Coverage</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded border border-transparent text-[#888888] hover:text-[#0F172B] hover:border-[#E2E2E2] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-[#E2E2E2] px-5 shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[#0F172B] text-[#0F172B]"
                  : "border-transparent text-[#888888] hover:text-[#0F172B]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-[13px] leading-relaxed text-[#888888]">
          {/* ── For Admins ── */}
          {tab === "admins" && (
            <>
              <section className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172B]">L1 — Transcript / PPT / Annual Report Extraction</h4>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">What it does</p>
                  <p>On-demand, one-off signal extraction — there&rsquo;s no cron/auto mode, every run is triggered manually for a chosen ticker set. <span className="font-medium text-[#0F172B]">Preview</span> is read-only and free to repeat. <span className="font-medium text-[#0F172B]">Run</span> dispatches real, billable LLM extraction jobs, so it stays disabled until Preview matches the exact options you&rsquo;re about to run.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Which companies?</p>
                  <p><span className="font-medium text-[#0F172B]">Default list</span> falls back to the backend&rsquo;s built-in ticker list. <span className="font-medium text-[#0F172B]">Manual tickers</span> lets you type an explicit set for this run only. <span className="font-medium text-[#0F172B]">Saved group</span> reuses a Company Group. <span className="font-medium text-[#0F172B]">All companies</span> scans everything (~2,000 tickers) — pair with Start From to resume a partial run.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Extraction options</p>
                  <p><span className="font-medium text-[#0F172B]">Start From</span> is an alphabetical cursor to resume a long run. <span className="font-medium text-[#0F172B]">Limit</span> and <span className="font-medium text-[#0F172B]">Latest</span> both cap to the N most-recent calls/reports per ticker — Latest wins if both are set. Leave both blank and Preview shows only the 20 most recent calls per ticker (the true total is still shown alongside) — set either one to look further back. <span className="font-medium text-[#0F172B]">Force re-extract</span> re-runs tickers that already have signals, discarding the old ones (off by default, so already-extracted tickers are normally skipped). <span className="font-medium text-[#0F172B]">Annual reports only</span> and <span className="font-medium text-[#0F172B]">Skip annual reports</span> are mutually exclusive toggles for which source types run.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Preview pagination</p>
                  <p>Once a preview spans more than one page of companies, Page controls appear next to the tickers-total count. Paging never invalidates Run — pagination only affects which slice of companies Preview displays, not what a subsequent Run dispatches.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Export CSV</p>
                  <p>Downloads the full picture as a spreadsheet — always covers complete, uncapped history. Limit, Latest, AR-only, and Skip AR are ignored for the export, and the export is never paginated (always all companies in one file).</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Run History errors</p>
                  <p>When a ticker&rsquo;s per-ticker row in Run History shows a non-zero <span className="font-medium text-[#0F172B]">Failed</span> count, that count becomes a clickable expander revealing the specific document(s) that failed — source (transcript/PPT/annual report), fiscal year/quarter, and the error message. A ticker can fail on more than one document in the same run.</p>
                </div>
              </section>

              <div className="border-t border-[#E2E2E2]" />

              <section className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172B]">L2 — Skill Dispatch</h4>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">What it does</p>
                  <p>Runs a specific analysis skill (e.g. guidance-credibility) against a ticker set. There&rsquo;s no default ticker list here — pick Manual tickers, a Saved group, or All companies. Every ticker resolves its skill config automatically from whichever tagged Company Group covers it; an untagged ticker hard-fails with a 400 on Run. If a ticker sits in more than one tagged group, the most recently updated group wins — see Overlapping groups below.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Group Config Tag</p>
                  <p>Picking <span className="font-medium text-[#0F172B]">Saved group</span> surfaces a config-tagging control right there in the dispatch flow, so you can tag or retag that group with the skill config it should resolve to without leaving the page. It&rsquo;s always editable, even if the group is already tagged.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Multiple skills</p>
                  <p>The Skill field is a checkbox list, not a single picker — check as many as you want, or use <span className="font-medium text-[#0F172B]">Select all</span>. Preview always queries just the first selected skill (one <code>/preview</code> call, since it only accepts a single slug). Run fans out to every selected skill at once — one <code>/run</code> POST per skill, fired concurrently, not one at a time — and each gets its own row in Run History.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Historic mode / Force</p>
                  <p>Both are <span className="font-medium text-[#0F172B]">Run only</span> — Preview ignores them entirely. <span className="font-medium text-[#0F172B]">Historic</span> runs the full base-context build instead of incremental; <span className="font-medium text-[#0F172B]">Force</span> bypasses the cache.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Preview</p>
                  <p>A fast, single-query signal-availability report — not a per-ticker prompt build, so it&rsquo;s quick even for large groups. Shows transcript/PPT/annual-report totals per ticker, expandable to a per fiscal-year/quarter breakdown. Use <span className="font-medium text-[#0F172B]">Sort by least covered</span> to surface the biggest coverage gaps for a given source first — note this only sorts within the current page, not across the whole ticker set. Page controls appear once a preview spans more than one page; paging doesn&rsquo;t affect Run.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Export CSV vs JSON Preview</p>
                  <p>CSV numbers won&rsquo;t exactly match the JSON preview above: CSV reports total signal coverage of any type per period, while the JSON preview only counts signals relevant to the selected skill&rsquo;s whitelist. This is a deliberate tradeoff to keep broad-whitelist CSV exports fast.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Run History caveat</p>
                  <p>Queued/failed counts here only mean dispatch succeeded — the actual per-ticker skill result happens later, inside the worker. A ticker can show &ldquo;queued&rdquo; here and still fail once picked up; check the job/Bull Board flow for the real outcome.</p>
                </div>
              </section>

              <div className="border-t border-[#E2E2E2]" />

              <section className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172B]">Daily Runs — Prowess Daily &amp; BSE Discovery</h4>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Prowess Daily</p>
                  <p>Not implemented yet — placeholder section, coming later.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">BSE Discovery — what it does</p>
                  <p><span className="font-medium text-[#0F172B]">Run Discovery</span> scrapes BSE and resolves cover-letter PDFs in the background (~1-2 min); an optional Lookback Days narrows how far back it looks. Nothing lands in the real tables automatically — every discovered URL passes through an admin&rsquo;s eyes first.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Discovered URLs</p>
                  <p>Every URL from every scrape in the last N days (default 14) — there&rsquo;s no &ldquo;pending&rdquo; status, this is just a flat review list. The same URL can reappear across days if re-scraped. <span className="font-medium text-[#0F172B]">Source</span> shows &ldquo;BSE Original&rdquo; (straight from the filing) vs &ldquo;Resolved&rdquo; (extracted from a cover-letter PDF).</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Company / Fiscal Year / Quarter</p>
                  <p>Prefilled from the backend&rsquo;s best guess, always editable. Quarter is hidden for annual reports (not applicable). If Company comes back unmatched, it must be typed in manually — there&rsquo;s no fallback ticker match.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Approve</p>
                  <p>Writes the URL into the real earnings_calls or annual_reports table. Idempotent — re-approving the same URL just overwrites the same field, safe to click twice.</p>
                </div>
              </section>

              <div className="border-t border-[#E2E2E2]" />

              <section className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172B]">Company Groups</h4>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">What it does</p>
                  <p>Reusable ticker sets, shared across L1, L2, and L3 — each tab keeps its own independent selection of which group to use. Manage them from the banner at the top of this page.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Manual vs Dynamic</p>
                  <p><span className="font-medium text-[#0F172B]">Manual</span> is a fixed, explicit list of tickers. <span className="font-medium text-[#0F172B]">Dynamic</span> resolves live from a flat set of filters — Alphabet range, Transcript/PPT/Annual Report status (present, not yet extracted, or already extracted), Market cap, and Industries. Every enabled filter is ANDed together — there&rsquo;s no any/all toggle.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Transcript / PPT recency window</p>
                  <p>Each rule has three optional numbers: &ldquo;N most recent quarters&rdquo; (window), &ldquo;at least this many must match&rdquo; (minCount), and &ldquo;no more than this many&rdquo; (maxCount). Leave all blank to check all-time history; set only window to require all N consecutively (no gaps); lower minCount to tolerate gaps — e.g. 8 and 4 means &ldquo;at least 4 of the last 8 quarters.&rdquo; Add maxCount to turn it into a range (12–16 of the last 16), or set minCount to 0 with a low maxCount to find sparse coverage instead of good coverage. Click &ldquo;+ Add another rule&rdquo; to AND multiple such clauses together. Annual Report keeps the simpler single &ldquo;latest N years&rdquo; field, unscoped by consecutiveness.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">config_key</p>
                  <p>Ties a group to the skill config its tickers should resolve to for L2 runs. Tag it either inline from the L2 tab while dispatching, or from the group&rsquo;s row on the Company Groups page.</p>
                </div>

                <div>
                  <p className="text-[#0F172B] font-medium mb-0.5">Overlapping groups</p>
                  <p>A ticker can belong to more than one tagged group at once — there&rsquo;s no exclusivity check when you save a group. When that happens, the config from whichever of those groups was <span className="font-medium text-[#0F172B]">most recently updated</span> wins for that ticker, not any fixed priority order. If a ticker&rsquo;s L2 results don&rsquo;t match the group you expect, check whether it also sits in another tagged group that was edited more recently.</p>
                </div>
              </section>
            </>
          )}

          {/* ── FAQ ── */}
          {tab === "faq" && (
            <section className="space-y-4">
              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: I clicked Run on L1 or L2 — can I stop, pause, or resume it from this page?</p>
                <p>No — once Run is confirmed, this page&rsquo;s job is done; it only fires the dispatch request, it doesn&rsquo;t keep a handle on the jobs. Actual job control (stop, pause, retry, resume) lives in Bull Board, which is shared with admins specifically for this — use it any time you need to intervene on jobs that are already queued or running.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: I triggered a run but Run History still shows nothing, or hasn&rsquo;t updated after a while — is polling broken?</p>
                <p>This page only auto-polls <code>/runs</code> once it already has the active <code>run_id</code> from the trigger response, and only while that run is still <code>&quot;running&quot;</code>. If a row seems stuck or missing, hit Refresh manually first. If it&rsquo;s still not there, the dispatch likely hit an issue before writing a run record at all — check Bull Board directly for the underlying job.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: L2 Run History shows a ticker as &ldquo;queued&rdquo; or the run as &ldquo;completed&rdquo; — does that mean it actually worked?</p>
                <p>Not necessarily. Those counts only reflect whether the job was dispatched successfully, not whether the skill actually resolved a config and produced output — that happens later, asynchronously, inside the worker. Bull Board (or the job/output history) is the source of truth for whether a specific ticker really succeeded.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: I closed the tab or navigated away right after clicking Run — did that cancel anything?</p>
                <p>No — Run is a one-shot POST; the jobs keep running server-side regardless of whether this tab stays open. Come back to Run History any time to check status, or watch it live in Bull Board.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: Preview passed with no errors, but Run gives a 400 for some L2 tickers — what happened?</p>
                <p>Preview never touches config resolution — it&rsquo;s purely a signal-availability report. Run resolves each ticker&rsquo;s skill config from whichever tagged Company Group covers it, and an untagged ticker hard-fails with 400 at dispatch time. Tag the group via the inline Group Config Tag control and try again.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: BSE Discovery&rsquo;s run is taking longer than the usual ~1-2 minutes, or seems stuck on &ldquo;running&rdquo; — what do I do?</p>
                <p>Same answer as L1/L2: hit Refresh on Run History first, and if it&rsquo;s genuinely stuck, check Bull Board — the scrape/resolve job is still just a regular BullMQ job under the hood, so the same stop/retry/inspect controls apply.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: I approved a BSE Discovery URL with the wrong ticker or fiscal year — can I fix it?</p>
                <p>Yes — you can&rsquo;t delete the write from this page, but Approve is idempotent. Correct the Company/Fiscal Year/Quarter fields on that same row and click Approve again; it overwrites the same record rather than creating a duplicate or conflicting one.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: A discovered URL I never approve — does it expire, or get cleaned up automatically?</p>
                <p>No. There&rsquo;s no &ldquo;pending&rdquo; status or auto-expiry — it just stays visible in the review list (default last 14 days, adjustable) until you approve it, or it simply ages out of whatever days-window you&rsquo;re currently viewing. Nothing reaches earnings_calls or annual_reports unless you explicitly approve it.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: I tagged a Company Group&rsquo;s config_key from the L2 tab — does that change what L1 or L3 do with that same group?</p>
                <p>No — <code>config_key</code> only matters for L2 (it decides which skill config a ticker resolves to). L1 and L3 only care about the group&rsquo;s ticker membership, and never look at its tag.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Q: I edited a dynamic (filter-based) group&rsquo;s filters after already running Preview — do I need to Preview again before Run?</p>
                <p>Yes. A dynamic group&rsquo;s resolved ticker set can change the moment its filters change, so Preview may no longer reflect reality. Run stays disabled until Preview matches the exact current options anyway, so re-running Preview is required either way.</p>
              </div>
            </section>
          )}

          {/* ── For Developers ── */}
          {tab === "developers" && (
            <section className="space-y-3">
              <div>
                <p className="text-[#0F172B] font-medium mb-1">L1 vs L2 preview mechanics</p>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E2E2]">
                      <th className="text-left py-1 pr-2 font-semibold text-[#888888]"></th>
                      <th className="text-left py-1 pr-2 font-semibold text-[#888888]">L1 Preview</th>
                      <th className="text-left py-1 font-semibold text-[#888888]">L2 Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E2E2]">
                    <tr>
                      <td className="py-1 pr-2 text-[#0F172B]">Query pattern</td>
                      <td className="py-1 pr-2">Per-ticker signal presence</td>
                      <td className="py-1">One batched query for the whole set</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[#0F172B]">Respects Historic/Force?</td>
                      <td className="py-1 pr-2">n/a</td>
                      <td className="py-1">No — Run only</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[#0F172B]">CSV export scope</td>
                      <td className="py-1 pr-2">Full uncapped history, ignores Limit/Latest/AR flags</td>
                      <td className="py-1">Same filters as Preview, but total coverage (any type), not skill-whitelisted</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-2 text-[#0F172B]">Pagination</td>
                      <td className="py-1 pr-2" colSpan={2}><code>page</code>/<code>pageSize</code> on <code>/preview</code> only — never on <code>/run</code> or <code>/preview/csv</code>. <code>tickerCount</code> is the total across all pages; <code>perTicker</code>/<code>tickers</code> is just the current page.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Preview/CSV response caching</p>
                <p>Both <code>/preview</code> (~60s) and <code>/preview/csv</code> (~180s) responses may be served from a server-side cache — an identical request shortly after the first can return near-instantly. No contract-visible difference, just faster repeats. <code>/run</code> is never cached.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">Run History polling</p>
                <p>Every tab (L1, L2, BSE Discovery) polls its own <code>/runs</code> endpoint every 2s while the just-triggered run is still <code>&quot;running&quot;</code>, and stops once it settles to <code>&quot;completed&quot;</code>/<code>&quot;failed&quot;</code>. Run histories are independent per tab — an L1 run never shows up under L2, and vice versa. This page never talks to Bull Board directly; it only reads the run rows the backend writes.</p>
              </div>

              <div>
                <p className="text-[#0F172B] font-medium mb-0.5">L2 dispatch vs skill outcome</p>
                <p>L2&rsquo;s <code>/run</code> only queues per-ticker jobs — a &ldquo;queued&rdquo; row in Run History is not the same as the skill having actually resolved a config and produced output. That resolution happens asynchronously per-job; a ticker without a tagged group fails at dispatch time (400), but a tagged ticker can still fail later inside the worker.</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
