// BricksWords — flashcards + games for the curriculum vocabulary (Units 1-4).
// Reuses the same game shapes as the phonics side, adapted for plain words:
// Flashcards, Match (picture -> word), Memory (picture <-> word), Spell.
import { BRICKS_UNITS, BRICKS_WORDS } from "./bricks-data.js";
import { speak, speakTimes, shuffle, randomItem, replay, confetti } from "./utils.js";

const stage = document.getElementById("bricksStage");
const unitsEl = document.getElementById("bricksUnits");
const gamesEl = document.getElementById("bricksGames");

const GAMES = [
  { id: "flash",  label: "🃏 Flashcards" },
  { id: "match",  label: "🎯 Match" },
  { id: "memory", label: "🧠 Memory" },
  { id: "spell",  label: "🔡 Spell" },
];
const ALPHA = "abcdefghijklmnopqrstuvwxyz".split("");

let unit = 0;       // 0 = all units, else 1..4
let game = "flash";

function currentWords() {
  return unit === 0 ? BRICKS_WORDS : BRICKS_UNITS[unit - 1].words;
}

// A picture node that falls back to the word text if the image is missing.
function picEl(w, cls = "brick-pic") {
  const d = document.createElement("div");
  d.className = cls;
  d.dataset.word = w.word;
  const img = document.createElement("img");
  img.src = `images/bricks/${w.key}.png`;
  img.alt = w.word;
  img.addEventListener("error", () => d.classList.add("noimg"));
  d.appendChild(img);
  return d;
}

// ---------------- Flashcards ----------------
function renderFlash() {
  const words = shuffle([...currentWords()]);
  let i = 0;
  stage.innerHTML = `
    <div class="brick-flip-scene">
      <div class="brick-flip" id="brickFlip" tabindex="0" aria-label="Flashcard">
        <div class="brick-face brick-front"></div>
        <div class="brick-face brick-back">
          <div class="brick-word" id="brickWord"></div>
          <button class="speak-btn" id="brickSpeak">🔊</button>
        </div>
      </div>
    </div>
    <div class="brick-controls">
      <button id="bPrev" title="Previous">◀</button>
      <span class="progress" id="bProg"></span>
      <button id="bNext" title="Next">▶</button>
      <button id="bShuf" title="Shuffle">🔀</button>
    </div>
    <p class="keys">tap the card to flip</p>`;

  const flip = stage.querySelector("#brickFlip");
  const front = stage.querySelector(".brick-front");
  const wordEl = stage.querySelector("#brickWord");
  const prog = stage.querySelector("#bProg");

  function show() {
    const w = words[i];
    flip.classList.remove("flipped");
    front.innerHTML = "";
    front.appendChild(picEl(w));
    wordEl.textContent = w.word;
    prog.textContent = `${i + 1} / ${words.length}`;
  }
  function move(d) { i = (i + d + words.length) % words.length; show(); }

  flip.addEventListener("click", () => {
    flip.classList.toggle("flipped");
    if (flip.classList.contains("flipped")) speak(words[i].word);
  });
  stage.querySelector("#brickSpeak").addEventListener("click", e => { e.stopPropagation(); speak(words[i].word); });
  stage.querySelector("#bPrev").addEventListener("click", () => move(-1));
  stage.querySelector("#bNext").addEventListener("click", () => move(1));
  stage.querySelector("#bShuf").addEventListener("click", () => { shuffle(words); i = 0; show(); });
  show();
}

