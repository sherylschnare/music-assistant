
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Song, User, Concert } from '@/lib/types';
import { users as defaultUsers, songs as defaultSongs, concerts as defaultConcerts } from '@/lib/data';

interface UserContextType {
  user: User | null;
  setUser: (user: Partial<User> | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  addSongs: (songs: Song[]) => Promise<void>;
  concerts: Concert[];
  setConcerts: (concerts: Concert[]) => void;
  loading: boolean;
  musicTypes: string[];
  setMusicTypes: (types: string[]) => void;
  musicSubtypes: string[];
  setMusicSubtypes: (subtypes: string[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const baseSubtypes = ["Christmas", "Easter", "Spring", "Winter", "Fall", "Summer", "Celtic", "Pop"];
const baseTypes = ["Choral", "Orchestral", "Band", "Solo", "Chamber", "Holiday"];


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [users, setUsersState] = useState<User[]>(defaultUsers);
  const [songs, setSongsState] = useState<Song[]>(defaultSongs);
  const [concerts, setConcertsState] = useState<Concert[]>(defaultConcerts);
  const [loading, setLoading] = useState(true);
  const [musicTypes, setMusicTypesState] = useState<string[]>(baseTypes);
  const [musicSubtypes, setMusicSubtypesState] = useState<string[]>(baseSubtypes);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch(e) {
      console.error("Failed to load user from localstorage", e)
    } finally {
        setLoading(false);
    }
  }, []);

  const setUsers = async (newUsers: User[]) => {
    setUsersState(newUsers);
  }

  const setSongs = async (newSongs: Song[]) => {
    setSongsState(newSongs);
  };

  const addSongs = async (newSongs: Song[]) => {
    setSongsState(prev => [...prev, ...newSongs]);
  };

  const setConcerts = async (newConcerts: Concert[]) => {
     setConcertsState(newConcerts);
  }

  const updateUser = (updatedFields: Partial<User> | null) => {
    if (updatedFields === null) {
      setUserState(null);
      localStorage.removeItem('userProfile');
      return;
    }
    
    const userToUpdate = user || defaultUsers.find(u => u.id === '1');
    if (!userToUpdate) return;

    const updatedUser = { ...userToUpdate, ...updatedFields };
    setUserState(updatedUser as User);
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
  }

  const setMusicTypes = (types: string[]) => {
    setMusicTypesState(types);
  }

  const setMusicSubtypes = (subtypes: string[]) => {
    setMusicSubtypesState(subtypes);
  }

  const value = { 
    user, setUser: updateUser, 
    users, setUsers, 
    songs, setSongs, addSongs, 
    concerts, setConcerts, 
    loading, 
    musicTypes, setMusicTypes,
    musicSubtypes, setMusicSubtypes 
  };

  return (
    <UserContext.Provider value={value}>
      {children}
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
