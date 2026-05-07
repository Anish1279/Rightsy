const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").split("/")[0] ?? "";
    return YOUTUBE_ID_REGEX.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const queryId = url.searchParams.get("v");
    if (queryId && YOUTUBE_ID_REGEX.test(queryId)) {
      return queryId;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if ((segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "v") && segments[1]) {
      return YOUTUBE_ID_REGEX.test(segments[1]) ? segments[1] : null;
    }
  }

  return null;
}
