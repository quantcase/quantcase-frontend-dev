export function EntryPointCallout() {
  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-sm font-bold">
          ⊙
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Why Entry Point Matters</h3>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <span className="text-red-600 dark:text-red-400 font-semibold">A good asset can be a bad investment at a bad entry point.</span>{" "}
            You can do everything right to underwrite promoter teams and their assets, but your entry point dictates the success of your investment. This goes beyond plain valuation.
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A deep understanding of <strong className="text-zinc-800 dark:text-zinc-200">quality of earnings</strong>, and ability of{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">valuation multiples to rerate</strong> dictate the magnitude of success or failure. More importantly, it helps you understand your{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">risk-reward</span> for any investment.
          </p>
        </div>
      </div>
    </div>
  );
}
