"use client";

import { usePlayerEvents, type UnifiedPlayerEventData } from "@/hooks/usePlayerEvents";
import { siteConfig } from "@/config/site";
import { Params } from "@/types";
import { tmdb } from "@/api/tmdb";
import { useQuery } from "@tanstack/react-query";
import { Button, Tooltip } from "@heroui/react";
import { useDocumentTitle, useIdle } from "@mantine/hooks";
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { IoArrowBack } from "react-icons/io5";

const WatchTvPage: NextPage<
  Params<{ id: string; season: string; episode: string }>
> = ({ params }) => {
  const { id, season: initialSeason, episode: initialEpisode } = use(params);
  const router = useRouter();

  const [currentSeason, setCurrentSeason] = useState(Number(initialSeason) || 1);
  const [currentEpisode, setCurrentEpisode] = useState(Number(initialEpisode) || 1);

  // Fetch actual series name from TMDB
  const { data: tvDetails } = useQuery({
    queryKey: ["tv-details-title", id],
    queryFn: async () => {
      try {
        const res = await tmdb.tvShows.details(Number(id));
        return res?.name || res?.original_name || null;
      } catch (e) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  const seriesName = tvDetails || "TV Show";

  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentSeason(Number(initialSeason) || 1);
    setCurrentEpisode(Number(initialEpisode) || 1);
  }, [initialSeason, initialEpisode]);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/tv/${id}`);
    }
  }, [router, id]);

  useEffect(() => {
    resetTimer();

    const handleInteraction = () => {
      resetTimer();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      resetTimer();
      // Handle back keys on TV remotes, webOS, Tizen, and keyboard
      if (
        e.key === "Escape" ||
        e.key === "Backspace" ||
        e.key === "BrowserBack" ||
        e.key === "GoBack" ||
        e.keyCode === 10009 || // Samsung Tizen Return
        e.keyCode === 461 // LG webOS Back
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

  const handleEpisodeChange = useCallback(
    (data: UnifiedPlayerEventData) => {
      const nextSeason = Number(data.season) || 1;
      const nextEpisode = Number(data.episode) || 1;

      if (nextSeason !== currentSeason || nextEpisode !== currentEpisode) {
        setCurrentSeason(nextSeason);
        setCurrentEpisode(nextEpisode);

        // Update browser URL in address bar without reloading the iframe
        const newUrl = `/watch/tv/${id}/${nextSeason}/${nextEpisode}`;
        window.history.replaceState(window.history.state, "", newUrl);

        // Update document title with actual series name
        document.title = `Watch ${seriesName} S${nextSeason}E${nextEpisode} | ${siteConfig.name}`;
      }
    },
    [id, currentSeason, currentEpisode, seriesName],
  );

  usePlayerEvents({
    mediaId: id,
    mediaType: "tv",
    saveHistory: true,
    metadata: { season: currentSeason, episode: currentEpisode },
    onEpisodeChange: handleEpisodeChange,
  });

  useDocumentTitle(`Watch ${seriesName} S${currentSeason}E${currentEpisode} | ${siteConfig.name}`);

  return (
    <div
      onClick={resetTimer}
      onTouchStart={resetTimer}
      className="fixed inset-0 h-[100dvh] w-full min-h-[100dvh] overflow-hidden bg-black select-none z-50 touch-none overscroll-none"
    >
      {/* Top-Left Corner Hover / Tap Sensor */}
      <div
        onMouseMove={resetTimer}
        onMouseEnter={resetTimer}
        onTouchStart={resetTimer}
        className="fixed top-0 left-0 w-32 h-20 z-[9998] pointer-events-auto bg-transparent"
      />

      {/* Top-Left Floating Back Button */}
      <div
        onMouseMove={resetTimer}
        onMouseEnter={resetTimer}
        onTouchStart={resetTimer}
        className={`fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-[9999] transition-all duration-300 ease-in-out ${
          showControls
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <button
          onClick={handleBack}
          tabIndex={showControls ? 0 : -1}
          aria-label="Go back"
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-black/80 hover:bg-black text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer group"
        >
          <IoArrowBack size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium pr-1">Back</span>
        </button>
      </div>

      {/* Pure Bingr Player (Ad-Free) */}
      <iframe
        src={`/api/bingr-clean/watch/tv/${id}/${initialSeason}/${initialEpisode}`}
        className="absolute inset-0 h-full w-full border-0 bg-black"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default WatchTvPage;
