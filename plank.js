// Walk the Plank: hear a word, pick its picture from 3 options.
// Wrong = the kid steps further out the plank. Right = the whale swims
// closer to the rescue. Whale arrives first -> saved. Kid falls off -> splash.
import { CARDS } from "./cards.js";
import { speak, shuffle, randomItem, imagePath, replay, confetti } from "./utils.js";

const STEPS = 6; // 6 correct rescues you; 6 wrong walks you off the end

// Scene positions (percent), tuned to the perspective plank in
// images/plank_scene.png. The plank runs from the ship (upper, far, small)
// down toward the viewer (lower-right, near, big), so as the pirate walks out
// he moves right + down and scales UP. The whale swims in toward the near end.
const KID = {
  startL: 47, endL: 76,   // left %: ship end -> near tip
  startT: 44, endT: 66,   // top %:  higher (far) -> lower (near)
  startS: 0.55, endS: 1.15, // scale:  small (far) -> big (near)
};
const WHALE_START = 90, WHALE_END = 72;
const PIRATE_FRAMES = ["images/pirate_1.png", "images/pirate_2.png", "images/pirate_3.png"];

const scene = document.getElementById("plankScene");
const walker = document.getElementById("walker");
const walkerImg = document.getElementById("walkerImg");
const whaleEl = document.getElementById("whale");
const splash = document.getElementById("splash");
const optionsEl = document.getElementById("plankOptions");
const progressEl = document.getElementById("plankProgress");
const doneEl = document.getElementById("plankDone");
const doneTitle = document.getElementById("plankDoneTitle");
const doneScore = document.getElementById("plankDoneScore");

let current = null;   // current question
let correct = 0;      // whale's progress
let wrong = 0;        // kid's progress along the plank
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

function positions() {
  const t = wrong / STEPS;
  walker.style.left = `${KID.startL + (KID.endL - KID.startL) * t}%`;
  walker.style.top = `${KID.startT + (KID.endT - KID.startT) * t}%`;
  walker.style.transform = `scale(${KID.startS + (KID.endS - KID.startS) * t})`;
  whaleEl.style.left = `${WHALE_START - (WHALE_START - WHALE_END) * (correct / STEPS)}%`;
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
  progressEl.textContent = `🐳 ${correct}/${STEPS}  •  🚶 ${wrong}/${STEPS}`;
  replay(optionsEl, "swap-in");
  setTimeout(() => speak(current.target.word), 450);
}

function answer(btn, item) {
  if (answered || over) return;
  if (item.correct) {
    answered = true;
    btn.classList.add("correct");
    correct++;
    positions();
    progressEl.textContent = `🐳 ${correct}/${STEPS}  •  🚶 ${wrong}/${STEPS}`;
    optionsEl.querySelectorAll("button").forEach(b => (b.disabled = true));
    if (correct >= STEPS) return win();
    setTimeout(renderQuestion, 1100);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    wrong++;
    positions();
    takeStep(); // a step further out the plank, toward us
    walkerImg.classList.add("wobble");
    setTimeout(() => walkerImg.classList.remove("wobble"), 500);
    progressEl.textContent = `🐳 ${correct}/${STEPS}  •  🚶 ${wrong}/${STEPS}`;
    if (wrong >= STEPS) lose();
  }
}

function win() {
  over = true;
  speak("You are rescued!");
  // hop the pirate onto the whale at the near end of the plank
  walker.style.left = `${WHALE_END + 1}%`;
  walker.style.top = "60%";
  walker.style.transform = "scale(1.05)";
  walker.classList.add("rescued");
  setTimeout(() => {
    doneTitle.textContent = "🐳 Rescued! 🎉";
    doneScore.textContent = `The whale reached you with ${wrong} slip${wrong === 1 ? "" : "s"} to spare!`;
    doneEl.classList.remove("hidden");
    confetti(doneEl);
  }, 900);
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
    doneScore.textContent = `You walked the plank! The whale got ${correct}/${STEPS} of the way. Try again!`;
    doneEl.classList.remove("hidden");
  }, 1100);
}

export function newPlankGame() {
  correct = 0;
  wrong = 0;
  over = false;
  frame = 0;
  walker.classList.remove("fall", "rescued");
  walkerImg.classList.remove("wobble", "stepping");
  walkerImg.src = PIRATE_FRAMES[0];
  splash.classList.add("hidden");
  doneEl.classList.add("hidden");
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
