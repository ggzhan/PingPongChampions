
"use client";

import { createContext, useContext, useState, ReactNode, FC, useEffect } from 'react';
import { updateUserInLeagues, getUserById, createUserProfile } from '@/lib/data';
import { useFirebase } from '@/firebase';
import type { User as AuthUser } from 'firebase/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  showEmail: boolean;
}

interface UserContextType {
  user: User | null;
  authUser: AuthUser | null;
  updateUser: (newDetails: Partial<User>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser && firebaseUser.emailVerified) {
            setAuthUser(firebaseUser);
            let userProfile = await getUserById(firebaseUser.uid);
            if (!userProfile) {
                // This might happen on first login if profile creation was interrupted
                const newUserProfile: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email!,
                    showEmail: false
                };
                await createUserProfile(newUserProfile);
                userProfile = newUserProfile;
            }
            setUser(userProfile);
        } else {
            setAuthUser(null);
            setUser(null);
        }
    });

    return () => unsubscribe();
  }, [auth]);


  const updateUser = async (newDetails: Partial<User>) => {
    if (user) {
        const updatedUser = { ...user, ...newDetails };
        setUser(updatedUser);
        await updateUserInLeagues(updatedUser as User);
    }
  };

  const logout = async () => {
    if (auth) {
        await auth.signOut();
    }
    setUser(null);
    setAuthUser(null);
  }

  return (
    <UserContext.Provider value={{ user, authUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
