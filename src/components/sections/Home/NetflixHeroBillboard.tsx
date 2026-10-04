"use client";

import { tmdb } from "@/api/tmdb";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import { SavedMovieDetails } from "@/types/movie";
import { MOCK_MOVIES, MOCK_TV_SHOWS } from "@/utils/mockData";
import { getImageUrl, mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useSearchParams } from "next/navigation";
import { cn } from "@/utils/helpers";

interface NetflixHeroBillboardProps {
  contentType?: "movie" | "tv";
}

const SLIDE_INTERVAL_MS = 7000;

const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({ contentType: propContentType }) => {
  const searchParams = useSearchParams();
  const currentContent = propContentType || searchParams.get("content") || "movie";
  const isTv = currentContent === "tv";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const paused = hoverPaused || hidden || manualPaused;

  // Embla Carousel with true seamless Infinite Loop
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
    skipSnaps: false,
  });

  const { data, isPending } = useQuery({
    queryKey: ["hero-billboard-trending", currentContent],
    queryFn: async () => {
      try {
        if (isTv) {
          const res = await tmdb.trending.trending("tv", "day");
          if (res?.results?.length > 0) return res;
        } else {
          const res = await tmdb.trending.trending("movie", "day");
          if (res?.results?.length > 0) return res;
        }
      } catch (err) {
        console.warn("TMDB fetch error in billboard, using top trending fallback:", err);
      }
      return {
        page: 1,
        results: isTv ? MOCK_TV_SHOWS : MOCK_MOVIES,
        total_pages: 1,
        total_results: 10,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Extract top 4 trending titles
  const heroItems = useMemo(() => {
    const rawList = data?.results && data.results.length > 0 ? data.results : (isTv ? MOCK_TV_SHOWS : MOCK_MOVIES);
    const withBackdrop = rawList.filter((item: any) => Boolean(item.backdrop_path));
    if (withBackdrop.length >= 4) {
      return withBackdrop.slice(0, 4);
    }
    const fallbackList = isTv ? MOCK_TV_SHOWS : MOCK_MOVIES;
    const combined = [...withBackdrop];
    for (const item of fallbackList) {
      if (combined.length >= 4) break;
      if (!combined.some((c: any) => c.id === item.id)) {
        combined.push(item);
      }
    }
    return combined.slice(0, 4);
  }, [data, isTv]);

  // Sync selected index with Embla scroll events
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset to first slide when switching between Movies and TV
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, true);
      setCurrentIndex(0);
    }
  }, [currentContent, emblaApi]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Automatic infinite scroll. Pauses while hovered or the tab is hidden.
  useEffect(() => {
    if (!emblaApi || heroItems.length <= 1 || paused) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [emblaApi, heroItems.length, currentIndex, paused]);

  const handleSlideClick = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (isPending && (!heroItems || heroItems.length === 0)) {
    return (
      <div className="relative h-[62dvh] min-h-[400px] max-h-[520px] sm:h-[70dvh] sm:min-h-[480px] sm:max-h-[640px] lg:h-[82dvh] lg:min-h-[560px] lg:max-h-[820px] 2xl:h-[80dvh] w-full overflow-hidden bg-[#0c0c0e]">
        <Skeleton className="size-full rounded-none opacity-20" />
        <div className="absolute bottom-6 sm:bottom-10 md:bottom-16 lg:bottom-20 left-4 md:left-12 flex flex-col gap-3 max-w-xl z-20">
          <Skeleton className="h-5 w-28 sm:h-6 sm:w-36 rounded-sm opacity-40" />
          <Skeleton className="h-9 w-60 sm:h-14 sm:w-80 rounded-sm opacity-40" />
          <Skeleton className="h-3.5 w-44 sm:h-4 sm:w-60 rounded-sm opacity-30" />
          <Skeleton className="h-10 w-full sm:h-16 rounded-sm opacity-30" />
          <div className="flex gap-2.5">
            <Skeleton className="h-9 w-24 sm:h-11 sm:w-32 rounded-md opacity-40" />
            <Skeleton className="h-9 w-28 sm:h-11 sm:w-36 rounded-md opacity-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!heroItems || heroItems.length === 0) return null;

  return (
    <div
      className={cn(
        "group/hero relative h-[62dvh] min-h-[400px] max-h-[520px] sm:h-[70dvh] sm:min-h-[480px] sm:max-h-[640px] lg:h-[82dvh] lg:min-h-[560px] lg:max-h-[820px] 2xl:h-[80dvh] w-full select-none overflow-hidden bg-[#0c0c0e]",
        paused && "hero-paused",
      )}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setHoverPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHoverPaused(false);
        }
      }}
    >
      {/* Infinite Scroll Viewport */}
      <div className="size-full overflow-hidden" ref={emblaRef}>
        {/* Infinite Scroll Track */}
        <div className="flex h-full w-full touch-pan-y">
          {heroItems.map((item: any, idx: number) => {
            const title = isTv
              ? mutateTvShowTitle(item as any)
              : mutateMovieTitle(item as any);

            const releaseDate = item.release_date || item.first_air_date;
            const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 2025;
            const detailHref = isTv ? `/tv/${item.id}` : `/movie/${item.id}`;
            const playHref = isTv ? `/watch/tv/${item.id}/1/1` : `/watch/movie/${item.id}`;

            const voteAverage = item.vote_average || 8.2;
            const matchPercentage = Math.min(99, Math.round(voteAverage * 10 + 8));
            const bgUrl = getImageUrl(item.backdrop_path, "backdrop", true);

            const bookmarkData: SavedMovieDetails = {
              type: isTv ? "tv" : "movie",
              adult: item.adult || false,
              backdrop_path: item.backdrop_path,
              id: item.id,
              poster_path: item.poster_path,
              release_date: releaseDate || "",
              title,
              vote_average: item.vote_average,
              saved_date: new Date().toISOString(),
            };

            return (
              <div key={item.id || idx} className="relative h-full w-full flex-none overflow-hidden">
                {/* Background Backdrop: Vibrant, Crisp, 100% Brightness */}
                  <img
                  src={bgUrl}
                  alt=""
                  width={1280}
                  height={720}
                  fetchPriority={idx === currentIndex ? "high" : "low"}
                  loading={idx === currentIndex ? "eager" : "lazy"}
                  className={cn(
                    "absolute inset-0 size-full object-cover object-center sm:object-top brightness-105 contrast-[1.04] saturate-[1.08] pointer-events-none",
                    idx === currentIndex && "hero-ken",
                  )}
                  draggable={false}
                />

                {/* Cinematic Vignette Gradients */}
                {/* Bottom smooth fade to content section */}
                <div className="absolute inset-x-0 bottom-0 h-40 sm:h-52 md:h-64 bg-linear-to-t from-[#0c0c0e] via-[#0c0c0e]/55 to-transparent pointer-events-none z-10" />
                {/* Left subtle vignette only behind text */}
                <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 md:w-3/5 bg-linear-to-r from-[#0c0c0e]/88 via-[#0c0c0e]/40 via-50% to-transparent pointer-events-none z-10" />
                {/* Top subtle navbar blend */}
                <div className="absolute top-0 inset-x-0 h-14 bg-linear-to-b from-black/20 to-transparent pointer-events-none z-10" />

                {/* Slide Content */}
                <div className="absolute bottom-6 sm:bottom-10 md:bottom-16 lg:bottom-20 left-4 md:left-12 right-4 md:right-auto max-w-xl lg:max-w-2xl flex flex-col gap-2 sm:gap-2.5 md:gap-3 z-20">
                  {/* Netflix Brand Tagline / Badge */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center justify-center h-4 w-3.5 sm:h-5 sm:w-4 rounded-xs bg-linear-to-b from-[#E50914] to-[#B81D24] shadow-xs">
                      <span className="text-[9px] sm:text-[11px] font-black text-white">S</span>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm font-extrabold tracking-[0.18em] sm:tracking-[0.22em] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {isTv ? "SNAPFLIX ORIGINAL" : "SNAPFLIX FILM"}
                    </span>
                    <span className="bg-[#E50914] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm tracking-wider uppercase shadow-[0_0_16px_rgba(229,9,20,0.45)]">
                      #{idx + 1} Today
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] line-clamp-2 leading-tight">
                    {title}
                  </h1>

                  {/* Top Trending Badge & Metadata */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-[11px] sm:text-xs md:text-sm">
                    <span className="font-extrabold text-[#46D369] drop-shadow-sm">
                      {matchPercentage}% Match
                    </span>
                    <span className="text-gray-300 font-medium">{releaseYear}</span>
                    <span className="border border-white/40 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-xs text-[10px] sm:text-[11px] font-bold text-white uppercase">
                      {item.adult ? "18+" : "16+"}
                    </span>
                    <span className="hidden sm:inline-block border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
                      4K Ultra HD
                    </span>
                    <span className="hidden md:inline-block border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
                      5.1 Audio
                    </span>
                  </div>

                  {/* Overview */}
                  <p className="text-xs sm:text-sm md:text-base text-gray-200/90 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {item.overview || "Stream this blockbuster title now exclusively on SnapFlix."}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                    <Link
                      href={playHref}
                      className="group/btn flex items-center gap-1.5 sm:gap-2.5 rounded-md bg-white px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-bold text-black shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:bg-[#f4f4f4] hover:shadow-[0_0_0_4px_rgba(255,255,255,0.12)] active:scale-95 shrink-0"
                    >
                      <FaPlay className="text-xs sm:text-sm md:text-base transition-transform group-hover/btn:scale-110" />
                      <span>Play</span>
                    </Link>

                    <Link
                      href={detailHref}
                      className="flex items-center gap-1.5 sm:gap-2 rounded-md bg-white/15 backdrop-blur-md px-3.5 sm:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white transition-all duration-200 hover:bg-white/25 active:scale-95 border border-white/15 shrink-0"
                    >
                      <IoInformationCircleOutline size={18} className="sm:size-[22px]" />
                      <span>More Info</span>
                    </Link>

                    <div className="scale-95 sm:scale-105 shrink-0">
                      <BookmarkButton data={bookmarkData} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Right: Clean Slide Indicators & Maturity Rating */}
      <div className="absolute right-4 md:right-12 bottom-6 sm:bottom-10 md:bottom-16 lg:bottom-20 flex items-center gap-2.5 sm:gap-4 z-30">
        <button
          type="button"
          onClick={() => setManualPaused((value) => !value)}
          aria-pressed={manualPaused}
          className="rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {manualPaused ? "Play slides" : "Pause slides"}
        </button>
        {/* Clean Capsule Slide Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/55 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-white/15">
          {heroItems.map((_, idx: number) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => handleSlideClick(idx)}
                aria-label={`Slide ${idx + 1}`}
                aria-current={isCurrent ? "true" : undefined}
                className="group/dot relative h-1.5 rounded-full overflow-hidden transition-all duration-300 focus:outline-hidden cursor-pointer bg-white/30"
                style={{ width: isCurrent ? "34px" : "8px" }}
              >
                {isCurrent && (
                  <span
                    key={`progress-${currentIndex}`}
                    className="hero-progress absolute inset-0 origin-left bg-[#E50914] shadow-[0_0_10px_rgba(229,9,20,0.85)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Maturity Rating Pill */}
        <div className="hidden sm:flex items-center bg-[#0c0c0e]/75 border-l-[3px] border-[#E50914] py-1.5 pl-3 pr-4 backdrop-blur-md text-[11px] font-bold text-gray-200 uppercase tracking-[0.16em]">
          {heroItems[currentIndex]?.adult ? "TV-MA / 18+" : "TV-14 / 16+"}
        </div>
      </div>
    </div>
  );
};

export default NetflixHeroBillboard;
