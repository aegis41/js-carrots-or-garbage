const achivementList = [
    {
        key: 'bet_01',
        name: 'Bet Once',
        description: 'Place a single bet.',
        criteria: {
            value: 1,
            attribute: 'results.turns',
            operator: '>='
        },
        reward: {
            attribute: 'money',
            amount: 100,
            operation: 'add'
        },
        completed: null
    },
    {
        key: 'bet_02',
        name: 'Bet Tence',
        description: 'Place ten bets.',
        criteria: {
            value: 10,
            attribute: 'results.turns',
            operator: '>='
        },
        reward: {
            attribute: 'money',
            amount: 100,
            operation: 'add'
        },
        completed: null
    }
];

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
    resets: 0, // number of resets
    // achivements list
    achievements: achivementList
};

// Function to save game state to localStorage
const saveGameState = () => {
    localStorage.setItem('carrotsOrGarbageGameState', JSON.stringify(gameState));
};

// Function to clear saved game state from local storage.
const clearGameProgress = () => {
    const newGameState = {
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
        games: gameState.games,
        resets: gameState.resets + 1,
        achievements: gameState.achievements
    };

    // Save the new game state to local storage
    localStorage.setItem('carrotsOrGarbageGameState', JSON.stringify(newGameState));

    //update the HUD to reflect the fresh game state
    gameState = newGameState;
    updateHUD();
    updateContinueGameButton();

    // Show an alert confirming the progress reset
    const notification = document.getElementById('clear-progress-notification');
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
};

// Function to load the game state from local storage
const loadGameState = () => {
    const savedState = localStorage.getItem('carrotsOrGarbageGameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        updateHUD();
    }
}

window.onload = () => {
    loadGameState();
    refreshUI();
};


// BUTTON EVENT LISTENER BLOCK ******//
// BUTTONS HERE *********************//
// Start game button event listener *//
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

document.getElementById('quit-game').addEventListener('click', () => {
    // hide the game screen
    document.getElementById('game-screen').style.display = 'none';
    //show the home screen
    document.getElementById('home-screen').style.display = 'block';
    updateHomeScreenButtons();
});

document.getElementById('view-stats').addEventListener('click', () => {
    document.getElementById('stats-screen').style.display = 'block';
    document.getElementById('home-screen').style.display = 'none';
    populateStatistics();
});

document.getElementById('back-to-home').addEventListener('click', () => {
    document.getElementById('stats-screen').style.display = 'none';
    updateHomeScreenButtons();
    document.getElementById('home-screen').style.display = 'block';
});

// BUTTON BEHAVIOR BLOCK
const updateHomeScreenButtons = () => {
    const savedGame = JSON.parse(localStorage.getItem('carrotsOrGarbageGameState'));

    // is there a turn
    let isTurn = 

    // disable start-game if you're not on at least turn 2
    document.getElementById('start-game').disabled = gameState.results.turns <= 1 && savedGame;

    // call function to update continue game button
    updateContinueGameButton();

    // disable clear progress if there is no progress to clear
    document.getElementById('clear-progress').disabled = !savedGame;
}

const refreshUI = () => {
    // check if there's a saved game to adjust button states
    const savedGame = localStorage.getItem('carrotsOrGarbageGameState');

    // update the home screen button states
    updateHomeScreenButtons();

    // show the correct screen based on the current state
    if (gameState.money <=0) {
        // If game is over, shot the game over modal
        document.getElementById('game-over-modal').style.display = 'flex';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'none';
    } else if (savedGame) {
        // If there's a saved game, show the game screen
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('home-screen').style.display = 'none';
    } else {
        //otherwise, show the home screen
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'block';
    }

    // update the HUD and buttons if on game screen
    if (document.getElementById('game-screen').style.display === 'block') {
        updateHUD();
        renderBetAmountButtons();
    }
};

const updateContinueGameButton = () => {
    const savedGame = localStorage.getItem('carrotsOrGarbageGameState');
    const continueGameButton = document.getElementById('continue-game');

    if (savedGame) {
        continueGameButton.disabled = false;
        continueGameButton.innerHTML = `Continue Game<br><small>${getGameInfoText()}</small>`;
    } else {
        continueGameButton.disabled = true;
        continueGameButton.innerHTML = 'Continue Game';
    }
};

// END OF BUTTON BLOCK //
// ******************* //

document.getElementById('continue-game').addEventListener('click', () => {
    loadGameState();
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    renderBetAmountButtons();
    updateHUD();
});

