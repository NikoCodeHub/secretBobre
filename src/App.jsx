import { useState, useEffect } from 'react';
import './App.css';
import { database } from './firebase';
import { ref, onValue, set, update, get } from 'firebase/database';

// Teilnehmer-Liste
const participants = [
  'Niko', 'Noah', 'Konrad', 'Marek', 'Robin',
  'Leander', 'Jonas', 'Felix', 'Gustav', 'Jeri',
  'Kilian', 'Christoph', 'Marius', 'Robert', 'Moritz',
  'Sten', 'Tammo', 'Tillman', 'Gelimer', 'Erik',
  'Piepen', 'Benni', 'Theo', 'Malin'
];

// Funktion zum Erstellen der Zuordnungen
function createAssignments() {
  let givers = [...participants];
  let receivers = [...participants];

  // Fisher-Yates Shuffle
  for (let i = receivers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
  }

  // Stelle sicher, dass niemand sich selbst bekommt
  let valid = false;
  let attempts = 0;

  while (!valid && attempts < 1000) {
    valid = true;
    for (let i = 0; i < givers.length; i++) {
      if (givers[i] === receivers[i]) {
        valid = false;
        // Tausche mit nächster Person
        const swapIndex = (i + 1) % receivers.length;
        [receivers[i], receivers[swapIndex]] = [receivers[swapIndex], receivers[i]];
        break;
      }
    }
    attempts++;
  }

  // Erstelle Zuordnungs-Objekt
  const assignments = {};
  for (let i = 0; i < givers.length; i++) {
    assignments[givers[i]] = receivers[i];
  }

  return assignments;
}

