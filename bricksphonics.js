// Bricks Phonics — alphabet activities (3 parts) and CVC-word games, reusing
// the same game shapes as the rest of the app. Image-free for letters; CVC
// words reuse existing pictures where present, else fall back to the word text.
import { ALPHABET, ALPHABET_PARTS, PHONICS_WORDS } from "./bricksphonics-data.js";
import { speak, speakTimes, playClip, shuffle, randomItem, replay, confetti } from "./utils.js";

const stage = document.getElementById("bpStage");
const sectionsEl = document.getElementById("bpSections");
const gamesEl = document.getElementById("bpGames");
const ALPHA = "abcdefghijklmnopqrstuvwxyz".split("");

const LETTER_GAMES = [
  { id: "lflash",  label: "🃏 Flashcards" },
  { id: "lmatch",  label: "🎯 Match" },
  { id: "lmemory", label: "🧠 Memory" },
];
const WORD_GAMES = [
  { id: "wflash",  label: "🃏 Flashcards" },
  { id: "wmatch",  label: "🎯 Match" },
  { id: "wmemory", label: "🧠 Memory" },
  { id: "wspell",  label: "🔡 Spell" },
];

let section = 0; // 0-2 = alphabet parts, 3 = CVC words
let game = "lflash";

const isWords = () => section === 3;
const speakLetter = l => playClip(`audio/letter-${l.key}.mp3`, l.upper);

function picEl(w) {
  const d = document.createElement("div");
  d.className = "brick-pic";
  d.dataset.word = w.word;
  const img = document.createElement("img");
  img.src = `images/obj/${w.key}.png`;
  img.alt = w.word;
  img.addEventListener("error", () => d.classList.add("noimg"));
  d.appendChild(img);
  return d;
}

// ---------------- Letter flashcards ----------------
function letterFlash() {
  const letters = shuffle([...ALPHABET_PARTS[section].letters]);
  let i = 0;
  stage.innerHTML = `
    <div class="brick-flip-scene"><div class="brick-flip" id="bpFlip" tabindex="0">
      <div class="brick-face brick-front"><span class="bp-letter" id="bpUpper"></span></div>
      <div class="brick-face brick-back"><span class="bp-letter" id="bpLower"></span><button class="speak-btn" id="bpSpeak">🔊</button></div>
    </div></div>
    <div class="brick-controls"><button id="bpPrev">◀</button><span class="progress" id="bpProg"></span><button id="bpNext">▶</button><button id="bpShuf">🔀</button></div>
    <p class="keys">tap to flip · 🔊 hear the letter</p>`;
  const flip = stage.querySelector("#bpFlip");
  const show = () => {
    const l = letters[i];
    flip.classList.remove("flipped");
    stage.querySelector("#bpUpper").textContent = l.upper;
    stage.querySelector("#bpLower").textContent = l.lower;
    stage.querySelector("#bpProg").textContent = `${i + 1} / ${letters.length}`;
  };
  const move = d => { i = (i + d + letters.length) % letters.length; show(); };
  flip.addEventListener("click", () => { flip.classList.toggle("flipped"); speakLetter(letters[i]); });
  stage.querySelector("#bpSpeak").addEventListener("click", e => { e.stopPropagation(); speakLetter(letters[i]); });
  stage.querySelector("#bpPrev").addEventListener("click", () => move(-1));
  stage.querySelector("#bpNext").addEventListener("click", () => move(1));
  stage.querySelector("#bpShuf").addEventListener("click", () => { shuffle(letters); i = 0; show(); });
  show();
}