// ---------------- Match (picture -> word) ----------------
function renderMatch() {
  const pool = currentWords();
  const questions = shuffle([...pool]);
  let qi = 0, score = 0, firstTry = true, locked = false;

  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="mProg"></span><span class="match-stars" id="mStars"></span></div>
    <div class="brick-match-stage" id="mStage">
      <p class="match-question">🔊 Which word is this?</p>
      <div class="brick-match-pic" id="mPic"></div>
      <div class="brick-options" id="mOpts"></div>
    </div>
    <div class="match-done hidden" id="mDone"><div class="match-done-card">
      <p class="match-done-title" id="mTitle"></p><p class="match-done-score" id="mScore"></p>
      <button class="pill big" id="mAgain">Play again 🎉</button>
    </div></div>`;

  const picWrap = stage.querySelector("#mPic");
  const optsEl = stage.querySelector("#mOpts");
  const starsEl = stage.querySelector("#mStars");
  const progEl = stage.querySelector("#mProg");
  const doneEl = stage.querySelector("#mDone");

  function stars() { starsEl.textContent = "⭐".repeat(score) + "☆".repeat(questions.length - score); }

  function showQ() {
    const w = questions[qi];
    firstTry = true; locked = false;
    picWrap.innerHTML = "";
    picWrap.appendChild(picEl(w));
    const distractors = shuffle(pool.filter(x => x.key !== w.key)).slice(0, 3);
    const opts = shuffle([w, ...distractors]);
    optsEl.innerHTML = "";
    opts.forEach(o => {
      const b = document.createElement("button");
      b.className = "brick-option";
      b.textContent = o.word;
      b.addEventListener("click", () => answer(b, o, w));
      optsEl.appendChild(b);
    });
    progEl.textContent = `${qi + 1} / ${questions.length}`;
    stars();
    replay(stage.querySelector("#mStage"), "swap-in");
    setTimeout(() => speakTimes(w.word, 2), 350);
  }

  function answer(b, o, w) {
    if (locked) return;
    if (o.key === w.key) {
      locked = true;
      b.classList.add("correct");
      if (firstTry) score++;
      stars();
      speak(w.word);
      optsEl.querySelectorAll("button").forEach(x => (x.disabled = true));
      setTimeout(() => { qi++; qi < questions.length ? showQ() : finish(); }, 1200);
    } else {
      firstTry = false;
      b.classList.add("wrong");
      b.disabled = true;
    }
  }

  function finish() {
    stage.querySelector("#mTitle").textContent =
      score === questions.length ? "Perfect! 🌟" : score >= questions.length / 2 ? "Great job! 👏" : "Good try! 💪";
    stage.querySelector("#mScore").textContent = `${score} / ${questions.length} first-try stars`;
    doneEl.classList.remove("hidden");
    if (score === questions.length) confetti(doneEl);
  }

  stage.querySelector("#mAgain").addEventListener("click", renderMatch);
  showQ();
}

// ---------------- Memory (picture <-> word) ----------------
function renderMemory() {
  const words = shuffle([...currentWords()]).slice(0, Math.min(8, currentWords().length));
  const tiles = shuffle(words.flatMap(w => [
    { key: w.key, word: w.word, type: "pic" },
    { key: w.key, word: w.word, type: "word" },
  ]));
  let open = [], lock = false, moves = 0, remaining = tiles.length;
  const cols = tiles.length <= 12 ? 4 : tiles.length <= 16 ? 4 : 5;

  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="memMoves">Moves: 0</span></div>
    <div class="brick-memory" id="memGrid" style="grid-template-columns:repeat(${cols},1fr)"></div>
    <div class="match-done hidden" id="memDone"><div class="match-done-card">
      <p class="match-done-title">🏆 You matched them all!</p><p class="match-done-score" id="memScore"></p>
      <button class="pill big" id="memAgain">Play again 🎉</button>
    </div></div>`;

  const grid = stage.querySelector("#memGrid");
  const movesEl = stage.querySelector("#memMoves");

  tiles.forEach((t, n) => {
    const el = document.createElement("div");
    el.className = "brick-tile";
    el.style.animationDelay = `${n * 0.04}s`;
    const faceBack = t.type === "pic"
      ? `<div class="brick-tile-pic" data-word="${t.word}"><img src="images/bricks/${t.key}.png" alt="" onerror="this.parentElement.classList.add('noimg')"></div>`
      : `<span class="brick-tile-word">${t.word}</span>`;
    el.innerHTML = `<div class="brick-tile-inner"><div class="brick-tile-face brick-tile-front">🧱</div><div class="brick-tile-face brick-tile-back">${faceBack}</div></div>`;
    el.addEventListener("click", () => flip(el, t));
    grid.appendChild(el);
  });

  function flip(el, t) {
    if (lock || el.classList.contains("open") || el.classList.contains("matched")) return;
    el.classList.add("open");
    open.push({ el, t });
    if (open.length < 2) return;
    moves++; movesEl.textContent = `Moves: ${moves}`;
    const [a, b] = open; open = [];
    if (a.t.key === b.t.key && a.t.type !== b.t.type) {
      if (a.t.type === "word" || b.t.type === "word") speak(a.t.word);
      lock = true;
      setTimeout(() => {
        a.el.classList.add("matched"); b.el.classList.add("matched");
        lock = false; remaining -= 2;
        if (remaining === 0) {
          stage.querySelector("#memScore").textContent = `Finished in ${moves} moves`;
          stage.querySelector("#memDone").classList.remove("hidden");
          confetti(stage.querySelector("#memDone"), 40);
        }
      }, 600);
    } else {
      lock = true;
      setTimeout(() => { a.el.classList.remove("open"); b.el.classList.remove("open"); lock = false; }, 900);
    }
  }

  stage.querySelector("#memAgain").addEventListener("click", renderMemory);
}

