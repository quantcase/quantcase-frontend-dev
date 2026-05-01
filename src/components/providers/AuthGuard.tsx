"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BACKEND_URL } from "@/lib/constants";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/signin") return;

    const token = localStorage.getItem("qc_at");

    fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => {
      if (res.status === 401) {
        localStorage.removeItem("qc_at");
        localStorage.removeItem("qc_rt");
        router.push("/signin");
      }
    }).catch(() => {
      // Network error — don't redirect, let the page handle it
    });
  }, [pathname, router]);

  return <>{children}</>;
}
