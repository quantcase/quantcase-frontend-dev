"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BACKEND_URL } from "@/lib/constants";
import { useUser, usesInvestorFlow, hasAdminPrivileges, type AccountType } from "@/components/providers/UserContext";
import type { MeResponse } from "@/types/auth";

const PUBLIC_PATHS = ["/signin", "/", "/register"];
const ONBOARDING_PATH = "/onboarding";
const ADMIN_PATH_PREFIXES = ["/admin", "/wealthos", "/model-builder", "/model-analytics"];

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function homePathFor(accountType: AccountType) {
  return usesInvestorFlow(accountType) ? "/investor/dashboard" : "/dashboard";
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setAccountType, setFromMe } = useUser();

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) return;

    const token = localStorage.getItem("qc_at");
    if (!token) {
      router.push(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Synchronous guard: check cached onboarding state before network call
    const cachedOnboarding = localStorage.getItem("qc_onboarding_completed");
    if (cachedOnboarding === "false" && pathname !== ONBOARDING_PATH) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    // Synchronous guard: redirect investor-flow accounts from manager dashboard immediately
    const cachedType = localStorage.getItem("qc_account_type") as AccountType;
    if (usesInvestorFlow(cachedType) && pathname === "/dashboard") {
      router.replace("/investor/dashboard");
      return;
    }

    // Synchronous guard: block admin-only routes for accounts without admin privileges
    if (isAdminPath(pathname) && cachedType && !hasAdminPrivileges(cachedType)) {
      router.replace(homePathFor(cachedType));
      return;
    }

    fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("qc_at");
          localStorage.removeItem("qc_rt");
          localStorage.removeItem("qc_account_type");
          localStorage.removeItem("qc_onboarding_completed");
          localStorage.removeItem("qc_paywall_triggered");
          router.push(`/signin?next=${encodeURIComponent(pathname)}`);
          return;
        }
        if (!res.ok) return;

        const data: MeResponse = await res.json();

        let isCompleted = data.onboarding_completed ?? data.profile?.onboarding_completed ?? false;

        // Never downgrade a locally-confirmed completed state with a potentially
        // stale backend response (race between PATCH completion and this GET).
        const localFlag = localStorage.getItem("qc_onboarding_completed");
        if (localFlag === "true") {
          isCompleted = true;
          data.onboarding_completed = true;
        } else if (isCompleted) {
          data.onboarding_completed = true;
        }

        setFromMe(data);

        // Onboarding redirect — only if both local cache and network agree
        if (!isCompleted && pathname !== ONBOARDING_PATH) {
          router.replace(ONBOARDING_PATH);
          return;
        }

        const acctType: AccountType = data.accountType ?? data.account_type ?? null;

        // Authoritative guard: block admin-only routes for accounts without admin privileges
        if (isAdminPath(pathname) && !hasAdminPrivileges(acctType)) {
          router.replace(homePathFor(acctType));
          return;
        }

        // Investor-flow account on manager dashboard
        if (usesInvestorFlow(acctType) && pathname === "/dashboard") {
          router.replace("/investor/dashboard");
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, setAccountType, setFromMe]);

  return <>{children}</>;
}
