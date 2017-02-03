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

const checkFlags = buildFlags(flagList);
const trippedFlags = [];


function choose (guess) {
	let choice = guess || "carrots";
	let result = getCarrotOrGarbage();
	game.modAttr("playCredits",1);
	game.addPlay();
	updateDisplay(choice, result);
}

function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt (upper, lower) {
	const min = Math.ceil(lower || 0);
	const max = Math.floor(upper || 1);
	return Math.floor(Math.random() * (max + 1 - min) + min);
}

function getCarrotOrGarbage () {
	let rand = getRandomInt(2,1);
	return rand > 1 ? "garbage" : "carrots";
}

function updateDisplay (guess, result) {
	const [choiceDisplay] = document.getElementsByClassName("guess");
	const [resultsDisplay] = document.getElementsByClassName("result");
	const [winDisplay] = document.getElementsByClassName("win-lose");
	const [scoreDisplay] = document.getElementsByClassName("score");
	const [totalPlays] = document.getElementsByClassName("total-plays");
	const [playCredits] = document.getElementsByClassName("play-credits");
	let winText = "YOU LOSE!";
	if(didWin(guess, result)) {
		winText = "WINNER!";
		game.modAttr("score",1);
	} else {
		game.modAttr("score",-1);
	}

	choiceDisplay.innerHTML = capitalizeFirstLetter(guess);
	resultsDisplay.innerHTML = capitalizeFirstLetter(result);
	winDisplay.innerHTML = winText;
	scoreDisplay.innerHTML = game.score;
	totalPlays.innerHTML = game.totalPlays;
	playCredits.innerHTML = game.playCredits;

}

function didWin (guess, result) {
	return guess === result;
}

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

function buildFlags (flagList) {
	const flagArray = flagList.map((flag)=> {
		return new Flag (flag.flagName, flag.attr, flag.condition, flag.condValue);
	});
	return flagArray;
}
