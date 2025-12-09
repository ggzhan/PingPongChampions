
"use client";

import { createContext, useContext, useState, ReactNode, FC, useCallback, useEffect } from 'react';
import type { League } from '@/lib/types';
import { getLeagues } from '@/lib/data';

interface AppContextType {
  leagues: League[];
  leaguesLoading: boolean;
  refresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLeaguesLoading(true);
    try {
        const allLeagues = await getLeagues();
        setLeagues(allLeagues);
    } catch (error) {
        console.error("Failed to refresh leagues:", error);
        setLeagues([]); // Reset on error
    } finally {
        setLeaguesLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppContext.Provider value={{ leagues, leaguesLoading, refresh }}>
        {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
