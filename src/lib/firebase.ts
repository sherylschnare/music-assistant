
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "orchestra-assistant",
  appId: "1:213349109970:web:63c67a4d0bfb2d7cb91d0b",
  storageBucket: "orchestra-assistant.firebasestorage.app",
  apiKey: "AIzaSyADKAxsk0ohucyB9VixUhGht-pzm2Ho8k4",
  authDomain: "orchestra-assistant.firebaseapp.com",
  messagingSenderId: "213349109970"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