function App() {
  const [gameState, setGameState] = useState({
    assignments: {},
    drawnBy: []
  });
  const [selectedName, setSelectedName] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Lade Spielstand beim Start und synchronisiere mit Firebase
  useEffect(() => {
    const gameRef = ref(database, 'wichtelnGame');
    let unsubscribe = () => {};

    // Versuche Firebase zu verwenden
    const setupFirebase = async () => {
      try {
        // Prüfe zuerst, ob schon Daten existieren
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) {
          // Nur initialisieren, wenn noch keine Daten existieren
          await initializeGame();
        }

        // Echtzeit-Listener für Änderungen
        unsubscribe = onValue(gameRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.assignments && data.drawnBy !== undefined) {
            console.log('Firebase update received:', data);
            setGameState(data);
            // Speichere auch in localStorage als Backup
            localStorage.setItem('wichtelnGame', JSON.stringify(data));
            setIsLoading(false);
          }
        }, (error) => {
          console.error('Firebase error:', error);
          // Fallback auf localStorage
          loadFromLocalStorage();
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Firebase setup error:', error);
        // Fallback auf localStorage
        loadFromLocalStorage();
        setIsLoading(false);
      }
    };

    setupFirebase();

    // Cleanup-Funktion
    return () => unsubscribe();
  }, []);

  // Initialisiere neues Spiel
  const initializeGame = async () => {
    if (isInitializing) {
      console.log('Already initializing, skipping...');
      return;
    }

    setIsInitializing(true);
    console.log('Initializing new game...');

    const assignments = createAssignments();
    const newState = {
      assignments,
      drawnBy: [],
      createdAt: Date.now()
    };

    // Speichere in Firebase und localStorage
    try {
      const gameRef = ref(database, 'wichtelnGame');
      await set(gameRef, newState);
      console.log('Game initialized in Firebase');
      setGameState(newState);
    } catch (error) {
      console.error('Could not save to Firebase:', error);
      setGameState(newState);
    }
    localStorage.setItem('wichtelnGame', JSON.stringify(newState));
    setIsInitializing(false);
  };

  // Lade von localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('wichtelnGame');
    if (saved) {
      setGameState(JSON.parse(saved));
    } else {
      initializeGame();
    }
  };

  // Los ziehen
  const drawName = async () => {
    if (!selectedName) {
      alert('Bitte wähle zuerst deinen Namen aus!');
      return;
    }

    if (gameState.drawnBy.includes(selectedName)) {
      alert('Du hast bereits dein Los gezogen!');
      return;
    }

    // Zeige das Ergebnis
    const recipient = gameState.assignments[selectedName];
    if (!recipient) {
      alert('Fehler: Keine Zuordnung gefunden. Bitte lade die Seite neu.');
      return;
    }

    setGiftRecipient(recipient);
    setShowResult(true);

    // Markiere als gezogen und aktualisiere State
    const newDrawnBy = [...gameState.drawnBy, selectedName];
    console.log('Updating drawnBy:', newDrawnBy);

    // Synchronisiere mit Firebase und localStorage
    try {
      const gameRef = ref(database, 'wichtelnGame');
      await update(gameRef, { drawnBy: newDrawnBy });
      console.log('Successfully updated Firebase');
    } catch (error) {
      console.error('Could not update Firebase:', error);
      // Aktualisiere trotzdem lokal
      const newState = { ...gameState, drawnBy: newDrawnBy };
      setGameState(newState);
      localStorage.setItem('wichtelnGame', JSON.stringify(newState));
    }

    // Scroll zum Ergebnis
    setTimeout(() => {
      document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Spiel zurücksetzen
  const resetGame = async () => {
    if (confirm('Bist du sicher, dass du das Spiel zurücksetzen möchtest? Alle bisherigen Zuordnungen gehen verloren!')) {
      const assignments = createAssignments();
      const newState = {
        assignments,
        drawnBy: [],
        createdAt: Date.now()
      };

      // Synchronisiere mit Firebase und localStorage
      try {
        const gameRef = ref(database, 'wichtelnGame');
        await set(gameRef, newState);
        console.log('Game reset in Firebase');
        setGameState(newState);
      } catch (error) {
        console.error('Could not reset in Firebase:', error);
        setGameState(newState);
      }
      localStorage.setItem('wichtelnGame', JSON.stringify(newState));

      setShowResult(false);
      setSelectedName('');
      alert('Das Spiel wurde zurückgesetzt! Die Biber haben neue Lose vorbereitet! 🎁');
    }
  };

  return (
    <>
      {/* Schwebende Biber-Bilder im Hintergrund */}
      <img src="/Justin_Bieber.webp" className="beaver-img-bg" style={{ top: '15%', left: '5%', animationDelay: '1s' }} alt="" />
      <img src="/biber.webp" className="beaver-img-bg" style={{ top: '60%', right: '5%', animationDelay: '4s' }} alt="" />
      <img src="/betteln-beaver.webp" className="beaver-img-bg" style={{ top: '80%', left: '10%', animationDelay: '7s' }} alt="" />
      <img src="/stamm.webp" className="beaver-img-bg" style={{ top: '30%', right: '10%', animationDelay: '10s' }} alt="" />

      <div className="container">
        <div className="beaver-header">🎁</div>
        <h1>Biber-Wichteln 2025</h1>
        <p className="subtitle">Zeit deinen Bobre zu ziehen ♥️</p>

        <div className="beaver-dam">
          <img src="/biber.webp" alt="Biber-Stamm" />
        </div>

        {isLoading && (
          <div className="section">
            <div className="info-box">
              Lade Biber-Daten... 🦫
            </div>
          </div>
        )}

        {/* Los ziehen Sektion */}
        <div className="section">
          <h2>Ziehe dein Los!</h2>
          <div className="info-box">
            <strong>So funktioniert's:</strong> Wähle deinen Namen aus und ziehe dein Los. Du erfährst dann, wen du beschenken darfst! 🎁
          </div>

          <select
            id="nameSelect"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            <option value="">-- Wähle deinen Namen --</option>
            {participants.map(name => (
              <option
                key={name}
                value={name}
                disabled={gameState.drawnBy.includes(name)}
              >
                {name}{gameState.drawnBy.includes(name) ? ' (bereits gezogen)' : ''}
              </option>
            ))}
          </select>

          <button id="drawButton" onClick={drawName}>
            Los ziehen! 🎁
          </button>

          <div id="result" className={`result ${showResult ? 'show' : ''}`}>
            <p style={{ fontSize: '1.3rem', color: '#654321' }}>Du beschenkst:</p>
            <div className="gift-name">{giftRecipient}</div>
            <p style={{ color: '#8B4513', marginTop: '20px' }}>🎁 Viel Spaß beim Geschenke aussuchen! 🎁</p>
          </div>
        </div>

        {/* Biber-Bildergalerie */}
        <div className="section">
          <div className="image-gallery">
            <img src="/biber.webp" alt="Biber" />
            <img src="/betteln-beaver.webp" alt="Bettelnder Biber" />
            <img src="/stamm.webp" alt="Biber-Stamm" />
            <img src="/Justin_Bieber.webp" alt="Justin Bieber" />
          </div>
        </div>

        {/* Status Übersicht */}
        <div className="section">
          <h2>Biber-Status: Wer hat schon gezogen?</h2>
          <div className="participants-list">
            {participants.map(name => (
              <div
                key={name}
                className={`participant ${gameState.drawnBy.includes(name) ? 'drawn' : 'not-drawn'}`}
              >
                {gameState.drawnBy.includes(name) && <span className="status-icon">✅</span>}
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Bereich */}
        <div className="section reset-section">
          <h2>Admin-Bereich</h2>
          <div className="warning">
            <strong>⚠️ Achtung!</strong> Das Zurücksetzen löscht alle gezogenen Lose und erstellt eine neue Zuordnung!
          </div>
          <button onClick={resetGame} style={{ background: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)' }}>
            🔄 Spiel zurücksetzen
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
