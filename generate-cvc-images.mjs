// Generates pictures for the CVC words that don't already have art, into
// images/obj/<word>.png (fox, pig, dog, hen, bag already exist and are skipped).
// Usage: OPENAI_API_KEY=sk-... node generate-cvc-images.mjs
import { PHONICS_WORDS } from "./bricksphonics-data.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error("Set OPENAI_API_KEY first."); process.exit(1); }

const STYLE = "Simple, friendly cartoon illustration for a children's flashcard: " +
  "bold clean outlines, bright cheerful colors, a single centered subject, plain white background, " +
  "absolutely no text or letters. Subject: ";

const DESC = {
  cat: "a cute cartoon cat", mug: "a mug of hot cocoa", ten: "a big colorful number 10",
  box: "a cardboard box", bat: "a cute cartoon bat, the flying animal", bug: "a cute cartoon ladybug",
  wig: "a curly wig", cap: "a baseball cap", can: "a shiny tin can", dot: "a single big round red dot",
};

await mkdir("images/obj", { recursive: true });

let done = 0, skip = 0;
const failed = [];

async function gen(w) {
  const file = `images/obj/${w.key}.png`;
  if (existsSync(file)) { skip++; return; }
  const subject = DESC[w.key] || `a ${w.word}`;
  for (let a = 1; a <= 5; a++) {
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-1", prompt: STYLE + subject, size: "1024x1024", quality: "medium", n: 1 }),
      });
    } catch { await new Promise(r => setTimeout(r, 5000 * a)); continue; }
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 5000 * a)); continue; }
    if (!res.ok) { failed.push(`${file}: ${res.status} ${(await res.text()).slice(0, 120)}`); return; }
    const data = await res.json();
    await writeFile(file, Buffer.from(data.data[0].b64_json, "base64"));
    done++; console.log(`${file}`); return;
  }
  failed.push(`${file}: exhausted retries`);
}

async function worker(q) { while (q.length) await gen(q.shift()); }
const queue = [...PHONICS_WORDS];
await Promise.all(Array.from({ length: 3 }, () => worker(queue)));

console.log(`\nDone: ${done} generated, ${skip} skipped, ${failed.length} failed.`);
if (failed.length) { failed.forEach(f => console.log("  " + f)); process.exit(1); }
