"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BACKEND_URL } from "@/lib/constants";
import { useUser } from "@/components/providers/UserContext";
import type { MeResponse } from "@/types/auth";

const PUBLIC_PATHS = ["/signin", "/", "/register"];
const ONBOARDING_PATH = "/onboarding";
const ADMIN_PATH_PREFIXES = ["/admin", "/wealthos", "/model-builder", "/model-analytics"];

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function homePathFor(accountType: string | null) {
  return accountType === "investor" ? "/investor/dashboard" : "/dashboard";
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setAccountType, setFromMe } = useUser();

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) return;

    const token = localStorage.getItem("qc_at");
    if (!token) {
      router.push("/signin");
      return;
    }

    // Synchronous guard: check cached onboarding state before network call
    const cachedOnboarding = localStorage.getItem("qc_onboarding_completed");
    if (cachedOnboarding === "false" && pathname !== ONBOARDING_PATH) {
      router.replace(ONBOARDING_PATH);
      return;
    }

    // Synchronous guard: redirect investor from manager dashboard immediately
    const cachedType = localStorage.getItem("qc_account_type");
    if (cachedType === "investor" && pathname === "/dashboard") {
      router.replace("/investor/dashboard");
      return;
    }

    // Synchronous guard: block admin-only routes for non-manager accounts
    if (isAdminPath(pathname) && cachedType && cachedType !== "manager") {
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
          router.push("/signin");
          return;
        }
        if (!res.ok) return;

        const data: MeResponse = await res.json();

        // Never downgrade a locally-confirmed completed state with a potentially
        // stale backend response (race between PATCH completion and this GET).
        const localFlag = localStorage.getItem("qc_onboarding_completed");
        if (localFlag === "true") {
          data.onboarding_completed = true;
        }

        setFromMe(data);

        // Onboarding redirect — only if both local cache and network agree
        if (!data.onboarding_completed && pathname !== ONBOARDING_PATH) {
          router.replace(ONBOARDING_PATH);
          return;
        }

        const acctType = data.accountType ?? data.account_type ?? null;

        // Authoritative guard: block admin-only routes for non-manager accounts
        if (isAdminPath(pathname) && acctType !== "manager") {
          router.replace(homePathFor(acctType));
          return;
        }

        // Investor on manager dashboard
        if (acctType === "investor" && pathname === "/dashboard") {
          router.replace("/investor/dashboard");
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, setAccountType, setFromMe]);

  return <>{children}</>;
}
