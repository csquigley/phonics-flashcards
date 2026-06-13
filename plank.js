// Walk the Plank: hear a word, pick its picture from 3 options.
// A flock of seagulls flies in a little closer EVERY turn (10 turns to reach
// you -> you escape). Each WRONG answer steps the pirate further out the plank;
// 5 wrong and he falls off the end. It's a race: survive to the flock or fall.
import { CARDS } from "./cards.js";
import { speak, highlight, shuffle, randomItem, imagePath, replay, confetti } from "./utils.js";

const TURNS_TO_RESCUE = 10; // flock advances once per turn and arrives at 10
const MAX_WRONG = 5;        // 5 wrong answers and the pirate falls off

// Scene positions (percent), tuned to the perspective plank in
// images/plank_scene.png. The plank runs from the ship's centre rail (far,
// small) down toward the viewer (near, big); each wrong answer walks the
// pirate further out and scales him UP.
const KID = {
  startL: 42, endL: 73,   // left %: centre rail -> near tip
  startT: 50, endT: 64,   // top %:  higher (far) -> lower (near)
  startS: 0.5, endS: 1.15, // scale:  small (far) -> big (near)
};
// The flock starts far away in the top-right corner (tiny) and homes in on the
// pirate's current spot, growing as it nears.
const FLOCK_START = { L: 95, T: 8, S: 0.22 };
const PIRATE_FRAMES = ["images/pirate_1.png", "images/pirate_2.png", "images/pirate_3.png"];

const scene = document.getElementById("plankScene");
const walker = document.getElementById("walker");
const walkerImg = document.getElementById("walkerImg");
const flockEl = document.getElementById("flock");
const carriedEl = document.getElementById("carried");
const splash = document.getElementById("splash");
const optionsEl = document.getElementById("plankOptions");
const progressEl = document.getElementById("plankProgress");
const revealEl = document.getElementById("plankReveal");
const doneEl = document.getElementById("plankDone");
const doneTitle = document.getElementById("plankDoneTitle");
const doneScore = document.getElementById("plankDoneScore");

let current = null;   // current question
let turn = 0;         // total answers given -> drives the flock
let wrong = 0;        // wrong answers -> walks the pirate out
let answered = false; // question resolved, waiting for next
let over = false;

// Flat pool of every {card, word} so we can pull distractors.
const ALL = CARDS.flatMap(c => c.words.map(w => ({ card: c, word: w.word })));

// One question: a target word plus 2 distractor pictures. Distractors prefer
// the SAME sound family (cake vs gate vs snake) so the child must hear the
// whole word, not just the first sound.
function buildQuestion() {
  const card = randomItem(CARDS);
  const word = randomItem(card.words).word;
  const sameSound = ALL.filter(x => x.card.sound === card.sound && x.word !== word);
  let pool = shuffle(sameSound);
  if (pool.length < 2) pool = shuffle(ALL.filter(x => x.word !== word));
  // dedupe distractor words and keep two
  const seen = new Set([word]);
  const distractors = [];
  for (const x of pool) {
    if (seen.has(x.word)) continue;
    seen.add(x.word);
    distractors.push(x);
    if (distractors.length === 2) break;
  }
  return {
    target: { card, word },
    items: shuffle([{ card, word, correct: true },
                    ...distractors.map(d => ({ ...d, correct: false }))]),
  };
}

function lerp(a, b, p) { return a + (b - a) * p; }

function positions() {
  const t = wrong / MAX_WRONG;
  const kidL = lerp(KID.startL, KID.endL, t);
  const kidT = lerp(KID.startT, KID.endT, t);
  walker.style.left = `${kidL}%`;
  walker.style.top = `${kidT}%`;
  walker.style.transform = `scale(${lerp(KID.startS, KID.endS, t)})`;
  // Flock homes in on the pirate's current position as the turns tick down.
  const p = turn / TURNS_TO_RESCUE;
  flockEl.style.left = `${lerp(FLOCK_START.L, kidL, p)}%`;
  flockEl.style.top = `${lerp(FLOCK_START.T, kidT, p)}%`;
  flockEl.style.transform = `translateX(-50%) scale(${lerp(FLOCK_START.S, 1, p)})`;
}

function updateProgress() {
  progressEl.textContent = `🐦 ${turn}/${TURNS_TO_RESCUE}  •  🚶 ${wrong}/${MAX_WRONG}`;
}

// Cycle the pirate's stride and play a little walk bounce.
let frame = 0;
function takeStep() {
  frame = (frame + 1) % PIRATE_FRAMES.length;
  walkerImg.src = PIRATE_FRAMES[frame];
  replay(walkerImg, "stepping");
}

