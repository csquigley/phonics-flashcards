// Walk the Plank: hear a word, pick its picture from 3 options.
// Wrong = the kid steps further out the plank. Right = the whale swims
// closer to the rescue. Whale arrives first -> saved. Kid falls off -> splash.
import { CARDS } from "./cards.js";
import { speak, shuffle, randomItem, imagePath, replay, confetti } from "./utils.js";

const STEPS = 6; // 6 correct rescues you; 6 wrong walks you off the end

// Scene positions (percent across the scene), tuned to the drawn plank in
// images/plank_scene.png. Kid walks the plank left->right toward the open
// tip; whale swims in the water right->left toward the tip to rescue.
const KID_START = 42, KID_END = 86;
const WHALE_START = 90, WHALE_END = 72;

const scene = document.getElementById("plankScene");
const walker = document.getElementById("walker");
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
  walker.style.left = `${KID_START + (KID_END - KID_START) * (wrong / STEPS)}%`;
  whaleEl.style.left = `${WHALE_START - (WHALE_START - WHALE_END) * (correct / STEPS)}%`;
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
    walker.classList.add("wobble");
    setTimeout(() => walker.classList.remove("wobble"), 500);
    progressEl.textContent = `🐳 ${correct}/${STEPS}  •  🚶 ${wrong}/${STEPS}`;
    if (wrong >= STEPS) lose();
  }
}

function win() {
  over = true;
  speak("You are rescued!");
  // hop the kid onto the whale
  walker.style.left = `${WHALE_START - (WHALE_START - WHALE_END)}%`;
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
  walker.classList.remove("fall", "rescued");
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
