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

function pxToRem(px) {
  return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function remToPx(rem) {
	return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
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
	console.log("now");
	let mapsToRoll = getMapsToRoll(selectedTiers, goldenList);
	getRandomMap(mapsToRoll);
}

function getRandomMap(mapsToRoll) {
	if (mapsToRoll.length <= 0) return;

	const randomMap = mapsToRoll[getRandomInt(0, mapsToRoll.length - 1)];
	campaignNameObject.innerText = randomMap.name === randomMap.campaignName ? "" : randomMap.campaignName;
	const challenge = randomMap.challenges[0]
	mapNameObject.innerHTML =
    "<a href='https://www.goldberries.net/challenge/" +
    challenge.id +
    "' target='_blank' rel='noopener noreferrer'>" +
    randomMap.name + (challenge.requires_fc ? " [FC]" : "") +
    "</a>";
	mapSegmentObject.innerText = challenge.label !== null ? challenge.label : "";
	mapTierObject.innerText = challenge.difficulty.name;

	console.log(randomMap);
}

function getMapsToRoll(tiers, tierSortedMaps) {
	if (tiers === null || tiers.length <= 0 || tierSortedMaps === null || tierSortedMaps.length <= 0) {
		return [];
	}

	let mapsToRoll = [];
	tiers.forEach(tier => {
    if (tier in tierSortedMaps) {
      mapsToRoll = mapsToRoll.concat(tierSortedMaps[tier]);
    } else {
      console.error(tier + " is not in goldenList");
    }
	});
	return mapsToRoll;
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

	addMapsToRoulette()

	console.log(selectedTiers);
}

function resizeFontToFit(htmlObj, width, height) {
	const compStyle = getComputedStyle(htmlObj);
	const fontSize = compStyle.fontSize;
	const styleWidth = compStyle.width;
	htmlObj.style.width = "auto";

	htmlObj.style.fontSize = parseFloat(fontSize) - 1 + "px";

	if (htmlObj.clientWidth > width || htmlObj.clientHeight > height) {
    resizeFontToFit(htmlObj, width, height);
  }
	htmlObj.style.width = styleWidth;
}

function addMapsToRoulette() {
	const shallowChildrenCopy = [...rouletteContainer.children];
	for (const child of shallowChildrenCopy) {
    if (child.tagName === "P") {
      rouletteContainer.removeChild(child);
    }
  }

	// let maps = [
  //   {
  //     name: "Waterbear Mountain",
  //     challenges: [
  //       {
  //         requires_fc: true,
  //         label: null,
  //       },
  //     ],
  //   },
  //   {
  //     name: "Pinball purgatory",
  //     challenges: [
  //       {
  //         requires_fc: false,
  //         label: null,
  //       },
  //     ],
  //   },
  //   {
  //     name: "GMHS",
  //     challenges: [
  //       {
  //         requires_fc: false,
  //         label: null,
  //       },
  //     ],
  //   },
  //   {
  //     name: "LXVI - Venus",
  //     challenges: [
  //       {
  //         requires_fc: false,
  //         label: null,
  //         challenge: {
  //           label: "start - end",
  //         },
  //       },
  //     ],
  //   },
  // ];
	const maps = getMapsToRoll(selectedTiers, goldenList);

	let challengeCount = 0;
	maps.forEach(map => {
		map.challenges.forEach(_ => {
			challengeCount++;
		})
	});

	let count = 0;
	maps.forEach(map => {
		map.challenges.forEach(challenge => {
			let p = document.createElement("p");
			p.innerHTML =
				map.name +
				(challenge.requires_fc ? " [FC]" : "") + " "
				+ (challenge.label !== null ? "[" + challenge.label + "]" : "") + " "
			// + challenge.difficulty.name;
			
			
			rouletteContainer.appendChild(p);
			p.style = "--nth-child: " + count;
			resizeFontToFit(p, remToPx(15) - 70, 20 * Math.PI * 15 / challengeCount);
			count++;
		})
	});
	rouletteContainer.style = "--childRotation: " + (challengeCount !== 0 ? 360 / challengeCount : 10) + "deg";
}

//--------------------

const rouletteContainer = document.getElementById("rouletteContainer");
const rouletteLoadIcon = document.getElementById("rouletteLoadIcon");
const goldberryImg = document.getElementById("goldberryImg");

const tierDropdown = document.getElementById("tierDropdown");
const tierDropdownPopup = document.getElementById("tierDropdownPopup");

const campaignNameObject = document.getElementById("campaignName");
const mapNameObject = document.getElementById("mapName");
const mapSegmentObject = document.getElementById("mapSegment");
const mapTierObject = document.getElementById("mapTier");

let goldenList = null;
let campaignList = [];
let selectedTiers = [];

//----------------------

setTierDropdownPopoverWidth();
addEventListener("resize", (_) => setTierDropdownPopoverWidth());

// let count = 1;
// rouletteContainer.style = "--childRotation: " + 360/count + "deg";
// for (let i = 0; i < count; i++){
// 	const p = document.createElement("p");
// 	p.innerHTML = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
// 	rouletteContainer.appendChild(p);
// 	p.style = "--nth-child: " + i;
// 	resizeFontToFit(p, remToPx(15) / 4);
// }

// addMapsToRoulette();

request("https://goldberries.net/api/lists/golden-list?archived=true&arbitrary=true")
	.then(value => {
		campaignList = value;
		goldenList = getGoldenListFromCampaigns(campaignList);
		rouletteLoadIcon.classList.add("hidden");
		goldberryImg.classList.remove("hidden");
		addMapsToRoulette();
	})
	.catch(err => {
		console.error(err);
	});