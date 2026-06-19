// Generates audio for Bricks Phonics: letter names (audio/letter-<x>.mp3) and
// the CVC words (audio/<word>.mp3). Uses the English-tuned turbo model so
// single letters and short words are pronounced correctly. Resumable.
// Usage: ELEVENLABS_API_KEY=sk_... node generate-bricksphonics-audio.mjs
import { ALPHABET, PHONICS_WORDS } from "./bricksphonics-data.js";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error("Set ELEVENLABS_API_KEY first."); process.exit(1); }

const VOICE = "21m00Tcm4TlvDq8ikWAM";
const MODEL = "eleven_turbo_v2_5";
const SETTINGS = { stability: 0.6, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true };

const jobs = [
  ...ALPHABET.map(l => ({ file: `audio/letter-${l.key}.mp3`, text: l.upper })),
  ...PHONICS_WORDS.map(w => ({ file: `audio/${w.key}.mp3`, text: w.word })),
];

let done = 0, skip = 0;
const failed = [];

async function gen(job) {
  if (existsSync(job.file)) { skip++; return; }
  for (let a = 1; a <= 4; a++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: job.text, model_id: MODEL, voice_settings: SETTINGS }),
    });
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 2000 * a)); continue; }
    if (!res.ok) { failed.push(`${job.file}: ${res.status} ${(await res.text()).slice(0, 100)}`); return; }
    await writeFile(job.file, Buffer.from(await res.arrayBuffer()));
    done++; console.log(`${job.file}`); return;
  }
  failed.push(`${job.file}: exhausted retries`);
}

async function worker(q) { while (q.length) await gen(q.shift()); }
const queue = [...jobs];
await Promise.all(Array.from({ length: 3 }, () => worker(queue)));

console.log(`\nDone: ${done} generated, ${skip} skipped, ${failed.length} failed.`);
if (failed.length) { failed.forEach(f => console.log("  " + f)); process.exit(1); }
