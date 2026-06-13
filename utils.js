// Shared helpers for the flashcards and games.

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

export function speak(text) {
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
