
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, onSnapshot, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Song, User, Concert } from '@/lib/types';
import { users as defaultUsers, songs as defaultSongs, concerts as defaultConcerts } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';

interface UserContextType {
  user: User;
  setUser: (user: Partial<User>) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  addSongs: (songs: Song[]) => Promise<void>;
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

async function clearFirestoreData() {
  console.log("Clearing Firestore data...");
  const songsCollectionRef = collection(db, 'songs');
  const concertsCollectionRef = collection(db, 'concerts');
  const usersCollectionRef = collection(db, 'users');

  const songsSnapshot = await getDocs(songsCollectionRef);
  const concertsSnapshot = await getDocs(concertsCollectionRef);
  const usersSnapshot = await getDocs(usersCollectionRef);

  const batch = writeBatch(db);

  songsSnapshot.forEach(doc => batch.delete(doc.ref));
  concertsSnapshot.forEach(doc => batch.delete(doc.ref));
  usersSnapshot.forEach(doc => batch.delete(doc.ref));
  
  await batch.commit();
  console.log("Firestore data cleared.");
  try {
    localStorage.setItem('firestore_cleared', 'true');
  } catch (e) {
    console.error('Could not set firestore_cleared flag in local storage.', e)
  }
}


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User>(defaultUser);
  const [users, setUsersState] = useState<User[]>([]);
  const [songs, setSongsState] = useState<Song[]>([]);
  const [concerts, setConcertsState] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setup() {
        let cleared = false;
        try {
          cleared = localStorage.getItem('firestore_cleared') === 'true';
        } catch(e) {
          console.error("Could not read firestore_cleared flag from local storage.", e);
        }

        if (!cleared) {
          await clearFirestoreData();
        }

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

        const existingDocs = await getDocs(songsCollectionRef);
        existingDocs.forEach(doc => batch.delete(doc.ref));

        newSongs.forEach(s => {
            const docRef = doc(db, 'songs', s.id);
            batch.set(docRef, s);
        });
        await batch.commit();
    } catch (error) {
      console.error("Failed to save songs to Firestore", error);
    }
  };

  const addSongs = async (newSongs: Song[]) => {
    try {
      const batch = writeBatch(db);
      newSongs.forEach(s => {
        const docRef = doc(db, 'songs', s.id);
        batch.set(docRef, s);
      });
      await batch.commit();
    } catch (error) {
      console.error("Failed to add songs to Firestore", error);
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
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      setUserState(updatedUser);
      
      const userRef = doc(db, 'users', updatedUser.id);
      await setDoc(userRef, updatedUser, { merge: true });

    } catch (error) {
      console.error("Failed to save user to localStorage/Firestore", error);
    }
  }

  const value = { user, setUser: updateUser, users, setUsers, songs, setSongs, addSongs, concerts, setConcerts, loading };

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
