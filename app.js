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
    } else {
        alert('Not enough money to place this bet.');
    }
};

// function to add winnings
const addWinnings = (amount) => {
    gameState.money += amount * 2;
};

// Function to update the Result Display
const updateResultDisplay = (type, resultType, outcome) => {
    const resultContainer = document.getElementById('result-display');
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

    // Create the text elements

    // Append all elements to the result container

    console.log(type, resultType, outcome);
};