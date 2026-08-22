"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("qc_at");
    if (!token) {
      router.replace("/signin");
      return;
    }

    const onboardingDone = localStorage.getItem("qc_onboarding_completed");
    // Temporarily disabled so you can preview the onboarding UI
    // if (onboardingDone === "true") {
    //   router.replace("/investor/dashboard");
    //   return;
    // }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return <>{children}</>;
}
