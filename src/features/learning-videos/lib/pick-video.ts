import { LEARNING_VIDEO_IDS } from "../constants";

export function pickRandomVideoId(previousId: string | null = null): string {
  if (LEARNING_VIDEO_IDS.length === 0) {
    throw new Error("learning-videos: no video IDs configured");
  }

  if (LEARNING_VIDEO_IDS.length === 1) {
    return LEARNING_VIDEO_IDS[0]!;
  }

  const candidates = previousId
    ? LEARNING_VIDEO_IDS.filter((id) => id !== previousId)
    : LEARNING_VIDEO_IDS;

  const list = candidates.length > 0 ? candidates : LEARNING_VIDEO_IDS;
  const index = Math.floor(Math.random() * list.length);
  return list[index] ?? list[0]!;
}
