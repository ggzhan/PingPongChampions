
"use client";

import { createContext, useContext, useState, ReactNode, FC, useCallback } from 'react';

interface AppContextType {
  appKey: number;
  refresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appKey, setAppKey] = useState(0);

  const refresh = useCallback(() => {
    setAppKey(prevKey => prevKey + 1);
  }, []);

  return (
    <AppContext.Provider value={{ appKey, refresh }}>
      <div key={appKey}>
        {children}
      </div>
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
