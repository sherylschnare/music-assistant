
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

async function seedInitialData() {
    console.log("Seeding initial data...");
    const batch = writeBatch(db);

    const usersCollectionRef = collection(db, 'users');
    const songsCollectionRef = collection(db, 'songs');
    const concertsCollectionRef = collection(db, 'concerts');

    const usersSnapshot = await getDocs(usersCollectionRef);
    if (usersSnapshot.empty) {
        defaultUsers.forEach(user => {
            const docRef = doc(db, 'users', user.id);
            batch.set(docRef, user);
        });
        console.log("Seeding users...");
    }

    const songsSnapshot = await getDocs(songsCollectionRef);
    if (songsSnapshot.empty) {
        defaultSongs.forEach(song => {
            const docRef = doc(db, 'songs', song.id);
            batch.set(docRef, song);
        });
        console.log("Seeding songs...");
    }
    
    const concertsSnapshot = await getDocs(concertsCollectionRef);
    if (concertsSnapshot.empty) {
        defaultConcerts.forEach(concert => {
            const docRef = doc(db, 'concerts', concert.id);
            batch.set(docRef, concert);
        });
        console.log("Seeding concerts...");
    }

    await batch.commit();
    console.log("Initial data seeding complete.");
}


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(defaultUser);
  const [users, setUsersState] = useState<User[]>([]);
  const [songs, setSongsState] = useState<Song[]>([]);
  const [concerts, setConcertsState] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setup() {
        await seedInitialData();

        const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersData = snapshot.docs.map(doc => doc.data() as User);
            setUsersState(usersData);
            setLoading(false);
        });

        const songsUnsubscribe = onSnapshot(collection(db, "songs"), (snapshot) => {
            const songsData = snapshot.docs.map(doc => doc.data() as Song);
            setSongsState(songsData);
        });

        const concertsUnsubscribe = onSnapshot(collection(db, "concerts"), (snapshot) => {
            const concertsData = snapshot.docs.map(doc => doc.data() as Concert);
            setConcertsState(concertsData);
        });

        // Load logged in user from local storage
        try {
          const storedUser = localStorage.getItem('userProfile');
          if (storedUser) {
            setUserState(JSON.parse(storedUser));
          } else {
            setUserState(defaultUser)
          }
        } catch(e) {
          console.error("Failed to load user from localstorage", e)
          setUserState(defaultUser);
        }


        return () => {
            usersUnsubscribe();
            songsUnsubscribe();
            concertsUnsubscribe();
        };
    }

    setup();
  }, []);

  const setUsers = async (newUsers: User[]) => {
    try {
      const batch = writeBatch(db);
      newUsers.forEach(u => {
        const docRef = doc(db, 'users', u.id);
        batch.set(docRef, u);
      });
      await batch.commit();
    } catch (error) {
      console.error("Failed to save users to Firestore", error);
    }
  }

  const setSongs = async (newSongs: Song[]) => {
    try {
        const batch = writeBatch(db);
        const songsCollectionRef = collection(db, "songs");

        // Clear existing songs
        const existingDocs = await getDocs(songsCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        // Add new songs
        newSongs.forEach(s => {
            const docRef = doc(db, 'songs', s.id);
            batch.set(docRef, s);
        });
        await batch.commit();
    } catch (error) {
      console.error("Failed to save songs to Firestore", error);
    }
  };

  const setConcerts = async (newConcerts: Concert[]) => {
     try {
      const batch = writeBatch(db);
      newConcerts.forEach(c => {
        const docRef = doc(db, 'concerts', c.id);
        batch.set(docRef, c);
      });
      await batch.commit();
    } catch (error) {
      console.error("Failed to save concerts to Firestore", error);
    }
  }

  const updateUser = async (updatedFields: Partial<User>) => {
    const updatedUser = { ...user, ...updatedFields };
    try {
      // Update local storage for immediate UI response of logged-in user
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUserState(updatedUser);
      
      // Update the user in Firestore
      const userRef = doc(db, 'users', updatedUser.id);
      await setDoc(userRef, updatedUser, { merge: true });

    } catch (error) {
      console.error("Failed to save user to localStorage/Firestore", error);
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
