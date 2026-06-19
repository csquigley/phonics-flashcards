// Generates an illustrated card per letter into images/letters/<x>.png:
// the capital and lowercase letter shown clearly, plus a cute cartoon
// animal/object that starts with that letter. Uses gpt-image-1 at "high"
// quality so the rendered letters are clean. Resumable (skips existing).
// Usage: OPENAI_API_KEY=sk-... node generate-alphabet-images.mjs
// Optional: pass letters to (re)generate, e.g. `node generate-alphabet-images.mjs a b c`
import { ALPHABET } from "./bricksphonics-data.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error("Set OPENAI_API_KEY first."); process.exit(1); }

const only = process.argv.slice(2).map(s => s.toLowerCase());
const letters = only.length ? ALPHABET.filter(l => only.includes(l.key)) : ALPHABET;

await mkdir("images/letters", { recursive: true });

const prompt = l =>
  `A fun, cartoonish children's alphabet flashcard. Clearly show the capital letter "${l.upper}" ` +
  `and the lowercase letter "${l.lower}" together in a big colorful playful rounded font. ` +
  `Next to the letters, a single cute friendly cartoon ${l.keyword} (which starts with the letter ${l.upper}). ` +
  `Bold clean black outlines, bright cheerful colors, plain soft background, neat and uncluttered. ` +
  `The only letters in the picture are "${l.upper}" and "${l.lower}".`;

let done = 0, skip = 0;
const failed = [];

async function gen(l) {
  const file = `images/letters/${l.key}.png`;
  if (existsSync(file)) { skip++; return; }
  for (let a = 1; a <= 5; a++) {
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-1", prompt: prompt(l), size: "1024x1024", quality: "high", n: 1 }),
      });
    } catch { await new Promise(r => setTimeout(r, 5000 * a)); continue; }
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 5000 * a)); continue; }
    if (!res.ok) { failed.push(`${file}: ${res.status} ${(await res.text()).slice(0, 120)}`); return; }
    const data = await res.json();
    await writeFile(file, Buffer.from(data.data[0].b64_json, "base64"));
    done++; console.log(`${l.key}  (${l.upper}${l.lower} ${l.keyword})`); return;
  }
  failed.push(`${file}: exhausted retries`);
}

async function worker(q) { while (q.length) await gen(q.shift()); }
const queue = [...letters];
await Promise.all(Array.from({ length: 3 }, () => worker(queue)));

console.log(`\nDone: ${done} generated, ${skip} skipped, ${failed.length} failed.`);
if (failed.length) { failed.forEach(f => console.log("  " + f)); process.exit(1); }
