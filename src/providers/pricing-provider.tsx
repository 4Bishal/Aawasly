"use client";

import { createContext, useContext, useEffect, useState } from "react";

const TaxContext = createContext<{
  includeTax: boolean;
  setIncludeTax: (value: boolean) => void;
} | null>(null);
const storageKey = "aawasly:include-tax";

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [includeTax, setTax] = useState(false);
  useEffect(() => {
    try {
      setTax(localStorage.getItem(storageKey) === "true");
    } catch {
      /* Storage may be disabled. */
    }
    function sync(event: StorageEvent) {
      if (event.key === storageKey || event.key === null)
        setTax(event.newValue === "true");
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function setIncludeTax(value: boolean) {
    setTax(value);
    try {
      localStorage.setItem(storageKey, String(value));
    } catch {
      /* State still works. */
    }
  }
  return (
    <TaxContext.Provider value={{ includeTax, setIncludeTax }}>
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const context = useContext(TaxContext);
  if (!context) throw new Error("useTax must be used within PricingProvider");
  return context;
}