// ---------------- Letter match (hear a letter -> pick it) ----------------
function letterMatch() {
  const qs = shuffle([...ALPHABET_PARTS[section].letters]);
  let qi = 0, score = 0, locked = false;
  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="lmProg"></span><span class="match-stars" id="lmStars"></span>
      <button class="pill" id="lmHear">🔊 Hear it again</button></div>
    <div class="brick-match-stage" id="lmStage"><p class="match-question">🔊 Which letter do you hear?</p>
      <div class="bp-letter-options" id="lmOpts"></div></div>
    <div class="match-done hidden" id="lmDone"><div class="match-done-card">
      <p class="match-done-title" id="lmTitle"></p><p class="match-done-score" id="lmScore"></p>
      <button class="pill big" id="lmAgain">Play again 🎉</button></div></div>`;
  const optsEl = stage.querySelector("#lmOpts");
  const starsEl = stage.querySelector("#lmStars");
  const stars = () => starsEl.textContent = "⭐".repeat(score) + "☆".repeat(qs.length - score);
  function showQ() {
    const l = qs[qi];
    locked = false;
    const distractors = shuffle(ALPHABET.filter(x => x.key !== l.key)).slice(0, 3);
    const opts = shuffle([l, ...distractors]);
    optsEl.innerHTML = "";
    opts.forEach(o => {
      const b = document.createElement("button");
      b.className = "bp-letter-opt";
      b.textContent = o.upper;
      b.addEventListener("click", () => answer(b, o, l));
      optsEl.appendChild(b);
    });
    stage.querySelector("#lmProg").textContent = `${qi + 1} / ${qs.length}`;
    stars();
    replay(stage.querySelector("#lmStage"), "swap-in");
    setTimeout(() => speakLetter(l), 350);
  }
  function answer(b, o, l) {
    if (locked) return;
    if (o.key === l.key) {
      locked = true; score++; stars(); b.classList.add("correct"); speakLetter(l);
      optsEl.querySelectorAll("button").forEach(x => x.disabled = true);
      setTimeout(() => { qi++; qi < qs.length ? showQ() : finish(); }, 1100);
    } else { b.classList.add("wrong"); b.disabled = true; }
  }
  function finish() {
    stage.querySelector("#lmTitle").textContent = score === qs.length ? "Perfect! 🌟" : "Great job! 👏";
    stage.querySelector("#lmScore").textContent = `${score} / ${qs.length} first-try stars`;
    stage.querySelector("#lmDone").classList.remove("hidden");
    if (score === qs.length) confetti(stage.querySelector("#lmDone"));
  }
  stage.querySelector("#lmHear").addEventListener("click", () => speakLetter(qs[qi]));
  stage.querySelector("#lmAgain").addEventListener("click", letterMatch);
  showQ();
}

// ---------------- Letter memory (uppercase <-> lowercase) ----------------
function letterMemory() {
  const letters = ALPHABET_PARTS[section].letters;
  const tiles = shuffle(letters.flatMap(l => [
    { key: l.key, label: l.upper, cap: "U" },
    { key: l.key, label: l.lower, cap: "L" },
  ]));
  let open = [], lock = false, moves = 0, remaining = tiles.length;
  const cols = tiles.length <= 12 ? 4 : tiles.length <= 16 ? 4 : tiles.length <= 20 ? 5 : 6;
  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="lMoves">Moves: 0</span></div>
    <div class="brick-memory" id="lGrid" style="grid-template-columns:repeat(${cols},1fr)"></div>
    <div class="match-done hidden" id="lmemDone"><div class="match-done-card">
      <p class="match-done-title">🏆 Matched them all!</p><p class="match-done-score" id="lmemScore"></p>
      <button class="pill big" id="lmemAgain">Play again 🎉</button></div></div>`;
  const grid = stage.querySelector("#lGrid");
  const movesEl = stage.querySelector("#lMoves");
  tiles.forEach((t, n) => {
    const el = document.createElement("div");
    el.className = "brick-tile";
    el.style.animationDelay = `${n * 0.03}s`;
    el.innerHTML = `<div class="brick-tile-inner"><div class="brick-tile-face brick-tile-front">🔤</div><div class="brick-tile-face brick-tile-back"><span class="bp-tile-letter">${t.label}</span></div></div>`;
    el.addEventListener("click", () => flip(el, t));
    grid.appendChild(el);
  });
  function flip(el, t) {
    if (lock || el.classList.contains("open") || el.classList.contains("matched")) return;
    el.classList.add("open"); open.push({ el, t });
    if (open.length < 2) return;
    moves++; movesEl.textContent = `Moves: ${moves}`;
    const [a, b] = open; open = [];
    if (a.t.key === b.t.key && a.t.cap !== b.t.cap) {
      lock = true;
      setTimeout(() => {
        a.el.classList.add("matched"); b.el.classList.add("matched"); lock = false; remaining -= 2;
        if (remaining === 0) {
          stage.querySelector("#lmemScore").textContent = `Finished in ${moves} moves`;
          stage.querySelector("#lmemDone").classList.remove("hidden");
          confetti(stage.querySelector("#lmemDone"), 40);
        }
      }, 550);
    } else {
      lock = true;
      setTimeout(() => { a.el.classList.remove("open"); b.el.classList.remove("open"); lock = false; }, 850);
    }
  }
  stage.querySelector("#lmemAgain").addEventListener("click", letterMemory);
}

