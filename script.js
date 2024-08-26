document.addEventListener("DOMContentLoaded", function() {
    const numStars = 700;
    const starsContainer = document.createElement('div');
    starsContainer.classList.add('stars');
    document.body.appendChild(starsContainer);

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
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
    const startAngle = Math.PI / 2; // Startwinkel für 1 unten (90° bzw. π/2)

    sections.forEach((section, index) => {
        const angle = startAngle + (index / sections.length) * 2 * Math.PI;
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
                    message.innerHTML = 'Erfolg! <a href="https://example.com" target="_blank" style="color: cyan; text-decoration: underline;">Weiter</a>';
                    } else {
                    message.innerText = "Fehlgeschlagen!";
                }
                clickedSequence = [];
                history.innerHTML = ''; // Historie zurücksetzen
            }
        });
    });


    // Funktion zur Erstellung einer Sternschnuppe
    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.top = `${Math.random() * 50}vh`;
        shootingStar.style.left = `${Math.random() * 50}vw`;
        starsContainer.appendChild(shootingStar);

        // Entferne die Sternschnuppe nach der Animation
        setTimeout(() => {
            starsContainer.removeChild(shootingStar);
        }, 1000); // entspricht der Dauer der Animation
    }

    // Funktion, die die Sternschnuppen nach einer zufälligen Zeitspanne startet
    function startShootingStars() {
        setTimeout(() => {
            createShootingStar();
            startShootingStars();
        }, Math.random() * 5000 + 2000); // Wartezeit zwischen 5 und 10 Sekunden
    }

    // Sternschnuppen-Animation starten
    startShootingStars();
});
