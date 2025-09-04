
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Song, User, Concert } from '@/lib/types';
import { users as defaultUsers, songs as defaultSongs, concerts as defaultConcerts } from '@/lib/data';

interface UserContextType {
  user: User;
  setUser: (user: Partial<User>) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  concerts: Concert[];
  setConcerts: (concerts: Concert[]) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = defaultUsers[0];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(defaultUser);
  const [users, setUsersState] = useState<User[]>(defaultUsers);
  const [songs, setSongsState] = useState<Song[]>(defaultSongs);
  const [concerts, setConcertsState] = useState<Concert[]>(defaultConcerts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      } else {
        setUserState(defaultUser);
      }

      const storedUsers = localStorage.getItem('userList');
      if (storedUsers) {
        setUsersState(JSON.parse(storedUsers));
      } else {
        setUsersState(defaultUsers);
      }
      
      const storedSongs = localStorage.getItem('songList');
      if (storedSongs) {
        setSongsState(JSON.parse(storedSongs));
      } else {
        setSongsState(defaultSongs);
      }

      const storedConcerts = localStorage.getItem('concertList');
      if (storedConcerts) {
        setConcertsState(JSON.parse(storedConcerts));
      } else {
        setConcertsState(defaultConcerts);
      }

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setUserState(defaultUser);
      setUsersState(defaultUsers);
      setSongsState(defaultSongs);
      setConcertsState(defaultConcerts);
    }
    setLoading(false);
  }, []);

  const setUsers = (newUsers: User[]) => {
     try {
      localStorage.setItem('userList', JSON.stringify(newUsers));
      setUsersState(newUsers);
    } catch (error) {
      console.error("Failed to save users to localStorage", error);
    }
  }

  const setSongs = (newSongs: Song[]) => {
    try {
      localStorage.setItem('songList', JSON.stringify(newSongs));
      setSongsState(newSongs);
    } catch (error) {
      console.error("Failed to save songs to localStorage", error);
    }
  };

  const setConcerts = (newConcerts: Concert[]) => {
    try {
      localStorage.setItem('concertList', JSON.stringify(newConcerts));
      setConcertsState(newConcerts);
    } catch (error) {
      console.error("Failed to save concerts to localStorage", error);
    }
  }

  const updateUser = (updatedFields: Partial<User>) => {
    const updatedUser = { ...user, ...updatedFields };
    try {
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUserState(updatedUser);
      
      // Also update the user in the main list
      const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      setUsers(newUsers);

    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }

  const value = { user, setUser: updateUser, users, setUsers, songs, setSongs, concerts, setConcerts, loading };

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