// ---------------- CVC word flashcards ----------------
function wordFlash() {
  const words = shuffle([...PHONICS_WORDS]);
  let i = 0;
  stage.innerHTML = `
    <div class="brick-flip-scene"><div class="brick-flip" id="wFlip" tabindex="0">
      <div class="brick-face brick-front"></div>
      <div class="brick-face brick-back"><div class="brick-word" id="wWord"></div><button class="speak-btn" id="wSpeak">🔊</button></div>
    </div></div>
    <div class="brick-controls"><button id="wPrev">◀</button><span class="progress" id="wProg"></span><button id="wNext">▶</button><button id="wShuf">🔀</button></div>
    <p class="keys">tap the card to flip</p>`;
  const flip = stage.querySelector("#wFlip");
  const front = stage.querySelector(".brick-front");
  const show = () => {
    const w = words[i];
    flip.classList.remove("flipped");
    front.innerHTML = ""; front.appendChild(picEl(w));
    stage.querySelector("#wWord").textContent = w.word;
    stage.querySelector("#wProg").textContent = `${i + 1} / ${words.length}`;
  };
  const move = d => { i = (i + d + words.length) % words.length; show(); };
  flip.addEventListener("click", () => { flip.classList.toggle("flipped"); if (flip.classList.contains("flipped")) speak(words[i].word); });
  stage.querySelector("#wSpeak").addEventListener("click", e => { e.stopPropagation(); speak(words[i].word); });
  stage.querySelector("#wPrev").addEventListener("click", () => move(-1));
  stage.querySelector("#wNext").addEventListener("click", () => move(1));
  stage.querySelector("#wShuf").addEventListener("click", () => { shuffle(words); i = 0; show(); });
  show();
}

