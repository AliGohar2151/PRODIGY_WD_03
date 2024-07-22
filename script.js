const cells = document.querySelectorAll('[data-cell]');
const gameStatus = document.getElementById('gameStatus');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const setupButton = document.getElementById('setupButton');
const endButton = document.getElementById('endButton');
const setup = document.getElementById('setup');
const game = document.getElementById('game');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const gameDifficulty = document.getElementById('gameDifficulty');
const player1ScoreElement = document.getElementById('player1Score');
const player2ScoreElement = document.getElementById('player2Score');
const drawCountElement = document.getElementById('drawCount');
const modal = document.getElementById('scoreModal');
const modalClose = document.getElementsByClassName('close')[0];
const finalScoreMessage = document.getElementById('finalScoreMessage');

const X_CLASS = 'x';
const O_CLASS = 'o';
let isOTurn = false;
let isAiGame = false;
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let difficulty = 'easy';

let player1Score = 0;
let player2Score = 0;
let drawCount = 0;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

difficultyRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });
});

startButton.addEventListener('click', () => {
    player1Name = player1NameInput.value || 'Player 1';
    player2Name = player2NameInput.value || 'Player 2';
    isAiGame = !player2NameInput.value; // If player 2 name is not entered, play with AI
    if (isAiGame) {
        player2Name = 'AI'; // Set player 2 name to AI
        gameDifficulty.style.display = 'block';
        gameDifficulty.textContent = `Difficulty: ${capitalizeFirstLetter(difficulty)}`; // Update difficulty text
    } else {
        gameDifficulty.style.display = 'none';
    }
    setup.style.display = 'none';
    game.style.display = 'block';
    updateScoreboard(); // Update the scoreboard with player names
    startGame();
});

restartButton.addEventListener('click', startGame);

setupButton.addEventListener('click', () => {
    game.style.display = 'none';
    setup.style.display = 'block';
    resetScores();
});

endButton.addEventListener('click', () => {
    showFinalScore();
    resetScores();
    setup.style.display = 'block';
    game.style.display = 'none';
});

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

function startGame() {
    isOTurn = false;
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setGameStatus(`${player1Name}'s turn`);
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = isOTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setGameStatus(`${isOTurn ? player2Name : player1Name}'s turn`);
        if (isAiGame && isOTurn) {
            setTimeout(() => {
                if (difficulty === 'easy') {
                    makeEasyAiMove();
                } else if (difficulty === 'difficult') {
                    makeMediumAiMove();
                }
            }, 500);
        }
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    isOTurn = !isOTurn;
}

function setGameStatus(message) {
    gameStatus.innerText = message;
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function endGame(draw) {
    if (draw) {
        setGameStatus('Draw!');
        drawCount++;
    } else {
        setGameStatus(`${isOTurn ? player2Name : player1Name} Wins!`);
        if (isOTurn) {
            player2Score++;
        } else {
            player1Score++;
        }
    }
    updateScoreboard();
    cells.forEach(cell => {
        cell.removeEventListener('click', handleClick);
    });
}

function updateScoreboard() {
    player1ScoreElement.textContent = `${player1Name}: ${player1Score}`;
    player2ScoreElement.textContent = `${player2Name}: ${player2Score}`;
    drawCountElement.textContent = `Draws: ${drawCount}`;
}

function resetScores() {
    player1Score = 0;
    player2Score = 0;
    drawCount = 0;
    updateScoreboard();
}

function showFinalScore() {
    let winner;
    if (player1Score > player2Score) {
        winner = player1Name;
    } else if (player2Score > player1Score) {
        winner = player2Name;
    } else {
        winner = 'No one, it\'s a draw';
    }
    finalScoreMessage.innerHTML = `Final Scores:<br>${player1Name}: ${player1Score}<br>${player2Name}: ${player2Score}<br>Draws: ${drawCount}<br><br>Winner: ${winner}`;
    modal.style.display = 'block';
}

function makeEasyAiMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[randomIndex];
    cell.click();
}

function makeMediumAiMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });

    if (availableCells.length === 0) return;

    // difficult difficulty: Prioritize winning, blocking, and then random
    for (const cell of availableCells) {
        cell.classList.add(O_CLASS);
        if (checkWin(O_CLASS)) {
            cell.click();
            return;
        }
        cell.classList.remove(O_CLASS);
    }

    for (const cell of availableCells) {
        cell.classList.add(X_CLASS);
        if (checkWin(X_CLASS)) {
            cell.classList.remove(X_CLASS);
            cell.click();
            return;
        }
        cell.classList.remove(X_CLASS);
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[randomIndex];
    cell.click();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
