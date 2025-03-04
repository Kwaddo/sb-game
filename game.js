let lastMoveTime = 0;
let isMoving = false;
let isPaused = false;
let gameStarted = false;
let pauseMenu, nameMenu = false, namePrompt;
window.countdownTime = 180;
let countdownInterval;
let arrowStyleSet = false;
let countdownDisplay;
let score = 0;
let pressedKeys = new Set();
let moveInterval = null;
let currentDirection = null;
let lives = 2;

document.getElementById("start-game").addEventListener("click", () => {
    document.getElementById("game-menu").style.display = "none";
    initGame();
});

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !gameStarted) {
        document.getElementById("game-menu").style.display = "none";
        initGame();
    }
});

function resetGame(instant = false) {
    document.querySelectorAll('.mode-button').forEach(button => {
        button.style.pointerEvents = "all";
        button.style.opacity = "1";
        button.style.cursor = "pointer";
    });
    if (pauseMenu) {
        pauseMenu.remove();
        pauseMenu = null;
    }
    isPaused = false;
    window.characters.forEach(character => {
        if (character.element) {
            character.element.remove();
        }
    });
    window.characters = [];
    window.hintScore = 0;
    removePlayer();
    window.winningCharacter = null;
    gameStarted = false;
    if (countdownDisplay) {
        countdownDisplay.remove();
        countdownDisplay = null;
    }
    clearInterval(countdownInterval);
    window.clearHints();
    
    if (instant) {
        initGame();
    } else {
        document.getElementById("game-menu").style.display = "flex";
    }
}

function createCountdownTimer() {
    countdownDisplay = document.createElement("div");
    countdownDisplay.id = "countdown-timer";
    countdownDisplay.style.position = "absolute";
    countdownDisplay.style.fontSize = "24px";
    countdownDisplay.style.color = "white";
    countdownDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    countdownDisplay.style.padding = "10px";
    countdownDisplay.style.borderRadius = "5px";
    document.body.appendChild(countdownDisplay);
}

function updateCountdown() {
    const minutes = Math.floor(window.countdownTime / 60);
    const seconds = window.countdownTime % 60;
    countdownDisplay.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    updateScoreDisplay();

    if (window.countdownTime <= 0) {
        clearInterval(countdownInterval);
        showLosePopup();
    }
}

function updateScoreDisplay() {
    const scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay && !isPaused) {
        const timeScore = window.countdownTime;
        const hintScore = window.hintScore;
        const totalScore = timeScore + hintScore;
        scoreDisplay.innerText = `Score: ${totalScore}`;
    }
}

function startCountdown() {
    window.countdownTime = 180;
    updateCountdown();

    countdownInterval = setInterval(() => {
        if (!isPaused) {
            window.countdownTime--;
            updateCountdown();
            if (window.countdownTime <= 0) {
                clearInterval(countdownInterval);
                showLosePopup();
            }
        }
    }, 1000);
}

function pauseCountdown() {
    clearInterval(countdownInterval);
}

function resumeCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        if (!isPaused) {
            window.countdownTime--;
            updateCountdown();
            if (window.countdownTime <= 0) {
                clearInterval(countdownInterval);
                showLosePopup();
            }
        }
    }, 1000);
}

function showWinPopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = "YOU WIN!";
    document.querySelector(".start-text").innerText = "I finally found him! Ahmed, I need you to audit me for this project. What do you mean after you're done smoking?";
    document.body.appendChild(popup);
    removePlayer();

    pauseCountdown();
    setTimeout(() => {
        popup.style.opacity = 1;
    }, 100);
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup);
            document.getElementById("start-game").innerText = "Try Again?";
            resetGame(false);
        }, 300);
    }, 2000);
}

function updateLeaderboard(name, score) {
    const leaderboard = document.getElementById("leaderboard");
    if (!leaderboard) {
        const leaderboardContainer = document.createElement("div");
        leaderboardContainer.id = "leaderboard";
        document.body.appendChild(leaderboardContainer);
    }
    const playerScore = document.createElement("div");
    playerScore.classList.add("leaderboard-item");
    playerScore.innerText = `${name}: ${score}`;
    document.getElementById("leaderboard").appendChild(playerScore);
}

function showLosePopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = "YOU LOSE!";
    document.querySelector(".start-text").innerText = "Where in the love of God is he? I actually can't find him! I guess he's not here? I'll just return to the campus and wait for him there. Dangit.";
    document.body.appendChild(popup);
    pauseCountdown();
    setTimeout(() => {
        popup.style.opacity = 1;
    }, 100);
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup);
            document.getElementById("start-game").innerText = "Try Again?";
            resetGame(false);
        }, 300);
    }, 2000);
}

function removePlayer() {
    const player = document.getElementById("player");
    if (player) {
        player.remove();
    }
}

function gameLoop(timestamp) {
    if (!isPaused) {
        window.characters.forEach(character => {
            if (!character.lastMoveTime) character.lastMoveTime = timestamp;
            const deltaTime = timestamp - character.lastMoveTime;
            
            if (deltaTime > character.moveInterval) {
                window.moveCharacterRandomly(character);
                character.lastMoveTime = timestamp;
            }
        });
    }
    requestAnimationFrame(gameLoop);
}

function initPlayer() {
    const player = document.createElement("div")
    player.id = "player"

    let startX, startY;
    do {
        startX = Math.floor(window.columns / 1.4);
        startY = Math.floor(window.rows / 2.1);
    } while (!window.isValidMove(startX, startY))

    updatePlayerPosition(player, startX, startY);

    window.tilemapContainer.appendChild(player);
    player.dataset.x = startX;
    player.dataset.y = startY;
}

