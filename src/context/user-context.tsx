
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  role: string;
  email: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
    name: 'Sheryl Schnare',
    role: 'Music Director',
    email: 'sherylschnare@birdsongstudio.ca',
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure email is not overwritten by old stored data if it doesn't match
        if (parsedUser.email !== defaultUser.email) {
          parsedUser.email = defaultUser.email;
        }
        setUserState(parsedUser);
      } else {
        setUserState(defaultUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUserState(defaultUser);
    }
    setLoading(false);
  }, []);

  const setUser = (newUser: User) => {
    try {
      // Prevent email from being changed
      const userToSave = { ...newUser, email: user.email };
      localStorage.setItem('userProfile', JSON.stringify(userToSave));
      setUserState(userToSave);
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  };

  const value = { user, setUser, loading };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
