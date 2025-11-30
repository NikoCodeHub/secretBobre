import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase-Konfiguration für das secret-bobre Projekt
const firebaseConfig = {
  apiKey: "AIzaSyDpGB8TyeamSbZKTDVOi80NJvULEgtX0hU",
  authDomain: "secret-bobre.firebaseapp.com",
  databaseURL: "https://secret-bobre-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "secret-bobre",
  storageBucket: "secret-bobre.firebasestorage.app",
  messagingSenderId: "694092250642",
  appId: "1:694092250642:web:a159c7ddf528556ce4a2cb",
  measurementId: "G-YESHGD126N"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Realtime Database Referenz
export const database = getDatabase(app);
