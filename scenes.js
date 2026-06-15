// "Find It!" — themed scenes populated with objects. A word is shown and
// spoken; tap the matching object to make it vanish. Wrong tap = a strike;
// 3 strikes ends the scene. Clear all 10 objects to move to the next scene.
import { SCENES } from "./scenes-data.js";
import { CARDS } from "./cards.js";
import { speak, shuffle, replay, confetti } from "./utils.js";

const MAX_STRIKES = 3;

// word -> picture. Reuse the flashcard image for existing words; new scene
// words have their own picture under images/obj/.
const CARD_IMG = {};
CARDS.forEach(c => c.words.forEach(w => { CARD_IMG[w.word] = `images/${c.id}_${w.word}.png`; }));
const objImg = word => CARD_IMG[word] || `images/obj/${word}.png`;

// Scatter positions (centre %, x/y) — spread out so cards don't overlap.
const SLOTS = [
  [13, 22], [34, 16], [54, 20], [73, 15], [88, 32],
  [12, 47], [33, 54], [54, 50], [74, 55], [88, 62],
  [26, 78], [55, 78],
];

const stageEl = document.getElementById("sceneStage");
const wordEl = document.getElementById("scenesWord");
const progressEl = document.getElementById("scenesProgress");
const heartsEl = document.getElementById("scenesHearts");
const banner = document.getElementById("scenesBanner");
const bannerTitle = document.getElementById("scenesBannerTitle");
const bannerText = document.getElementById("scenesBannerText");
const bannerBtn = document.getElementById("scenesBannerBtn");

let sceneIndex = 0;
let toFind = [];     // words not yet found, in order
let strikes = 0;
let locked = false;  // brief lock during pop/strike animations

function renderHearts() {
  heartsEl.textContent = "❤️".repeat(MAX_STRIKES - strikes) + "🖤".repeat(strikes);
}

function loadScene() {
  const scene = SCENES[sceneIndex];
  strikes = 0;
  locked = false;
  banner.classList.add("hidden");
  stageEl.style.backgroundImage = `url("images/scenes/${scene.key}.png")`;
  stageEl.innerHTML = "";

  const slots = shuffle([...SLOTS]).slice(0, scene.words.length);
  scene.words.forEach((word, i) => {
    const btn = document.createElement("button");
    btn.className = "scene-obj";
    btn.style.left = `${slots[i][0]}%`;
    btn.style.top = `${slots[i][1]}%`;
    btn.style.animationDelay = `${i * 0.05}s`;
    btn.innerHTML = `<img src="${objImg(word)}" alt="">`;
    btn.addEventListener("click", () => tap(btn, word));
    stageEl.appendChild(btn);
  });

  toFind = shuffle([...scene.words]);
  progressEl.textContent = `${scene.emoji} ${scene.name} — Scene ${sceneIndex + 1}/${SCENES.length}`;
  renderHearts();
  nextTarget();
}

function nextTarget() {
  if (!toFind.length) return sceneComplete();
  const word = toFind[0];
  wordEl.textContent = word;
  replay(wordEl, "pop");
  setTimeout(() => speak(word), 250);
}

function tap(btn, word) {
  if (locked || btn.classList.contains("found")) return;
  if (word === toFind[0]) {
    locked = true;
    btn.classList.add("found");
    toFind.shift();
    setTimeout(() => { btn.remove(); locked = false; nextTarget(); }, 450);
  } else {
    strikes++;
    renderHearts();
    btn.classList.add("miss");
    btn.addEventListener("animationend", () => btn.classList.remove("miss"), { once: true });
    if (strikes >= MAX_STRIKES) lose();
  }
}

function sceneComplete() {
  sceneIndex++;
  if (sceneIndex >= SCENES.length) return win();
  confetti(stageEl, 28);
  showBanner("🎉 Scene complete!", `Next up: ${SCENES[sceneIndex].emoji} ${SCENES[sceneIndex].name}`, "Continue →", loadScene);
}

function lose() {
  locked = true;
  const scene = SCENES[sceneIndex];
  showBanner("💥 Three misses!", `Let's try ${scene.emoji} ${scene.name} again.`, "Try again", loadScene);
}

function win() {
  confetti(banner, 60);
  showBanner("🏆 You found everything!", `You cleared all ${SCENES.length} scenes!`, "Play again 🎉", () => { sceneIndex = 0; loadScene(); });
}

function showBanner(title, text, btnLabel, onClick) {
  bannerTitle.textContent = title;
  bannerText.textContent = text;
  bannerBtn.textContent = btnLabel;
  bannerBtn.onclick = onClick;
  banner.classList.remove("hidden");
}

export function newScenesGame() {
  sceneIndex = 0;
  loadScene();
}

export function initScenes() {
  document.getElementById("scenesReset").addEventListener("click", newScenesGame);
  document.getElementById("scenesSpeak").addEventListener("click", () => { if (toFind.length) speak(toFind[0]); });
  newScenesGame();
}
