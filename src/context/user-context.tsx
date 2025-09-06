
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, doc, setDoc, onSnapshot, writeBatch, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import type { Song, User, Concert } from '@/lib/types';
import { users as defaultUsers, songs as defaultSongs, concerts as defaultConcerts } from '@/lib/data';

interface UserContextType {
  user: User | null;
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

// Helper function to convert Firestore Timestamps to ISO strings
const convertTimestamps = (data: any) => {
  if (!data) return data;
  
  // Convert Timestamps in Concerts
  if (data.date && data.date instanceof Timestamp) {
    data.date = data.date.toDate().toISOString();
  }
  if (data.pieces && Array.isArray(data.pieces)) {
    data.pieces = data.pieces.map(convertTimestamps);
  }

  // Convert Timestamps in Songs
  if (data.lastPerformed && data.lastPerformed instanceof Timestamp) {
    data.lastPerformed = data.lastPerformed.toDate().toISOString();
  }
  if (data.performanceHistory && Array.isArray(data.performanceHistory)) {
    data.performanceHistory = data.performanceHistory.map(h => 
        h.date && h.date instanceof Timestamp ? { ...h, date: h.date.toDate().toISOString() } : h
    );
  }
  
  return data;
};


const UserContext = createContext<UserContextType | undefined>(undefined);

const baseSubtypes = ["Christmas", "Easter", "Spring", "Winter", "Fall", "Summer", "Celtic", "Pop"];
const baseTypes = ["Choral", "Orchestral", "Band", "Solo", "Chamber", "Holiday"];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null); // Start with null user
  const [users, setUsersState] = useState<User[]>([]);
  const [songs, setSongsState] = useState<Song[]>([]);
  const [concerts, setConcertsState] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true); // True while checking auth state
  const [musicTypes, setMusicTypesState] = useState<string[]>([]);
  const [musicSubtypes, setMusicSubtypesState] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot to listen for real-time updates to the user document
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserState({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            // This case can happen if the user's record in Firestore is deleted
            // but they are still authenticated.
            console.log("User exists in Auth, but not in Firestore DB.");
            setUserState(null);
          }
          setLoading(false);
        });
        
        // Return the unsubscribe function for the user document listener
        return () => unsubUser();

      } else {
        // User is signed out.
        setUserState(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  
  useEffect(() => {
    // These listeners will fetch data for the application regardless of auth state
    const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => doc.data() as User);
        setUsersState(usersData);
    });

    const songsUnsubscribe = onSnapshot(collection(db, "songs"), (snapshot) => {
        const songsData = snapshot.docs.map(doc => convertTimestamps(doc.data()) as Song);
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
        const concertsData = snapshot.docs.map(doc => convertTimestamps(doc.data()) as Concert);
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
      
      const newConcertIds = new Set(newConcerts.map(c => c.id));
      
      existingDocs.forEach(doc => {
        if (!newConcertIds.has(doc.id)) {
            batch.delete(doc.ref);
        }
      });
      
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
    if (!user) return; // No user to update
    const updatedUser = { ...user, ...updatedFields };
    try {
      setUserState(updatedUser);
      const userRef = doc(db, 'users', updatedUser.id);
      await setDoc(userRef, updatedUser, { merge: true });

    } catch (error) {
      console.error("Failed to save user to Firestore", error);
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
