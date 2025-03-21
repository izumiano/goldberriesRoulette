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

function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function easeOutSine(x) {
  return Math.sin((x * Math.PI) / 2);
}

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

let rouletteRotationInterval = null;
let rouletteT = 0;
function startRouletteRotation(
  duration = null,
	speed = 0.1,
	callback = () => { },
  easingFunction = t => {return t;}
) {
  stopRouletteRotation();

	const millisecondTimeout = 4;

	const actualDuration = duration;
	duration ??= 1;

  rouletteT = 0;
  const initalRouletteAngle = rouletteAngle;
	rouletteRotationInterval = setInterval(() => {
    const angle = easingFunction(rouletteT) * duration * 360 + initalRouletteAngle;
    rouletteAngle = angle % 360;
		rouletteContainer.style.transform = `rotateZ(${rouletteAngle}deg)`;
		const speedIncrease = (millisecondTimeout * speed) / (1000 * duration);
		rouletteT += speedIncrease;
		
		if (actualDuration && rouletteT >= 1) {
			stopRouletteRotation();
      callback && callback();
		}
  }, millisecondTimeout);
}

function stopRouletteRotation() {
	if (rouletteRotationInterval !== null) {
		clearInterval(rouletteRotationInterval);
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
	startRouletteRotation(
    20,
    1,
    () => {
      const wheelIndex = getCurrentWheelIndex();
      if (wheelIndex < challengesOnWheel.length) {
        console.log(`Rolled ${challengesOnWheel[wheelIndex].mapName}`);
      } else {
        console.log("challenge not added");
      }
    },
		easeOutSine
  );
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
    "Tier 1": [],
    "Tier 2": [],
    "Tier 3": [],
    "Tier 4": [],
    "Tier 5": [],
    "Tier 6": [],
    "Tier 7": [],
    "Tier 8": [],
    "Tier 9": [],
    "Tier 10": [],
    "Tier 11": [],
    "Tier 12": [],
    "Tier 13": [],
    "Tier 14": [],
    "Tier 15": [],
    "Tier 16": [],
    "Tier 17": [],
    "Tier 18": [],
    "Tier 19": [],
    "Untiered": [],
    "Undetermined": [],
  };
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

	tierSortedLoadingBars[button.value].style.width = "0";

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

function addTierSortedLoadingBars() {
	const tierSortedLoadingBars = {};
	
	for (child of tierDropdownPopup.children) {
		const div = document.createElement("div")
		child.appendChild(div);
		tierSortedLoadingBars[child.dataset.tier] = div;
	}
	return tierSortedLoadingBars;
}

function setTierSortedProgress(progress, selectedTiers) {
	selectedTiers.forEach((tier) => {
		tierSortedProgress[tier] = progress;
		tierSortedLoadingBars[tier].style.width = progress === 1 ? "0" : progress * 100 + "%";
  });
}

let chunkTimeoutIDs = [];
const tierSortedProgress = {
  "Tier 1": 0,
  "Tier 2": 0,
  "Tier 3": 0,
  "Tier 4": 0,
  "Tier 5": 0,
  "Tier 6": 0,
  "Tier 7": 0,
  "Tier 8": 0,
  "Tier 9": 0,
  "Tier 10": 0,
  "Tier 11": 0,
  "Tier 12": 0,
  "Tier 13": 0,
  "Tier 14": 0,
  "Tier 15": 0,
  "Tier 16": 0,
  "Tier 17": 0,
  "Tier 18": 0,
  "Tier 19": 0,
  "Untiered": 0,
  "Undetermined": 0,
};
function addMapChunksToRoulette(maps, selectedTiers, challengeCount) {
	const chunk = 20;
	let count = 0;
	challengesOnWheel = [];
  (function loop(i) {
    if (i >= maps.length) return; // all done
    maps.slice(i, i + chunk).forEach((map) => {
			for (let j = 0; j < map.challenges.length; j++) {
				const challenge = map.challenges[j];
				challenge.mapName = map.name;
        const p = document.createElement("p");
        p.innerHTML =
          map.name +
          (challenge.requires_fc ? " [FC]" : "") +
          " " +
          (challenge.label !== null ? "[" + challenge.label + "]" : "") +
          " ";
        // + challenge.difficulty.name;

				challengesOnWheel.push(challenge);
        rouletteTextContainer.appendChild(p);
        p.style = "--nth-child: " + count;
        resizeFontToFit(p, 240 - 70, (1.8 * Math.PI * 240) / challengeCount); // 240 is remToPx(15)
        count++;
      }
		});
		
		setTierSortedProgress(count / challengeCount, selectedTiers);

    chunkTimeoutIDs.push(setTimeout(loop.bind(null, i + chunk)));
  })(0);
}

function addMapsToRoulette() {
	chunkTimeoutIDs.forEach(id => {
		clearTimeout(id);
	})
	chunkTimeoutIDs = [];

	const shallowChildrenCopy = [...rouletteTextContainer.children];
	for (const child of shallowChildrenCopy) {
    if (child.tagName === "P") {
      rouletteTextContainer.removeChild(child);
    }
  }

	const maps = getMapsToRoll(selectedTiers, goldenList);

	let challengeCount = 0;
	maps.forEach(map => {
		challengeCount += map.challenges.length
	});

	console.log(maps);
	addMapChunksToRoulette(maps, selectedTiers, challengeCount);

	childRotationAngle = challengeCount !== 0 ? 360 / challengeCount : 10;
	console.log(childRotationAngle);
	rouletteWheel.style = "--childRotation: " + childRotationAngle + "deg";
}

function startSpinCheck() {
	let prevIndex = null;
	setInterval(() => {
		const wheelIndex = getCurrentWheelIndex();
		if (prevIndex !== null && prevIndex !== wheelIndex) {
      if (wheelIndex < challengesOnWheel.length) {
        console.log(challengesOnWheel[wheelIndex].mapName);
      } else {
        console.log("challenge not added");
			}
			clickAudio.play();
    }
		prevIndex = wheelIndex;
	})
}

function getCurrentWheelIndex() {
	const a = rouletteAngle - childRotationAngle / 2;
	const b = (360 - a);
	const c = b / childRotationAngle
	const d = Math.floor(c);
	const wheelIndex = d % (360 / childRotationAngle);
	return wheelIndex;
}

//--------------------

const rouletteContainer = document.getElementById("rouletteContainer");
const rouletteTextContainer = document.getElementById("rouletteTextContainer");
const rouletteWheel = document.getElementById("rouletteWheel");
const goldberryImg = document.getElementById("goldberryImg");

const tierDropdown = document.getElementById("tierDropdown");
const tierDropdownPopup = document.getElementById("tierDropdownPopup");

const campaignNameObject = document.getElementById("campaignName");
const mapNameObject = document.getElementById("mapName");
const mapSegmentObject = document.getElementById("mapSegment");
const mapTierObject = document.getElementById("mapTier");

const tierSortedLoadingBars = addTierSortedLoadingBars();

class ClickAudio {
  source = "mixkit-classic-click-1117.wav";
  currentIndex = 0;
  instances = [];

	constructor() {
		const audio = new Audio(this.source);
		audio.preload = "auto";
		this.instances.push(audio);
		for (let index = 0; index < 5; index++) {
			this.instances.push(audio.cloneNode(true));
		}
	}

	play() {
		this.instances[this.currentIndex++].play();
    if (this.currentIndex >= this.instances.length) {
      this.currentIndex = 0;
    }
	}
}
const clickAudio = new ClickAudio();

let goldenList = null;
let campaignList = [];
let selectedTiers = [];
let challengesOnWheel = [];

let rouletteAngle = 0;
let childRotationAngle;

//----------------------

startRouletteRotation();

setTierDropdownPopoverWidth();
addEventListener("resize", (_) => setTierDropdownPopoverWidth());
rouletteWheel.addEventListener("animationend", (event) => {
  if (event.animationName === "spinnerToRoulette") {
		rouletteWheel.classList.add("rouletteWheel");
  }
});

request(
  "https://goldberries.net/api/lists/golden-list"
)
  .then((value) => {
    campaignList = value;
    goldenList = getGoldenListFromCampaigns(campaignList);
    rouletteWheel.classList.add("spinnerToRoulette");
    addMapsToRoulette();
    startSpinCheck();
  })
  .catch((err) => {
    console.error(err);
  });