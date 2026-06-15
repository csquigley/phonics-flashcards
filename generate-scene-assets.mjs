// Generates scene backgrounds (images/scenes/<key>.png) and object pictures
// for the NEW scene words (images/obj/<word>.png). Existing vocabulary reuses
// its flashcard image, so only new words are generated here.
// Resumable: existing files are skipped. Usage: OPENAI_API_KEY=sk-... node generate-scene-assets.mjs
import { SCENES, SCENE_WORDS } from "./scenes-data.js";
import { CARDS } from "./cards.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error("Set OPENAI_API_KEY first."); process.exit(1); }

const OBJ_STYLE = "Simple, friendly cartoon illustration for a children's flashcard: " +
  "bold clean outlines, bright cheerful colors, a single centered object, plain white background, " +
  "absolutely no text, letters or numbers. Subject: ";
const BG_STYLE = "Simple friendly flat cartoon background for a children's game, bright cheerful colors, " +
  "bold clean outlines, no text or letters, no people, no animals, nothing in the foreground. Scene: ";

// Clearer prompts for words that are ambiguous on their own.
const DESC = {
  present: "a wrapped birthday present gift box with a bow",
  hat: "a colorful party hat",
  sign: "a street sign post",
  bridge: "a small arched bridge",
  shop: "a small cartoon shop storefront",
  drum: "a colorful toy drum",
  chalk: "a piece of white chalk",
  comb: "a hair comb",
  pot: "a cooking pot",
  bird: "a small cute bird",
  ball: "a colorful beach ball",
  book: "a closed storybook",
  bag: "a school backpack",
  ruler: "a ruler",
  desk: "a wooden school desk",
  clock: "a round wall clock",
  lamp: "a table lamp",
  candle: "a single birthday candle",
  cookie: "a chocolate chip cookie",
  juice: "a glass of orange juice",
  milk: "a glass of milk",
  cup: "a teacup",
  spoon: "a spoon",
  plate: "a dinner plate",
  egg: "a white egg",
  soap: "a bar of soap with bubbles",
  towel: "a folded towel",
  sink: "a bathroom sink",
  mirror: "a hand mirror",
  toothbrush: "a toothbrush",
  sock: "a single sock",
  house: "a small cartoon house",
  car: "a cute car",
  bus: "a yellow bus",
  truck: "a delivery truck",
  bench: "a park bench",
  flower: "a single flower",
  starfish: "a starfish",
  crab: "a friendly crab",
  sun: "a smiling sun",
  mushroom: "a red toadstool mushroom",
  hen: "a hen",
  pencil: "a yellow pencil",
  pen: "a blue pen",
  scissors: "a pair of child-safe scissors",
};

const existingWords = new Set(CARDS.flatMap(c => c.words.map(w => w.word)));
const newWords = SCENE_WORDS.filter(w => !existingWords.has(w));

const jobs = [
  ...SCENES.map(s => ({ file: `images/scenes/${s.key}.png`, prompt: BG_STYLE + s.bg, size: "1536x1024" })),
  ...newWords.map(w => ({ file: `images/obj/${w}.png`, prompt: OBJ_STYLE + (DESC[w] || `a ${w}`), size: "1024x1024" })),
];

await mkdir("images/scenes", { recursive: true });
await mkdir("images/obj", { recursive: true });

let done = 0, skipped = 0;
const failed = [];
const CONCURRENCY = 4, MAX_RETRIES = 5;

async function gen(job) {
  if (existsSync(job.file)) { skipped++; return; }
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-1", prompt: job.prompt, size: job.size, quality: "medium", n: 1 }),
      });
    } catch (err) {
      await new Promise(r => setTimeout(r, Math.min(60, 5 * 2 ** (attempt - 1)) * 1000));
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await new Promise(r => setTimeout(r, Math.min(60, 5 * 2 ** (attempt - 1)) * 1000));
      continue;
    }
    if (!res.ok) { failed.push(`${job.file}: ${res.status} ${(await res.text()).slice(0, 120)}`); return; }
    const data = await res.json();
    await writeFile(job.file, Buffer.from(data.data[0].b64_json, "base64"));
    done++;
    console.log(`[${done + skipped}/${jobs.length}] ${job.file}`);
    return;
  }
  failed.push(`${job.file}: exhausted retries`);
}

async function worker(q) { while (q.length) await gen(q.shift()); }

console.log(`${jobs.length} assets: ${SCENES.length} backgrounds + ${newWords.length} new objects.`);
const queue = [...jobs];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

console.log(`\nDone: ${done} generated, ${skipped} skipped, ${failed.length} failed.`);
if (failed.length) { failed.forEach(f => console.log("  " + f)); process.exit(1); }