document.getElementById('clear-progress').addEventListener('click', clearGameProgress);

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
        resets: gameState.resets,
        achievements: gameState.achievements
    };

    // Display game screen, etc.
    // Hide the home screen
    document.getElementById('home-screen').style.display = 'none';

    // Show the game screen
    document.getElementById('game-screen').style.display = 'block';

    // Render the bet buttons
    saveGameState();
    renderBetAmountButtons();
    updateHUD();
    clearResultsHUD();
    updateHomeScreenButtons();
};

const triggerGameOver = () => {
    // Display Final Stats
    document.getElementById('final-turns').textContent = gameState.results.turns;
    document.getElementById('final-carrot-wins').textContent = gameState.results.wins.carrots;
    document.getElementById('final-garbage-wins').textContent = gameState.results.wins.garbage;

    //show the Game Over modal
    document.getElementById('game-over-modal').style.display = 'flex';
};

// Function to render the bet amount buttons from the gameState.betAmounts array
const renderBetAmountButtons = () => {
    const betButtonContainer = document.getElementById('bet-amounts');
    betButtonContainer.innerHTML = ''; // clear any existing buttons

    gameState.betAmounts.forEach(amount => {
        const button = document.createElement('button');
        button.textContent = `$${amount}`;

        // Add the 'active' class to the current bet amount 
        if (amount === gameState.currentBet) button.classList.add('active');

        button.addEventListener('click', () => {
            gameState.currentBet = amount;
            updateActiveBetButton(button);
        });
        betButtonContainer.appendChild(button);
    });
}

const updateActiveBetButton = (selectedButton) => {
    // Get all bet amount buttons
    const buttons = document.querySelectorAll('#bet-amounts button');

    // Remove the 'active' class from all buttons
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Add the active class to the selected button
    selectedButton.classList.add('active');
}

// Function to place a bet
const placeBet = (type) => {
    if (gameState.money >= gameState.currentBet) {
        gameState.money -= gameState.currentBet;

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
        checkAchievements();
        updateHUD();
        checkGameOver();
        saveGameState();
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

const getGameInfoText = () => {
    const savedGame = localStorage.getItem('carrotsOrGarbageGameState');
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        return `R${gameState.resets}-G${gameState.games}-T${gameState.results.turns} | $${gameState.money}`;
    }
    return '';
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
};

const populateStatistics = () => {
    document.getElementById('stat-total-turns').textContent = gameState.results.turns;
    document.getElementById('stat-total-games').textContent = gameState.games;
    document.getElementById('stat-total-resets').textContent = gameState.resets;
    document.getElementById('stat-carrot-wins').textContent = gameState.results.wins.carrots;
    document.getElementById('stat-carrot-losses').textContent = gameState.results.losses.carrots;
    document.getElementById('stat-garbage-wins').textContent = gameState.results.wins.garbage;
    document.getElementById('stat-garbage-losses').textContent = gameState.results.losses.garbage;
};


// ***** *********** *****
// ***** ACHIVEMENTS *****
// ***** *********** *****

// Run through all incomplete Achivements to see if they're done.
const checkAchievements = () => {
    gameState.achievements.forEach(achievement => {
        if (!achievement.completed && evaluateCriteria(achievement.criteria)) {
            markAsCompleted(achievement);
            rewardPlayer(achievement);
        }
    });
};

// Evaluate criteria method (generic)
const evaluateCriteria = (criteria) => {
    const { value, attribute, operator } = criteria;
    const attributeValue = attribute.split('.').reduce((obj, key) => obj[key], gameState);

    switch (operator) {
        case '>=': return attributeValue >= value;
        case '<=': return attributeValue <= value;
        case '==': return attributeValue == value;
        default: throw new Error(`Unknown operator: ${operator}`);
    }
};

// Reward player when achivement is completed
const applyReward = (reward) => {
    const { attribute, amount, operation } = reward;

    // access the attribute in gameState dynamically
    const attributeValue = attribute.split('.').reduce((obj, key) => obj[key], gameState);

    // apply the reward operation
    switch (operation) {
        case 'add':
            updateNestedAttribute(gameState, attribute, attributeValue + amount);
            break;
        case 'subtract':
            updateNestedAttribute(gameState, attribute, attributeValue = amount);
            break;
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
};

const updateNestedAttribute = (obj, path, value) => {
    const keys = path.split('.');
    keys.reduce((obj, key, index) => {
        if (index === keys.length - 1) {
            obj[key] = value;
        }
        return obj[key];
    }, obj);
};

const markAsCompleted = (achievement) => {
    achievement.completed = new Date().toISOString(); // mark completion time
};

// Reward the player by applying all rewards
const rewardPlayer = (achievement) => {
    applyReward(achievement.reward);
};

const clearAchievements = () => {
    gameState.achievements.forEach(achievement => {
        achievement.completed = null;
    });
};
