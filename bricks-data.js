// BricksWords vocabulary — curriculum words grouped into Units 1-4, each with
// an A and a B word list. `word` is the display/spoken form; `key` is the
// filename-safe id used for images (images/bricks/<key>.png) and audio
// (audio/<key>.mp3). `spell` marks single-token words usable in the Spell game.
export const BRICKS_UNITS = [
  { unit: 1, part: "A", name: "Seasons", emoji: "🌷", words: [
    { word: "spring",     key: "spring",     spell: true,  prompt: "a spring tree branch with pink blossom and green buds" },
    { word: "tulips",     key: "tulips",     spell: true,  prompt: "a small bunch of colorful tulips" },
    { word: "sunflowers", key: "sunflowers", spell: true,  prompt: "two tall yellow sunflowers" },
    { word: "fall",       key: "fall",       spell: true,  prompt: "an autumn tree with orange and red falling leaves" },
    { word: "winter",     key: "winter",     spell: true,  prompt: "a snowy winter scene with a snow-covered pine tree and snowflakes" },
  ]},
  { unit: 1, part: "B", name: "Seasons", emoji: "🌷", words: [
    { word: "summer",     key: "summer",     spell: true,  prompt: "a bright summer sun wearing sunglasses with an ice cream" },
    { word: "season",     key: "season",     spell: true,  prompt: "a single tree shown changing through the four seasons" },
    { word: "do",         key: "do",         spell: true,  prompt: "a cheerful child doing a task with a big checkmark" },
    { word: "you",        key: "you",        spell: true,  prompt: "a friendly cartoon hand pointing forward toward the viewer" },
  ]},

  { unit: 2, part: "A", name: "School", emoji: "🏫", words: [
    { word: "math",           key: "math",           spell: true,  prompt: "a colorful wooden abacus" },
    { word: "science",        key: "science",        spell: true,  prompt: "science beakers and a flask with colorful bubbling liquid" },
    { word: "learn",          key: "learn",          spell: true,  prompt: "an open book with a glowing lightbulb above it" },
    { word: "P.E.",           key: "pe",             spell: false, prompt: "a soccer ball, a whistle and sport sneakers" },
    { word: "social studies", key: "social_studies", spell: false, prompt: "a globe next to a rolled world map" },
    { word: "countries",      key: "countries",      spell: true,  prompt: "a globe surrounded by several little country flags" },
    { word: "different",      key: "different",      spell: true,  prompt: "three identical red apples and one different green apple" },
  ]},
  { unit: 2, part: "B", name: "School", emoji: "🏫", words: [
    { word: "school",  key: "school",  spell: true,  prompt: "a friendly school building with a flag" },
    { word: "class",   key: "class",   spell: true,  prompt: "a classroom with rows of desks and a chalkboard" },
    { word: "many",    key: "many",    spell: true,  prompt: "a big bunch of many colorful balloons" },
    { word: "animals", key: "animals", spell: true,  prompt: "a group of friendly cartoon animals together: a dog, cat and rabbit" },
    { word: "plants",  key: "plants",  spell: true,  prompt: "several green potted plants in a row" },
  ]},

  { unit: 3, part: "A", name: "Recycling", emoji: "♻️", words: [
    { word: "trash",     key: "trash",     spell: true,  prompt: "a trash can with crumpled paper inside" },
    { word: "hang",      key: "hang",      spell: true,  prompt: "wet clothes hanging on a clothesline with pegs" },
    { word: "eggshells", key: "eggshells", spell: true,  prompt: "a few broken white eggshells" },
    { word: "track",     key: "track",     spell: true,  prompt: "a trail of footprints tracks on the ground" },
    { word: "paint",     key: "paint",     spell: true,  prompt: "open pots of colorful paint with a paintbrush" },
    { word: "stack",     key: "stack",     spell: true,  prompt: "a neat stack of colorful building blocks" },
  ]},
  { unit: 3, part: "B", name: "Recycling", emoji: "♻️", words: [
    { word: "throw",    key: "throw",    spell: true,  prompt: "a child throwing a ball" },
    { word: "make",     key: "make",     spell: true,  prompt: "child hands making a craft from materials" },
    { word: "plastic",  key: "plastic",  spell: true,  prompt: "a clear plastic water bottle" },
    { word: "cut",      key: "cut",      spell: true,  prompt: "a pair of scissors cutting a sheet of paper" },
    { word: "together", key: "together", spell: true,  prompt: "two children holding hands together" },
    { word: "wash",     key: "wash",     spell: true,  prompt: "two hands washing under running water with soap bubbles" },
    { word: "put",      key: "put",      spell: true,  prompt: "a hand putting a block into a box" },
    { word: "tires",    key: "tires",    spell: true,  prompt: "a stack of black rubber car tires (wheels)" },
  ]},

  { unit: 4, part: "A", name: "At Home", emoji: "🏠", words: [
    { word: "living room", key: "living_room", spell: false, prompt: "a cozy living room with a sofa, rug and television" },
    { word: "bathroom",    key: "bathroom",    spell: true,  prompt: "a bathroom with a sink, mirror and toilet" },
    { word: "bathtub",     key: "bathtub",     spell: true,  prompt: "a bathtub full of bubbles" },
    { word: "bedroom",     key: "bedroom",     spell: true,  prompt: "a bedroom with a bed, pillow and lamp" },
    { word: "kitchen",     key: "kitchen",     spell: true,  prompt: "a kitchen with cupboards and a counter" },
    { word: "stove",       key: "stove",       spell: true,  prompt: "a kitchen stove with pots cooking on it" },
  ]},
  { unit: 4, part: "B", name: "Garden", emoji: "🌱", words: [
    { word: "garden", key: "garden", spell: true,  prompt: "a sunny garden with flowers and a watering can" },
    { word: "seed",   key: "seed",   spell: true,  prompt: "a few seeds with a tiny green sprout" },
  ]},
];

export const BRICKS_WORDS = BRICKS_UNITS.flatMap(u => u.words);
