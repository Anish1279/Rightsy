type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5;

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => YTPlayerState;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

interface YTPlayerEvent {
  data: YTPlayerState;
  target: YTPlayer;
}

interface YTConstructor {
  new (
    container: HTMLElement | string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: { data: number; target: YTPlayer }) => void;
      };
    },
  ): YTPlayer;
}

interface YTNamespace {
  Player: YTConstructor;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SCRIPT_ID = "rightsy-yt-iframe-api";
const SCRIPT_SRC = "https://www.youtube.com/iframe_api";

let loaderPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API can only load in the browser"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<YTNamespace>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const previousReadyCallback = window.onYouTubeIframeAPIReady;

    const handleReady = () => {
      previousReadyCallback?.();
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API loaded without YT.Player"));
      }
    };

    window.onYouTubeIframeAPIReady = handleReady;

    if (!existing) {
      const tag = document.createElement("script");
      tag.id = SCRIPT_ID;
      tag.src = SCRIPT_SRC;
      tag.async = true;
      tag.onerror = () => {
        loaderPromise = null;
        reject(new Error("Failed to load YouTube IFrame API"));
      };
      document.head.appendChild(tag);
    } else if (window.YT?.Player) {
      handleReady();
    }
  }).catch((error) => {
    loaderPromise = null;
    throw error;
  });

  return loaderPromise;
}

export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;
