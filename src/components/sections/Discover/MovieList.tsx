"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { memo, useEffect } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useFetchDiscoverMovies from "@/hooks/useFetchDiscoverMovies";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import { getLoadingLabel } from "@/utils/movies";
import { MOCK_MOVIES } from "@/utils/mockData";

const MovieDiscoverList = () => {
  const { ref, inViewport } = useInViewport();
  const { genresString, queryType } = useDiscoverFilters();

  const { data, isPending, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["discover-movies", queryType, genresString],
      queryFn: ({ pageParam }) =>
        useFetchDiscoverMovies({
          page: pageParam,
          type: queryType as DiscoverMoviesFetchQueryType,
          genres: genresString,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport && !isPending) {
      fetchNextPage();
    }
  }, [inViewport]);

  if (status === "error" || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="movie-grid">
          {MOCK_MOVIES.map((movie) => (
            <MoviePosterCard key={movie.id} movie={movie as any} variant="bordered" />
          ))}
        </div>
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
        {isFetchingNextPage && <Spinner size="lg" variant="wave" label={getLoadingLabel()} />}
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