function updatePlayerPosition(player, x, y) {
    const left = x * window.tileSize + window.tileSize / 2 - player.offsetWidth / 2;
    const top = y * window.tileSize + window.tileSize / 2 - player.offsetHeight / 2;
    player.style.left = `${left}px`;
    player.style.top = `${top}px`;
}

function movePlayer(e) {
    if (isPaused) return;

    const player = document.getElementById("player");
    const x = Number.parseInt(player.dataset.x, 10);
    const y = Number.parseInt(player.dataset.y, 10);

    let newX = x, newY = y;
    switch (e.key) {
        case "ArrowLeft":
            newX = x - 1;
            break;
        case "ArrowRight":
            newX = x + 1;
            break;
        case "ArrowUp":
            newY = y - 1;
            break;
        case "ArrowDown":
            newY = y + 1;
            break;
    }

    if (window.isValidMove(newX, newY)) {
        player.classList.add("moving");
        player.dataset.x = newX;
        player.dataset.y = newY;
        updatePlayerPosition(player, newX, newY);
        window.checkHintCollision(newX, newY);
        setTimeout(() => {
            player.classList.remove("moving");
        }, 400);

        if (window.winningCharacter &&
            newX === window.winningCharacter.position.x &&
            newY === window.winningCharacter.position.y) {

            showWinPopup();
            removeCharacter(window.winningCharacter);
            window.winningCharacter = null;
        }
        for (const character of window.characters) {
            if (newX === character.position.x && newY === character.position.y) {
                loseLife();
                return;
            }
        }
    }
}

function createPauseMenu() {
    pauseMenu = document.createElement("div");
    pauseMenu.classList.add("pause-menu");
    
    const content = document.createElement("div");
    content.classList.add("pause-content");
    
    content.innerHTML = `
        <h2>Game Paused</h2>
        <button id="resumeButton">Continue</button>
        <button id="resetButton">Reset Game</button>
    `;
    
    pauseMenu.appendChild(content);
    document.body.appendChild(pauseMenu);

    document.getElementById("resumeButton").addEventListener("click", () => {
        unpauseGame();
    });

    document.getElementById("resetButton").addEventListener("click", () => {
        hidePauseMenu();
        resetGame(true);
    });
}

function showPauseMenu() {
    if (!gameStarted) return;
    if (!pauseMenu) {
        createPauseMenu();
    }
    pauseMenu.style.display = "flex";
    isPaused = true;
}

function hidePauseMenu() {
    if (pauseMenu) {
        pauseMenu.style.display = "none"
    }
    isPaused = false
}

function togglePause() {
    if (!gameStarted || nameMenu) return;
    if (isPaused) {
        unpauseGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    if (!gameStarted) return;
    pauseCountdown();
    showPauseMenu()
}

function unpauseGame() {
    hidePauseMenu();
    lastMoveTime = performance.now();
    requestAnimationFrame(gameLoop);
    resumeCountdown();
}

window.addEventListener("resize", () => {
    window.characters.forEach(window.updateCharacterPosition)
    updatePlayerPosition(
        document.getElementById("player"),
        Number.parseInt(document.getElementById("player").dataset.x, 10),
        Number.parseInt(document.getElementById("player").dataset.y, 10),
    )
})

function startAutoMove(direction) {
    if (moveInterval) clearInterval(moveInterval);
    
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.style.backgroundColor = "";
        arrow.style.transform = "";
    });
    const arrowSelector = `.arrow.${direction.slice(5).toLowerCase()}`;
    const arrowElement = document.querySelector(arrowSelector);
    
    if (arrowElement) {
        arrowElement.style.background = "rgba(0, 0, 0, 0.4)";
        arrowElement.style.transform = "scale(0.95)";
    }
    
    currentDirection = direction;
    arrowStyleSet = true;
    
    const moveEvent = { key: direction };
    movePlayer(moveEvent);
    
    moveInterval = setInterval(() => {
        if (!isPaused) {
            movePlayer(moveEvent);
        }
    }, 200);
}

function stopAutoMove() {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.style.background = "";
        arrow.style.transform = "";
    });
    currentDirection = null;
    arrowStyleSet = false;
}

function simulateArrowClick(key) {
    const arrowSelector = `.arrow.${key.slice(5).toLowerCase()}`;
    const arrowElement = document.querySelector(arrowSelector);

    if (arrowElement) {
        arrowElement.style.background = "rgba(0, 0, 0, 0.7)";
        arrowElement.style.transform = "scale(0.95)";
        setTimeout(() => {
            arrowElement.style.background = "";
            arrowElement.style.transform = "";
        }, 100); 
    }
    const event = { key: key };
    movePlayer(event);
}

window.addEventListener("keydown", (e) => {
    if (pressedKeys.has(e.key)) return;
    pressedKeys.add(e.key);
    
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (currentDirection !== e.key) {
            currentDirection = e.key;
            startAutoMove(e.key);
        }
    }
});

window.addEventListener("keyup", (e) => {
    pressedKeys.delete(e.key);
    if (e.key === currentDirection) {
        stopAutoMove();
    }
    if (e.key === "Escape") {
        togglePause();
    }
});

function initGame() {
    document.getElementById("game-menu").style.display = "none";
    gameStarted = true;
    isPaused = false;
    lives = 2;
    window.hintScore = 0;
    initPlayer();
    window.clearHints();
    window.initCharacter();
    createCountdownTimer();
    startCountdown();
    window.startHintSystem();
    lastMoveTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function loseLife() {
    lives--;
    const player = document.getElementById("player");
    if (lives > 0) {
        player.style.backgroundColor = "red";
    } else {
        showLosePopup();
        removePlayer();
    }
}
