"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import CatalogErrorState from "@/components/ui/other/CatalogErrorState";
import Loop from "@/components/ui/other/Loop";
import PopcornTvLoader from "@/components/ui/other/PopcornTvLoader";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import fetchDiscoverMovies from "@/hooks/useFetchDiscoverMovies";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { unwrapCatalog } from "@/utils/catalog";
import { getLoadingLabel } from "@/utils/movies";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { memo, useEffect } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";

const MovieDiscoverList = () => {
  const { ref, inViewport } = useInViewport();
  const { genresString, queryType } = useDiscoverFilters();

  const { data, isPending, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, isRefetching } =
    useInfiniteQuery({
      queryKey: ["discover-movies", queryType, genresString],
      queryFn: ({ pageParam }) =>
        fetchDiscoverMovies({
          page: pageParam,
          type: queryType as DiscoverMoviesFetchQueryType,
          genres: genresString,
        }).then(unwrapCatalog),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <CatalogErrorState
          error={error}
          isRetrying={isRefetching}
          onRetry={() => refetch()}
          title="Movies are unavailable"
        />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="movie-grid">
          <Loop count={20} prefix="SkeletonDiscoverPosterCard">
            <PosterCardSkeleton variant="bordered" />
          </Loop>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {data.pages.map((page) => {
          return page.results.map((movie) => {
            return <MoviePosterCard key={movie.id} movie={movie} variant="bordered" />;
          });
        })}
      </div>
      <div ref={ref} className="flex h-24 items-center justify-center">
        {isFetchingNextPage && <PopcornTvLoader size="sm" label={getLoadingLabel()} />}
        {!hasNextPage && !isPending && (
          <p className="text-muted-foreground text-center text-base">
            You have reached the end of the list.
          </p>
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default memo(MovieDiscoverList);
