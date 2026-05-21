"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BACKEND_URL } from "@/lib/constants";
import { useUser } from "@/components/providers/UserContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setAccountType } = useUser();

  useEffect(() => {
    if (pathname === "/signin" || pathname === "/") return;

    const token = localStorage.getItem("qc_at");
    if (!token) {
      router.push("/signin");
      return;
    }

    // Synchronous guard: if accountType is already in localStorage, redirect immediately
    // without waiting for the network — this prevents the dashboard flash on login
    const cachedType = localStorage.getItem("qc_account_type");
    if (cachedType === "investor" && pathname === "/dashboard") {
      router.replace("/investor/dashboard");
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
          router.push("/signin");
          return;
        }
        if (!res.ok) return;

        const data = await res.json();
        const acctType: "manager" | "investor" | null =
          data?.accountType ?? data?.account_type ?? null;

        if (acctType) setAccountType(acctType);

        if (acctType === "investor" && pathname === "/dashboard") {
          router.replace("/investor/dashboard");
        }
      })
      .catch(() => {});
  }, [pathname, router, setAccountType]);

  return <>{children}</>;
}
