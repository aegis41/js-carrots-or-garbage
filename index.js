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


// object keeping track of score, total plays, and play credits
if (myStorage.getItem('game')) {
	console.log(myStorage.getItem('game'));
}
const game = {
	score: 0,
	totalPlays: 0,
	playCredits: 0,
	activeExtras: [],
	choice: "",
	result: "",
	modAttr: function (attr, amount, relative) {
		relative = relative || true;
		if (relative) {
			this[attr] += amount;
		} else {
			this[attr] = amount;
		}
	},
	addPlay: function () {
		++this.totalPlays;
	}
};

// list of the flags that may be passed in gameplay
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

// array of the flags that need to be checked each play cycle
const flagsToCheck = buildFlags(flagList);
//array of the flags that have already been tripped (reached achievements)
const trippedFlags = [];

// this function takes a carrots or garbage guess, updates some game properties, checks to see if flags are tripped, and updates the display
function choose (guess) {
	game.choice = guess || "carrots";
	game.result = getCarrotOrGarbage();
	game.modAttr("playCredits",1);
	game.addPlay();
	checkFlags();
	updateLocalStorage();
	updateDisplay();
}

// this function capitalizes the first letter of a string
function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// this function generates a random integer, inclusively, between an upper and lower range
function getRandomInt (upper, lower) {
	const min = Math.ceil(lower || 0);
	const max = Math.floor(upper || 1);
	return Math.floor(Math.random() * (max + 1 - min) + min);
}

// this function returns a string of carrots or garbage
function getCarrotOrGarbage () {
	let rand = getRandomInt(2,1);
	return rand > 1 ? "garbage" : "carrots";
}

// this function updates the local storage after a game play cycle
function updateLocalStorage() {
	if(canStore) {
		myStorage.setItem("game", game);
	}
}

// this function updates the display after a game play cycle
function updateDisplay () {
	const [choiceDisplay] = document.getElementsByClassName("guess");
	const [resultsDisplay] = document.getElementsByClassName("result");
	const [winDisplay] = document.getElementsByClassName("win-lose");
	const [scoreDisplay] = document.getElementsByClassName("score");
	const [totalPlays] = document.getElementsByClassName("total-plays");
	const [playCredits] = document.getElementsByClassName("play-credits");
	const [flagDisplay] = document.getElementsByClassName("flag-display");
	const [flagList] = document.getElementsByClassName("flag-list");
	const [extras] = document.getElementsByClassName("extras");
	const [activeExtras] = document.getElementsByClassName("active-extras");

	let winText = "YOU LOSE!";

	if(didWin(game.choice, game.result)) {
		winText = "WINNER!";
		game.modAttr("score",1);
	} else {
		game.modAttr("score",-1);
	}

	if (game.activeExtras && game.activeExtras.length > 0) {
		game.activeExtras.forEach((extra) => {
			let textNode = document.createTextNode(extra);
			activeExtras.appendChild(textNode);
		})
	}

	clearElement(flagList);
	clearElement(extras);
	displayTrippedFlags(flagList);
	displayExtrasButtons(extras);

	choiceDisplay.innerHTML = capitalizeFirstLetter(game.choice);
	resultsDisplay.innerHTML = capitalizeFirstLetter(game.result);
	winDisplay.innerHTML = winText;
	scoreDisplay.innerHTML = game.score;
	totalPlays.innerHTML = game.totalPlays;
	playCredits.innerHTML = game.playCredits;

}

// this function returns true if the guess matched the result
function didWin (guess, result) {
	return guess === result;
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

// this function removes all of the list items from a list
function clearElement (element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

// this function checks the flags
function checkFlags () {
	flagsToCheck.forEach((flag) => {
		let tripped = flag.checkMe();
		if (tripped) {
			trippedFlags.push(flag);
			flagsToCheck.splice(flagsToCheck.indexOf(flag),1);
		}
	});
}

function displayTrippedFlags (trippedList) {
	if(trippedFlags && trippedFlags.length > 0) {
		trippedFlags.forEach((flag => {
			let listItem = document.createElement("li");
			listItem.appendChild(document.createTextNode(flag.flagName));
			trippedList.appendChild(listItem);
		})
	)}
}

function displayExtrasButtons (extrasElement) {
	if(trippedFlags && trippedFlags.length > 0) {
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

function toggleActiveExtra(extra) {
	if(game.activeExtras.indexOf(extra) === -1) {
		game.activeExtras.push(extra);
	} else {
		game.activeExtras.splice(game.activeExtras.indexOf(extra),1);
	}
	updateDisplay();
}