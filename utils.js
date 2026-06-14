// Shared helpers for the flashcards and games.
import { CARDS } from "./cards.js";

// Words we have a pre-recorded ElevenLabs clip for (audio/<word>.mp3).
const AUDIO_WORDS = new Set(CARDS.flatMap(c => c.words.map(w => w.word)));

// Pre-recorded clips for whole phrases (keyed by lowercased text).
const PHRASES = {
  "you did it! you escaped!": "audio/escaped.mp3",
};

// Does this word contain the grapheme? Split digraphs (a_e) match
// vowel ... final e; everything else is a substring check.
export function wordMatches(word, grapheme) {
  if (grapheme.includes("_")) {
    const [v, e] = grapheme.split("_");
    return new RegExp(`${v}\\w*${e}$`).test(word);
  }
  return word.includes(grapheme);
}

// Highlight the grapheme inside a word, e.g. "rain" + "ai" -> r<span>ai</span>n.
export function highlight(word, grapheme) {
  if (grapheme.includes("_")) {
    const [v, e] = grapheme.split("_");
    const re = new RegExp(`(${v})(\\w*)(${e})$`);
    if (re.test(word)) {
      return word.replace(re, '<span class="hl">$1</span>$2<span class="hl">$3</span>');
    }
  }
  if (word.includes(grapheme)) {
    return word.replace(grapheme, `<span class="hl">${grapheme}</span>`);
  }
  return word;
}

let currentAudio = null;
let seqToken = 0; // bumped to cancel any in-flight sequence

function srcForKey(key) {
  if (AUDIO_WORDS.has(key)) return `audio/${key}.mp3`;
  return PHRASES[key] || null;
}

function stopAll() {
  seqToken++; // invalidate any running sequence
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

// Play a word once: use the recorded ElevenLabs clip when we have one, else
// fall back to the browser's speech synth (used for phrases like "You escaped!").
export function speak(text) {
  stopAll();
  const src = srcForKey(String(text).toLowerCase().trim());
  if (src) {
    currentAudio = new Audio(src);
    currentAudio.play().catch(() => synthSpeak(text)); // fall back if blocked
    return;
  }
  synthSpeak(text);
}

// Play a list of words/phrases in order, each separated by `gap` ms. Waits for
// each clip to finish before pausing then starting the next. Cancels any
// previous sequence (or single speak) so they never overlap.
export function speakSequence(items, gap = 500) {
  stopAll();
  const token = seqToken;
  let i = 0;
  const next = () => {
    if (token !== seqToken || i >= items.length) return;
    const text = items[i++];
    const src = srcForKey(String(text).toLowerCase().trim());
    const after = () => { if (token === seqToken) setTimeout(next, gap); };
    if (src) {
      currentAudio = new Audio(src);
      currentAudio.addEventListener("ended", after, { once: true });
      currentAudio.addEventListener("error", after, { once: true });
      currentAudio.play().catch(after);
    } else if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8;
      u.onend = after;
      speechSynthesis.speak(u);
    } else {
      after();
    }
  };
  next();
}

// Play the same word `n` times with a pause between each.
export function speakTimes(text, n = 3, gap = 500) {
  speakSequence(Array(n).fill(text), gap);
}

function synthSpeak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.8;
  speechSynthesis.speak(u);
}

// Re-trigger a CSS animation by removing and re-adding its class.
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow so the animation restarts
  el.classList.add(cls);
}

// In-place Fisher–Yates shuffle; returns the array.
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function imagePath(cardId, word) {
  return `images/${cardId}_${word}.png`;
}

// Emoji confetti burst for celebrations.
export function confetti(container, count = 36) {
  const emoji = ["🎉", "⭐", "🌟", "🎈", "✨", "💛", "💜"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = randomItem(emoji);
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDuration = `${1.6 + Math.random() * 1.8}s`;
    s.style.animationDelay = `${Math.random() * 0.6}s`;
    s.style.fontSize = `${1 + Math.random() * 1.6}rem`;
    container.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
}
