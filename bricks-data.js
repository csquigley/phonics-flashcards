// BricksWords vocabulary — curriculum words grouped into Units 1-4.
// `word` is the display/spoken form; `key` is the filename-safe id used for
// images (images/bricks/<key>.png) and audio (audio/<key>.mp3). `spell` marks
// single-token words that work in the Spell game. `prompt` drives image gen.
export const BRICKS_UNITS = [
  { unit: 1, name: "Seasons", emoji: "🌷", words: [
    { word: "spring",     key: "spring",     spell: true,  prompt: "a spring tree branch with pink blossom and green buds" },
    { word: "tulips",     key: "tulips",     spell: true,  prompt: "a small bunch of colorful tulips" },
    { word: "sunflowers", key: "sunflowers", spell: true,  prompt: "two tall yellow sunflowers" },
    { word: "fall",       key: "fall",       spell: true,  prompt: "an autumn tree with orange and red falling leaves" },
    { word: "winter",     key: "winter",     spell: true,  prompt: "a snowy winter scene with a snow-covered pine tree and snowflakes" },
  ]},
  { unit: 2, name: "School", emoji: "🏫", words: [
    { word: "math",           key: "math",           spell: true,  prompt: "a colorful wooden abacus" },
    { word: "science",        key: "science",        spell: true,  prompt: "science beakers and a flask with colorful bubbling liquid" },
    { word: "learn",          key: "learn",          spell: true,  prompt: "an open book with a glowing lightbulb above it" },
    { word: "P.E.",           key: "pe",             spell: false, prompt: "a soccer ball, a whistle and sport sneakers" },
    { word: "social studies", key: "social_studies", spell: false, prompt: "a globe next to a rolled world map" },
    { word: "countries",      key: "countries",      spell: true,  prompt: "a globe surrounded by several little country flags" },
    { word: "different",      key: "different",      spell: true,  prompt: "three identical red apples and one different green apple" },
  ]},
  { unit: 3, name: "Recycling", emoji: "♻️", words: [
    { word: "trash",     key: "trash",     spell: true,  prompt: "a trash can with crumpled paper inside" },
    { word: "hang",      key: "hang",      spell: true,  prompt: "wet clothes hanging on a clothesline with pegs" },
    { word: "eggshells", key: "eggshells", spell: true,  prompt: "a few broken white eggshells" },
    { word: "track",     key: "track",     spell: true,  prompt: "a trail of footprints tracks on the ground" },
    { word: "paint",     key: "paint",     spell: true,  prompt: "open pots of colorful paint with a paintbrush" },
    { word: "stack",     key: "stack",     spell: true,  prompt: "a neat stack of colorful building blocks" },
  ]},
  { unit: 4, name: "At Home", emoji: "🏠", words: [
    { word: "living room", key: "living_room", spell: false, prompt: "a cozy living room with a sofa, rug and television" },
    { word: "bathroom",    key: "bathroom",    spell: true,  prompt: "a bathroom with a sink, mirror and toilet" },
    { word: "bathtub",     key: "bathtub",     spell: true,  prompt: "a bathtub full of bubbles" },
    { word: "bedroom",     key: "bedroom",     spell: true,  prompt: "a bedroom with a bed, pillow and lamp" },
    { word: "kitchen",     key: "kitchen",     spell: true,  prompt: "a kitchen with cupboards and a counter" },
    { word: "stove",       key: "stove",       spell: true,  prompt: "a kitchen stove with pots cooking on it" },
  ]},
];

export const BRICKS_WORDS = BRICKS_UNITS.flatMap(u => u.words);
