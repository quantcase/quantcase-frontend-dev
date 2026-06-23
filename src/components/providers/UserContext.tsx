"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Subscription, MeResponse } from "@/types/auth";

export type AccountType = "manager" | "investor" | null;

interface UserContextValue {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
  subscription: Subscription | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  isAccessBlocked: boolean;
  setFromMe: (data: MeResponse) => void;
}

const UserContext = createContext<UserContextValue>({
  accountType: null,
  setAccountType: () => {},
  subscription: null,
  onboardingCompleted: true,
  onboardingStep: 0,
  isAccessBlocked: false,
  setFromMe: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [accountType, setAccountTypeState] = useState<AccountType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("qc_account_type") as AccountType) ?? null;
    }
    return null;
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("qc_onboarding_completed");
      // Default to true so existing users without this flag aren't redirected to onboarding
      return cached === null ? true : cached === "true";
    }
    return true;
  });

  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const isAccessBlocked = subscription?.is_access_blocked ?? false;

  const setAccountType = useCallback((t: AccountType) => {
    setAccountTypeState(t);
    if (t) localStorage.setItem("qc_account_type", t);
    else localStorage.removeItem("qc_account_type");
  }, []);

  const setFromMe = useCallback((data: MeResponse) => {
    const acctType = data.accountType ?? data.account_type ?? null;
    if (acctType) {
      setAccountTypeState(acctType);
      localStorage.setItem("qc_account_type", acctType);
    }
    setOnboardingCompleted(data.onboarding_completed);
    localStorage.setItem("qc_onboarding_completed", String(data.onboarding_completed));
    setOnboardingStep(data.onboarding_step ?? 0);
    setSubscription(data.subscription ?? null);
  }, []);

  return (
    <UserContext.Provider value={{
      accountType,
      setAccountType,
      subscription,
      onboardingCompleted,
      onboardingStep,
      isAccessBlocked,
      setFromMe,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
