import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

const RefreshContext = createContext(0);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  return <RefreshContext.Provider value={tick}>{children}</RefreshContext.Provider>;
}

export function useRefreshTick() {
  return useContext(RefreshContext);
}