// ---------------- CVC word match (hear -> pick word) ----------------
function wordMatch() {
  const pool = PHONICS_WORDS;
  const qs = shuffle([...pool]);
  let qi = 0, score = 0, firstTry = true, locked = false;
  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="wmProg"></span><span class="match-stars" id="wmStars"></span>
      <button class="pill" id="wmHear">🔊 Hear it again</button></div>
    <div class="brick-match-stage" id="wmStage"><p class="match-question">🔊 Which word do you hear?</p>
      <div class="brick-options" id="wmOpts"></div></div>
    <div class="match-done hidden" id="wmDone"><div class="match-done-card">
      <p class="match-done-title" id="wmTitle"></p><p class="match-done-score" id="wmScore"></p>
      <button class="pill big" id="wmAgain">Play again 🎉</button></div></div>`;
  const optsEl = stage.querySelector("#wmOpts");
  const starsEl = stage.querySelector("#wmStars");
  const stars = () => starsEl.textContent = "⭐".repeat(score) + "☆".repeat(qs.length - score);
  function showQ() {
    const w = qs[qi]; firstTry = true; locked = false;
    const opts = shuffle([w, ...shuffle(pool.filter(x => x.key !== w.key)).slice(0, 3)]);
    optsEl.innerHTML = "";
    opts.forEach(o => {
      const b = document.createElement("button"); b.className = "brick-option"; b.textContent = o.word;
      b.addEventListener("click", () => answer(b, o, w)); optsEl.appendChild(b);
    });
    stage.querySelector("#wmProg").textContent = `${qi + 1} / ${qs.length}`;
    stars();
    replay(stage.querySelector("#wmStage"), "swap-in");
    setTimeout(() => speakTimes(w.word, 2), 350);
  }
  function answer(b, o, w) {
    if (locked) return;
    if (o.key === w.key) {
      locked = true; if (firstTry) score++; stars(); b.classList.add("correct"); speak(w.word);
      optsEl.querySelectorAll("button").forEach(x => x.disabled = true);
      setTimeout(() => { qi++; qi < qs.length ? showQ() : finish(); }, 1100);
    } else { firstTry = false; b.classList.add("wrong"); b.disabled = true; }
  }
  function finish() {
    stage.querySelector("#wmTitle").textContent = score === qs.length ? "Perfect! 🌟" : "Great job! 👏";
    stage.querySelector("#wmScore").textContent = `${score} / ${qs.length} first-try stars`;
    stage.querySelector("#wmDone").classList.remove("hidden");
    if (score === qs.length) confetti(stage.querySelector("#wmDone"));
  }
  stage.querySelector("#wmHear").addEventListener("click", () => speakTimes(qs[qi].word, 2));
  stage.querySelector("#wmAgain").addEventListener("click", wordMatch);
  showQ();
}

// ---------------- CVC word memory (picture <-> word) ----------------
function wordMemory() {
  const words = shuffle([...PHONICS_WORDS]).slice(0, 8);
  const tiles = shuffle(words.flatMap(w => [{ ...w, type: "pic" }, { ...w, type: "word" }]));
  let open = [], lock = false, moves = 0, remaining = tiles.length;
  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="wMoves">Moves: 0</span></div>
    <div class="brick-memory" id="wGrid" style="grid-template-columns:repeat(4,1fr)"></div>
    <div class="match-done hidden" id="wmemDone"><div class="match-done-card">
      <p class="match-done-title">🏆 Matched them all!</p><p class="match-done-score" id="wmemScore"></p>
      <button class="pill big" id="wmemAgain">Play again 🎉</button></div></div>`;
  const grid = stage.querySelector("#wGrid");
  const movesEl = stage.querySelector("#wMoves");
  tiles.forEach((t, n) => {
    const el = document.createElement("div");
    el.className = "brick-tile";
    el.style.animationDelay = `${n * 0.04}s`;
    const back = t.type === "pic"
      ? `<div class="brick-tile-pic" data-word="${t.word}"><img src="images/obj/${t.key}.png" alt="" onerror="this.parentElement.classList.add('noimg')"></div>`
      : `<span class="brick-tile-word">${t.word}</span>`;
    el.innerHTML = `<div class="brick-tile-inner"><div class="brick-tile-face brick-tile-front">🔤</div><div class="brick-tile-face brick-tile-back">${back}</div></div>`;
    el.addEventListener("click", () => flip(el, t));
    grid.appendChild(el);
  });
  function flip(el, t) {
    if (lock || el.classList.contains("open") || el.classList.contains("matched")) return;
    el.classList.add("open"); open.push({ el, t });
    if (open.length < 2) return;
    moves++; movesEl.textContent = `Moves: ${moves}`;
    const [a, b] = open; open = [];
    if (a.t.key === b.t.key && a.t.type !== b.t.type) {
      speak(a.t.word); lock = true;
      setTimeout(() => {
        a.el.classList.add("matched"); b.el.classList.add("matched"); lock = false; remaining -= 2;
        if (remaining === 0) {
          stage.querySelector("#wmemScore").textContent = `Finished in ${moves} moves`;
          stage.querySelector("#wmemDone").classList.remove("hidden");
          confetti(stage.querySelector("#wmemDone"), 40);
        }
      }, 600);
    } else {
      lock = true;
      setTimeout(() => { a.el.classList.remove("open"); b.el.classList.remove("open"); lock = false; }, 900);
    }
  }
  stage.querySelector("#wmemAgain").addEventListener("click", wordMemory);
}

