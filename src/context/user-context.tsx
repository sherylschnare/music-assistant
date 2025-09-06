
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, onSnapshot, writeBatch, getDoc, updateDoc } from 'firebase/firestore';
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

const defaultUser: User = defaultUsers[0];
const baseSubtypes = ["Christmas", "Easter", "Spring", "Winter", "Fall", "Summer", "Celtic", "Pop"];
const baseTypes = ["Choral", "Orchestral", "Band", "Solo", "Chamber", "Holiday"];

async function seedInitialData() {
    console.log("Seeding initial data if necessary...");
    const batch = writeBatch(db);

    // Seed Taxonomy
    const taxonomyDocRef = doc(db, 'app-data', 'taxonomy');
    const taxonomySnap = await getDoc(taxonomyDocRef);
    if (!taxonomySnap.exists()) {
        try {
            batch.set(taxonomyDocRef, { types: baseTypes, subtypes: baseSubtypes });
            console.log("Seeding taxonomy...");
        } catch (error) {
            console.error("Failed to seed taxonomy data", error);
        }
    }

    // Seed Users
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    if (usersSnapshot.empty) {
        defaultUsers.forEach(user => {
            const docRef = doc(db, 'users', user.id);
            batch.set(docRef, user);
        });
        console.log("Seeding users...");
    }

    // Seed Songs
    const songsCollectionRef = collection(db, 'songs');
    const songsSnapshot = await getDocs(songsCollectionRef);
    if (songsSnapshot.empty) {
        defaultSongs.forEach(song => {
            const docRef = doc(db, 'songs', song.id);
            batch.set(docRef, song);
        });
        console.log("Seeding songs...");
    }
    
    // Seed Concerts
    const concertsCollectionRef = collection(db, 'concerts');
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
  const [musicTypes, setMusicTypesState] = useState<string[]>([]);
  const [musicSubtypes, setMusicSubtypesState] = useState<string[]>([]);

  useEffect(() => {
    async function setup() {
        await seedInitialData();

        const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersData = snapshot.docs.map(doc => doc.data() as User);
            setUsersState(usersData);
            if(loading) setLoading(false);
        });

        const songsUnsubscribe = onSnapshot(collection(db, "songs"), (snapshot) => {
            const songsData = snapshot.docs.map(doc => doc.data() as Song);
            setSongsState(songsData);
        });

        const taxonomyUnsubscribe = onSnapshot(doc(db, "app-data", "taxonomy"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setMusicTypesState(data.types || []);
                setMusicSubtypesState(data.subtypes || []);
            } else {
                setMusicTypesState(baseTypes);
                setMusicSubtypesState(baseSubtypes);
            }
        });

        const concertsUnsubscribe = onSnapshot(collection(db, "concerts"), (snapshot) => {
            const concertsData = snapshot.docs.map(doc => doc.data() as Concert);
            setConcertsState(concertsData);
        });

        try {
          const storedUser = localStorage.getItem('userProfile');
          if (storedUser) {
            setUserState(JSON.parse(storedUser));
          } else if (users.length > 0) {
            setUserState(users[0]);
          }
        } catch(e) {
          console.error("Failed to load user from localstorage", e)
          if (users.length > 0) {
            setUserState(users[0]);
          }
        }

        return () => {
            usersUnsubscribe();
            songsUnsubscribe();
            concertsUnsubscribe();
            taxonomyUnsubscribe();
        };
    }

    setup();
  }, [loading, users.length]);

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
        newSongs.forEach(s => {
            const docRef = doc(db, 'songs', s.id);
            batch.set(docRef, s, { merge: true });
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
      const concertsCollectionRef = collection(db, "concerts");
      const existingDocs = await getDocs(concertsCollectionRef);
      
      const batch = writeBatch(db);
      
      // Get IDs of new concerts
      const newConcertIds = new Set(newConcerts.map(c => c.id));
      
      // Delete concerts that are not in the new list
      existingDocs.forEach(doc => {
        if (!newConcertIds.has(doc.id)) {
            batch.delete(doc.ref);
        }
      });
      
      // Set/update new concerts
      newConcerts.forEach(c => {
        const docRef = doc(db, 'concerts', c.id);
        batch.set(docRef, c, { merge: true });
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

  const setMusicTypes = async (types: string[]) => {
    try {
      const taxonomyDocRef = doc(db, 'app-data', 'taxonomy');
      await updateDoc(taxonomyDocRef, { types });
    } catch (e) {
      console.error("Failed to update music types", e);
    }
  }

  const setMusicSubtypes = async (subtypes: string[]) => {
    try {
      const taxonomyDocRef = doc(db, 'app-data', 'taxonomy');
      await updateDoc(taxonomyDocRef, { subtypes });
    } catch (e) {
      console.error("Failed to update music subtypes", e);
    }
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
