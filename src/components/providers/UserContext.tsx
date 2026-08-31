"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Subscription, MeResponse, SmallcaseConnection } from "@/types/auth";

export type AccountType = "manager" | "investor" | "admin" | null;

/**
 * Whether an account follows the investor UX flow (investor dashboard + sidebar).
 * "admin" mirrors the investor flow while retaining privileged access elsewhere.
 */
export function usesInvestorFlow(accountType: AccountType): boolean {
  return accountType === "investor" || accountType === "admin";
}

/** Whether an account has privileged (admin-only) nav items and routes. */
export function hasAdminPrivileges(accountType: AccountType): boolean {
  return accountType === "manager" || accountType === "admin";
}

interface UserContextValue {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
  id: string | null;
  displayName: string | null;
  email: string | null;
  isAdmin: boolean;
  subscription: Subscription | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
  isAccessBlocked: boolean;
  /** Broker/smallcase connection state from /auth/me. null until fetched. */
  smallcase: SmallcaseConnection | null;
  setFromMe: (data: MeResponse) => void;
  paywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  freeTickersViewed: string[];
  recordTickerView: (symbol: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  accountType: null,
  setAccountType: () => {},
  id: null,
  displayName: null,
  email: null,
  isAdmin: false,
  subscription: null,
  onboardingCompleted: true,
  onboardingStep: 0,
  isAccessBlocked: false,
  smallcase: null,
  setFromMe: () => {},
  paywallOpen: false,
  openPaywall: () => {},
  closePaywall: () => {},
  freeTickersViewed: [],
  recordTickerView: async () => {},
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
  const [id, setId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qc_user_id") ?? null;
    }
    return null;
  });
  const [displayName, setDisplayName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qc_display_name") ?? null;
    }
    return null;
  });
  const [email, setEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qc_email") ?? null;
    }
    return null;
  });
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [smallcase, setSmallcase] = useState<SmallcaseConnection | null>(null);

  const isAccessBlocked = subscription?.is_access_blocked ?? false;
  const isAdmin = hasAdminPrivileges(accountType);

  const openPaywall = useCallback(() => setPaywallOpen(true), []);
  const closePaywall = useCallback(() => setPaywallOpen(false), []);

  const setAccountType = useCallback((t: AccountType) => {
    setAccountTypeState(t);
    if (t) localStorage.setItem("qc_account_type", t);
    else localStorage.removeItem("qc_account_type");
  }, []);

  const [freeTickersViewed, setFreeTickersViewed] = useState<string[]>([]);

  const setFromMe = useCallback((data: MeResponse) => {
    const acctType = data.accountType ?? data.account_type ?? null;
    if (acctType) {
      setAccountTypeState(acctType);
      localStorage.setItem("qc_account_type", acctType);
    }

    const userId = data.id ?? null;
    setId(userId);
    if (userId) localStorage.setItem("qc_user_id", userId);
    else localStorage.removeItem("qc_user_id");

    const isCompleted = data.onboarding_completed ?? data.profile?.onboarding_completed ?? false;
    setOnboardingCompleted(isCompleted);
    localStorage.setItem("qc_onboarding_completed", String(isCompleted));
    
    const step = data.onboarding_step ?? (data.profile?.onboarding_step ? Number(data.profile.onboarding_step) : 0);
    setOnboardingStep(step);
    setSubscription(data.subscription ?? null);

    if (data.profile?.free_tickers_viewed) {
      setFreeTickersViewed(data.profile.free_tickers_viewed);
    }

    const name = data.display_name ?? null;
    setDisplayName(name);
    if (name) localStorage.setItem("qc_display_name", name);
    else localStorage.removeItem("qc_display_name");

    const mail = data.email ?? null;
    setEmail(mail);
    if (mail) localStorage.setItem("qc_email", mail);
    else localStorage.removeItem("qc_email");

    setSmallcase(data.smallcase ?? null);
  }, []);

  const recordTickerView = useCallback(async (symbol: string) => {
    try {
      const token = localStorage.getItem("qc_at");
      if (!token) return;
      
      const res = await fetch("/api/auth/me/view-ticker", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticker: symbol }),
      });
      const json = await res.json();
      if (json.success && json.data?.free_tickers_viewed) {
        setFreeTickersViewed(json.data.free_tickers_viewed);
      }
    } catch (e) {
      console.error("Failed to record ticker view", e);
    }
  }, []);

  return (
    <UserContext.Provider value={{
      accountType,
      setAccountType,
      id,
      displayName,
      email,
      isAdmin,
      subscription,
      onboardingCompleted,
      onboardingStep,
      isAccessBlocked,
      smallcase,
      setFromMe,
      paywallOpen,
      openPaywall,
      closePaywall,
      freeTickersViewed,
      recordTickerView,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