// ---------------- CVC word spell ----------------
function wordSpell() {
  const words = shuffle([...PHONICS_WORDS]);
  let qi = 0, score = 0, slots = [], tiles = [], locked = false;
  stage.innerHTML = `
    <div class="brick-top"><span class="match-progress" id="spProg"></span><span class="match-stars" id="spStars"></span></div>
    <p class="match-question">🔊 Listen and build the word!</p>
    <div class="brick-spell-pic" id="spPic"></div>
    <div class="brick-solved" id="spSolved"></div>
    <div class="build-slots" id="spSlots"></div>
    <div class="build-pool" id="spPool"></div>
    <button class="pill" id="spClear">⌫ Clear</button>
    <div class="match-done hidden" id="spDone"><div class="match-done-card">
      <p class="match-done-title" id="spTitle"></p><p class="match-done-score" id="spScore"></p>
      <button class="pill big" id="spAgain">Play again 🎉</button></div></div>`;
  const picWrap = stage.querySelector("#spPic");
  const slotsEl = stage.querySelector("#spSlots");
  const poolEl = stage.querySelector("#spPool");
  const solvedEl = stage.querySelector("#spSolved");
  const starsEl = stage.querySelector("#spStars");
  const stars = () => starsEl.textContent = "⭐".repeat(score) + "☆".repeat(words.length - score);
  function newWord() {
    const w = words[qi]; locked = false;
    const letters = w.word.split("");
    const extra = shuffle(ALPHA.filter(l => !letters.includes(l))).slice(0, 2);
    tiles = shuffle([...letters, ...extra]).map((letter, id) => ({ id, letter, used: false }));
    slots = Array(letters.length).fill(null);
    solvedEl.textContent = ""; solvedEl.className = "brick-solved";
    picWrap.innerHTML = ""; picWrap.appendChild(picEl(w));
    stage.querySelector("#spProg").textContent = `${qi + 1} / ${words.length}`;
    stars(); draw();
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
    const t = tiles.find(x => x.id === id); const slot = slots.indexOf(null);
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
      solvedEl.textContent = words[qi].word; solvedEl.classList.add("show"); speak(words[qi].word);
      setTimeout(() => { qi++; qi < words.length ? newWord() : finish(); }, 1300);
    } else {
      slotsEl.querySelectorAll(".letter-slot").forEach(s => { s.classList.add("wrong"); s.addEventListener("animationend", () => s.classList.remove("wrong"), { once: true }); });
    }
  }
  function finish() {
    stage.querySelector("#spTitle").textContent = score === words.length ? "Spelling star! 🌟" : "Great work! 👏";
    stage.querySelector("#spScore").textContent = `${score} / ${words.length} words built`;
    stage.querySelector("#spDone").classList.remove("hidden");
    if (score === words.length) confetti(stage.querySelector("#spDone"));
  }
  stage.querySelector("#spClear").addEventListener("click", () => {
    if (locked) return;
    tiles.forEach(t => t.used = false); slots = slots.map(() => null);
    solvedEl.textContent = ""; solvedEl.className = "brick-solved"; draw();
  });
  stage.querySelector("#spAgain").addEventListener("click", wordSpell);
  newWord();
}

// ---------------- Shell / navigation ----------------
const RENDERERS = {
  lflash: letterFlash, lmatch: letterMatch, lmemory: letterMemory,
  wflash: wordFlash, wmatch: wordMatch, wmemory: wordMemory, wspell: wordSpell,
};

function buildGameButtons() {
  const list = isWords() ? WORD_GAMES : LETTER_GAMES;
  if (!list.some(g => g.id === game)) game = list[0].id;
  gamesEl.innerHTML = "";
  list.forEach(g => {
    const b = document.createElement("button");
    b.textContent = g.label; b.dataset.game = g.id;
    b.addEventListener("click", () => { game = g.id; render(); });
    gamesEl.appendChild(b);
  });
}

function render() {
  [...sectionsEl.children].forEach(b => b.classList.toggle("active", +b.dataset.section === section));
  buildGameButtons();
  [...gamesEl.children].forEach(b => b.classList.toggle("active", b.dataset.game === game));
  RENDERERS[game]();
}

export function refreshBricksPhonics() { render(); }

export function initBricksPhonics() {
  ALPHABET_PARTS.forEach((p, i) => {
    const b = document.createElement("button");
    b.textContent = `🔤 ${p.name}`; b.dataset.section = i;
    b.addEventListener("click", () => { section = i; game = "lflash"; render(); });
    sectionsEl.appendChild(b);
  });
  const wb = document.createElement("button");
  wb.textContent = "🧱 CVC Words"; wb.dataset.section = 3;
  wb.addEventListener("click", () => { section = 3; game = "wflash"; render(); });
  sectionsEl.appendChild(wb);

  section = 0; game = "lflash";
  render();
}
