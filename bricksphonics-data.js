// Bricks Phonics — the alphabet split into three parts plus a set of CVC words.
// Each letter has a keyword animal/object (used for its illustrated card).
const KEYWORDS = {
  a: "apple", b: "bear", c: "cat", d: "dog", e: "elephant", f: "fish",
  g: "goat", h: "horse", i: "igloo", j: "jellyfish", k: "kite", l: "lion",
  m: "monkey", n: "nest", o: "octopus", p: "pig", q: "queen", r: "rabbit",
  s: "sun", t: "tiger", u: "umbrella", v: "violin", w: "whale",
  x: "xylophone", y: "yo-yo", z: "zebra",
};
export const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("").map(ch => ({
  lower: ch, upper: ch.toUpperCase(), key: ch, keyword: KEYWORDS[ch],
}));

export const ALPHABET_PARTS = [
  { name: "A–I", emoji: "🔤", letters: ALPHABET.slice(0, 9) },
  { name: "J–R", emoji: "🔤", letters: ALPHABET.slice(9, 18) },
  { name: "S–Z", emoji: "🔤", letters: ALPHABET.slice(18) },
];

// CVC words. Pictures reuse the scene/object art where it already exists
// (fox, pig, dog, hen, bag); the rest fall back to the word text until images
// can be generated. All are spellable (3 letters).
export const PHONICS_WORDS = [
  "cat", "mug", "fox", "pig", "ten", "box", "bat", "hen",
  "bug", "wig", "cap", "dog", "can", "dot", "bag",
].map(w => ({ word: w, key: w }));
