"use client";

import { forwardRef, memo, useMemo, useState } from "react";
import { Season } from "tmdb-ts";
import { useDebouncedValue } from "@mantine/hooks";
import dynamic from "next/dynamic";
import RowHeader from "@/components/ui/other/RowHeader";
import { cn } from "@/utils/helpers";

const TvShowEpisodesSelection = dynamic(() => import("./Episodes"));

interface Props {
  id: number;
  seasons: Season[];
}

const TvShowsSeasonsSelection = forwardRef<HTMLElement, Props>(({ id, seasons }, ref) => {
  const ordered = useMemo(
    () => [...(seasons || [])].sort((a, b) => a.season_number - b.season_number),
    [seasons],
  );
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebouncedValue(search, 300);
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [sortedByName, setSortedByName] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState(
    () => ordered.find((season) => season.season_number > 0)?.season_number ?? ordered[0]?.season_number ?? 1,
  );

  if (!ordered.length) return null;

  return (
    <section ref={ref} id="seasons-episodes" className="flex flex-col gap-3 px-4 md:px-12">
      <RowHeader title="Episodes" />
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {ordered.map((season) => {
          const active = season.season_number === seasonNumber;
          const label = season.season_number === 0 ? "Specials" : season.name || `Season ${season.season_number}`;
          return (
            <button
              key={season.id || season.season_number}
              type="button"
              onClick={() => {
                setSeasonNumber(season.season_number);
                setSearch("");
                setSortedByName(false);
              }}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
                active ? "bg-white text-black" : "sf-chip text-white/80 hover:text-white",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search episodes"
          aria-label="Search episodes"
          className="sf-chip h-11 min-w-0 flex-1 rounded-full px-4 text-sm text-white outline-none placeholder:text-white/40"
        />
        <button
          type="button"
          onClick={() => setLayout((value) => (value === "list" ? "grid" : "list"))}
          className="sf-chip h-11 shrink-0 rounded-full px-3 text-xs font-semibold text-white"
        >
          {layout === "list" ? "Grid" : "List"}
        </button>
        <button
          type="button"
          aria-pressed={sortedByName}
          onClick={() => setSortedByName((value) => !value)}
          className={cn(
            "sf-chip h-11 shrink-0 rounded-full px-3 text-xs font-semibold",
            sortedByName ? "bg-white text-black" : "text-white",
          )}
        >
          A-Z
        </button>
      </div>
      <TvShowEpisodesSelection
        id={id}
        seasonNumber={seasonNumber}
        filters={{ searchQuery, sortedByName, layout }}
      />
    </section>
  );
});

TvShowsSeasonsSelection.displayName = "TvShowsSeasonsSelection";

export default memo(TvShowsSeasonsSelection);
