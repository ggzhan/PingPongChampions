
'use client';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { app, db, auth } from './index'; // Use the safe index
import { FirebaseClientProvider } from './client-provider';

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // The useMemo hook ensures that the context value object is stable
  // and only re-created if one of the dependencies changes.
  const contextValue = useMemo(() => ({ app, db, auth }), []);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  // We filter out null values to satisfy TypeScript,
  // knowing they will be initialized on the client.
  if (!context.app || !context.db || !context.auth) {
      if (typeof window === 'undefined') {
          // Return a mock or empty implementation for SSR
          return { app: null, db: null, auth: null };
      }
      throw new Error("Firebase not initialized correctly on the client.");
  }
  return context as { app: FirebaseApp; db: Firestore; auth: Auth; };
};
