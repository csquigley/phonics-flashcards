// Shared card data — used by the browser app and the image-generation script.
// Each sound has 5 example words; each word gets its own generated image,
// saved as images/<cardId>_<word>.png
export const CARDS = [
  // ---- Long A ----
  { id: "a_e", grapheme: "a_e", display: "a–e", sound: "long a", words: [
    { word: "cake",  prompt: "a birthday cake with lit candles" },
    { word: "gate",  prompt: "a wooden garden gate with flowers around it" },
    { word: "snake", prompt: "a friendly smiling green snake" },
    { word: "plane", prompt: "a small cheerful passenger airplane flying among clouds" },
    { word: "whale", prompt: "a happy blue whale spouting water" },
  ]},
  { id: "ai", grapheme: "ai", display: "ai", sound: "long a", words: [
    { word: "rain",  prompt: "rain falling from a friendly cloud onto a red umbrella" },
    { word: "train", prompt: "a cheerful steam train with colorful carriages" },
    { word: "snail", prompt: "a cute snail with a spiral shell on a leaf" },
    { word: "paint", prompt: "a paintbrush and colorful pots of paint" },
    { word: "tail",  prompt: "a happy puppy wagging its fluffy tail" },
  ]},
  { id: "ay", grapheme: "ay", display: "ay", sound: "long a", words: [
    { word: "play",   prompt: "two happy children playing with a ball in a park" },
    { word: "tray",   prompt: "a tray holding a sandwich and a glass of juice" },
    { word: "hay",    prompt: "a golden haystack on a sunny farm" },
    { word: "crayon", prompt: "a box of colorful crayons" },
    { word: "spray",  prompt: "a spray bottle spraying a fine mist of water" },
  ]},

  // ---- Long E ----
  { id: "ee", grapheme: "ee", display: "ee", sound: "long e", words: [
    { word: "bee",   prompt: "a cute smiling bumblebee flying near a flower" },
    { word: "tree",  prompt: "a big leafy green tree on a grassy hill" },
    { word: "sheep", prompt: "a fluffy white sheep standing in a meadow" },
    { word: "feet",  prompt: "a pair of cartoon feet with wiggly toes, simple and playful" },
    { word: "queen", prompt: "a kind queen wearing a golden crown" },
  ]},
  { id: "ea", grapheme: "ea", display: "ea", sound: "long e", words: [
    { word: "leaf",  prompt: "a single bright green leaf" },
    { word: "sea",   prompt: "a calm blue sea with gentle waves and a sun" },
    { word: "beach", prompt: "a sandy beach with a bucket, spade and seashells" },
    { word: "peach", prompt: "a ripe juicy peach with a leaf on its stem" },
    { word: "read",  prompt: "a child sitting cross-legged happily reading a book" },
  ]},

  // ---- Long I ----
  { id: "i_e", grapheme: "i_e", display: "i–e", sound: "long i", words: [
    { word: "kite",  prompt: "a colorful diamond kite flying in a blue sky" },
    { word: "bike",  prompt: "a red children's bicycle with a basket" },
    { word: "smile", prompt: "a big happy smiling face" },
    { word: "five",  prompt: "the number five, large and colorful, with five stars" },
    { word: "slide", prompt: "a playground slide with a child sliding down" },
  ]},
  { id: "igh", grapheme: "igh", display: "igh", sound: "long i", words: [
    { word: "light",      prompt: "a glowing yellow lightbulb" },
    { word: "night",      prompt: "a starry night sky with a crescent moon" },
    { word: "knight",     prompt: "a friendly knight in shining armor holding a shield" },
    { word: "high",       prompt: "a hot air balloon floating high above tiny hills" },
    { word: "flashlight", prompt: "a flashlight shining a bright beam of light" },
  ]},
  { id: "y", grapheme: "y", display: "y", sound: "long i", words: [
    { word: "fly",       prompt: "a cute cartoon fly with big friendly eyes and wings" },
    { word: "sky",       prompt: "a bright blue sky with fluffy white clouds and a sun" },
    { word: "cry",       prompt: "a cartoon baby with big teardrops, crying" },
    { word: "fry",       prompt: "golden french fries in a red carton" },
    { word: "butterfly", prompt: "a beautiful butterfly with colorful patterned wings" },
  ]},

  // ---- Long O ----
  { id: "o_e", grapheme: "o_e", display: "o–e", sound: "long o", words: [
    { word: "bone",  prompt: "a white dog bone" },
    { word: "home",  prompt: "a cozy little house with a red roof and chimney" },
    { word: "rope",  prompt: "a coiled brown rope tied in a loop" },
    { word: "stone", prompt: "a smooth round grey stone" },
    { word: "nose",  prompt: "a cartoon face with a big friendly round nose" },
  ]},
  { id: "oa", grapheme: "oa", display: "oa", sound: "long o", words: [
    { word: "boat",  prompt: "a small sailboat on calm blue water" },
    { word: "goat",  prompt: "a cheerful white goat with little horns" },
    { word: "coat",  prompt: "a warm red winter coat with buttons" },
    { word: "road",  prompt: "a winding country road through green hills" },
    { word: "toast", prompt: "a slice of golden toast with butter" },
  ]},
  { id: "ow", grapheme: "ow", display: "ow", sound: "long o", words: [
    { word: "snow",    prompt: "a happy snowman with falling snowflakes" },
    { word: "crow",    prompt: "a friendly black crow perched on a branch" },
    { word: "bow",     prompt: "a big red gift bow ribbon" },
    { word: "window",  prompt: "an open window with curtains and a sunny view" },
    { word: "rainbow", prompt: "a bright rainbow arching over green hills" },
  ]},

  // ---- Long U ----
  { id: "u_e", grapheme: "u_e", display: "u–e", sound: "long u", words: [
    { word: "cube",  prompt: "a shiny ice cube" },
    { word: "mule",  prompt: "a friendly brown mule with long ears" },
    { word: "flute", prompt: "a silver flute with musical notes floating around it" },
    { word: "tube",  prompt: "a tube of toothpaste with paste squeezed out" },
    { word: "dune",  prompt: "a golden sand dune in a sunny desert" },
  ]},
  { id: "ue", grapheme: "ue", display: "ue", sound: "long u", words: [
    { word: "glue",     prompt: "a bottle of white school glue" },
    { word: "blue",     prompt: "a splash of bright blue paint" },
    { word: "statue",   prompt: "a stone statue of a lion on a pedestal" },
    { word: "tissue",   prompt: "a box of tissues with one tissue pulled up" },
    { word: "barbecue", prompt: "a barbecue grill with sausages and corn cooking" },
  ]},
  { id: "ew", grapheme: "ew", display: "ew", sound: "long u", words: [
    { word: "newt",  prompt: "a cute smiling orange newt on a lily pad" },
    { word: "stew",  prompt: "a steaming pot of vegetable stew" },
    { word: "screw", prompt: "a metal screw and a screwdriver" },
    { word: "jewel", prompt: "a sparkling purple jewel gemstone" },
    { word: "chew",  prompt: "a happy dog chewing a toy" },
  ]},

  // ---- Consonant digraphs ----
  { id: "th", grapheme: "th", display: "th", sound: "th", words: [
    { word: "thumb", prompt: "a hand giving a cheerful thumbs up" },
    { word: "three", prompt: "the number three, large and colorful, with three balloons" },
    { word: "bath",  prompt: "a bathtub full of bubbles with a rubber duck" },
    { word: "teeth", prompt: "a smiling mouth showing clean white teeth and a toothbrush" },
    { word: "moth",  prompt: "a fluffy friendly moth with patterned wings" },
  ]},
  { id: "ch", grapheme: "ch", display: "ch", sound: "ch", words: [
    { word: "cheese",   prompt: "a wedge of yellow cheese with holes" },
    { word: "chair",    prompt: "a cozy red armchair" },
    { word: "chick",    prompt: "a fluffy yellow baby chick" },
    { word: "cherry",   prompt: "two shiny red cherries on a stem" },
    { word: "lunchbox", prompt: "an open lunchbox with a sandwich, apple and juice" },
  ]},
  { id: "sh", grapheme: "sh", display: "sh", sound: "sh", words: [
    { word: "ship",  prompt: "a friendly cartoon ship sailing on waves" },
    { word: "shell", prompt: "a pink and white spiral seashell on sand" },
    { word: "fish",  prompt: "a colorful tropical fish blowing bubbles" },
    { word: "brush", prompt: "a hairbrush with a pink handle" },
    { word: "shoe",  prompt: "a red children's sneaker with white laces" },
  ]},
];
