"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type AccountType = "manager" | "investor" | null;

interface UserContextValue {
  accountType: AccountType;
  setAccountType: (t: AccountType) => void;
}

const UserContext = createContext<UserContextValue>({
  accountType: null,
  setAccountType: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [accountType, setAccountTypeState] = useState<AccountType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("qc_account_type") as AccountType) ?? null;
    }
    return null;
  });

  const setAccountType = useCallback((t: AccountType) => {
    setAccountTypeState(t);
    if (t) localStorage.setItem("qc_account_type", t);
    else localStorage.removeItem("qc_account_type");
  }, []);

  return (
    <UserContext.Provider value={{ accountType, setAccountType }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
