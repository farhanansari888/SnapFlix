"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Suspense } from "react";

const MovieHomeList = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));
const Top10Row = dynamic(() => import("@/components/sections/Home/Top10Row"));

const HomePageList: React.FC = () => {
  const { movies, tvShows } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv"]).withDefault("movie"),
  );

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Netflix Content Type Pills */}
      <div className="flex justify-center md:justify-start px-4 md:px-12">
        <ContentTypeSelection />
      </div>

      <div className="relative flex min-h-32 flex-col gap-8 md:gap-12">
        <Suspense
          fallback={
            <Spinner
              size="lg"
              variant="simple"
              className="absolute-center"
              color="primary"
            />
          }
        >
          {content === "movie" && (
            <>
              {/* Row 1: Trending */}
              {movies.length > 0 && <MovieHomeList key={movies[0].name} {...movies[0]} />}

              {/* Netflix Signature Top 10 Row */}
              <Top10Row contentType="movie" />

              {/* Remaining Movie Categories */}
              {movies.slice(1).map((movie) => (
                <MovieHomeList key={movie.name} {...movie} />
              ))}
            </>
          )}

          {content === "tv" && (
            <>
              {/* Row 1: Trending TV */}
              {tvShows.length > 0 && <TvShowHomeList key={tvShows[0].name} {...tvShows[0]} />}

              {/* Netflix Signature Top 10 Row */}
              <Top10Row contentType="tv" />

              {/* Remaining TV Categories */}
              {tvShows.slice(1).map((tv) => (
                <TvShowHomeList key={tv.name} {...tv} />
              ))}
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default HomePageList;