function renderQuestion() {
  answered = false;
  current = buildQuestion();
  optionsEl.innerHTML = "";
  current.items.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "plank-option";
    btn.innerHTML = `<img src="${imagePath(item.card.id, item.word)}" alt="option">`;
    btn.addEventListener("click", () => answer(btn, item));
    optionsEl.appendChild(btn);
  });
  revealEl.className = "plank-reveal";
  revealEl.innerHTML = "";
  updateProgress();
  replay(optionsEl, "swap-in");
  setTimeout(() => speak(current.target.word), 450);
}

// One guess per question: reveal the right picture either way, then move on.
function answer(btn, item) {
  if (answered || over) return;
  answered = true;
  const buttons = [...optionsEl.children];
  buttons.forEach(b => (b.disabled = true));
  // always show which picture was correct
  const correctIdx = current.items.findIndex(x => x.correct);
  buttons[correctIdx].classList.add("correct");
  speak(current.target.word); // say the answer aloud

  // The flock advances every turn, no matter the answer.
  turn++;
  const labelled = highlight(current.target.word, current.target.card.grapheme);
  if (item.correct) {
    positions();
    revealEl.className = "plank-reveal right show";
    revealEl.innerHTML = `✅ Yes! It was <b>${labelled}</b>`;
  } else {
    btn.classList.add("wrong");
    wrong++;
    positions();
    takeStep(); // a step further out the plank, toward us
    walkerImg.classList.add("wobble");
    setTimeout(() => walkerImg.classList.remove("wobble"), 500);
    revealEl.className = "plank-reveal wrong show";
    revealEl.innerHTML = `❌ It was <b>${labelled}</b>`;
  }
  updateProgress();

  // Falling off takes priority; otherwise the flock arriving means escape.
  if (wrong >= MAX_WRONG) return lose();
  if (turn >= TURNS_TO_RESCUE) return win();
  setTimeout(renderQuestion, item.correct ? 1500 : 1900);
}

function win() {
  over = true;
  speak("You escaped!");
  // Swap the pirate + flock for the combined "carried away" sprite at the
  // pirate's current spot, then let it soar up and off the top of the scene.
  const t = wrong / MAX_WRONG;
  carriedEl.style.left = `${lerp(KID.startL, KID.endL, t)}%`;
  carriedEl.style.top = `${lerp(KID.startT, KID.endT, t) - 26}%`;
  walker.classList.add("hidden");
  flockEl.classList.add("hidden");
  carriedEl.classList.remove("hidden");
  replay(carriedEl, "flyaway");
  setTimeout(() => {
    doneTitle.textContent = "🐦 You escaped! 🎉";
    const slips = MAX_WRONG - wrong;
    doneScore.textContent = `The seagulls carried you off with ${slips} slip${slips === 1 ? "" : "s"} to spare!`;
    doneEl.classList.remove("hidden");
    confetti(doneEl);
  }, 1700);
}

function lose() {
  over = true;
  answered = true;
  optionsEl.querySelectorAll("button").forEach(b => (b.disabled = true));
  walker.classList.add("fall");
  splash.classList.remove("hidden");
  replay(splash, "splashing");
  setTimeout(() => {
    doneTitle.textContent = "💦 Splash!";
    doneScore.textContent = `You fell off! The flock was ${TURNS_TO_RESCUE - turn} turn${TURNS_TO_RESCUE - turn === 1 ? "" : "s"} away. Try again!`;
    doneEl.classList.remove("hidden");
  }, 1100);
}

export function newPlankGame() {
  turn = 0;
  wrong = 0;
  over = false;
  frame = 0;
  walker.classList.remove("fall", "rescued", "hidden");
  walkerImg.classList.remove("wobble", "stepping");
  walkerImg.src = PIRATE_FRAMES[0];
  flockEl.classList.remove("hidden");
  carriedEl.classList.add("hidden");
  carriedEl.classList.remove("flyaway");
  splash.classList.add("hidden");
  doneEl.classList.add("hidden");
  revealEl.className = "plank-reveal";
  revealEl.innerHTML = "";
  positions();
  renderQuestion();
}

export function initPlank() {
  document.getElementById("plankReset").addEventListener("click", newPlankGame);
  document.getElementById("plankAgain").addEventListener("click", newPlankGame);
  document.getElementById("plankSpeak").addEventListener("click", () => {
    if (current) speak(current.target.word);
  });
  newPlankGame();
}
