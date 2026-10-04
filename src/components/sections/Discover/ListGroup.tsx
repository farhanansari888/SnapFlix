"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import DiscoverFilters from "./Filters";
import MovieDiscoverList from "./MovieList";
import TvShowDiscoverList from "./TvShowList";

const DiscoverListGroup = () => {
  const { content } = useDiscoverFilters();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl min-w-0 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-8 sm:px-8 md:px-12">
      {/* Sleek Netflix Toolbar: Title, Switcher, Genre Dropdown & Categories */}
      <DiscoverFilters />

      {/* Content Grid */}
      <div className="w-full">
        {content === "movie" && <MovieDiscoverList />}
        {content === "tv" && <TvShowDiscoverList />}
      </div>
    </div>
  );
};

export default DiscoverListGroup;
