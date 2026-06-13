// Generates an MP3 pronunciation for each unique vocabulary word into audio/.
// Uses ElevenLabs Multilingual v2 (highest quality, 1 credit/char) and skips
// words that already exist, so it's safe to re-run.
// Usage: ELEVENLABS_API_KEY=sk_... node generate-audio.mjs
import { CARDS } from "./cards.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error("Set ELEVENLABS_API_KEY first."); process.exit(1); }

const VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel — clear default premade voice
const MODEL = "eleven_multilingual_v2"; // highest-quality model
// Per-word model overrides: multilingual_v2 mispronounces some "magic e"
// words (dune -> DooNeh, mule, kite), so use the English-tuned turbo model.
const TURBO = "eleven_turbo_v2_5";
const MODEL_OVERRIDES = { dune: TURBO, mule: TURBO, kite: TURBO };
const VOICE_SETTINGS = { stability: 0.6, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true };
const CONCURRENCY = 3;

// Unique words only — minimises characters billed.
const words = [...new Set(CARDS.flatMap(c => c.words.map(w => w.word)))];

await mkdir("audio", { recursive: true });

let done = 0, skipped = 0;
const failed = [];

async function gen(word) {
  const file = `audio/${word}.mp3`;
  if (existsSync(file)) { skipped++; return; }
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
      { method: "POST",
        headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, model_id: MODEL_OVERRIDES[word] || MODEL, voice_settings: VOICE_SETTINGS }) });
    if (res.status === 429 || res.status >= 500) {
      await new Promise(r => setTimeout(r, 2000 * attempt));
      continue;
    }
    if (!res.ok) { failed.push(`${word}: ${res.status} ${(await res.text()).slice(0,120)}`); return; }
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    done++;
    console.log(`[${done + skipped}/${words.length}] ${file}`);
    return;
  }
  failed.push(`${word}: exhausted retries`);
}

async function worker(queue) { while (queue.length) await gen(queue.shift()); }

const totalChars = words.reduce((n, w) => n + w.length, 0);
console.log(`${words.length} unique words, ${totalChars} characters total (~${totalChars} credits at ${MODEL}).`);
const queue = [...words];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

console.log(`\nDone: ${done} generated, ${skipped} skipped, ${failed.length} failed.`);
if (failed.length) { failed.forEach(f => console.log("  " + f)); process.exit(1); }
