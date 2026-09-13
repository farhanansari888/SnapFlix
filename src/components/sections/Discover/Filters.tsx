"use client";

import { tmdb } from "@/api/tmdb";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { cn } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaFilm, FaTv } from "react-icons/fa6";
import { IoCheckmark, IoChevronDown, IoClose } from "react-icons/io5";

// Fallback genres for movies & TV
const MOVIE_GENRES_FALLBACK = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
];

const TV_GENRES_FALLBACK = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10768, name: "War & Politics" },
];

const DiscoverFilters: React.FC = () => {
  const {
    content,
    setContent,
    queryType,
    setQueryType,
    genres,
    setGenres,
    clearGenres,
    resetFilters,
  } = useDiscoverFilters();

  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsGenreOpen(false);
      }
    };
    if (isGenreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isGenreOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsGenreOpen(false);
    };
    if (isGenreOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGenreOpen]);

  // Fetch genres from TMDB
  const { data: genresData } = useQuery({
    queryKey: ["tmdb-genres", content],
    queryFn: () => (content === "movie" ? tmdb.genres.movies() : tmdb.genres.tvShows()),
    staleTime: 1000 * 60 * 60,
  });

  const availableGenres = useMemo(() => {
    if (genresData?.genres && genresData.genres.length > 0) {
      return genresData.genres;
    }
    return content === "movie" ? MOVIE_GENRES_FALLBACK : TV_GENRES_FALLBACK;
  }, [genresData, content]);

  // Selected genre
  const selectedGenreId = genres && genres.size > 0 ? Array.from(genres)[0] : null;
  const selectedGenre = availableGenres.find((g) => String(g.id) === selectedGenreId);

  // Quick tabs for sorting/curation
  const quickTabs = useMemo(() => {
    if (content === "movie") {
      return [
        { key: "todayTrending", label: "Trending" },
        { key: "popular", label: "Popular" },
        { key: "topRated", label: "Top Rated" },
        { key: "nowPlaying", label: "In Theatres" },
      ];
    }
    return [
      { key: "todayTrending", label: "Trending" },
      { key: "popular", label: "Popular" },
      { key: "topRated", label: "Top Rated" },
      { key: "onTheAir", label: "On The Air" },
    ];
  }, [content]);

  const handleSelectGenre = (genreId: number | null) => {
    if (!genreId) {
      clearGenres();
      setQueryType("todayTrending");
    } else {
      setGenres(new Set([String(genreId)]));
      setQueryType("discover");
    }
    setIsGenreOpen(false);
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
      {/* Left: Title + Media Toggle + Genre Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
          New & Popular
        </h1>

        {/* Media Toggle: Movies vs TV Series */}
        <div className="inline-flex items-center p-0.5 rounded-full bg-zinc-900/90 border border-white/10 shadow-sm">
          <button
            type="button"
            onClick={() => {
              clearGenres();
              setQueryType("todayTrending");
              setContent("movie");
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none",
              content === "movie"
                ? "bg-[#E50914] text-white shadow-sm"
                : "text-zinc-400 hover:text-white",
            )}
          >
            <FaFilm size={11} />
            <span>Movies</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearGenres();
              setQueryType("todayTrending");
              setContent("tv");
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none",
              content === "tv"
                ? "bg-[#E50914] text-white shadow-sm"
                : "text-zinc-400 hover:text-white",
            )}
          >
            <FaTv size={11} />
            <span>TV</span>
          </button>
        </div>

        {/* Netflix-style Genre Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsGenreOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 border cursor-pointer select-none",
              selectedGenre
                ? "bg-[#E50914]/20 text-white border-[#E50914]/60"
                : "bg-zinc-900/90 text-zinc-300 hover:text-white border-white/15 hover:border-white/30",
            )}
          >
            <span>{selectedGenre ? selectedGenre.name : "Genres"}</span>
            {selectedGenre ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectGenre(null);
                }}
                className="hover:text-red-400 p-0.5 -mr-1"
                title="Clear genre"
              >
                <IoClose size={14} />
              </span>
            ) : (
              <IoChevronDown
                size={12}
                className={cn(
                  "text-zinc-400 transition-transform duration-200",
                  isGenreOpen && "rotate-180",
                )}
              />
            )}
          </button>

          {/* Floating Dropdown Menu */}
          <AnimatePresence>
            {isGenreOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-2 w-64 sm:w-72 max-h-80 overflow-y-auto z-50 bg-[#121212]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-2 flex flex-col gap-1 no-scrollbar"
              >
                {/* All Genres option */}
                <button
                  type="button"
                  onClick={() => handleSelectGenre(null)}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors flex items-center justify-between cursor-pointer",
                    !selectedGenre
                      ? "bg-[#E50914] text-white"
                      : "text-zinc-300 hover:text-white hover:bg-white/10",
                  )}
                >
                  <span>All Genres</span>
                  {!selectedGenre && <IoCheckmark size={14} />}
                </button>

                <div className="w-full h-px bg-white/10 my-0.5" />

                {/* Grid of Genres */}
                <div className="grid grid-cols-2 gap-1">
                  {availableGenres.map((g) => {
                    const isSelected = String(g.id) === selectedGenreId;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGenre(g.id)}
                        className={cn(
                          "px-2 py-1.5 rounded-md text-xs font-medium text-left transition-colors flex items-center justify-between truncate cursor-pointer",
                          isSelected
                            ? "bg-[#E50914] text-white font-semibold"
                            : "text-zinc-300 hover:text-white hover:bg-white/10",
                        )}
                      >
                        <span className="truncate">{g.name}</span>
                        {isSelected && <IoCheckmark size={12} className="shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Clean Quick Tabs (Trending, Popular, Top Rated, etc.) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {quickTabs.map((tab) => {
          const isSelected = queryType === tab.key && !selectedGenre;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                clearGenres();
                setQueryType(tab.key as any);
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none",
                isSelected
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/10",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DiscoverFilters;
