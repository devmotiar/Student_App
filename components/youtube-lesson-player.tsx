"use client";

import { useEffect, useId, useRef } from "react";

type YouTubePlayerEvent = {
  data: number;
  target: YouTubePlayer;
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
};

type YouTubePlayerOptions = {
  videoId: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void;
    onStateChange?: (event: YouTubePlayerEvent) => void;
  };
};

type YouTubeNamespace = {
  Player: new (element: string, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
    __youtubeIframeApiPromise?: Promise<void>;
  }
}

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined" || window.YT?.Player) {
    return Promise.resolve();
  }

  if (window.__youtubeIframeApiPromise) {
    return window.__youtubeIframeApiPromise;
  }

  window.__youtubeIframeApiPromise = new Promise<void>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => {
      reject(new Error("YouTube player API timed out while loading."));
    }, 10000);

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      window.clearTimeout(timeout);
      resolve();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return window.__youtubeIframeApiPromise;
}

interface YouTubeLessonPlayerProps {
  videoId: string;
  title: string;
  onProgress: (currentTime: number, duration: number) => void;
  onCompleted: (currentTime: number, duration: number) => void;
}

/**
 * A YouTube iframe that reports real playback time to the Firebase progress layer.
 * The iframe remains useful as a normal embed if the IFrame API is unavailable.
 */
export function YouTubeLessonPlayer({
  videoId,
  title,
  onProgress,
  onCompleted,
}: YouTubeLessonPlayerProps) {
  const generatedId = useId().replace(/:/g, "");
  const playerId = `youtube-lesson-${generatedId}`;
  const callbacksRef = useRef({ onProgress, onCompleted });

  useEffect(() => {
    callbacksRef.current = { onProgress, onCompleted };
  }, [onCompleted, onProgress]);

  useEffect(() => {
    if (!videoId) return;

    let player: YouTubePlayer | undefined;
    let progressTimer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player) return;

        player = new window.YT.Player(playerId, {
          videoId,
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              progressTimer = setInterval(() => {
                if (
                  event.target.getPlayerState() !== window.YT?.PlayerState.PLAYING
                ) {
                  return;
                }

                const duration = event.target.getDuration();
                const currentTime = event.target.getCurrentTime();
                if (duration > 0 && currentTime >= 0) {
                  callbacksRef.current.onProgress(currentTime, duration);
                }
              }, 5000);
            },
            onStateChange: (event) => {
              if (event.data !== window.YT?.PlayerState.ENDED) return;

              const duration = event.target.getDuration();
              const currentTime = event.target.getCurrentTime();
              callbacksRef.current.onCompleted(currentTime, duration);
            },
          },
        });
      })
      .catch((error) => {
        // The normal iframe still renders, so an API failure should not block playback.
        console.error("Failed to initialize YouTube playback tracking:", error);
      });

    return () => {
      cancelled = true;
      if (progressTimer) clearInterval(progressTimer);
      player?.destroy();
    };
  }, [playerId, videoId]);

  return (
    <iframe
      id={playerId}
      className="aspect-video w-full"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
