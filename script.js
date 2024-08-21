const correctOrder = [2, 5, 8, 1, 4, 7, 10, 3, 6, 9, 12, 11]; // Festgelegte Reihenfolge
let userClicks = [];
let history = [];
const circle = document.getElementById('circle');
const message = document.getElementById('message');
const historyList = document.getElementById('history');

// Erzeuge 12 Flächen im Kreis
const totalSections = correctOrder.length;
const radius = 160; // Radius des Kreises
const sectionSize = 50; // Größe der Flächen
const angleStep = 2 * Math.PI / totalSections; // Schrittwinkel

function updateHistory() {
    historyList.innerHTML = history.map(num => `<span>${num}</span>`).join('');
}

for (let i = 0; i < totalSections; i++) {
    const section = document.createElement('div');
    section.classList.add('section');
    section.textContent = i + 1;

    const angle = i * angleStep;
    const x = radius + radius * Math.cos(angle) - sectionSize / 2;
    const y = radius + radius * Math.sin(angle) - sectionSize / 2;

    section.style.left = `${x}px`;
    section.style.top = `${y}px`;

    section.addEventListener('click', () => {
        if (userClicks.length < 12) { // Maximal 12 Klicks erlauben
            userClicks.push(parseInt(section.textContent));
            history.push(parseInt(section.textContent)); // Füge zur Historie hinzu
            section.classList.add('clicked');
            section.style.opacity = '0'; // Flächen verschwinden lassen
            updateHistory(); // Historie aktualisieren

            // Nach einer kurzen Zeit die Fläche wieder sichtbar machen
            setTimeout(() => {
                section.style.opacity = '1'; // Flächen wieder sichtbar
            }, 500); // Zeit in Millisekunden, die die Flächen verschwinden

            // Überprüfen, ob alle Flächen angeklickt wurden
            if (userClicks.length === 12) {
                if (userClicks.toString() === correctOrder.toString()) {
                    message.innerHTML = 'Erfolg! Du hast die Flächen in der richtigen Reihenfolge angeklickt. <a href="https://www.example.com" target="_blank">Hier geht es weiter</a>.';
                } else {
                    message.textContent = 'Fehler! Die Reihenfolge stimmt nicht.';
                }
            }
        }
    });

    circle.appendChild(section);
}
