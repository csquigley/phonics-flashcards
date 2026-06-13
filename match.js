// Match game: see a picture, choose the sound you hear from 4 large options.
import { CARDS } from "./cards.js";
import { wordMatches, highlight, speak, shuffle, randomItem, imagePath, replay, confetti } from "./utils.js";

const ROUND_SIZE = 8;
const OPTION_COUNT = 4;

const stage = document.getElementById("matchStage");
const imageEl = document.getElementById("matchImage");
const wordEl = document.getElementById("matchWord");
const optionsEl = document.getElementById("matchOptions");
const progressEl = document.getElementById("matchProgress");
const starsEl = document.getElementById("matchStars");
const doneEl = document.getElementById("matchDone");
const doneTitle = document.getElementById("matchDoneTitle");
const doneScore = document.getElementById("matchDoneScore");

let questions = [];
let qIndex = 0;
let score = 0;
let firstTry = true;
let locked = false;

// A question is a (sound, word) plus 3 distractor sounds whose graphemes
// do NOT appear in the word — so only one option can be right.
function buildRound() {
  const sounds = shuffle([...CARDS]).slice(0, ROUND_SIZE);
  return sounds.map(card => {
    const word = randomItem(card.words).word;
    const distractors = shuffle(
      CARDS.filter(o => o.id !== card.id && !wordMatches(word, o.grapheme))
    ).slice(0, OPTION_COUNT - 1);
    return { card, word, options: shuffle([card, ...distractors]) };
  });
}

function renderStars() {
  starsEl.textContent = "⭐".repeat(score) + "☆".repeat(questions.length - score);
}

function renderQuestion() {
  const q = questions[qIndex];
  firstTry = true;
  locked = false;
  imageEl.src = imagePath(q.card.id, q.word);
  imageEl.alt = q.word;
  wordEl.textContent = q.word; // show the word (plain — sound not given away yet)
  wordEl.classList.remove("revealed");
  optionsEl.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "match-option";
    btn.textContent = opt.display;
    btn.addEventListener("click", () => answer(btn, opt, q));
    optionsEl.appendChild(btn);
  });
  progressEl.textContent = `${qIndex + 1} / ${questions.length}`;
  renderStars();
  replay(stage, "swap-in");
}

function answer(btn, opt, q) {
  if (locked) return;
  if (opt.id === q.card.id) {
    locked = true;
    btn.classList.add("correct");
    if (firstTry) score++;
    renderStars();
    wordEl.innerHTML = highlight(q.word, q.card.grapheme); // now reveal the sound
    wordEl.classList.add("revealed");
    speak(q.word);
    optionsEl.querySelectorAll("button").forEach(b => (b.disabled = true));
    setTimeout(() => {
      qIndex++;
      qIndex < questions.length ? renderQuestion() : finish();
    }, 1300);
  } else {
    firstTry = false;
    btn.classList.add("wrong");
    btn.disabled = true;
  }
}

function finish() {
  doneTitle.textContent =
    score === questions.length ? "Perfect! 🌟" :
    score >= questions.length / 2 ? "Great job! 👏" : "Good try! 💪";
  doneScore.textContent = `${score} / ${questions.length} first-try stars`;
  doneEl.classList.remove("hidden");
  if (score === questions.length) confetti(doneEl);
}

export function newMatchRound() {
  questions = buildRound();
  qIndex = 0;
  score = 0;
  doneEl.classList.add("hidden");
  renderQuestion();
}

export function initMatch() {
  document.getElementById("matchReset").addEventListener("click", newMatchRound);
  document.getElementById("matchAgain").addEventListener("click", newMatchRound);
  newMatchRound();
}
