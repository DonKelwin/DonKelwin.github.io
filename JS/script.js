document.addEventListener("DOMContentLoaded", function() {
    // Anzahl der Sterne, die erstellt werden sollen
    const numStars = 700;
    
    const starsContainer = document.createElement('div');
    starsContainer.classList.add('stars');
    document.body.appendChild(starsContainer);

    // Erstellen und Positionieren der Sterne
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Zufällige X- und Y-Koordinaten für jeden Stern
        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;
        star.style.setProperty('--x', x);
        star.style.setProperty('--y', y);
        star.style.top = "50%";
        star.style.left = "50%";
        star.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`;

        starsContainer.appendChild(star);
    }

    // Positionierung der Kreiselemente im Kreis
    const sections = document.querySelectorAll(".section");
    const circleRadius = 150; 
    const centerX = 200; 
    const centerY = 200; 
    const startAngle = Math.PI / 2; //Änderung des Startwinkels, um Positionierung des Kreises auf der Webseite mit dem Prototypen konsistent zu halten

    // Berechnung der Position für jede Sektion im Kreis
    sections.forEach((section, index) => {
        const angle = startAngle + (index / sections.length) * 2 * Math.PI;
        const x = centerX + circleRadius * Math.cos(angle) - 25;
        const y = centerY + circleRadius * Math.sin(angle) - 25;
        section.style.left = `${x}px`;
        section.style.top = `${y}px`;
    });

    // Richtig definierte Klick-Sequenz für den Erfolg
    const correctSequence = [3, 3, 4, 7, 1, 6, 10, 11, 2, 9, 8, 12];
    let clickedSequence = []; // Speichert die vom Benutzer geklickte Reihenfolge
    const message = document.getElementById("message");
    const history = document.getElementById("history");

    // Event-Listener für jeden Abschnitt: registriert Klicks und zeigt Historie an
    sections.forEach(section => {
        section.addEventListener("click", function() {
            const number = parseInt(this.innerText); 
            clickedSequence.push(number);
            const historyEntry = document.createElement("span");
            historyEntry.innerText = number;
            history.appendChild(historyEntry);
            this.classList.add("clicked");
            setTimeout(() => {
                this.classList.remove("clicked");
            }, 500); 

            // Überprüfen, ob die Reihenfolge vollständig ist (12 Klicks)
            if (clickedSequence.length === 12) {
                // Wenn die geklickte Sequenz korrekt ist
                if (JSON.stringify(clickedSequence) === JSON.stringify(correctSequence)) {
                    message.innerHTML = 'Erfolg! <a href="https://example.com" target="_blank" style="color: cyan; text-decoration: underline;">Weiter</a>';
                } else {
                    message.innerText = "Fehlgeschlagen!";
                }
                clickedSequence = []; // Klicksequenz zurücksetzen
                history.innerHTML = ''; 
            }
        });
    });

    // Funktion zum Erstellen einer Sternschnuppe
    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.top = `${Math.random() * 50}vh`;
        shootingStar.style.left = `${Math.random() * 50}vw`;
        starsContainer.appendChild(shootingStar);
        // Entfernt die Sternschnuppe nach Ablauf der Animation (1 Sekunde)
        setTimeout(() => {
            starsContainer.removeChild(shootingStar);
        }, 1000);
    }

    // Zufälliges Funkeln eines Sterns
    function randomTwinkle() {
        const randomStar = starsContainer.children[Math.floor(Math.random() * numStars)];
        randomStar.style.opacity = 0.5;
        randomStar.style.transform = 'scale(1)';
        setTimeout(() => {
            randomStar.style.opacity = 1;
            randomStar.style.transform = 'scale(1.5)'; 
        }, 700);
        setTimeout(() => {
            randomStar.style.opacity = 0.5;
            randomStar.style.transform = 'scale(1)';
        }, 4000);
    }

    // Intervall für zufälliges Funkeln der Sterne
    setInterval(randomTwinkle, 6000);

    function startShootingStars
