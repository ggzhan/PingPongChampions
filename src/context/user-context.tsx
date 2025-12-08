
"use client";

import { createContext, useContext, useState, ReactNode, FC, useEffect } from 'react';
import { updateUserInLeagues, getUserById, createUserProfile } from '@/lib/data';
import { useFirebase } from '@/firebase';
import type { User as AuthUser } from 'firebase/auth';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';


interface UserContextType {
  user: AppUser | null;
  authUser: AuthUser | null;
  updateUser: (newDetails: Partial<AppUser>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = useFirebase();
  const [user, setUser] = useState<AppUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser && firebaseUser.emailVerified) {
            setAuthUser(firebaseUser);
            let userProfile = await getUserById(firebaseUser.uid);
            if (!userProfile) {
                // This might happen on first login if profile creation was interrupted
                const newUserProfile: AppUser = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: user.email,
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


  const updateUser = (newDetails: Partial<AppUser>) => {
    if (user) {
        const updatedUser = { ...user, ...newDetails };
        setUser(updatedUser);
        // The database update is now handled separately in the profile page
        // to be paired with the form submission.
    }
  };

  const logout = async () => {
    if (auth) {
        await auth.signOut();
    }
    setUser(null);
    setAuthUser(null);
    router.push('/');
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
