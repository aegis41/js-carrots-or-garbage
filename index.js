// set up local storage
function storageAvailable(type) {
	try {
		let storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch (e) {
		return false;
	}
}

let myStorage = {};
let canStore = false;

if (storageAvailable('localStorage')) {
	myStorage = localStorage;
	canStore = true;
}

const flagList = [
	{
		"flagName": "Novice Better",
		"attr": "totalPlays",
		"condition": "===",
		"condValue": "5",
		"extra": {
			"extraName": "Double Down",
			"extraFunc": "doubleDown"
		}
	},
	{
		"flagName": "Experienced Better",
		"attr": "totalPlays",
		"condition": "===",
		"condValue": "10",
		"extra" : {
			"extraName": "Better Chance",
			"extraFunc": "betterChance"
		}
	}
];

// object keeping track of score, total plays, and play credits

const game = {
	curGame: "guess",
	betOptions: {
		guess: [1, 5, 10, 25, 50],
		haul: [50, 100, 250, 500, 750],
		match: [750, 1000, 1500, 2500, 5000]
	},
	betAmount: 1,
	score: 0,
	totalPlays: 0,
	playCredits: 0,
	activeExtras: [],
	choice: "",
	result: "",
	lastDidWin: false,
	// list of the flags that may be passed in gameplay
	flagsToCheck: buildFlags (flagList),
	trippedFlags: [],
	modAttr: function (attr, amount, relative = true) {
		if (relative) {
			this[attr] += amount;
		} else {
			this[attr] = amount;
		}
	},
	addPlay: function () {
		++this.totalPlays;
	},
	get: function(attr) {
		return game[attr];
	},
	set: function(attr, value) {
		game[attr] = value;
	}
};


// this function takes a carrots or garbage guess, updates some game properties, checks to see if flags are tripped, and updates the display
function choose (guess) {
	game.choice = guess || "carrots";
	game.result = getCarrotOrGarbage();
	game.modAttr("playCredits",1);
	game.addPlay();
	game.lastDidWin = didWin(game.choice, game.result);
	game.lastDidWin ? game.modAttr("score", game.betAmount) : game.modAttr("score", -game.betAmount);
	checkFlags(game.flagsToCheck, game.trippedFlags);
	//updateLocalStorage();
	updateDisplay();
}

// this function generates a random integer, inclusively, between an upper and lower range
function getRandomInt (upper, lower) {
	const min = Math.ceil(lower || 0);
	const max = Math.floor(upper || 1);
	return Math.floor(Math.random() * (max + 1 - min) + min);
}

// this function returns a string of carrots or garbage
function getCarrotOrGarbage () {
	let rand= getRandomInt(4,1),
		threshold = 2;
	if (checkActiveExtra("Better Chance") !== -1) {
		threshold = 3;
	}
	return rand > threshold ? getOppositeGuess() : game.choice;
}

// this function returns true if the guess matched the result
function didWin (guess, result) {
	return guess === result;
}

// this function updates the display after a game play cycle
function updateDisplay () {
	const [choiceDisplay] = document.getElementsByClassName("guess");
	const [resultsDisplay] = document.getElementsByClassName("result");
	const [winDisplay] = document.getElementsByClassName("win-lose");
	const [scoreDisplay] = document.getElementsByClassName("score");
	const [totalPlays] = document.getElementsByClassName("total-plays");
	const [playCredits] = document.getElementsByClassName("play-credits");
	const [betButtons] = document.getElementsByClassName("bet-buttons");
	const [currentBet] = document.getElementsByClassName("current-bet");
	const [flagDisplay] = document.getElementsByClassName("flag-display");
	const [flagListEl] = document.getElementsByClassName("flag-list");
	const [extras] = document.getElementsByClassName("extras");
	const [activeExtras] = document.getElementsByClassName("active-extras");

	let winText = game.lastDidWin ? "WINNER!" : "You Lose!!";


	clearElement(flagListEl);
	clearElement(extras);
	for (let i = 0; i < betButtons.cells.length; i++) {
		clearElement(betButtons.cells[i]);
	}
	clearElement(currentBet);
	clearElement(activeExtras);
	if (game.activeExtras && game.activeExtras.length > 0) {
		game.activeExtras.forEach((extra) => {
			let textNode = document.createTextNode(extra);
			activeExtras.appendChild(textNode);
		})
	}
	displayBetButtons(makeBetButtons(), betButtons);
	displayTrippedFlags(game.trippedFlags, flagListEl);
	displayExtrasButtons(extras, game.trippedFlags);
	currentBet.innerHTML = game.betAmount;
	choiceDisplay.innerHTML = capitalizeFirstLetter(game.choice);
	resultsDisplay.innerHTML = capitalizeFirstLetter(game.result);
	winDisplay.innerHTML = winText;
	scoreDisplay.innerHTML = game.score;
	totalPlays.innerHTML = game.totalPlays;
	playCredits.innerHTML = game.playCredits;

}

// this function capitalizes the first letter of a string
function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// this function removes all of the list items from a list
function clearElement (element) {
	if (element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}
}

function getOppositeGuess() {
	if (game.choice = "carrots") {
		return "garbage";
	}
	return "carrots";
}

function makeBetbutton(amount) {
	let betButton = document.createElement("button");
	with (betButton) {
		appendChild(document.createTextNode(amount));
		value = amount;
		type = "button";
		addEventListener("click", function () {game.modAttr("betAmount", amount, false)}, false);
		//addEventListener("click", function () {console.log("clicked button with " + this.value)}, false);
	}
	return betButton;
}

function makeBetButtons() {
	let buttons = []
	game.betOptions[game.curGame].forEach(function(amount) {
		buttons.push(makeBetbutton(amount));
	});
	return buttons;
}

function displayBetButtons(buttons, row) {
	buttons.forEach(function (button) {
		row.cells[buttons.indexOf(button)].appendChild(button);
		if(game.playCredits < button.value) {
			button.disabled = true;
		}
	})
}

// this function constructs a Flag object
function Flag (flagName, attr, condition, condValue, extra) {
	this.flagName = flagName;
	this.attr = attr;
	this.condition = condition;
	this.condValue = parseInt(condValue);
	this.extra = extra
	this.checkMe = function () {
		if (condition === "===") {
			return game[attr] === this.condValue;
		}
		if (condition === "<") {
			return game[attr] < this.condValue;
		}
		if (condition === ">") {
			return game[attr] > this.condValue;
		}
	}
}

// this function iterates the array of flags and instantiates each, returning an array of the flag objects
function buildFlags (flagList) {
	const flagArray = flagList.map((flag)=> {
		return new Flag (flag.flagName, flag.attr, flag.condition, flag.condValue, flag.extra);
	});
	return flagArray;
}

// this function checks the flags
function checkFlags (flagsToCheck, trippedFlags) {
	flagsToCheck.forEach((flag) => {
		let tripped = flag.checkMe();
		if (tripped) {
			trippedFlags.push(flag);
			flagsToCheck.splice(flagsToCheck.indexOf(flag),1);
		}
	});
}

function displayTrippedFlags (trippedFlags, trippedList) {
	if(trippedFlags && trippedFlags.length > 0) {
		trippedFlags.forEach((flag => {
			let listItem = document.createElement("li");
			listItem.appendChild(document.createTextNode(flag.flagName));
			trippedList.appendChild(listItem);
		})
	)}
}

function displayExtrasButtons (extrasElement, trippedFlags) {
	if (trippedFlags && trippedFlags.length > 0) {
		trippedFlags.forEach((flag => {
			let extraButton = document.createElement("button");
			with (extraButton) {
				appendChild(document.createTextNode(flag.extra.extraName));
				type = "button";
				addEventListener("click", function () {toggleActiveExtra(flag.extra.extraName)}, false);
			}
			extrasElement.appendChild(extraButton);
		})
	)}
}

function checkActiveExtra(extra) {
	if (game.activeExtras.indexOf(extra) === -1) {
		return false;
	}
	return true;
}

function toggleActiveExtra(extra) {
	if (game.activeExtras.indexOf(extra) === -1) {
		game.activeExtras.push(extra);
	} else {
		game.activeExtras.splice(game.activeExtras.indexOf(extra),1);
	}
	updateDisplay();
}

/*
// load in from local storage if there is one
if (myStorage.length) {
	readLocalStorage();
	updateDisplay();
}

// this function updates the local storage after a game play cycle
function updateLocalStorage() {
	if(canStore) {
		myStorage.setItem("score", game.score);
		myStorage.setItem("totalPlays", game.totalPlays);
		myStorage.setItem("playCredits", game.playCredits);
		myStorage.setItem("activeExtras", game.activeExtras);
		myStorage.setItem("choice", game.choice);
		myStorage.setItem("result", game.result);
	}
}

function readLocalStorage() {
	game.score = parseInt(myStorage.getItem("score"));
	game.totalPlays = parseInt(myStorage.getItem("totalPlays"));
	game.playCredits = parseInt(myStorage.getItem("playCredits"));
	game.activeExtras = myStorage.getItem("activeExtras");
	game.choice = myStorage.getItem("choice");
	game.result = myStorage.getItem("result");
}
*/