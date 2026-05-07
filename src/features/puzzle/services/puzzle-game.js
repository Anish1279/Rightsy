export const GRID_SIZE = 3;
export const TILE_COUNT = GRID_SIZE * GRID_SIZE;
export const PUZZLE_IMAGE_ASPECT_RATIO = "1672 / 941";
export const PUZZLE_IMAGE_RATIO_VALUE = 1672 / 941;

const PUZZLE_IMAGE_PATHS = [
  "/puzzle/ChatGPT Image May 3, 2026, 11_35_14 PM.png",
  "/puzzle/ChatGPT Image May 3, 2026, 11_40_57 PM.png",
  "/puzzle/ChatGPT Image May 3, 2026, 11_56_53 PM.png",
  "/puzzle/ChatGPT Image May 4, 2026, 12_08_21 AM.png",
  "/puzzle/ChatGPT Image May 4, 2026, 12_26_14 AM.png",
];

export const PUZZLE_IMAGES = PUZZLE_IMAGE_PATHS.map((src, index) => ({
  id: `puzzle-${index + 1}`,
  name: `Puzzle picture ${index + 1}`,
  src: encodeURI(src),
}));

export function pickRandomPuzzleImage(previousSrc, images = PUZZLE_IMAGES) {
  if (images.length === 0) return null;

  const availableImages =
    images.length > 1 ? images.filter((image) => image.src !== previousSrc) : images;

  return availableImages[Math.floor(Math.random() * availableImages.length)] || images[0];
}

export function getTilePosition(index, gridSize = GRID_SIZE) {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  };
}

export function createSolvedTiles(gridSize = GRID_SIZE) {
  return Array.from({ length: gridSize * gridSize }, (_, index) => ({
    id: `tile-${index}`,
    correctIndex: index,
    currentIndex: index,
  }));
}

export function shuffleItems(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function isPuzzleSolved(tiles) {
  return tiles.length === TILE_COUNT && tiles.every((tile) => tile.correctIndex === tile.currentIndex);
}

export function swapTiles(tiles, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= tiles.length ||
    toIndex >= tiles.length
  ) {
    return tiles;
  }

  const nextTiles = [...tiles];
  const fromTile = { ...nextTiles[fromIndex], currentIndex: toIndex };
  const toTile = { ...nextTiles[toIndex], currentIndex: fromIndex };

  nextTiles[fromIndex] = toTile;
  nextTiles[toIndex] = fromTile;

  return nextTiles;
}

export function createShuffledTiles(gridSize = GRID_SIZE) {
  const solvedTiles = createSolvedTiles(gridSize);
  let shuffledTiles = solvedTiles;
  let attempts = 0;

  do {
    const shuffledOrder = shuffleItems(solvedTiles.map((tile) => tile.correctIndex));
    shuffledTiles = shuffledOrder.map((correctIndex, currentIndex) => ({
      id: `tile-${correctIndex}`,
      correctIndex,
      currentIndex,
    }));
    attempts += 1;
  } while (isPuzzleSolved(shuffledTiles) && attempts < 12);

  return isPuzzleSolved(shuffledTiles) ? swapTiles(solvedTiles, 0, 1) : shuffledTiles;
}
