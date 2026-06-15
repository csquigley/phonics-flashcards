// Scene data for the "Find It!" game. 10 scenes x 10 words = 100 words.
// Words already in cards.js are reused (we have their image + audio); the rest
// are pre-A1/A1 CEFR vocabulary. Every word across all scenes is unique.
export const SCENES = [
  { key: "beach", name: "At the Beach", emoji: "🏖️",
    bg: "a sunny sandy beach with calm blue ocean and clear sky, simple flat cartoon background, empty open foreground, no characters",
    words: ["sea", "beach", "shell", "fish", "ship", "boat", "whale", "crab", "sun", "starfish"] },

  { key: "park", name: "In the Park", emoji: "🌳",
    bg: "a green park with grass, a path and a few bushes under a blue sky, simple flat cartoon background, open foreground, no characters",
    words: ["tree", "kite", "bike", "slide", "butterfly", "gate", "bench", "ball", "dog", "flower"] },

  { key: "forest", name: "In the Forest", emoji: "🌲",
    bg: "a friendly green forest with tall trees and a grassy floor, soft daylight, simple flat cartoon background, no characters",
    words: ["snake", "bee", "leaf", "moth", "snail", "fox", "owl", "bear", "mushroom", "bird"] },

  { key: "farm", name: "On the Farm", emoji: "🚜",
    bg: "a sunny farm with green fields, a red barn in the distance and a fence, simple flat cartoon background, open foreground, no characters",
    words: ["sheep", "goat", "hay", "crow", "mule", "cow", "pig", "duck", "hen", "horse"] },

  { key: "kitchen", name: "In the Kitchen", emoji: "🍳",
    bg: "a tidy cartoon kitchen with counters and cupboards, warm light, simple flat cartoon background, empty counter space, no characters",
    words: ["cheese", "toast", "stew", "tray", "egg", "milk", "cup", "spoon", "plate", "pot"] },

  { key: "bedroom", name: "In the Bedroom", emoji: "🛏️",
    bg: "a cozy child's bedroom with a window and soft wallpaper, simple flat cartoon background, open floor space, no characters",
    words: ["chair", "window", "brush", "shoe", "light", "bed", "lamp", "book", "sock", "clock"] },

  { key: "party", name: "Birthday Party", emoji: "🎉",
    bg: "a cheerful birthday party room with bunting and streamers on the walls, simple flat cartoon background, open table space, no characters",
    words: ["cake", "cherry", "peach", "balloon", "present", "candle", "juice", "cookie", "hat", "drum"] },

  { key: "school", name: "At School", emoji: "🏫",
    bg: "a bright classroom with a chalkboard and shelves, simple flat cartoon background, an empty desk surface, no characters",
    words: ["crayon", "paint", "glue", "pencil", "pen", "bag", "ruler", "desk", "scissors", "chalk"] },

  { key: "town", name: "In the Town", emoji: "🏙️",
    bg: "a cheerful town street with little shops and a road, blue sky, simple flat cartoon background, open road, no characters",
    words: ["train", "plane", "road", "car", "bus", "truck", "house", "shop", "bridge", "sign"] },

  { key: "bathroom", name: "In the Bathroom", emoji: "🛁",
    bg: "a clean bright bathroom with tiles and a window, simple flat cartoon background, open space, no characters",
    words: ["bath", "teeth", "nose", "thumb", "soap", "towel", "sink", "mirror", "toothbrush", "comb"] },
];

// Every unique word across all scenes (100).
export const SCENE_WORDS = [...new Set(SCENES.flatMap(s => s.words))];
