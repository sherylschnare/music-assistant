
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, onSnapshot, writeBatch, getDoc, updateDoc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Song, User, Concert } from '@/lib/types';
import { users as defaultUsers, songs as defaultSongs, concerts as defaultConcerts } from '@/lib/data';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => Promise<void>;
  songs: Song[];
  setSongs: (songs: Song[]) => Promise<void>;
  addSongs: (songs: Song[]) => Promise<void>;
  concerts: Concert[];
  setConcerts: (concerts: Concert[]) => Promise<void>;
  loading: boolean;
  musicTypes: string[];
  setMusicTypes: (types: string[]) => Promise<void>;
  musicSubtypes: string[];
  setMusicSubtypes: (subtypes: string[]) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const baseSubtypes = ["Christmas", "Easter", "Spring", "Winter", "Fall", "Summer", "Celtic", "Pop"];
const baseTypes = ["Choral", "Orchestral", "Band", "Solo", "Chamber", "Holiday"];

async function seedInitialData(userId: string) {
    console.log("Seeding initial data if necessary...");
    const batch = writeBatch(db);

    const taxonomyDocRef = doc(db, 'app-data', 'taxonomy');
    const taxonomySnap = await getDoc(taxonomyDocRef);
    if (!taxonomySnap.exists()) {
        batch.set(taxonomyDocRef, { types: baseTypes, subtypes: baseSubtypes });
    }

    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    if (usersSnapshot.empty) {
        defaultUsers.forEach(user => {
            const docRef = doc(db, 'users', user.id === '1' ? userId : user.id);
            batch.set(docRef, { ...user, id: user.id === '1' ? userId : user.id });
        });
    }

    const songsCollectionRef = collection(db, 'songs');
    const songsSnapshot = await getDocs(songsCollectionRef);
    if (songsSnapshot.empty) {
        defaultSongs.forEach(song => {
            const docRef = doc(db, 'songs', song.id);
            batch.set(docRef, song);
        });
    }
    
    const concertsCollectionRef = collection(db, 'concerts');
    const concertsSnapshot = await getDocs(concertsCollectionRef);
    if (concertsSnapshot.empty) {
        defaultConcerts.forEach(concert => {
            const docRef = doc(db, 'concerts', concert.id);
            batch.set(docRef, concert);
        });
    }

    await batch.commit();
}


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [users, setUsersState] = useState<User[]>([]);
  const [songs, setSongsState] = useState<Song[]>([]);
  const [concerts, setConcertsState] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [musicTypes, setMusicTypesState] = useState<string[]>([]);
  const [musicSubtypes, setMusicSubtypesState] = useState<string[]>([]);
  const [initialDataSeeded, setInitialDataSeeded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        if (!initialDataSeeded) {
            await seedInitialData(fbUser.uid);
            setInitialDataSeeded(true);
        }

        const userDocRef = doc(db, 'users', fbUser.uid);
        const userUnsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data() as User;
                setUserState(userData);
                localStorage.setItem('userProfile', JSON.stringify(userData));
            } else {
                setUserState(null);
                localStorage.removeItem('userProfile');
            }
            setLoading(false);
        });
        return () => userUnsubscribe();
      } else {
        setUserState(null);
        localStorage.removeItem('userProfile');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [initialDataSeeded]);

  useEffect(() => {
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => doc.data() as User);
        setUsersState(usersData);
    });

    const songsUnsubscribe = onSnapshot(query(collection(db, "songs")), (snapshot) => {
        const songsData = snapshot.docs.map(doc => doc.data() as Song);
        setSongsState(songsData);
    });

    const taxonomyUnsubscribe = onSnapshot(doc(db, "app-data", "taxonomy"), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            setMusicTypesState(data.types || baseTypes);
            setMusicSubtypesState(data.subtypes || baseSubtypes);
        } else {
            setMusicTypesState(baseTypes);
            setMusicSubtypesState(baseSubtypes);
        }
    });

    const concertsUnsubscribe = onSnapshot(query(collection(db, "concerts")), (snapshot) => {
        const concertsData = snapshot.docs.map(doc => doc.data() as Concert);
        setConcertsState(concertsData);
    });

    return () => {
        usersUnsubscribe();
        songsUnsubscribe();
        concertsUnsubscribe();
        taxonomyUnsubscribe();
    };
  }, []);

  const setUsers = async (newUsers: User[]) => {
    const batch = writeBatch(db);
    newUsers.forEach(u => {
      const docRef = doc(db, 'users', u.id);
      batch.set(docRef, u);
    });
    await batch.commit();
  }

  const setSongs = async (newSongs: Song[]) => {
    const batch = writeBatch(db);
    newSongs.forEach(s => {
        const docRef = doc(db, 'songs', s.id);
        batch.set(docRef, s, { merge: true });
    });
    await batch.commit();
  };

  const addSongs = async (newSongs: Song[]) => {
    const batch = writeBatch(db);
    newSongs.forEach(s => {
      const docRef = doc(db, 'songs', s.id);
      batch.set(docRef, s);
    });
    await batch.commit();
  };

  const setConcerts = async (newConcerts: Concert[]) => {
     const batch = writeBatch(db);
     newConcerts.forEach(c => {
       const docRef = doc(db, 'concerts', c.id);
       batch.set(docRef, c, { merge: true });
     });
     await batch.commit();
  }

  const updateUser = async (updatedUser: User | null) => {
    setUserState(updatedUser);
    if(updatedUser) {
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        const userRef = doc(db, 'users', updatedUser.id);
        await setDoc(userRef, updatedUser, { merge: true });
    } else {
        localStorage.removeItem('userProfile');
        await getAuth().signOut();
    }
  }

  const setMusicTypes = async (types: string[]) => {
    const taxonomyDocRef = doc(db, 'app-data', 'taxonomy');
    await updateDoc(taxonomyDocRef, { types });
  }

  const setMusicSubtypes = async (subtypes: string[]) => {
    const taxonomyDocRef = doc(db, 'app-data', 'taxonomy');
    await updateDoc(taxonomyDocRef, { subtypes });
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
