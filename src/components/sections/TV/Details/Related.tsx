"use client";

import { useState } from "react";
import RowHeader from "@/components/ui/other/RowHeader";
import { cn } from "@/utils/helpers";
import TvShowRelatedList from "./RelatedList";
import { TV } from "tmdb-ts/dist/types";

const TvShowRelatedSection: React.FC<{ tv: any }> = ({ tv }) => {
  const recommendations = (tv.recommendations?.results || []) as TV[];
  const similar = (tv.similar?.results || []) as TV[];
  const hasRecommendations = recommendations.length > 0;
  const hasSimilar = similar.length > 0;
  const [tab, setTab] = useState<"recommendations" | "similar">(
    hasRecommendations ? "recommendations" : "similar",
  );

  if (!hasRecommendations && !hasSimilar) return null;

  const shows = tab === "recommendations" && hasRecommendations ? recommendations : similar;

  return (
    <section id="related" className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3 px-4 md:px-12">
        <RowHeader title="More like this" className="min-w-0" />
        {hasRecommendations && hasSimilar && (
          <div className="sf-chip inline-flex shrink-0 rounded-full p-1">
            {(
              [
                ["recommendations", "Picks"],
                ["similar", "Similar"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
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
        <TvShowRelatedList tvs={shows} />
      </div>
    </section>
  );
};

export default TvShowRelatedSection;
