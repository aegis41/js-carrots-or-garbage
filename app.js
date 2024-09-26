// Initialize game state
let gameState = {
    money: 100,
    currentBet: 1,
    betAmounts: [1, 5, 10],
    bets: {
        carrots: 0,
        garbage: 0
    },
    results: {
        turns: 0, // total turns this game
        turnsHistory: [], // individual turn details
        wins: {
            carrots: 0,
            garbage: 0
        },
        losses: {
            carrots: 0,
            garbage: 0
        }
    },
    games: 0, // games played this reset
    resets: 0 // number of resets
};

// Start game button event listener
document.getElementById('start-game').addEventListener('click', () => {
    newGame();
});

document.getElementById('bet-carrots').addEventListener('click', () => {
    placeBet('carrots');
});

document.getElementById('bet-garbage').addEventListener('click', () => {
    placeBet('garbage');
});

document.getElementById('restart-game').addEventListener('click', () => {
    newGame();
    document.getElementById('game-over-modal').style.display = 'none';
});

// Function to start a new game
const newGame = () => {
    gameState = {
        money: 100,
        currentBet: 1,
        betAmounts: [1, 5, 10],
        bets: {
            carrots: 0,
            garbage: 0
        },
        results: {
            turns: 0, // total number of turns
            turnsHistory: [], //log of each turn's details
            wins: {
                carrots: 0,
                garbage: 0
            },
            losses: {
                carrots: 0,
                garbage: 0
            }
        },
        games: gameState.games + 1,
        resets: gameState.resets
    };

    console.log('New game started', gameState);

    // Display game screen, etc.
    // Hide the home screen
    document.getElementById('home-screen').style.display = 'none';
    console.log('Home screen hidden.');

    // Show the game screen
    document.getElementById('game-screen').style.display = 'block';
    console.log('Game screen displayed');

    // Render the bet buttons
    renderBetAmountButtons();
    updateHUD();
    clearResultsHUD();
};

const triggerGameOver = () => {
    // Display Final Stats
    document.getElementById('final-turns').textContent = gameState.results.turns;
    document.getElementById('final-carrot-wins').textContent = gameState.results.wins.carrots;
    document.getElementById('final-garbage-wins').textContent = gameState.results.wins.garbage;

    //show the Game Over modal
    document.getElementById('game-over-modal').style.display = 'block';
};

// Function to render the bet amount buttons from the gameState.betAmounts array
const renderBetAmountButtons = () => {
    const betButtonContainer = document.getElementById('bet-amounts');
    betButtonContainer.innerHTML = ''; // clear any existing buttons

    gameState.betAmounts.forEach(amount => {
        const button = document.createElement('button');
        button.textContent = `$${amount}`;
        button.addEventListener('click', () => {
            gameState.currentBet = amount;
            console.log(`Bet amount set to: $${amount}`);
        });
        betButtonContainer.appendChild(button);
    });
    console.log('Bet buttons rendered', [gameState.betAmounts]);
}

// Function to place a bet
const placeBet = (type) => {
    if (gameState.money >= gameState.currentBet) {
        gameState.money -= gameState.currentBet;
        console.log(`Placed a bet ${type}, current money: $${gameState.money}`);

        // Determine win/loss and update the game state
        // TODO: Expand Updates
        const outcome = Math.random() < 0.5 ? 'win' : 'lose';
        const resultType = outcome === 'win' ? type : type === 'carrots' ? 'garbage' : 'carrots';
        if (outcome === 'win') {
            addWinnings(gameState.currentBet); // update the money
            gameState.results.wins[type]++; // update the win
        } else {
            gameState.results.losses[type]++; // update the loss
        }

        updateResultDisplay(type, resultType, outcome);
        gameState.results.turns++;
        gameState.results.turnsHistory.push({
            turnID: gameState.results.turns,
            bet: {
                amount: gameState.currentBet,
                type: type
            },
            result: {
                type: type,
                outcome: outcome
            }
        });
        updateHUD();
        checkGameOver();
    } else {
        alert('Not enough money to place this bet.');
    }
};

const checkGameOver = () => {
    if (gameState.money <= 0) {
        triggerGameOver();
    }
};

// function to add winnings
const addWinnings = (amount) => {
    gameState.money += amount * 2;
};

// Function to update the Result Display
const updateResultDisplay = (type, resultType, outcome) => {
    const resultContainer = document.getElementById('result-hud');
    resultContainer.innerHTML = ''; // Clear previous content

    // Create the bet image element
    const betImg = document.createElement('img');
    betImg.src = `assets/${type}.webp`;
    betImg.alt = type;

    // Create the result image element
    const resultImg = document.createElement('img');
    resultImg.src = `assets/${resultType}.webp`;
    resultImg.alt = resultType;

    // Create the overlay div
    const overlay = document.createElement('div');
    overlay.className = 'result-overlay';
    overlay.style.backgroundColor = outcome === 'win' ? 'green' : 'red';
    overlay.appendChild(betImg);
    overlay.appendChild(resultImg);

    // Create the text elements
    const betText = document.createElement('p');
    betText.innerHTML = `<span class="hud-label">Bet:</span> <span class="hud-value">${type}</span>`;

    const resultText = document.createElement('p');
    resultText.innerHTML = `<span class="hud-label">Result:</span> <span class="hud-value">${resultType}</span>`;

    const outcomeText = document.createElement('p');
    outcomeText.innerHTML = outcome === 'win' ? 'You Won!' : 'You Lost!';

    const betAmountText = document.createElement('p');
    betAmountText.innerHTML = `<span class="hud-label">Bet Amount:</span> <span class="hud-value">$${gameState.currentBet}</span>`;

    const winningsText = document.createElement('p');
    winningsText.innerHTML = `<span class="hud-label">Winnings Amount:</span> <span class="hud-value">$${outcome === 'win' ? gameState.currentBet * 2 : -gameState.currentBet}</span>`;

    const balanceText = document.createElement('p');
    balanceText.innerHTML = `<span class="hud-label">New Balance:</span> <span class="hud-value">$${gameState.money}</span>`;

    // Append all elements to the result container
    resultContainer.appendChild(overlay);
    resultContainer.appendChild(betText);
    resultContainer.appendChild(resultText);
    resultContainer.appendChild(outcomeText);
    resultContainer.appendChild(betAmountText);
    resultContainer.appendChild(winningsText);
    resultContainer.appendChild(balanceText);

    console.log(`Updated Display: ${type} - ${resultType} - ${outcome}`);
};

// Function to update the HUD
const updateHUD = () => {
    document.getElementById('turn-number').textContent = gameState.results.turns;
    document.getElementById('games-played').textContent = gameState.games;
    document.getElementById('resets').textContent = gameState.resets;
    document.getElementById('carrot-wins').textContent = gameState.results.wins.carrots;
    document.getElementById('garbage-wins').textContent = gameState.results.wins.garbage;
    document.getElementById('current-money').textContent = gameState.money;
};

const clearResultsHUD = () => {
    document.getElementById('result-hud').innerHTML = '';
}