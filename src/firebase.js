import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase-Konfiguration
// WICHTIG: Um die Realtime Database zu verwenden, musst du sie im Firebase Console aktivieren:
// 1. Gehe zu https://console.firebase.google.com/
// 2. Wähle dein Projekt "secret-bobre"
// 3. Klicke auf "Realtime Database" im Menü links
// 4. Klicke auf "Datenbank erstellen"
// 5. Kopiere die Database URL und ersetze sie unten
const firebaseConfig = {
  apiKey: "AIzaSyDpGB8TyeamSbZKTDVOi80NJvULEgtX0hU",
  authDomain: "secret-bobre.firebaseapp.com",
  // TODO: Ersetze diese URL mit der echten Database URL aus dem Firebase Console
  // Die URL findest du unter: Realtime Database > Daten > URL oben in der Ansicht
  // Format: https://secret-bobre-default-rtdb.REGION.firebasedatabase.app
  databaseURL: "https://secret-bobre-default-rtdb.firebaseio.com",
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
