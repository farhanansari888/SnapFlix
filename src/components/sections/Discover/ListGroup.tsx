"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import DiscoverFilters from "./Filters";
import MovieDiscoverList from "./MovieList";
import TvShowDiscoverList from "./TvShowList";

const DiscoverListGroup = () => {
  const { content } = useDiscoverFilters();

  return (
    <div className="w-full min-h-screen pt-20 sm:pt-24 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto flex flex-col gap-5">
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
