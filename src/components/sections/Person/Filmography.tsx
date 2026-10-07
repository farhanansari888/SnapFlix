"use client";

import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import RowHeader from "@/components/ui/other/RowHeader";
import { cn } from "@/utils/helpers";
import { useMemo, useState } from "react";

interface FilmographyProps {
  credits: any[];
}

const PAGE_SIZE = 18;

/** Dedupes cast credits for one media type, favoring the most recent release. */
const dedupeByRecency = (credits: any[], mediaType: "movie" | "tv") => {
  const map = new Map<number, any>();
  for (const item of credits) {
    if (!item?.id || !item?.poster_path) continue;
    const itemType = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
    if (itemType !== mediaType) continue;
    const existing = map.get(item.id);
    if (!existing) map.set(item.id, item);
  }
  return Array.from(map.values()).sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";
    return dateB.localeCompare(dateA);
  });
};

const PersonFilmography: React.FC<FilmographyProps> = ({ credits }) => {
  const movies = useMemo(() => dedupeByRecency(credits || [], "movie"), [credits]);
  const tvShows = useMemo(() => dedupeByRecency(credits || [], "tv"), [credits]);

  const hasMovies = movies.length > 0;
  const hasTv = tvShows.length > 0;

  const [tab, setTab] = useState<"movie" | "tv">(hasMovies ? "movie" : "tv");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (!hasMovies && !hasTv) return null;

  const activeList = tab === "movie" ? movies : tvShows;
  const visibleList = activeList.slice(0, visibleCount);

  const handleTabChange = (next: "movie" | "tv") => {
    setTab(next);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section id="filmography" className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 px-4 md:px-12">
        <RowHeader title="Filmography" className="min-w-0" />
        {hasMovies && hasTv && (
          <div className="sf-chip inline-flex shrink-0 rounded-full p-1">
            {(
              [
                ["movie", "Movies"],
                ["tv", "TV Shows"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  tab === key ? "bg-white text-black" : "text-white/75 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 md:px-12">
        <div className="movie-grid">
          {visibleList.map((item) => (
            <div key={item.id}>
              {tab === "tv" ? (
                <TvShowPosterCard tv={item} variant="bordered" />
              ) : (
                <MoviePosterCard movie={item} variant="bordered" />
              )}
            </div>
          ))}
        </div>

        {visibleCount < activeList.length && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="sf-chip rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-95"
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonFilmography;
