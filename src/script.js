// Teilnehmer-Liste
const participants = [
    'Niko', 'Noah', 'Konrad', 'Marek', 'Robin',
    'Leander', 'Jonas', 'Felix', 'Gustav', 'Jeri',
    'Kilian', 'Christoph', 'Marius', 'Robert', 'Moritz',
    'Sten', 'Tammo', 'Tillman', 'Gelimer', 'Erik',
    'Piepen', 'Benni', 'Theo'
];

// Lokaler Speicher für den Spielstand
let gameState = {
    assignments: {},
    drawnBy: []
};

// Initialisierung
function init() {
    loadGameState();

    // Wenn noch keine Zuordnungen existieren, erstelle sie
    if (Object.keys(gameState.assignments).length === 0) {
        createAssignments();
    }

    populateNameSelect();
    updateParticipantsList();
}

// Erstelle zufällige Zuordnungen (jeder bekommt jemanden, aber nicht sich selbst)
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
    gameState.assignments = {};
    for (let i = 0; i < givers.length; i++) {
        gameState.assignments[givers[i]] = receivers[i];
    }

    gameState.drawnBy = [];
    saveGameState();
}

// Befülle das Dropdown
function populateNameSelect() {
    const select = document.getElementById('nameSelect');
    select.innerHTML = '<option value="">-- Wähle deinen Namen --</option>';

    participants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;

        // Deaktiviere Namen, die bereits gezogen haben
        if (gameState.drawnBy.includes(name)) {
            option.disabled = true;
            option.textContent = name + ' (bereits gezogen)';
        }

        select.appendChild(option);
    });
}

// Los ziehen
function drawName() {
    const select = document.getElementById('nameSelect');
    const selectedName = select.value;

    if (!selectedName) {
        alert('Bitte wähle zuerst deinen Namen aus!');
        return;
    }

    if (gameState.drawnBy.includes(selectedName)) {
        alert('Du hast bereits dein Los gezogen!');
        return;
    }

    // Zeige das Ergebnis
    const giftRecipient = gameState.assignments[selectedName];
    document.getElementById('giftName').textContent = giftRecipient;
    document.getElementById('result').classList.add('show');

    // Markiere als gezogen
    gameState.drawnBy.push(selectedName);
    saveGameState();

    // Update UI
    populateNameSelect();
    updateParticipantsList();

    // Scroll zum Ergebnis
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Update Teilnehmer-Liste
function updateParticipantsList() {
    const list = document.getElementById('participantsList');
    list.innerHTML = '';

    participants.forEach(name => {
        const div = document.createElement('div');
        div.className = 'participant';

        if (gameState.drawnBy.includes(name)) {
            div.classList.add('drawn');
            div.innerHTML = `<span class="status-icon">✅</span>${name}`;
        } else {
            div.classList.add('not-drawn');
            div.innerHTML = `${name}`;
        }

        list.appendChild(div);
    });
}

// Spielstand speichern
function saveGameState() {
    localStorage.setItem('wichtelnGameState', JSON.stringify(gameState));
}

// Spielstand laden
function loadGameState() {
    const saved = localStorage.getItem('wichtelnGameState');
    if (saved) {
        gameState = JSON.parse(saved);
    }
}

// Spiel zurücksetzen
function resetGame() {
    if (confirm('Bist du sicher, dass du das Spiel zurücksetzen möchtest? Alle bisherigen Zuordnungen gehen verloren!')) {
        gameState = {
            assignments: {},
            drawnBy: []
        };
        createAssignments();
        document.getElementById('result').classList.remove('show');
        populateNameSelect();
        updateParticipantsList();
        alert('Das Spiel wurde zurückgesetzt! Die Biber haben neue Lose vorbereitet! 🎁');
    }
}

// Initialisiere beim Laden der Seite
window.onload = init;
