
"use client";

import { createContext, useContext, useState, ReactNode, FC } from 'react';

// Define the shape of the user object
interface User {
  id: string;
  name: string;
  email: string;
  showEmail: boolean;
}

// Define the shape of the context
interface UserContextType {
  user: User | null;
  updateUser: (newDetails: Partial<User>) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data for initialization
const mockUser: User = {
  id: 'user-1', // This user is 'AlpacaRacer' in data.ts
  name: 'AlpacaRacer',
  email: 'john.doe@example.com',
  showEmail: false,
};

// Create the provider component
export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(mockUser);

  const updateUser = (newDetails: Partial<User>) => {
    setUser(currentUser => {
      if (currentUser) {
        return { ...currentUser, ...newDetails };
      }
      return null;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