// ---------------- Spell ----------------
function renderSpell() {
  const words = shuffle(currentWords().filter(w => w.spell));
  if (!words.length) {
    stage.innerHTML = `<p class="brick-empty">These words can't be spelled letter-by-letter.<br>Try another unit or game! 🔡</p>`;
    return;
  }
  let qi = 0, score = 0;

  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="sProg"></span><span class="match-stars" id="sStars"></span></div>
    <p class="match-question">🔊 Listen and build the word!</p>
    <div class="brick-spell-pic" id="sPic"></div>
    <div class="brick-solved" id="sSolved"></div>
    <div class="build-slots" id="sSlots"></div>
    <div class="build-pool" id="sPool"></div>
    <button class="pill" id="sClear">⌫ Clear</button>
    <div class="match-done hidden" id="sDone"><div class="match-done-card">
      <p class="match-done-title" id="sTitle"></p><p class="match-done-score" id="sScore"></p>
      <button class="pill big" id="sAgain">Play again 🎉</button>
    </div></div>`;

  const picWrap = stage.querySelector("#sPic");
  const slotsEl = stage.querySelector("#sSlots");
  const poolEl = stage.querySelector("#sPool");
  const solvedEl = stage.querySelector("#sSolved");
  const starsEl = stage.querySelector("#sStars");
  const progEl = stage.querySelector("#sProg");
  let slots = [], tiles = [], locked = false;

  function stars() { starsEl.textContent = "⭐".repeat(score) + "☆".repeat(words.length - score); }

  function newWord() {
    const w = words[qi];
    locked = false;
    const letters = w.word.split("");
    const extra = shuffle(ALPHA.filter(l => !letters.includes(l))).slice(0, 2);
    tiles = shuffle([...letters, ...extra]).map((letter, id) => ({ id, letter, used: false }));
    slots = Array(letters.length).fill(null);
    solvedEl.textContent = ""; solvedEl.className = "brick-solved";
    picWrap.innerHTML = ""; picWrap.appendChild(picEl(w));
    progEl.textContent = `${qi + 1} / ${words.length}`;
    stars();
    draw();
    setTimeout(() => speak(w.word), 350);
  }

  function draw() {
    slotsEl.innerHTML = "";
    slots.forEach((id, i) => {
      const s = document.createElement("div");
      s.className = "letter-slot" + (id !== null ? " filled" : "");
      if (id !== null) { s.textContent = tiles.find(t => t.id === id).letter; s.addEventListener("click", () => unplace(i)); }
      slotsEl.appendChild(s);
    });
    poolEl.innerHTML = "";
    tiles.forEach(t => {
      const b = document.createElement("button");
      b.className = "letter-tile" + (t.used ? " used" : "");
      b.textContent = t.letter; b.disabled = t.used || locked;
      b.addEventListener("click", () => place(t.id));
      poolEl.appendChild(b);
    });
  }

  function place(id) {
    if (locked) return;
    const t = tiles.find(x => x.id === id);
    const slot = slots.indexOf(null);
    if (t.used || slot === -1) return;
    slots[slot] = id; t.used = true; draw();
    if (!slots.includes(null)) check();
  }
  function unplace(i) {
    if (locked) return;
    tiles.find(t => t.id === slots[i]).used = false; slots[i] = null;
    solvedEl.textContent = ""; solvedEl.className = "brick-solved"; draw();
  }

  function check() {
    const built = slots.map(id => tiles.find(t => t.id === id).letter).join("");
    if (built === words[qi].word) {
      locked = true; score++; stars();
      slotsEl.querySelectorAll(".letter-slot").forEach(s => s.classList.add("correct"));
      solvedEl.textContent = words[qi].word; solvedEl.classList.add("show");
      speak(words[qi].word);
      setTimeout(() => { qi++; qi < words.length ? newWord() : finish(); }, 1400);
    } else {
      slotsEl.querySelectorAll(".letter-slot").forEach(s => {
        s.classList.add("wrong");
        s.addEventListener("animationend", () => s.classList.remove("wrong"), { once: true });
      });
    }
  }

  function finish() {
    stage.querySelector("#sTitle").textContent = score === words.length ? "Spelling star! 🌟" : "Great work! 👏";
    stage.querySelector("#sScore").textContent = `${score} / ${words.length} words built`;
    stage.querySelector("#sDone").classList.remove("hidden");
    if (score === words.length) confetti(stage.querySelector("#sDone"));
  }

  stage.querySelector("#sClear").addEventListener("click", () => {
    if (locked) return;
    tiles.forEach(t => (t.used = false)); slots = slots.map(() => null);
    solvedEl.textContent = ""; solvedEl.className = "brick-solved"; draw();
  });
  stage.querySelector("#sAgain").addEventListener("click", renderSpell);
  newWord();
}

// ---------------- Shell / navigation ----------------
const RENDERERS = { flash: renderFlash, match: renderMatch, memory: renderMemory, spell: renderSpell };

function render() {
  [...unitsEl.children].forEach(b => b.classList.toggle("active", +b.dataset.unit === unit));
  [...gamesEl.children].forEach(b => b.classList.toggle("active", b.dataset.game === game));
  RENDERERS[game]();
}

export function refreshBricks() { render(); }

export function initBricks() {
  const mkBtn = (label, on) => { const b = document.createElement("button"); b.textContent = label; b.addEventListener("click", on); return b; };

  const allBtn = mkBtn("All", () => { unit = 0; render(); }); allBtn.dataset.unit = 0;
  unitsEl.appendChild(allBtn);
  BRICKS_UNITS.forEach(u => {
    const b = mkBtn(`${u.emoji} Unit ${u.unit}`, () => { unit = u.unit; render(); });
    b.dataset.unit = u.unit;
    unitsEl.appendChild(b);
  });

  GAMES.forEach(g => {
    const b = mkBtn(g.label, () => { game = g.id; render(); });
    b.dataset.game = g.id;
    gamesEl.appendChild(b);
  });

  unit = 1; game = "flash";
  render();
}
