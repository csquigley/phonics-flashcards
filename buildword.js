// Build a Word: hear a word, see its picture, then tap letter tiles into the
// slots to spell it. The pool holds the word's letters (scrambled) plus a few
// distractor letters, so the child must choose, not just unscramble.
import { CARDS } from "./cards.js";
import { highlight, speak, shuffle, randomItem, imagePath, replay, confetti } from "./utils.js";

const ROUND = 8;
const DISTRACTORS = 2;
const ALPHA = "abcdefghijklmnopqrstuvwxyz".split("");

const imageEl = document.getElementById("buildImage");
const slotsEl = document.getElementById("buildSlots");
const poolEl = document.getElementById("buildPool");
const progressEl = document.getElementById("buildProgress");
const starsEl = document.getElementById("buildStars");
const solvedEl = document.getElementById("buildSolved");
const doneEl = document.getElementById("buildDone");
const doneTitle = document.getElementById("buildDoneTitle");
const doneScore = document.getElementById("buildDoneScore");

let queue = [];   // the round's words
let qIndex = 0;
let score = 0;
let current = null;   // { card, word }
let slots = [];       // tileId | null, one per letter
let tiles = [];       // { id, letter, used }
let locked = false;   // brief lock after a correct word

function distractorLetters(word, n) {
  const inWord = new Set(word.split(""));
  return shuffle(ALPHA.filter(l => !inWord.has(l))).slice(0, n);
}

function buildQueue() {
  // ROUND distinct (card, word) pairs
  const all = shuffle(CARDS.flatMap(c => c.words.map(w => ({ card: c, word: w.word }))));
  return all.slice(0, ROUND);
}

function renderStars() {
  starsEl.textContent = "⭐".repeat(score) + "☆".repeat(queue.length - score);
}

function newQuestion() {
  current = queue[qIndex];
  locked = false;
  const letters = current.word.split("");
  let pool = shuffle([...letters, ...distractorLetters(current.word, DISTRACTORS)]);
  // avoid the pool accidentally showing the answer in order
  if (pool.slice(0, letters.length).join("") === current.word) pool = shuffle(pool);
  tiles = pool.map((letter, i) => ({ id: i, letter, used: false }));
  slots = Array(letters.length).fill(null);
  solvedEl.textContent = "";
  solvedEl.className = "build-solved";
  imageEl.src = imagePath(current.card.id, current.word);
  imageEl.alt = "mystery picture";
  render();
  progressEl.textContent = `${qIndex + 1} / ${queue.length}`;
  renderStars();
  replay(imageEl, "swap-in");
  setTimeout(() => speak(current.word), 450);
}

function render() {
  slotsEl.innerHTML = "";
  slots.forEach((tileId, i) => {
    const slot = document.createElement("div");
    slot.className = "letter-slot" + (tileId !== null ? " filled" : "");
    if (tileId !== null) {
      slot.textContent = tiles.find(t => t.id === tileId).letter;
      slot.addEventListener("click", () => removeFromSlot(i));
    }
    slotsEl.appendChild(slot);
  });

  poolEl.innerHTML = "";
  tiles.forEach(t => {
    const tile = document.createElement("button");
    tile.className = "letter-tile" + (t.used ? " used" : "");
    tile.textContent = t.letter;
    tile.disabled = t.used || locked;
    tile.addEventListener("click", () => placeTile(t.id));
    poolEl.appendChild(tile);
  });
}

function placeTile(id) {
  if (locked) return;
  const tile = tiles.find(t => t.id === id);
  if (tile.used) return;
  const slot = slots.indexOf(null);
  if (slot === -1) return;
  slots[slot] = id;
  tile.used = true;
  render();
  if (!slots.includes(null)) check();
}

function removeFromSlot(i) {
  if (locked) return;
  const id = slots[i];
  if (id === null) return;
  tiles.find(t => t.id === id).used = false;
  slots[i] = null;
  solvedEl.textContent = "";
  solvedEl.className = "build-solved";
  render();
}

function check() {
  const assembled = slots.map(id => tiles.find(t => t.id === id).letter).join("");
  if (assembled === current.word) {
    locked = true;
    score++;
    renderStars();
    slotsEl.querySelectorAll(".letter-slot").forEach(s => s.classList.add("correct"));
    solvedEl.innerHTML = highlight(current.word, current.card.grapheme);
    solvedEl.classList.add("show");
    speak(current.word);
    setTimeout(() => {
      qIndex++;
      qIndex < queue.length ? newQuestion() : finish();
    }, 1500);
  } else {
    slotsEl.querySelectorAll(".letter-slot").forEach(s => {
      s.classList.add("wrong");
      s.addEventListener("animationend", () => s.classList.remove("wrong"), { once: true });
    });
  }
}

function finish() {
  doneTitle.textContent =
    score === queue.length ? "Spelling star! 🌟" :
    score >= queue.length / 2 ? "Great spelling! 👏" : "Keep practicing! 💪";
  doneScore.textContent = `${score} / ${queue.length} words built`;
  doneEl.classList.remove("hidden");
  if (score === queue.length) confetti(doneEl);
}

export function newBuildRound() {
  queue = buildQueue();
  qIndex = 0;
  score = 0;
  doneEl.classList.add("hidden");
  newQuestion();
}

export function initBuild() {
  document.getElementById("buildReset").addEventListener("click", newBuildRound);
  document.getElementById("buildAgain").addEventListener("click", newBuildRound);
  document.getElementById("buildClear").addEventListener("click", () => {
    if (locked) return;
    tiles.forEach(t => (t.used = false));
    slots = slots.map(() => null);
    solvedEl.textContent = "";
    solvedEl.className = "build-solved";
    render();
  });
  document.getElementById("buildSpeak").addEventListener("click", () => {
    if (current) speak(current.word);
  });
  newBuildRound();
}
