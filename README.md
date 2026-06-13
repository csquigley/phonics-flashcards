# Phonics Fun 🔤

A phonics flashcard app for practicing long vowel sounds (a–e, ai, ay, ee, ea,
i–e, igh, y, o–e, oa, ow, u–e, ue, ew) and the consonant digraphs th, ch, sh —
17 sounds, each with 5 illustrated example words.

## Activities

- **🃏 Flashcards** — flip the card to step through 5 illustrated words per
  sound, grapheme highlighted, with text-to-speech. Filter by sound family.
- **🎯 Match** — see a picture, choose the sound you hear from 4 options.
- **🕵️ Odd One Out** — three pictures, two share a sound; tap the one that
  doesn't belong.
- **🧠 Memory** — full-screen 4×4 grid; match each picture to its sound.

## Running it

It's a static site, but it uses JS modules so it needs to be served over HTTP
(opening `index.html` directly from the file system won't work):

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

## Regenerating the images

The 85 illustrations in `images/` were generated with OpenAI `gpt-image-1`.
To regenerate (existing files are skipped, so delete the ones you want redone):

```bash
OPENAI_API_KEY=sk-... node generate-images.mjs
```

Word lists and image prompts live in `cards.js`.

## Regenerating the audio

Each vocabulary word has a spoken clip in `audio/` generated with ElevenLabs
(Flash v2.5, the cheapest model). The app plays these clips and falls back to
the browser's speech synthesis for anything without a clip. To regenerate
(existing files are skipped):

```bash
ELEVENLABS_API_KEY=sk_... node generate-audio.mjs
```
