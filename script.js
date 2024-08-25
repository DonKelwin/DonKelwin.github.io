document.addEventListener("DOMContentLoaded", function() {
    const numStars = 150;
    const starsContainer = document.createElement('div');
    starsContainer.classList.add('stars');
    document.body.appendChild(starsContainer);

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const x = Math.random() - 0.5;  // Zufällige Richtung
        const y = Math.random() - 0.5;  // Zufällige Richtung
        star.style.setProperty('--x', x);
        star.style.setProperty('--y', y);
        star.style.top = "50%";
        star.style.left = "50%";
        star.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`;
        starsContainer.appendChild(star);
    }

    // Positionierung der Kreiselemente im Kreis
    const sections = document.querySelectorAll(".section");
    const circleRadius = 150; // Radius des Kreises
    const centerX = 200; // Mitte des Kreises X
    const centerY = 200; // Mitte des Kreises Y

    sections.forEach((section, index) => {
        const angle = (index / sections.length) * 2 * Math.PI;
        const x = centerX + circleRadius * Math.cos(angle) - 25;
        const y = centerY + circleRadius * Math.sin(angle) - 25;
        section.style.left = `${x}px`;
        section.style.top = `${y}px`;
    });

    const correctSequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let clickedSequence = [];
    const message = document.getElementById("message");
    const history = document.getElementById("history");

    sections.forEach(section => {
        section.addEventListener("click", function() {
            const number = parseInt(this.innerText);
            clickedSequence.push(number);
            const historyEntry = document.createElement("span");
            historyEntry.innerText = number;
            history.appendChild(historyEntry);

            if (clickedSequence.length === 12) {
                if (JSON.stringify(clickedSequence) === JSON.stringify(correctSequence)) {
                    message.innerHTML = 'Erfolg! <a href="#">Weiter</a>';
                } else {
                    message.innerText = "Fehlgeschlagen!";
                }
                clickedSequence = [];
                history.innerHTML = ''; // Historie zurücksetzen
            }
        });
    });
});
