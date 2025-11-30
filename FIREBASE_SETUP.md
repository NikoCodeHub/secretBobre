# Firebase Einrichtung für Biber-Wichteln

## Schritt 1: Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf "Projekt hinzufügen"
3. Gib einen Projektnamen ein (z.B. "biber-wichteln")
4. Deaktiviere Google Analytics (optional)
5. Klicke auf "Projekt erstellen"

## Schritt 2: Realtime Database aktivieren

1. Wähle in der linken Seitenleiste "Build" > "Realtime Database"
2. Klicke auf "Datenbank erstellen"
3. Wähle einen Standort (empfohlen: `europe-west1` für Europa)
4. Starte im **Testmodus** (für die ersten 30 Tage öffentlich zugänglich)
5. Klicke auf "Aktivieren"

## Schritt 3: Firebase-Konfiguration abrufen

1. Klicke auf das Zahnrad-Symbol neben "Projektübersicht" > "Projekteinstellungen"
2. Scrolle runter zu "Deine Apps"
3. Klicke auf das Web-Symbol `</>` um eine Web-App zu erstellen
4. Gib einen App-Namen ein (z.B. "biber-wichteln-web")
5. **Aktiviere "Auch Firebase Hosting für diese App einrichten"** (optional)
6. Klicke auf "App registrieren"
7. Kopiere die Konfigurations-Werte aus dem `firebaseConfig` Objekt

## Schritt 4: Konfiguration in src/firebase.js eintragen

Öffne die Datei `src/firebase.js` und ersetze die Platzhalter-Werte:

```javascript
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "dein-projekt.firebaseapp.com",
  databaseURL: "https://dein-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dein-projekt",
  storageBucket: "dein-projekt.appspot.com",
  messagingSenderId: "DEINE_SENDER_ID",
  appId: "DEINE_APP_ID"
};
```

## Schritt 5: Sicherheitsregeln anpassen (WICHTIG!)

1. Gehe zurück zur Realtime Database in der Firebase Console
2. Klicke auf "Regeln"
3. Ersetze die Regeln mit folgendem Code:

```json
{
  "rules": {
    "wichtelnGame": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **Hinweis:** Diese Regeln erlauben jedem Lese- und Schreibzugriff. Für eine Produktionsumgebung solltest du strengere Regeln definieren!

Für mehr Sicherheit (nach dem Wichteln):
```json
{
  "rules": {
    "wichtelnGame": {
      ".read": true,
      "drawnBy": {
        ".write": "!data.exists() || newData.val().length > data.val().length"
      },
      "assignments": {
        ".write": false
      }
    }
  }
}
```

## Schritt 6: App starten

```bash
npm run dev
```

Die App sollte jetzt mit Firebase synchronisiert sein!

## Testen

1. Öffne die App in zwei verschiedenen Browser-Tabs (oder auf zwei verschiedenen Geräten)
2. Ziehe ein Los in einem Tab
3. Der Status sollte sofort im anderen Tab aktualisiert werden

## Fehlerbehebung

### "Firebase: Error (auth/invalid-api-key)"
- Überprüfe, ob du alle Werte in `src/firebase.js` korrekt eingetragen hast

### "PERMISSION_DENIED: Permission denied"
- Überprüfe die Sicherheitsregeln in der Firebase Console
- Stelle sicher, dass die Regeln für `wichtelnGame` Lese- und Schreibzugriff erlauben

### Daten werden nicht synchronisiert
- Öffne die Firebase Console > Realtime Database > Daten
- Prüfe, ob Daten unter `wichtelnGame` erscheinen
- Überprüfe die Browser-Konsole auf Fehlermeldungen
