"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LifeBuoy, Flag, LogOut, Mail } from "lucide-react";
import { useUser } from "@/components/providers/UserContext";
import { ReportErrorModal } from "@/components/molecules/report-error-modal";

interface Props {
  /** Where the popover opens relative to the trigger. "side" = to the right (left rail), "up" = above (bottom bar). */
  placement?: "side" | "up";
}

export function UserMenu({ placement = "side" }: Props) {
  const router = useRouter();
  const { displayName, email } = useUser();
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // displayName/email come from localStorage (client-only), so the server
  // renders the fallback icon while the client has the real initial — a
  // hydration mismatch. Gate the initial behind a mounted flag so the first
  // client render matches the server, then swap in after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleLogout() {
    localStorage.clear();
    router.push("/signin");
  }

  const initial = (displayName ?? email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 36,
            height: 36,
            background: open ? "var(--qc-ink)" : "var(--qc-section)",
            color: open ? "var(--qc-on-dark)" : "var(--qc-ink-2)",
            border: "1px solid var(--qc-hair)",
          }}
        >
          {mounted && initial && initial !== "?" ? (
            <span className="text-[13px] font-semibold">{initial}</span>
          ) : (
            <User size={16} strokeWidth={1.8} />
          )}
        </button>

        {open && (
          <div
            className={
              placement === "up"
                ? "absolute bottom-[calc(100%+8px)] right-0 z-40 w-56 rounded-[10px] border border-hair bg-card shadow-lg py-1.5"
                : "absolute bottom-0 left-[calc(100%+8px)] z-40 w-56 rounded-[10px] border border-hair bg-card shadow-lg py-1.5"
            }
            role="menu"
          >
            {(displayName || email) && (
              <div className="px-3 py-2 border-b border-hair mb-1">
                {displayName && <p className="text-[13px] font-medium text-ink truncate">{displayName}</p>}
                {email && <p className="text-[11px] text-ink-3 truncate">{email}</p>}
              </div>
            )}

            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setHelpOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-ink hover:bg-secondary transition-colors"
            >
              <LifeBuoy size={15} strokeWidth={1.8} className="text-ink-3" />
              Help &amp; Support
            </button>

            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setReportOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-ink hover:bg-secondary transition-colors"
            >
              <Flag size={15} strokeWidth={1.8} className="text-ink-3" />
              Flag Error
            </button>

            <div className="my-1 border-t border-hair" />

            <button
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-down hover:bg-secondary transition-colors"
            >
              <LogOut size={15} strokeWidth={1.8} />
              Logout
            </button>
          </div>
        )}
      </div>

      {reportOpen && <ReportErrorModal onClose={() => setReportOpen(false)} />}
      {helpOpen && <HelpSupportModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}

function HelpSupportModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex flex-col w-[380px] bg-card rounded-[10px] border border-hair shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-hair">
          <h3 className="text-[16px] font-medium text-ink">Help &amp; Support</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-[13px] text-ink-3">
            Need a hand or found something confusing? Reach out and we&apos;ll get back to you.
          </p>
          <a
            href="mailto:support@quantcase.ai"
            className="flex items-center gap-2.5 rounded-md border border-hair px-3 py-2.5 text-[13px] text-ink hover:border-ink transition-colors"
          >
            <Mail size={15} strokeWidth={1.8} className="text-ink-3" />
            support@quantcase.ai
          </a>
        </div>
        <div className="px-5 py-4 border-t border-hair flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-hair px-4 py-2 text-sm font-medium text-ink-3 hover:text-ink hover:border-ink transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
