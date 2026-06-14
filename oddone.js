// Odd-one-out game: three pictures, two share a sound, one doesn't.
// Click the one with the different sound.
import { CARDS } from "./cards.js";
import { wordMatches, highlight, speak, speakTimes, speakSequence, shuffle, randomItem, imagePath, replay, confetti } from "./utils.js";

const ROUND_SIZE = 8;

const stage = document.getElementById("oddStage");
const imagesEl = document.getElementById("oddImages");
const progressEl = document.getElementById("oddProgress");
const starsEl = document.getElementById("oddStars");
const doneEl = document.getElementById("oddDone");
const doneTitle = document.getElementById("oddDoneTitle");
const doneScore = document.getElementById("oddDoneScore");

let questions = [];
let qIndex = 0;
let score = 0;
let firstTry = true;
let answered = false;

// All spellings of a phoneme family — "long a" covers a_e, ai AND ay, so an
// odd word can't sneak the pair's sound in through a different spelling
// (e.g. pair = ee but odd word "sheep" would still contain the long-e sound).
function graphemesOfSound(sound) {
  return CARDS.filter(c => c.sound === sound).map(c => c.grapheme);
}

function buildQuestion() {
  for (let tries = 0; tries < 50; tries++) {
    const pair = randomItem(CARDS);
    const odd = randomItem(CARDS.filter(c => c.sound !== pair.sound));
    const pairFamily = graphemesOfSound(pair.sound);
    const oddFamily = graphemesOfSound(odd.sound);
    const oddWords = odd.words.filter(w =>
      !pairFamily.some(g => wordMatches(w.word, g)));
    const pairWords = shuffle(pair.words.filter(w =>
      !oddFamily.some(g => wordMatches(w.word, g))));
    if (!oddWords.length || pairWords.length < 2) continue;
    return {
      items: shuffle([
        { card: pair, word: pairWords[0].word, odd: false },
        { card: pair, word: pairWords[1].word, odd: false },
        { card: odd, word: randomItem(oddWords).word, odd: true },
      ]),
    };
  }
  return null;
}

function buildRound() {
  const qs = [];
  while (qs.length < ROUND_SIZE) {
    const q = buildQuestion();
    if (q) qs.push(q);
  }
  return qs;
}

function renderStars() {
  starsEl.textContent = "⭐".repeat(score) + "☆".repeat(questions.length - score);
}

function renderQuestion() {
  const q = questions[qIndex];
  firstTry = true;
  answered = false;
  imagesEl.classList.remove("revealed");
  imagesEl.innerHTML = "";
  q.items.forEach(item => {
    const fig = document.createElement("figure");
    fig.className = "odd-item";
    // No word shown — this is a listening task. A speaker button replays this
    // picture's word; the caption only fills in after the answer.
    fig.innerHTML = `
      <div class="odd-pic">
        <img src="${imagePath(item.card.id, item.word)}" alt="${item.word}">
        <button class="odd-hear" title="Hear this word">🔊</button>
      </div>
      <figcaption class="odd-caption"></figcaption>`;
    fig.querySelector(".odd-hear").addEventListener("click", e => {
      e.stopPropagation(); // don't select when just listening
      speakTimes(item.word, 3);
    });
    fig.addEventListener("click", () => answer(fig, item));
    imagesEl.appendChild(fig);
  });
  progressEl.textContent = `${qIndex + 1} / ${questions.length}`;
  renderStars();
  replay(stage, "swap-in");
  hearAll(); // play the three words in sequence on load
}

// Play all three words once, in order, with a pause between.
function hearAll() {
  setTimeout(() => speakSequence(questions[qIndex].items.map(it => it.word), 650), 350);
}

function answer(fig, item) {
  if (answered) return;
  if (item.odd) {
    answered = true;
    fig.classList.add("correct");
    if (firstTry) score++;
    renderStars();
    speak(item.word);
    // highlight the grapheme in every word so the sounds can be compared
    const figs = imagesEl.querySelectorAll(".odd-item .odd-caption");
    q.items.forEach((it, i) => {
      figs[i].innerHTML = highlight(it.word, it.card.grapheme);
    });
    imagesEl.classList.add("revealed");
    setTimeout(() => {
      qIndex++;
      qIndex < questions.length ? renderQuestion() : finish();
    }, 1800);
  } else {
    firstTry = false;
    fig.classList.add("wrong");
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

export function newOddRound() {
  questions = buildRound();
  qIndex = 0;
  score = 0;
  doneEl.classList.add("hidden");
  imagesEl.classList.remove("revealed");
  renderQuestion();
}

export function initOdd() {
  document.getElementById("oddReset").addEventListener("click", newOddRound);
  document.getElementById("oddAgain").addEventListener("click", newOddRound);
  document.getElementById("oddHear").addEventListener("click", hearAll);
  newOddRound();
}
