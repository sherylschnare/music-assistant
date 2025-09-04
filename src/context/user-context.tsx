
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = users[0];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
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
      localStorage.setItem('userProfile', JSON.stringify(newUser));
      setUserState(newUser);
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  };
  
  const updateUser = (updatedFields: Partial<User>) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
  }

  const value = { user, setUser: updateUser, loading };

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
