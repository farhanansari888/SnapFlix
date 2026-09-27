"use client";

import { usePlayerEvents, type UnifiedPlayerEventData } from "@/hooks/usePlayerEvents";
import { siteConfig } from "@/config/site";
import { Params } from "@/types";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import { Button, Chip } from "@heroui/react";
import { useDocumentTitle } from "@mantine/hooks";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FaPlay, FaForwardStep } from "react-icons/fa6";
import { getImageUrl } from "@/utils/movies";
import { cn } from "@/utils/helpers";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import ShareButton from "@/components/ui/button/ShareButton";
import type { SavedMovieDetails } from "@/types/movie";

const WatchAnimePage: NextPage<Params<{ id: string; episode: string }>> = ({ params }) => {
  const { id, episode: initialEpisode } = use(params);
  const router = useRouter();

  const [currentEpisode, setCurrentEpisode] = useState(Number(initialEpisode) || 1);
  const [playerEpisode, setPlayerEpisode] = useState(Number(initialEpisode) || 1);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch anime details
  const { data: animeDetails } = useQuery({
    queryKey: ["anime-details", id],
    queryFn: async () => {
      try {
        const res = await tmdb.tvShows.details(Number(id));
        return res || null;
      } catch (e) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  // Fetch Season 1 episodes
  const { data: seasonData } = useQuery({
    queryKey: ["anime-season-1-episodes", id],
    queryFn: async () => {
      try {
        const res = await tmdb.tvShows.season(Number(id), 1);
        return res || null;
      } catch (e) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  const animeTitle = animeDetails?.name || animeDetails?.original_name || "Anime";
  const episodesList =
    seasonData?.episodes && seasonData.episodes.length > 0
      ? seasonData.episodes
      : Array.from({ length: 24 }).map((_, i) => ({
          episode_number: i + 1,
          name: `Episode ${i + 1}`,
          overview: "Watch this episode on SnapFlix.",
          still_path: animeDetails?.backdrop_path || null,
          runtime: 24,
        }));

  const currentEpisodeData = episodesList.find((e) => e.episode_number === currentEpisode);

  useEffect(() => {
    setCurrentEpisode(Number(initialEpisode) || 1);
    setPlayerEpisode(Number(initialEpisode) || 1);
  }, [initialEpisode]);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => {
        setIsFullscreen(true);
        if ("orientation" in screen && "lock" in (screen as any).orientation) {
          (screen as any).orientation.lock("landscape").catch(() => {});
        }
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setIsFullscreen(false);
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  useEffect(() => {
    resetTimer();

    const handleInteraction = () => {
      resetTimer();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      resetTimer();
      if (
        e.key === "Escape" ||
        e.key === "Backspace" ||
        e.key === "BrowserBack" ||
        e.key === "GoBack" ||
        e.keyCode === 10009 ||
        e.keyCode === 461
      ) {
        handleBack();
      }
    };

    window.addEventListener("mousemove", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("pointerdown", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, handleBack]);

  const handleSelectEpisode = useCallback(
    (epNum: number) => {
      setPlayerEpisode(epNum);
      setCurrentEpisode(epNum);

      const newUrl = `/watch/anime/${id}/${epNum}`;
      window.history.replaceState(window.history.state, "", newUrl);
      document.title = `Watch ${animeTitle} Ep ${epNum} | ${siteConfig.name}`;
    },
    [id, animeTitle]
  );

  const handleEpisodeChange = useCallback(
    (data: UnifiedPlayerEventData) => {
      const nextEpisode = Number(data.episode) || 1;

      if (nextEpisode !== currentEpisode) {
        setCurrentEpisode(nextEpisode);

        const newUrl = `/watch/anime/${id}/${nextEpisode}`;
        window.history.replaceState(window.history.state, "", newUrl);
        document.title = `Watch ${animeTitle} Ep ${nextEpisode} | ${siteConfig.name}`;
      }
    },
    [id, currentEpisode, animeTitle]
  );

  usePlayerEvents({
    mediaId: id,
    mediaType: "tv",
    saveHistory: true,
    metadata: { season: 1, episode: currentEpisode },
    onEpisodeChange: handleEpisodeChange,
  });

  useDocumentTitle(`Watch ${animeTitle} Ep ${currentEpisode} | ${siteConfig.name}`);

  const bookmarkData: SavedMovieDetails = {
    type: "tv",
    adult: (animeDetails as any)?.adult || false,
    backdrop_path: animeDetails?.backdrop_path || "",
    id: Number(id),
    poster_path: animeDetails?.poster_path || "",
    release_date: animeDetails?.first_air_date || "",
    title: animeTitle,
    vote_average: animeDetails?.vote_average || 8.0,
    saved_date: new Date().toISOString(),
  };

  const hasNextEpisode = episodesList.some((e) => e.episode_number === currentEpisode + 1);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-black select-none">
      {/* 1. TOP VIDEO PLAYER WINDOW (36% height in Portrait, 100% in Landscape or Fullscreen) */}
      <div
        onClick={resetTimer}
        onTouchStart={resetTimer}
        className={cn(
          "relative bg-black transition-all duration-300 overflow-hidden shrink-0 player-responsive-video",
          isFullscreen
            ? "fixed inset-0 w-full h-[100dvh] z-[9999]"
            : "w-full h-[36dvh] min-h-[220px] max-h-[380px] z-30 shadow-2xl border-b border-white/10"
        )}
      >
        {/* Pure Bingr Player */}
        <iframe
          src={`/api/bingr-clean/watch/anime/${id}/${playerEpisode}`}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Top-Left Floating Back Button */}
        <div
          className={cn(
            "absolute top-3 left-3 z-30 transition-all duration-300",
            isFullscreen && !showControls
              ? "opacity-0 pointer-events-none -translate-y-2"
              : "opacity-100 pointer-events-auto translate-y-0"
          )}
        >
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-105 active:scale-95 text-xs font-semibold cursor-pointer group"
          >
            <IoArrowBack size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Fullscreen / Rotate Toggle Button (Bottom-Right of Video) */}
        <div
          className={cn(
            "absolute bottom-3 right-3 z-30 transition-all duration-300",
            isFullscreen && !showControls
              ? "opacity-0 pointer-events-none translate-y-2"
              : "opacity-100 pointer-events-auto translate-y-0"
          )}
        >
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-2 rounded-lg bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
          </button>
        </div>
      </div>

      {/* 2. BOTTOM DETAILS & EPISODES (YouTube-style window, visible in Portrait, hidden in Landscape) */}
      {!isFullscreen && (
        <div className="flex-1 overflow-y-auto w-full bg-[#141414] text-white px-4 sm:px-6 py-4 space-y-5 pb-20 player-responsive-details">
          {/* Title & Active Episode Header */}
          <div className="space-y-1.5 border-b border-white/10 pb-3">
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight line-clamp-1">
              {animeTitle}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-primary">
                Episode {currentEpisode}
              </span>
              <span className="text-xs text-gray-400 font-medium line-clamp-1">
                {currentEpisodeData?.name || `Episode ${currentEpisode}`}
              </span>
            </div>

            {/* Quick Metadata Row */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-0.5">
              {animeDetails?.vote_average && (
                <span className="font-bold text-[#46D369]">
                  {Math.round(animeDetails.vote_average * 10)}% Match
                </span>
              )}
              {animeDetails?.first_air_date && (
                <span>{new Date(animeDetails.first_air_date).getFullYear()}</span>
              )}
              <span className="border border-white/20 px-1 rounded-xs text-[10px] text-gray-300">
                HD
              </span>
              <span>{episodesList.length} Episodes</span>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 shrink-0">
              {hasNextEpisode && (
                <Button
                  size="sm"
                  color="primary"
                  variant="solid"
                  className="font-semibold text-xs"
                  startContent={<FaForwardStep size={12} />}
                  onPress={() => handleSelectEpisode(currentEpisode + 1)}
                >
                  Next Ep
                </Button>
              )}

              <div className="scale-95 shrink-0">
                <BookmarkButton data={bookmarkData} />
              </div>

              <div className="scale-95 shrink-0">
                <ShareButton id={Number(id)} title={animeTitle} type="tv" />
              </div>
            </div>

            <Button
              size="sm"
              variant="flat"
              className="text-xs font-medium text-gray-300 border border-white/10 shrink-0"
              startContent={<MdFullscreen size={16} />}
              onPress={toggleFullscreen}
            >
              Rotate / Expand
            </Button>
          </div>

          {/* Episodes List */}
          <div className="space-y-3 pt-1">
            <h2 className="text-sm sm:text-base font-bold text-white">Episodes</h2>

            <div className="space-y-2">
              {episodesList.map((ep) => {
                const isPlaying = ep.episode_number === currentEpisode;
                const thumbUrl = getImageUrl(
                  ep.still_path || animeDetails?.backdrop_path || animeDetails?.poster_path,
                  "backdrop"
                );

                return (
                  <div
                    key={ep.episode_number}
                    onClick={() => handleSelectEpisode(ep.episode_number)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group",
                      isPlaying
                        ? "bg-[#E50914]/15 border border-[#E50914] shadow-md shadow-red-950/30"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border border-white/5"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-black/60">
                      <img
                        src={thumbUrl}
                        alt={ep.name}
                        className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                      />
                      {ep.runtime && (
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[9px] font-bold text-gray-200">
                          {ep.runtime}m
                        </span>
                      )}
                      {isPlaying ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <FaPlay className="text-[#E50914] text-xs animate-pulse" />
                        </div>
                      ) : null}
                    </div>

                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                          {ep.episode_number}. {ep.name}
                        </h3>
                        {isPlaying && (
                          <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px] shrink-0 font-bold">
                            Playing
                          </Chip>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 leading-snug">
                        {ep.overview || "Stream this episode now on SnapFlix."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Synopsis */}
          {animeDetails?.overview && (
            <div className="space-y-1.5 border-t border-white/10 pt-4">
              <h3 className="text-xs sm:text-sm font-bold text-gray-300">About {animeTitle}</h3>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {animeDetails.overview}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchAnimePage;
