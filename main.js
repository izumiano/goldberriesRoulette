async function request(url) {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}"`);
		}

		const json = await response.json();
		console.debug(json);
		return json;
	}
	catch (error) {
		throw new Error(error.message);
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function enableButton(button, text) {
	button.innerHTML = text;
	button.disabled = false;
}

function disableButton(button) {
	button.innerHTML = "Disabled";
	button.disabled = false;
}

function rollRoulette() {
	const keys = Object.keys(goldenList);
	const randomKey = keys[getRandomInt(0, keys.length - 1)];
	console.log(randomKey);
	console.log(getRandomInt(2, 5));
	const tier = goldenList[randomKey];
	const randomMap = tier[getRandomInt(0, tier.length - 1)];
	console.log(randomMap.name);
}

function getGoldenListFromCampaigns(campaigns) {
	const list = {
		"Tier 0": [],
		"Tier 1": [],
		"Tier 2": [],
		"Tier 3": [],
		"Tier 4": [],
		"Tier 5": [],
		"Tier 6": [],
		"Tier 7": [],
		"Standard": [],
		"Undetermined": [],
		"Trivial": [],
	}
	campaigns.forEach(campaign => {
		campaign.maps.forEach(map => {
			map.challenges.forEach(challenge => {
				const tierName = challenge.difficulty.name;
				const mapClone = structuredClone(map);
				mapClone.challenges = [challenge];
				list[tierName].push(mapClone);
			})
		})
	});
	return list;
}

const rouletteButton = document.getElementById("rouletteButton");

let goldenList = null;
let campaignList = [];

request("https://goldberries.net/api/lists/golden-list?archived=true&arbitrary=true")
	.then(value => {
		campaignList = value;
		goldenList = getGoldenListFromCampaigns(campaignList);
		console.log(goldenList);
		enableButton(rouletteButton, "Roll Roulette");
	})
	.catch(err => {
		console.error(err);
	});