// Generates one gpt-image-1 illustration per example word into images/.
// Usage: OPENAI_API_KEY=sk-... node generate-images.mjs
// Safe to re-run: existing images are skipped.
import { CARDS } from "./cards.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("Set OPENAI_API_KEY first.");
  process.exit(1);
}

const STYLE =
  "Simple, friendly cartoon illustration for a children's phonics flashcard: " +
  "bold clean outlines, bright cheerful colors, plain white background, " +
  "absolutely no text, letters, numbers or words in the image. Subject: ";

const CONCURRENCY = 3;
const MAX_RETRIES = 5;

const jobs = CARDS.flatMap(c =>
  c.words.map(w => ({ file: `images/${c.id}_${w.word}.png`, prompt: w.prompt }))
);

await mkdir("images", { recursive: true });

let done = 0, skipped = 0, failed = [];

async function generate(job) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: STYLE + job.prompt,
        size: "1024x1024",
        quality: "medium",
        n: 1,
      }),
      });
    } catch (err) {
      const wait = Math.min(60, 5 * 2 ** (attempt - 1));
      console.log(`  network error on ${job.file} (${err.message}), retry in ${wait}s`);
      await new Promise(r => setTimeout(r, wait * 1000));
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      const wait = Math.min(60, 5 * 2 ** (attempt - 1));
      console.log(`  rate-limited/server error on ${job.file}, retry in ${wait}s`);
      await new Promise(r => setTimeout(r, wait * 1000));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${res.status} for ${job.file}: ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    await writeFile(job.file, Buffer.from(data.data[0].b64_json, "base64"));
    return;
  }
  throw new Error(`Exhausted retries for ${job.file}`);
}

async function worker(queue) {
  while (queue.length) {
    const job = queue.shift();
    if (existsSync(job.file)) {
      skipped++;
      continue;
    }
    try {
      await generate(job);
      done++;
      console.log(`[${done + skipped}/${jobs.length}] ${job.file}`);
    } catch (err) {
      failed.push(job.file);
      console.error(`FAILED ${job.file}: ${err.message}`);
    }
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

console.log(`\nDone: ${done} generated, ${skipped} skipped, ${failed.length} failed.`);
if (failed.length) {
  console.log("Failed files (re-run the script to retry):");
  failed.forEach(f => console.log("  " + f));
  process.exit(1);
}
