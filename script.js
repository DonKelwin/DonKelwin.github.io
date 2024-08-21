const correctOrder = [2, 5, 8, 1, 4, 7, 10, 3, 6, 9, 12, 11]; // Festgelegte Reihenfolge
let userClicks = [];
const circle = document.getElementById('circle');
const message = document.getElementById('message');

// Erzeuge 12 Flächen im Kreis
const totalSections = correctOrder.length;
const radius = 160; // Radius des Kreises
const sectionSize = 50; // Größe der Flächen
const angleStep = 2 * Math.PI / totalSections; // Schrittwinkel

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
        if (!section.classList.contains('clicked')) {
            userClicks.push(parseInt(section.textContent));
            section.classList.add('clicked');
            section.style.display = 'none'; // Verschwindet nach dem Klick

            // Überprüfen, ob alle Flächen angeklickt wurden
            if (userClicks.length === totalSections) {
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
