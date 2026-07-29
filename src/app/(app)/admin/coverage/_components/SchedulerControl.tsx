"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock, RefreshCw, Play, CalendarClock } from "lucide-react";
import { rawFetch, rawPut, rawPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { SchedulerJob, SchedulerJobRun, SchedulerJobRunsResponse, SchedulerJobTriggerResponse, SchedulerJobSlug } from "./types";

const BASE = `${BACKEND_URL}/admin/scheduler-jobs`;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS = [1, 2, 3, 4, 5];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

// ── cron <-> UI, minute/hour + day-of-week only — dom/month always "*" for these jobs ──

function isWeekdaysOnly(days: number[]): boolean {
  return [...days].sort().join(",") === WEEKDAYS.join(",");
}

function toCron(hhmm: string, days: number[] | "every"): string {
  const [hour, minute] = hhmm.split(":").map(Number);
  const dow =
    days === "every" || days.length === 7
      ? "*"
      : isWeekdaysOnly(days)
      ? "1-5"
      : [...days].sort((a, b) => a - b).join(",");
  return `${minute} ${hour} * * ${dow}`;
}

function expandRange(part: string): number[] {
  if (!part.includes("-")) return [Number(part)];
  const [a, b] = part.split("-").map(Number);
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

/** Only a single-value minute/hour (e.g. "30 16", not "0 9,18") maps to a plain HH:mm. */
const SINGLE_VALUE = /^\d{1,2}$/;

/** Returns null when the cron uses a shape this simple one-time-a-day picker can't represent
 *  (multi-value/ranged hour or minute — e.g. twice-daily "9,18" — or a non-"*" dom/month). */
function fromCron(cron: string): { hhmm: string; days: number[] | "every" } | null {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minute, hour, dom, month, dow] = parts;
  if (dom !== "*" || month !== "*") return null;
  if (!SINGLE_VALUE.test(minute) || !SINGLE_VALUE.test(hour)) return null;
  const hh = hour.padStart(2, "0");
  const mm = minute.padStart(2, "0");
  const days = dow === "*" ? "every" : dow.split(",").flatMap(expandRange);
  return { hhmm: `${hh}:${mm}`, days };
}

// ── Run status badge ─────────────────────────────────────────────────────────

function RunStatusBadge({ status }: { status: SchedulerJobRun["status"] }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-up">
        <CheckCircle2 className="size-3.5" /> Completed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-down">
        <XCircle className="size-3.5" /> Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-blue">
      <Clock className="size-3.5" /> Running
    </span>
  );
}

interface SchedulerControlProps {
  slug: SchedulerJobSlug;
  /** e.g. "Prowess Daily" — used in copy only. */
  label: string;
  /**
   * Set true when the host panel already has its own trigger + run history reading the same
   * scheduler_runs rows (e.g. BSE Discovery's bespoke /admin/bse-discovery/run + /runs) — this
   * component then renders schedule config (Auto/Manual + time picker) only, with no "Run now"
   * button and no second copy of the same run list.
   */
  hideRunSection?: boolean;
}

