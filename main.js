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
	if (rouletteButton.disabled) return;

  let mapsToRoll = [];

  selectedTiers.forEach((tier) => {
    if (tier in goldenList) {
      mapsToRoll = mapsToRoll.concat(goldenList[tier]);
    } else {
      console.error(tier + " is not in goldenList");
    }
  });
	
	if (mapsToRoll.length <= 0) return;

	const randomMap = mapsToRoll[getRandomInt(0, mapsToRoll.length - 1)];
	campaignNameObject.innerText = randomMap.name === randomMap.campaignName ? "" : randomMap.campaignName;
	mapNameObject.innerText = randomMap.name;
	mapSegmentObject.innerText = randomMap.challenges[0].label !== null ? randomMap.challenges[0].label : "";
	mapTierObject.innerText = randomMap.challenges[0].difficulty.name;

	console.log(randomMap);
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
				mapClone.campaignName = campaign.name;
				list[tierName].push(mapClone);
			})
		})
	});
	return list;
}

function setTierDropdownPopoverWidth() {
	tierDropdownPopup.style.minWidth = tierDropdown.getBoundingClientRect().width + "px";
}

function selectInDropdown() {
	const button = this;

	if (button.classList.contains("selected")) {
		button.classList.remove("selected");
		selectedTiers = selectedTiers.filter(value => value !== button.value);
	}
	else {
		button.classList.add("selected");
		selectedTiers.push(button.value);
	}

	console.log(selectedTiers);
}

const rouletteButton = document.getElementById("rouletteButton");

const tierDropdown = document.getElementById("tierDropdown");
const tierDropdownPopup = document.getElementById("tierDropdownPopup");

const campaignNameObject = document.getElementById("campaignName");
const mapNameObject = document.getElementById("mapName");
const mapSegmentObject = document.getElementById("mapSegment");
const mapTierObject = document.getElementById("mapTier");

addEventListener("resize", _ => setTierDropdownPopoverWidth());

let goldenList = null;
let campaignList = [];
let selectedTiers = [];

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