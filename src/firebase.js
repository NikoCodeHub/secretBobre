import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase-Konfiguration
// WICHTIG: Diese Werte müssen durch deine eigenen Firebase-Credentials ersetzt werden
// Gehe zu https://console.firebase.google.com/ und erstelle ein neues Projekt
// Dann gehe zu Projekteinstellungen > Allgemein > Deine Apps > Web-App
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Realtime Database Referenz
export const database = getDatabase(app);
