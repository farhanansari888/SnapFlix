"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import CatalogErrorState from "@/components/ui/other/CatalogErrorState";
import Loop from "@/components/ui/other/Loop";
import PopcornTvLoader from "@/components/ui/other/PopcornTvLoader";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import fetchDiscoverTvShows from "@/hooks/useFetchDiscoverTvShow";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";
import { unwrapCatalog } from "@/utils/catalog";
import { getLoadingLabel } from "@/utils/movies";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import TvShowPosterCard from "../TV/Cards/Poster";

const TvShowDiscoverList = () => {
  const { ref, inViewport } = useInViewport();
  const { genresString, queryType } = useDiscoverFilters();
  const { data, isPending, isError, error, fetchNextPage, isFetchingNextPage, hasNextPage, refetch, isRefetching } =
    useInfiniteQuery({
      queryKey: ["discover-tv-shows", queryType, genresString],
      queryFn: ({ pageParam }) =>
        fetchDiscoverTvShows({
          page: pageParam,
          type: queryType as DiscoverTvShowsFetchQueryType,
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
          title="TV shows are unavailable"
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
          return page.results.map((tv) => {
            return <TvShowPosterCard key={tv.id} tv={tv} variant="bordered" />;
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

export default TvShowDiscoverList;
