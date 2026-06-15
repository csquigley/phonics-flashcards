import { CARDS } from "./cards.js";
import { highlight, speak, replay, shuffle, imagePath } from "./utils.js";
import { initMatch, newMatchRound } from "./match.js";
import { initMemory, newMemoryGame } from "./memory.js";
import { initOdd, newOddRound } from "./oddone.js";
import { initPlank, newPlankGame } from "./plank.js";
import { initBuild, newBuildRound } from "./buildword.js";
import { initScenes, newScenesGame } from "./scenes.js";

// ---------------- Tabs ----------------
const views = {
  flash: document.getElementById("view-flash"),
  match: document.getElementById("view-match"),
  odd: document.getElementById("view-odd"),
  plank: document.getElementById("view-plank"),
  build: document.getElementById("view-build"),
  scenes: document.getElementById("view-scenes"),
  memory: document.getElementById("view-memory"),
};
const tabButtons = document.querySelectorAll(".tabs button");
const initialized = { match: false, odd: false, plank: false, build: false, scenes: false, memory: false };

function showTab(name) {
  tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  Object.entries(views).forEach(([k, v]) => v.classList.toggle("hidden", k !== name));
  document.body.classList.toggle("memory-active", name === "memory");

  if (name === "match") {
    initialized.match ? newMatchRound() : initMatch();
    initialized.match = true;
  } else if (name === "odd") {
    initialized.odd ? newOddRound() : initOdd();
    initialized.odd = true;
  } else if (name === "plank") {
    initialized.plank ? newPlankGame() : initPlank();
    initialized.plank = true;
  } else if (name === "build") {
    initialized.build ? newBuildRound() : initBuild();
    initialized.build = true;
  } else if (name === "scenes") {
    initialized.scenes ? newScenesGame() : initScenes();
    initialized.scenes = true;
  } else if (name === "memory") {
    initialized.memory ? newMemoryGame() : initMemory(() => showTab("flash"));
    initialized.memory = true;
  }
}

tabButtons.forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));

// ---------------- Flashcards ----------------
const scene = document.getElementById("scene");
const card = document.getElementById("card");
const graphemeEl = document.getElementById("grapheme");
const wordStage = document.getElementById("wordStage");
const imageEl = document.getElementById("cardImage");
const wordEl = document.getElementById("word");
const dotsEl = document.getElementById("dots");
const progressEl = document.getElementById("progress");
const filtersEl = document.getElementById("filters");

const FILTERS = [
  { label: "All", match: () => true },
  { label: "Long a", match: c => c.sound === "long a" },
  { label: "Long e", match: c => c.sound === "long e" },
  { label: "Long i", match: c => c.sound === "long i" },
  { label: "Long o", match: c => c.sound === "long o" },
  { label: "Long u", match: c => c.sound === "long u" },
  { label: "th ch sh", match: c => ["th", "ch", "sh"].includes(c.sound) },
];

let deck = [...CARDS];
let index = 0;     // which sound
let wordIndex = 0; // which of the 5 example words

function renderWord() {
  const c = deck[index];
  const w = c.words[wordIndex];
  imageEl.src = imagePath(c.id, w.word);
  imageEl.alt = w.word;
  wordEl.innerHTML = highlight(w.word, c.grapheme);
  dotsEl.querySelectorAll("span").forEach((d, i) =>
    d.classList.toggle("on", i === wordIndex));
  replay(wordStage, "swap");
}

function renderCard(direction = 0) {
  const c = deck[index];
  wordIndex = 0;
  card.classList.remove("flipped");
  graphemeEl.textContent = c.display;
  replay(graphemeEl, "graphemePop");
  dotsEl.innerHTML = c.words.map(() => "<span></span>").join("");
  renderWord();
  progressEl.textContent = `${index + 1} / ${deck.length}`;
  if (direction > 0) replay(scene, "enter-right");
  else if (direction < 0) replay(scene, "enter-left");
}

function move(delta) {
  index = (index + delta + deck.length) % deck.length;
  renderCard(delta);
}

function moveWord(delta) {
  const count = deck[index].words.length;
  wordIndex = (wordIndex + delta + count) % count;
  renderWord();
}

// Tap: front flips to the back; on the back, step through the 5 words,
// then flip home after the last one.
card.addEventListener("click", () => {
  if (!card.classList.contains("flipped")) {
    card.classList.add("flipped");
    return;
  }
  if (wordIndex === deck[index].words.length - 1) {
    card.classList.remove("flipped");
    wordIndex = 0;
    setTimeout(renderWord, 300); // reset while the back is hidden mid-flip
  } else {
    moveWord(1);
  }
});

document.getElementById("prevBtn").addEventListener("click", () => move(-1));
document.getElementById("nextBtn").addEventListener("click", () => move(1));

document.getElementById("shuffleBtn").addEventListener("click", () => {
  shuffle(deck);
  index = 0;
  renderCard(1);
});

document.getElementById("speakBtn").addEventListener("click", e => {
  e.stopPropagation(); // don't flip the card
  speak(deck[index].words[wordIndex].word);
});

document.addEventListener("keydown", e => {
  if (!views.flash || views.flash.classList.contains("hidden")) return;
  if (e.key === "ArrowLeft") move(-1);
  else if (e.key === "ArrowRight") move(1);
  else if (e.key === "ArrowDown") { if (card.classList.contains("flipped")) moveWord(1); }
  else if (e.key === "ArrowUp") { if (card.classList.contains("flipped")) moveWord(-1); }
  else if (e.key === " ") {
    e.preventDefault();
    card.classList.toggle("flipped");
  }
});

// Filter buttons
FILTERS.forEach((f, i) => {
  const btn = document.createElement("button");
  btn.textContent = f.label;
  if (i === 0) btn.classList.add("active");
  btn.addEventListener("click", () => {
    filtersEl.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    deck = CARDS.filter(f.match);
    index = 0;
    renderCard(1);
  });
  filtersEl.appendChild(btn);
});

// Floating background letters
const bg = document.querySelector(".bg-letters");
const letters = "aeiou th ch sh ai ay ee igh oa ew".split(" ").join("").split("");
for (let i = 0; i < 14; i++) {
  const s = document.createElement("span");
  s.textContent = letters[Math.floor(Math.random() * letters.length)];
  s.style.left = `${Math.random() * 96}%`;
  s.style.animationDuration = `${14 + Math.random() * 18}s`;
  s.style.animationDelay = `${-Math.random() * 20}s`;
  s.style.fontSize = `${1.4 + Math.random() * 2}rem`;
  bg.appendChild(s);
}

renderCard();
