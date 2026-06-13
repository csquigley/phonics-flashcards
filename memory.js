// Memory game: full-screen 4x4 grid. Each pair is a picture tile and the
// grapheme tile of its sound — find the pair and both tiles vanish.
import { CARDS } from "./cards.js";
import { wordMatches, speak, shuffle, randomItem, imagePath, confetti } from "./utils.js";

const PAIRS = 8; // 4x4 grid

const gridEl = document.getElementById("memoryGrid");
const movesEl = document.getElementById("memoryMoves");
const winEl = document.getElementById("memoryWin");
const winMovesEl = document.getElementById("memoryWinMoves");

let open = [];       // currently face-up, unmatched tiles (max 2)
let lock = false;    // ignore clicks while a mismatch flips back
let moves = 0;
let remaining = 0;

// Pick sounds one by one, only keeping a sound if every sound chosen so far
// still has a word containing none of the other graphemes — otherwise a
// picture could match two sound tiles (e.g. "play" contains both ay and y).
function pickSounds() {
  const chosen = [];
  for (const c of shuffle([...CARDS])) {
    const trial = [...chosen, c];
    const ok = trial.every(card => card.words.some(w =>
      trial.every(o => o.id === card.id || !wordMatches(w.word, o.grapheme))));
    if (ok) chosen.push(c);
    if (chosen.length === PAIRS) break;
  }
  return chosen;
}

function buildTiles() {
  const sounds = pickSounds();
  const tiles = [];
  for (const card of sounds) {
    const safe = card.words.filter(w =>
      sounds.every(o => o.id === card.id || !wordMatches(w.word, o.grapheme)));
    const word = randomItem(safe).word;
    tiles.push({ sound: card.id, type: "image", word, display: card.display });
    tiles.push({ sound: card.id, type: "sound", word, display: card.display });
  }
  return shuffle(tiles);
}

function makeTileEl(tile) {
  const el = document.createElement("div");
  el.className = "tile";
  const face = tile.type === "image"
    ? `<img src="${imagePath(tile.sound, tile.word)}" alt="">`
    : `<span class="tile-grapheme">${tile.display}</span>`;
  el.innerHTML = `
    <div class="tile-inner">
      <div class="tile-face tile-front">★</div>
      <div class="tile-face tile-back">${face}</div>
    </div>`;
  el.addEventListener("click", () => flip(el, tile));
  return el;
}

function flip(el, tile) {
  if (lock || el.classList.contains("open") || el.classList.contains("matched")) return;
  el.classList.add("open");
  open.push({ el, tile });
  if (open.length < 2) return;

  moves++;
  movesEl.textContent = `Moves: ${moves}`;
  const [a, b] = open;
  open = [];

  if (a.tile.sound === b.tile.sound) {
    speak(a.tile.word);
    lock = true;
    setTimeout(() => {
      a.el.classList.add("matched");
      b.el.classList.add("matched");
      lock = false;
      remaining -= 2;
      if (remaining === 0) win();
    }, 600);
  } else {
    lock = true;
    setTimeout(() => {
      a.el.classList.remove("open");
      b.el.classList.remove("open");
      lock = false;
    }, 1000);
  }
}

function win() {
  winMovesEl.textContent = `Finished in ${moves} moves`;
  winEl.classList.remove("hidden");
  confetti(winEl, 50);
}

export function newMemoryGame() {
  open = [];
  lock = false;
  moves = 0;
  movesEl.textContent = "Moves: 0";
  winEl.classList.add("hidden");
  gridEl.innerHTML = "";
  const tiles = buildTiles();
  remaining = tiles.length;
  tiles.forEach((t, i) => {
    const el = makeTileEl(t);
    el.style.animationDelay = `${i * 0.04}s`; // staggered deal-in
    gridEl.appendChild(el);
  });
}

export function initMemory(onExit) {
  document.getElementById("memoryReset").addEventListener("click", newMemoryGame);
  document.getElementById("memoryAgain").addEventListener("click", newMemoryGame);
  document.getElementById("memoryExit").addEventListener("click", onExit);
  newMemoryGame();
}
