// Generates images (images/bricks/<key>.png) and audio (audio/<key>.mp3) for
// the BricksWords vocabulary. Resumable: existing files are skipped.
// Usage: OPENAI_API_KEY=sk-... ELEVENLABS_API_KEY=sk_... node generate-bricks-assets.mjs
import { BRICKS_WORDS } from "./bricks-data.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const OPENAI = process.env.OPENAI_API_KEY;
const ELEVEN = process.env.ELEVENLABS_API_KEY;

const OBJ_STYLE = "Simple, friendly cartoon illustration for a children's flashcard: " +
  "bold clean outlines, bright cheerful colors, plain white background, " +
  "absolutely no text or letters. Subject: ";

const VOICE = "21m00Tcm4TlvDq8ikWAM";
const AUDIO_MODEL = "eleven_multilingual_v2";
const AUDIO_SETTINGS = { stability: 0.6, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true };
// "P.E." should be read as the letters, not "pee".
const SPEAK_TEXT = { pe: "P E" };

await mkdir("images/bricks", { recursive: true });
await mkdir("audio", { recursive: true });

let img = 0, aud = 0, skip = 0;
const failed = [];

async function genImage(w) {
  const file = `images/bricks/${w.key}.png`;
  if (existsSync(file)) { skip++; return; }
  if (!OPENAI) { failed.push(`${file}: no OPENAI_API_KEY`); return; }
  for (let a = 1; a <= 5; a++) {
    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST", headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-image-1", prompt: OBJ_STYLE + w.prompt, size: "1024x1024", quality: "medium", n: 1 }),
      });
    } catch { await new Promise(r => setTimeout(r, 5000 * a)); continue; }
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 5000 * a)); continue; }
    if (!res.ok) { failed.push(`${file}: ${res.status} ${(await res.text()).slice(0, 100)}`); return; }
    const data = await res.json();
    await writeFile(file, Buffer.from(data.data[0].b64_json, "base64"));
    img++; console.log(`img ${w.key}`); return;
  }
  failed.push(`${file}: exhausted retries`);
}

async function genAudio(w) {
  const file = `audio/${w.key}.mp3`;
  if (existsSync(file)) { skip++; return; }
  if (!ELEVEN) { failed.push(`${file}: no ELEVENLABS_API_KEY`); return; }
  const text = SPEAK_TEXT[w.key] || w.word;
  for (let a = 1; a <= 4; a++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
      method: "POST", headers: { "xi-api-key": ELEVEN, "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: AUDIO_MODEL, voice_settings: AUDIO_SETTINGS }),
    });
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 2000 * a)); continue; }
    if (!res.ok) { failed.push(`${file}: ${res.status} ${(await res.text()).slice(0, 100)}`); return; }
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    aud++; console.log(`aud ${w.key}`); return;
  }
  failed.push(`${file}: exhausted retries`);
}

async function worker(q) { while (q.length) { const job = q.shift(); await job(); } }

const jobs = [...BRICKS_WORDS.map(w => () => genImage(w)), ...BRICKS_WORDS.map(w => () => genAudio(w))];
await Promise.all(Array.from({ length: 4 }, () => worker(jobs)));

console.log(`\nDone: ${img} images, ${aud} audio, ${skip} skipped, ${failed.length} failed.`);
if (failed.length) { failed.forEach(f => console.log("  " + f)); process.exit(1); }
