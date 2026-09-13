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

interface NetflixHeroBillboardProps {
  contentType?: "movie" | "tv";
}

const SLIDE_INTERVAL_MS = 3000; // 3 seconds infinite auto scroll

const NetflixHeroBillboard: React.FC<NetflixHeroBillboardProps> = ({ contentType: propContentType }) => {
  const searchParams = useSearchParams();
  const currentContent = propContentType || searchParams.get("content") || "movie";
  const isTv = currentContent === "tv";

  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Automatic Infinite Scroll Every 3 Seconds
  useEffect(() => {
    if (!emblaApi || heroItems.length <= 1) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [emblaApi, heroItems.length, currentIndex]);

  const handleSlideClick = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (isPending && (!heroItems || heroItems.length === 0)) {
    return (
      <div className="relative h-screen min-h-[580px] w-full overflow-hidden bg-[#141414]">
        <Skeleton className="size-full rounded-none opacity-20" />
        <div className="absolute bottom-14 sm:bottom-18 md:bottom-22 lg:bottom-24 left-4 md:left-12 flex flex-col gap-4 max-w-xl z-20">
          <Skeleton className="h-6 w-36 rounded-sm opacity-40" />
          <Skeleton className="h-14 w-80 rounded-sm opacity-40" />
          <Skeleton className="h-4 w-60 rounded-sm opacity-30" />
          <Skeleton className="h-16 w-full rounded-sm opacity-30" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 rounded-md opacity-40" />
            <Skeleton className="h-11 w-36 rounded-md opacity-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!heroItems || heroItems.length === 0) return null;

  return (
    <div className="group relative h-screen min-h-[580px] w-full select-none overflow-hidden bg-[#141414]">
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
            const playHref = isTv ? `/tv/${item.id}/1/1/player` : `/movie/${item.id}/player`;

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
                  alt={title}
                  className="absolute inset-0 size-full object-cover object-center sm:object-top filter brightness-100 contrast-[1.03] saturate-[1.05] pointer-events-none"
                  draggable={false}
                />

                {/* Cinematic Vignette Gradients - Light & Localized behind text */}
                {/* Bottom smooth fade to content section */}
                <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-[#141414] via-[#141414]/50 to-transparent pointer-events-none z-10" />
                {/* Left subtle vignette only behind text to keep characters and visuals bright */}
                <div className="absolute inset-y-0 left-0 w-full sm:w-3/4 md:w-3/5 bg-linear-to-r from-[#141414]/80 via-[#141414]/30 via-50% to-transparent pointer-events-none z-10" />
                {/* Top subtle navbar blend - ultra-light to keep transparent navbar view clear */}
                <div className="absolute top-0 inset-x-0 h-14 bg-linear-to-b from-black/15 to-transparent pointer-events-none z-10" />

                {/* Slide Content (Raised slightly for optimal visual balance) */}
                <div className="absolute bottom-14 sm:bottom-18 md:bottom-22 lg:bottom-24 left-4 md:left-12 max-w-xl lg:max-w-2xl flex flex-col gap-2.5 md:gap-3 z-20">
                  {/* Netflix Brand Tagline / Badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-5 w-4 rounded-xs bg-linear-to-b from-[#E50914] to-[#B81D24] shadow-xs">
                      <span className="text-[11px] font-black text-white">S</span>
                    </div>
                    <span className="text-xs md:text-sm font-extrabold tracking-[0.22em] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {isTv ? "SNAPFLIX ORIGINAL SERIES" : "SNAPFLIX FEATURE FILM"}
                    </span>
                    <span className="bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded-xs tracking-wider uppercase drop-shadow-sm">
                      TOP {idx + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)] line-clamp-2 leading-none">
                    {title}
                  </h1>

                  {/* Top Trending Badge & Metadata */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5 bg-black/60 border border-white/20 px-2 py-0.5 rounded text-white font-bold">
                      <span className="text-[#E50914] font-black text-xs">TOP 10</span>
                      <span className="text-xs">#{idx + 1} in {isTv ? "TV Shows" : "Movies"} Today</span>
                    </div>
                    <span className="font-extrabold text-[#46D369] drop-shadow-sm">
                      {matchPercentage}% Match
                    </span>
                    <span className="text-gray-300 font-medium">{releaseYear}</span>
                    <span className="border border-white/40 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-white uppercase">
                      {item.adult ? "18+" : "16+"}
                    </span>
                    <span className="border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
                      4K Ultra HD
                    </span>
                    <span className="border border-white/30 px-1.5 py-0.5 rounded-xs text-[11px] font-bold text-gray-200">
                      5.1 Audio
                    </span>
                  </div>

                  {/* Overview */}
                  <p className="text-sm md:text-base text-gray-200/90 leading-relaxed line-clamp-3 max-w-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {item.overview || "Stream this blockbuster title now exclusively on SnapFlix."}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={playHref}
                      className="group/btn flex items-center gap-2.5 rounded-md bg-white px-6 py-2.5 md:py-3 text-sm md:text-base font-bold text-black shadow-lg transition-all duration-200 hover:bg-white/80 active:scale-95"
                    >
                      <FaPlay className="text-sm md:text-base transition-transform group-hover/btn:scale-110" />
                      <span>Play</span>
                    </Link>

                    <Link
                      href={detailHref}
                      className="flex items-center gap-2 rounded-md bg-white/25 backdrop-blur-md px-6 py-2.5 md:py-3 text-sm md:text-base font-semibold text-white transition-all duration-200 hover:bg-white/35 active:scale-95 border border-white/10"
                    >
                      <IoInformationCircleOutline size={22} />
                      <span>More Info</span>
                    </Link>

                    <div className="scale-105">
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
      <div className="absolute right-4 md:right-12 bottom-14 sm:bottom-18 md:bottom-22 lg:bottom-24 flex items-center gap-3 md:gap-4 z-30">
        {/* 4 Clean Capsule Slide Indicators */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-full border border-white/15">
          {heroItems.map((_, idx: number) => {
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => handleSlideClick(idx)}
                aria-label={`Slide ${idx + 1}`}
                className="group/dot relative h-2 rounded-full overflow-hidden transition-all duration-300 focus:outline-hidden cursor-pointer"
                style={{ width: isCurrent ? "28px" : "10px" }}
              >
                <div
                  className={`h-full w-full rounded-full transition-colors duration-300 ${
                    isCurrent
                      ? "bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)]"
                      : "bg-white/40 group-hover/dot:bg-white/75"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Maturity Rating Pill */}
        <div className="hidden sm:flex items-center bg-[#141414]/70 border-l-3 border-[#E50914] py-1.5 pl-3 pr-4 backdrop-blur-xs text-xs font-bold text-gray-200 uppercase tracking-wider">
          {heroItems[currentIndex]?.adult ? "TV-MA / 18+" : "TV-14 / 16+"}
        </div>
      </div>
    </div>
  );
};

export default NetflixHeroBillboard;
