"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { platformMeta } from "@/lib/platforms";
import type { Video } from "@/lib/videos";
import { CloseIcon, ExternalIcon, PlatformIcon } from "./Icons";

const PlayerContext = createContext<(video: Video) => void>(() => {});

export const usePlayer = () => useContext(PlayerContext);

/**
 * One shared <dialog> that loads the official embed player only after a
 * visitor chooses a video, so pages never load a dozen third-party players.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loaded, setLoaded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const play = useCallback((v: Video) => {
    setLoaded(false);
    setVideo(v);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (video && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    }
  }, [video]);

  const close = () => dialogRef.current?.close();
  const onClose = () => {
    document.documentElement.style.overflow = "";
    setVideo(null); // unmounts the iframe → stops playback
  };

  const meta = video ? platformMeta[video.platform] : null;
  const vertical = video?.orientation === "vertical";

  return (
    <PlayerContext.Provider value={play}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={onClose}
        onClick={(e) => e.target === dialogRef.current && close()}
        aria-labelledby="player-title"
        className="m-auto max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-white backdrop:bg-black/85 sm:max-h-[95dvh] sm:w-auto"
      >
        {video && meta && (
          <div className={`mx-auto flex flex-col gap-3 rounded-md bg-ink p-3 ring-1 ring-white/10 sm:p-4 ${vertical ? "w-[min(100vw,26rem)] sm:w-[min(92vw,26rem)]" : "w-[min(100vw,60rem)] sm:w-[min(94vw,60rem)]"}`}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
                <PlatformIcon platform={video.platform} className="size-3.5" />
                {meta.name}
              </span>
              <h2 id="player-title" className="line-clamp-2 flex-1 text-sm leading-snug font-semibold sm:text-base">
                {video.title || `${meta.name} video`}
              </h2>
              <button
                type="button"
                onClick={close}
                className="-mt-1 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                autoFocus
              >
                <CloseIcon className="size-5" />
                <span className="sr-only">Close video</span>
              </button>
            </div>

            <div
              className={`relative overflow-hidden rounded-sm bg-surface-2 ${vertical ? "mx-auto aspect-[9/16] h-[min(78dvh,46rem)] max-w-full" : "aspect-video w-full"}`}
            >
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center" role="status">
                  <span className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                  <span className="sr-only">Loading video…</span>
                </div>
              )}
              {video.embedUrl && (
                <iframe
                  key={video.key}
                  src={video.embedUrl}
                  title={video.title || `${meta.name} video`}
                  onLoad={() => setLoaded(true)}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 size-full border-0"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
              <p className="text-muted">Not playing? It may be private or unavailable in your region.</p>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-white underline-offset-4 hover:underline"
              >
                Watch on {meta.name} <ExternalIcon className="size-4" />
              </a>
            </div>
            {video.caption && <p className="line-clamp-4 text-sm whitespace-pre-line text-white/80">{video.caption}</p>}
          </div>
        )}
      </dialog>
    </PlayerContext.Provider>
  );
}
