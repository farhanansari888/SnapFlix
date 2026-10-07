"use client";

import Carousel from "@/components/ui/wrapper/Carousel";
import RowHeader from "@/components/ui/other/RowHeader";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import { useMemo } from "react";

interface KnownForProps {
  credits: any[];
}

/** Dedupes combined credits by title + media type, favoring the most popular entry. */
const dedupeByTitle = (credits: any[]) => {
  const map = new Map<string, any>();
  for (const item of credits) {
    if (!item?.id || !item?.poster_path) continue;
    const mediaType = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
    const key = `${mediaType}_${item.id}`;
    const existing = map.get(key);
    if (!existing || (item.popularity ?? 0) > (existing.popularity ?? 0)) {
      map.set(key, { ...item, media_type: mediaType });
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
};

const PersonKnownForSection: React.FC<KnownForProps> = ({ credits }) => {
  const items = useMemo(() => dedupeByTitle(credits || []).slice(0, 20), [credits]);

  if (items.length === 0) return null;

  return (
    <section id="known-for" className="flex flex-col gap-3">
      <RowHeader title="Known For" className="px-4 md:px-12" />
      <div className="px-4 md:px-12">
        <Carousel>
          {items.map((item) => (
            <div
              key={`${item.media_type}_${item.id}`}
              className="flex min-h-fit max-w-fit items-center px-1 py-2"
            >
              {item.media_type === "tv" ? (
                <TvShowPosterCard tv={item} />
              ) : (
                <MoviePosterCard movie={item} />
              )}
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default PersonKnownForSection;
