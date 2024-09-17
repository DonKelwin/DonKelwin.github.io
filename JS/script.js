document.addEventListener("DOMContentLoaded", function() {
    // number of stars to animate
    const numStars = 700;
    
    // container for the stars
    const starsContainer = document.createElement('div');
    starsContainer.classList.add('stars');
    document.body.appendChild(starsContainer);

    // positioning of the stars
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

    // positioning of the circle
    const sections = document.querySelectorAll(".section");
    const circleRadius = 150; 
    const centerX = 200; 
    const centerY = 200; 
    const startAngle = Math.PI / 2; // start angle to match prototype

    sections.forEach((section, index) => {
        const angle = startAngle + (index / sections.length) * 2 * Math.PI;
        const x = centerX + circleRadius * Math.cos(angle) - 25;
        const y = centerY + circleRadius * Math.sin(angle) - 25;
        section.style.left = `${x}px`;
        section.style.top = `${y}px`;
    });

    // initialize correct sequence
    const correctSequence = [3, 3, 4, 7, 1, 6, 10, 11, 2, 9, 8, 12];
    let clickedSequence = []; // sequence by user is stored here
    const message = document.getElementById("message");
    const history = document.getElementById("history");

    // event listener for each field of number to store clicked sequence
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

            // check for correct sequence
            if (clickedSequence.length === 12) {
                // correct
                if (JSON.stringify(clickedSequence) === JSON.stringify(correctSequence)) {
                    message.innerHTML = 'Erfolg! Hier ist mein Master Passwort: PSWHwarEinCoolesPraktikum';
                } else {
                    message.innerText = "Fehlgeschlagen!";
                }
                clickedSequence = []; // reset clicked sequence
                history.innerHTML = ''; 
            }
        });
    });

    // function to create shooting star
    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.top = `${Math.random() * 50}vh`;
        shootingStar.style.left = `${Math.random() * 50}vw`;
        starsContainer.appendChild(shootingStar);
        setTimeout(() => {
            starsContainer.removeChild(shootingStar);
        }, 1000);
    }

    // twinkle of the remaining stars
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

    setInterval(randomTwinkle, 6000);

    function startShootingStars() {
        setTimeout(() => {
            createShootingStar();
            startShootingStars();
        }, Math.random() * 5000 + 2000);
    }

    startShootingStars();
});
