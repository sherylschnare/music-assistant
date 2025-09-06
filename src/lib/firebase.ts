
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADKAxsk0ohucyB9VixUhGht-pzm2Ho8k4",
  authDomain: "orchestra-assistant.firebaseapp.com",
  projectId: "orchestra-assistant",
  storageBucket: "orchestra-assistant.firebasestorage.app",
  messagingSenderId: "213349109970",
  appId: "1:213349109970:web:63c67a4d0bfb2d7cb91d0b"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
