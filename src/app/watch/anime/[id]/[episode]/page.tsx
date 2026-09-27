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

const WatchAnimePage: NextPage<Params<{ id: string; episode: string }>> = ({ params }) => {
  const { id, episode: initialEpisode } = use(params);
  const router = useRouter();

  const [currentEpisode, setCurrentEpisode] = useState(Number(initialEpisode) || 1);

  // Fetch actual anime name from TMDB
  const { data: animeDetails } = useQuery({
    queryKey: ["anime-details-title", id],
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

  const animeTitle = animeDetails || "Anime";

  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentEpisode(Number(initialEpisode) || 1);
  }, [initialEpisode]);

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
      router.push("/");
    }
  }, [router]);

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
    [id, currentEpisode, animeTitle],
  );

  usePlayerEvents({
    mediaId: id,
    mediaType: "tv",
    saveHistory: true,
    metadata: { season: 1, episode: currentEpisode },
    onEpisodeChange: handleEpisodeChange,
  });

  useDocumentTitle(`Watch ${animeTitle} Ep ${currentEpisode} | ${siteConfig.name}`);

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

      <iframe
        src={`/api/bingr-clean/watch/anime/${id}/${initialEpisode}`}
        className="absolute inset-0 h-full w-full border-0 bg-black"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default WatchAnimePage;