export function SchedulerControl({ slug, label, hideRunSection = false }: SchedulerControlProps) {
  const [job, setJob] = useState<SchedulerJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Time/day picker — seeded from the loaded job's cron, edited locally until Save.
  const [hhmm, setHhmm] = useState("16:00");
  const [days, setDays] = useState<number[] | "every">(WEEKDAYS);
  const [unsupportedCron, setUnsupportedCron] = useState<string | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runTriggered, setRunTriggered] = useState(false);

  const [runs, setRuns] = useState<SchedulerJobRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState<string | null>(null);

  const loadJob = useCallback(() => {
    rawFetch<SchedulerJob>(`${BASE}/${slug}`, {
      onStart: () => { setLoading(true); setLoadError(null); },
      onSuccess: (job) => {
        setJob(job);
        const parsed = fromCron(job.cron_expression);
        if (parsed) {
          setHhmm(parsed.hhmm);
          setDays(parsed.days);
          setUnsupportedCron(null);
        } else {
          setUnsupportedCron(job.cron_expression);
        }
      },
      onError: setLoadError,
      onComplete: () => setLoading(false),
    });
  }, [slug]);

  const loadRuns = useCallback(() => {
    rawFetch<SchedulerJobRunsResponse>(`${BASE}/${slug}/runs?limit=20`, {
      onStart: () => { setRunsLoading(true); setRunsError(null); },
      onSuccess: (res) => setRuns(res.runs ?? []),
      onError: setRunsError,
      onComplete: () => setRunsLoading(false),
    });
  }, [slug]);

  useEffect(() => {
    loadJob();
    // The host panel owns fetching/displaying runs when hideRunSection is set — same
    // scheduler_runs rows, no point fetching them twice.
    if (!hideRunSection) loadRuns();
  }, [loadJob, loadRuns, hideRunSection]);

  function toggleActive() {
    if (!job) return;
    const nextActive = !job.is_active;
    rawPut<SchedulerJob>(`${BASE}/${slug}`, {
      onStart: () => { setToggling(true); setToggleError(null); },
      onSuccess: setJob,
      onError: setToggleError,
      onComplete: () => setToggling(false),
    }, { is_active: nextActive });
  }

  function toggleDay(d: number) {
    setScheduleSaved(false);
    setDays((prev) => {
      const base = prev === "every" ? ALL_DAYS : prev;
      return base.includes(d) ? base.filter((x) => x !== d) : [...base, d].sort((a, b) => a - b);
    });
  }

  function saveSchedule() {
    if (days !== "every" && days.length === 0) {
      setScheduleError("Select at least one day.");
      return;
    }
    const cron_expression = toCron(hhmm, days);
    rawPut<SchedulerJob>(`${BASE}/${slug}`, {
      onStart: () => { setSavingSchedule(true); setScheduleError(null); setScheduleSaved(false); },
      onSuccess: (job) => { setJob(job); setUnsupportedCron(null); setScheduleSaved(true); },
      onError: setScheduleError,
      onComplete: () => setSavingSchedule(false),
    }, { cron_expression });
  }

  function runNow() {
    rawPost<SchedulerJobTriggerResponse>(`${BASE}/${slug}/run`, {
      onStart: () => { setRunning(true); setRunError(null); setRunTriggered(false); },
      onSuccess: () => { setRunTriggered(true); setTimeout(loadRuns, 2000); },
      onError: setRunError,
      onComplete: () => setRunning(false),
    });
  }

  const selectedDays = days === "every" ? ALL_DAYS : days;
  const isEveryDay = days === "every" || days.length === 7;
  const isWeekdays = days !== "every" && isWeekdaysOnly(days);

  return (
    <div className="rounded-[10px] border border-hair bg-card p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-ink-3" />
          <span className="text-[13px] font-medium text-ink">Schedule</span>
          {loading && <Loader2 className="size-3.5 animate-spin text-ink-3" />}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleActive}
            disabled={!job || toggling}
            className={`rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              job?.is_active
                ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]"
                : "border-hair text-ink hover:border-[var(--qc-ink)]"
            }`}
          >
            {toggling && <Loader2 className="inline size-3 animate-spin mr-1" />}
            {job?.is_active ? "Auto" : "Manual"}
          </button>
        </div>
      </div>

      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
          <AlertCircle className="size-3.5 shrink-0" /> {loadError}
        </div>
      )}
      {toggleError && (
        <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
          <AlertCircle className="size-3.5 shrink-0" /> {toggleError}
        </div>
      )}

      <p className="text-[11px] text-ink-3 leading-relaxed">
        {job?.is_active
          ? `${label} fires automatically on the schedule below (IST). It still runs on demand via "Run now" while Auto.`
          : `${label} is Manual — it only runs when triggered below. Switch to Auto to fire it on a schedule.`}
      </p>

      {unsupportedCron && (
        <div className="flex items-center gap-2 rounded-md border border-warn bg-warn-soft px-3 py-2 text-[12px] text-warn">
          <AlertCircle className="size-3.5 shrink-0" />
          Current cron (<span className="font-mono">{unsupportedCron}</span>) uses a shape this picker
          can&rsquo;t represent — e.g. multiple times a day, a ranged hour, or a day-of-month/month
          field. The fields below default to a single daily time; saving will overwrite the existing rule.
        </div>
      )}

      {/* Time + day picker */}
      <div className="space-y-2.5">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">
              Time (IST)
            </label>
            <input
              type="time"
              value={hhmm}
              onChange={(e) => { setHhmm(e.target.value); setScheduleSaved(false); }}
              className="rounded-md border border-hair px-3 py-2 text-sm font-mono text-ink focus:outline-none focus:border-hair-strong"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setDays("every"); setScheduleSaved(false); }}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                isEveryDay ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]" : "border-hair text-ink hover:border-[var(--qc-ink)]"
              }`}
            >
              Every day
            </button>
            <button
              onClick={() => { setDays(WEEKDAYS); setScheduleSaved(false); }}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                isWeekdays ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]" : "border-hair text-ink hover:border-[var(--qc-ink)]"
              }`}
            >
              Weekdays only
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-3 mb-1.5">Days</label>
          <div className="flex gap-1.5 flex-wrap">
            {DAY_LABELS.map((label2, d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`size-8 rounded-md border text-[11px] font-medium transition-colors ${
                  selectedDays.includes(d)
                    ? "border-[var(--qc-ink)] bg-ink text-[var(--qc-on-dark)]"
                    : "border-hair text-ink-3 hover:border-[var(--qc-ink)] hover:text-ink"
                }`}
              >
                {label2}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <button
            onClick={saveSchedule}
            disabled={savingSchedule || !job}
            className="flex items-center gap-1.5 rounded-md border border-hair px-3 py-1.5 text-[12px] font-medium text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingSchedule && <Loader2 className="size-3.5 animate-spin" />}
            Save schedule
          </button>
          {job && <span className="text-[11px] text-ink-3 font-mono">{job.cron_expression}</span>}
          {scheduleSaved && !savingSchedule && (
            <span className="flex items-center gap-1 text-[11px] text-up"><CheckCircle2 className="size-3.5" /> Saved</span>
          )}
        </div>

        {scheduleError && (
          <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
            <AlertCircle className="size-3.5 shrink-0" /> {scheduleError}
          </div>
        )}
      </div>

      {/* Run now + history — omitted when the host panel already has its own trigger/history
          reading the same scheduler_runs rows (see hideRunSection doc above). */}
      {!hideRunSection && (
        <div className="space-y-2 pt-2 border-t border-hair">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={runNow}
                disabled={running}
                className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] font-medium text-[var(--qc-on-dark)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                Run now
              </button>
              <span className="text-[11px] text-ink-3">Fires immediately, regardless of Auto/Manual.</span>
            </div>
            <button
              onClick={loadRuns}
              disabled={runsLoading}
              className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-ink disabled:opacity-40"
            >
              {runsLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Refresh runs
            </button>
          </div>

          {runError && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
              <AlertCircle className="size-3.5 shrink-0" /> {runError}
            </div>
          )}
          {runTriggered && !running && (
            <p className="flex items-center gap-1.5 text-[11px] text-up">
              <CheckCircle2 className="size-3.5" /> Triggered — check the run below for status.
            </p>
          )}

          {runsError && !runsLoading && (
            <div className="flex items-center gap-2 rounded-md border border-down bg-down-soft px-3 py-2 text-[12px] text-down">
              <AlertCircle className="size-3.5 shrink-0" /> {runsError}
            </div>
          )}
          {runs.length === 0 && !runsLoading && !runsError && <p className="text-[11px] text-ink-3">No runs yet.</p>}

          <div className="space-y-1.5">
            {runs.slice(0, 5).map((run) => (
              <div key={run.id} className="rounded-[8px] border border-hair bg-secondary px-3 py-2 flex items-center gap-4 flex-wrap">
                <RunStatusBadge status={run.status} />
                <span className="text-[11px] text-ink-3">
                  {run.records_processed != null ? `${run.records_processed} processed` : "—"}
                </span>
                {run.started_at && <span className="text-[11px] text-ink-3">started {new Date(run.started_at).toLocaleString()}</span>}
                {run.ended_at && <span className="text-[11px] text-ink-3">ended {new Date(run.ended_at).toLocaleString()}</span>}
                {run.status === "failed" && run.error && <span className="text-[11px] text-down truncate max-w-[280px]">{run.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
