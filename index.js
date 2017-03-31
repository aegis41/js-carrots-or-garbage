// object keeping track of score, total plays, and play credits
const game = {
	score: 0,
	totalPlays: 0,
	playCredits: 0,
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
		"condValue": "10"
	},
	{
		"flagName": "Experienced Better",
		"attr": "totalPlays",
		"condition": "===",
		"condValue": "100"
	}
];

// array of the flags that need to be checked each play cycle
const flagsToCheck = buildFlags(flagList);
//array of the flags that have already been tripped (reached achievements)
const trippedFlags = [];

// this function takes a carrots or garbage guess, updates some game properties, checks to see if flags are tripped, and updates the display
function choose (guess) {
	let choice = guess || "carrots";
	let result = getCarrotOrGarbage();
	game.modAttr("playCredits",1);
	game.addPlay();
	checkFlags();
	updateDisplay(choice, result);
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

// this function updates the display after a game play cycle
function updateDisplay (guess, result) {
	const [choiceDisplay] = document.getElementsByClassName("guess");
	const [resultsDisplay] = document.getElementsByClassName("result");
	const [winDisplay] = document.getElementsByClassName("win-lose");
	const [scoreDisplay] = document.getElementsByClassName("score");
	const [totalPlays] = document.getElementsByClassName("total-plays");
	const [playCredits] = document.getElementsByClassName("play-credits");
	const [flagDisplay] = document.getElementsByClassName("flag-display");
	const [flagList] = document.getElementsByClassName("flag-list");
	let winText = "YOU LOSE!";

	if(didWin(guess, result)) {
		winText = "WINNER!";
		game.modAttr("score",1);
	} else {
		game.modAttr("score",-1);
	}

	clearList(flagList);

	if(trippedFlags && trippedFlags.length > 0) {
		trippedFlags.forEach((flag => {
			let listItem = document.createElement("li");
			listItem.appendChild(document.createTextNode(flag.flagName));
			flagList.appendChild(listItem);
		}))
	}

	choiceDisplay.innerHTML = capitalizeFirstLetter(guess);
	resultsDisplay.innerHTML = capitalizeFirstLetter(result);
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
function Flag (flagName, attr, condition, condValue) {
	this.flagName = flagName;
	this.attr = attr;
	this.condition = condition;
	this.condValue = parseInt(condValue);
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
		return new Flag (flag.flagName, flag.attr, flag.condition, flag.condValue);
	});
	return flagArray;
}

// this function removes all of the list items from a list
function clearList (list) {
	while (list.firstChild) {
		list.removeChild(list.firstChild);
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
